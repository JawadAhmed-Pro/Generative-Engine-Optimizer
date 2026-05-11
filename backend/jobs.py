import uuid
import asyncio
import time
from datetime import datetime
from typing import Dict, Any, Callable
import traceback
from logger import app_logger

class JobManager:
    """
    In-memory and DB-backed job manager for long-running AI tasks.
    All lifecycle events are structured-logged for post-mortem analysis.
    """
    def __init__(self):
        self.background_tasks = set()

    async def update_job_progress(self, job_id: str, progress: int, db_sessionmaker: Callable):
        """Update progress percentage of a job."""
        from models import AnalysisJob
        from sqlalchemy import select
        try:
            async with db_sessionmaker() as db:
                job = (await db.execute(select(AnalysisJob).filter(AnalysisJob.id == job_id))).scalars().first()
                if job:
                    job.progress = progress
                    await db.commit()
        except Exception as e:
            app_logger.warning(f"[Job:{job_id}] Failed to update progress to {progress}%: {e}")

    async def submit_job(self, db_sessionmaker: Callable, job_type: str, user_id: int, func: Callable, *args, **kwargs) -> str:
        """
        Submit a background job.
        Provides the job function a fresh async db session from the sessionmaker.
        """
        job_id = str(uuid.uuid4())
        
        # 1. Create initial job record in DB
        async with db_sessionmaker() as db:
            from models import AnalysisJob
            job = AnalysisJob(
                id=job_id,
                user_id=user_id,
                job_type=job_type,
                status="pending",
                created_at=datetime.utcnow()
            )
            db.add(job)
            await db.commit()
        
        app_logger.info(f"[Job:{job_id}] Submitted | type={job_type} user={user_id}")
            
        # 2. Dispatch to event loop
        task = asyncio.create_task(self._run_job(job_id, user_id, db_sessionmaker, func, *args, **kwargs))
        self.background_tasks.add(task)
        task.add_done_callback(self.background_tasks.discard)
        
        return job_id

    async def _run_job(self, job_id: str, user_id: int, db_sessionmaker: Callable, func: Callable, *args, **kwargs):
        """Execute the job and update DB status."""
        from sqlalchemy import text
        from models import AnalysisJob
        from sqlalchemy import select

        start_time = time.time()

        async def set_tenant_context(session, uid):
            if session.bind.dialect.name == 'postgresql':
                try:
                    await session.execute(text("SELECT set_config('app.current_tenant', :uid, true)"), {"uid": str(uid)})
                except Exception as e:
                    app_logger.error(f"[Job:{job_id}] Failed to set tenant context: {e}")
                    await session.rollback()

        async with db_sessionmaker() as db:
            await set_tenant_context(db, user_id)
            job = (await db.execute(select(AnalysisJob).filter(AnalysisJob.id == job_id))).scalars().first()
            if job:
                job.status = "running"
                await db.commit()
        
        app_logger.info(f"[Job:{job_id}] Running...")
            
        try:
            kwargs['job_id'] = job_id
            kwargs['user_id'] = user_id
            kwargs['db_sessionmaker'] = db_sessionmaker
            result = await func(*args, **kwargs)
            
            elapsed = round(time.time() - start_time, 1)
            
            async with db_sessionmaker() as db:
                await set_tenant_context(db, user_id)
                job = (await db.execute(select(AnalysisJob).filter(AnalysisJob.id == job_id))).scalars().first()
                if job:
                    job.status = "completed"
                    job.progress = 100
                    job.result = result
                    job.completed_at = datetime.utcnow()
                    await db.commit()
            
            app_logger.info(f"[Job:{job_id}] Completed in {elapsed}s")
                    
        except Exception as e:
            elapsed = round(time.time() - start_time, 1)
            app_logger.error(f"[Job:{job_id}] FAILED after {elapsed}s: {str(e)[:200]}", exc_info=True)
            try:
                async with db_sessionmaker() as db:
                    await set_tenant_context(db, user_id)
                    job = (await db.execute(select(AnalysisJob).filter(AnalysisJob.id == job_id))).scalars().first()
                    if job:
                        job.status = "failed"
                        job.error_message = str(e)[:500]
                        job.completed_at = datetime.utcnow()
                        await db.commit()
            except Exception as inner_e:
                app_logger.error(f"[Job:{job_id}] CRITICAL: Failed to persist failure status: {inner_e}")

job_manager = JobManager()


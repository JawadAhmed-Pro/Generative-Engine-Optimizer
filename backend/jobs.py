import uuid
import asyncio
from datetime import datetime
from typing import Dict, Any, Callable
import traceback

class JobManager:
    """
    In-memory and DB-backed job manager for long-running AI tasks.
    In a true enterprise setup, this would wrap Celery or ARQ with Redis.
    For this MVP scaling step, we use asyncio.create_task and track status in the DB.
    """
    def __init__(self):
        pass

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
            print(f"Warning: Failed to update progress for job {job_id}: {e}")

    async def submit_job(self, db_sessionmaker: Callable, job_type: str, user_id: int, func: Callable, *args, **kwargs) -> str:
        """
        Submit a background job.
        Provides the job function a fresh async db session from the sessionmaker.
        """
        job_id = str(uuid.uuid4())
        
        # 1. Create initial job record in DB
        # Since we use Async DB engine, we can use an isolated session
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
            
        # 2. Dispatch to event loop
        # Pass the db_sessionmaker down to the runner so it can manage its own lifecycle
        asyncio.create_task(self._run_job(job_id, user_id, db_sessionmaker, func, *args, **kwargs))
        
        return job_id

    async def _run_job(self, job_id: str, user_id: int, db_sessionmaker: Callable, func: Callable, *args, **kwargs):
        """Execute the job and update DB status."""
        from sqlalchemy import text
        from models import AnalysisJob
        from sqlalchemy import select

        async def set_tenant_context(session, uid):
            # Only set tenant context if using PostgreSQL
            if session.bind.dialect.name == 'postgresql':
                try:
                    await session.execute(text("SET LOCAL app.current_tenant = :uid"), {"uid": uid})
                except Exception as e:
                    print(f"Failed to set tenant context: {e}")

        async with db_sessionmaker() as db:
            await set_tenant_context(db, user_id)
            
            # Set to running
            job = (await db.execute(select(AnalysisJob).filter(AnalysisJob.id == job_id))).scalars().first()
            if job:
                job.status = "running"
                await db.commit()
            
        try:
            # Execute actual heavy lifting function with injected context
            kwargs['job_id'] = job_id
            kwargs['user_id'] = user_id
            kwargs['db_sessionmaker'] = db_sessionmaker
            result = await func(*args, **kwargs)
            
            async with db_sessionmaker() as db:
                await set_tenant_context(db, user_id)
                job = (await db.execute(select(AnalysisJob).filter(AnalysisJob.id == job_id))).scalars().first()
                if job:
                    job.status = "completed"
                    job.progress = 100
                    job.result = result
                    job.completed_at = datetime.utcnow()
                    await db.commit()
                    
        except Exception as e:
            traceback.print_exc()
            try:
                async with db_sessionmaker() as db:
                    await set_tenant_context(db, user_id)
                    job = (await db.execute(select(AnalysisJob).filter(AnalysisJob.id == job_id))).scalars().first()
                    if job:
                        job.status = "failed"
                        job.error_message = str(e)
                        job.completed_at = datetime.utcnow()
                        await db.commit()
            except Exception as inner_e:
                print(f"Critical: Failed to update job status to 'failed': {inner_e}")

job_manager = JobManager()

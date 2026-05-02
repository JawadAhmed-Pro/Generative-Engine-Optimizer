from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from models import Base
from config import settings
from typing import Generator, AsyncGenerator
import time
import logging

# Synchronous Engine (For fast, lightweight CRUD without event-loop migration overhead)
sync_engine = create_engine(
    settings.DATABASE_URL,
    pool_size=20,
    max_overflow=10,
    echo=False
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=sync_engine)

# Async Engine (For JobManager and long-running Heavy DB logic to avoid IO blocks)
async_engine = create_async_engine(
    settings.async_database_url,
    pool_size=20,
    max_overflow=10,
    echo=False
)
AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

def init_db():
    """Initialize database tables synchronously and ensure schema is up to date."""
    Base.metadata.create_all(bind=sync_engine)
    
    from sqlalchemy import text, inspect
    inspector = inspect(sync_engine)
    
    # 1. Migration for 'content_items'
    ci_columns = [c['name'] for c in inspector.get_columns('content_items')]
    if 'user_id' not in ci_columns:
        print("Migrating: Adding user_id to content_items...")
        with sync_engine.connect() as conn:
            if sync_engine.url.drivername.startswith('sqlite'):
                conn.execute(text("ALTER TABLE content_items ADD COLUMN user_id INTEGER REFERENCES users(id)"))
            else:
                conn.execute(text("ALTER TABLE content_items ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id)"))
            conn.commit()

    # 2. Migration for 'analysis_results' (New GEO Pillars)
    ar_columns = [c['name'] for c in inspector.get_columns('analysis_results')]
    target_pillars = [
        'structural_clarity_score',
        'citation_worthiness_score',
        'semantic_coverage_score',
        'freshness_authority_score'
    ]
    
    missing_pillars = [p for p in target_pillars if p not in ar_columns]
    
    if missing_pillars:
        print(f"Migrating: Adding missing pillars to analysis_results: {missing_pillars}")
        with sync_engine.connect() as conn:
            for pillar in missing_pillars:
                try:
                    conn.execute(text(f"ALTER TABLE analysis_results ADD COLUMN {pillar} FLOAT"))
                    conn.commit()
                except Exception as e:
                    print(f"Column {pillar} might already exist or migration failed: {e}")
                    conn.rollback()

    # 3. Migration for 'analysis_jobs' (Progress)
    start_time = time.time()
    aj_columns = [c['name'] for c in inspector.get_columns('analysis_jobs')]
    if 'progress' not in aj_columns:
        print(f"Migrating: Adding progress to analysis_jobs... (Inspector took {time.time() - start_time:.2f}s)")
        with sync_engine.connect() as conn:
            try:
                conn.execute(text("ALTER TABLE analysis_jobs ADD COLUMN progress INTEGER DEFAULT 0"))
                conn.commit()
                print("Migration successful.")
            except Exception as e:
                print(f"Progress column migration failed: {e}")
                conn.rollback()
    else:
        print(f"Migration: progress column already exists. (Check took {time.time() - start_time:.2f}s)")

def get_db() -> Generator[Session, None, None]:
    """Base Dependency to get synchronous database session (No RLS)."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_tenant_session(current_user: dict = __import__('fastapi').Depends(__import__('auth').require_auth)) -> Generator[Session, None, None]:
    """Dependency to get synchronous database session scoped to current tenant (RLS)."""
    db = SessionLocal()
    try:
        from sqlalchemy import text
        # Only set tenant context if using PostgreSQL (which supports SET LOCAL)
        if sync_engine.url.drivername.startswith('postgresql'):
            db.execute(text("SET LOCAL app.current_tenant = :uid"), {"uid": current_user["id"]})
        yield db
    finally:
        db.close()

async def get_async_db() -> AsyncGenerator[AsyncSession, None]:
    """Base Dependency to get async database session (No RLS)."""
    async with AsyncSessionLocal() as session:
        yield session

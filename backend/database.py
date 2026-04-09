from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from models import Base
from config import settings
from typing import Generator, AsyncGenerator

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
    """Initialize database tables synchronously."""
    Base.metadata.create_all(bind=sync_engine)

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
        # Set Context for RLS mathematically
        db.execute(text("SET LOCAL app.current_tenant = :uid"), {"uid": current_user["id"]})
        yield db
    finally:
        db.close()

async def get_async_db() -> AsyncGenerator[AsyncSession, None]:
    """Base Dependency to get async database session (No RLS)."""
    async with AsyncSessionLocal() as session:
        yield session

import os

try:
    from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
    from sqlalchemy.orm import declarative_base
    DATABASE_URL = os.getenv(
        "DATABASE_URL", 
        "sqlite+aiosqlite:///./enterprise_health.db"
    )
    engine = create_async_engine(DATABASE_URL, echo=False)
    AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    Base = declarative_base()
    HAS_DB = True
except Exception as e:
    print(f"SQLAlchemy database engine not initialized (Local Dev Memory Fallback Mode): {e}")
    engine = None
    Base = None
    AsyncSessionLocal = None
    HAS_DB = False

async def get_db():
    """FastAPI Dependency to inject database sessions into endpoints."""
    if HAS_DB and AsyncSessionLocal:
        async with AsyncSessionLocal() as session:
            yield session
    else:
        yield None
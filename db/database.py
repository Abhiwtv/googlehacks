import os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base

# In production, this URL comes from Google Cloud Secret Manager.
# For local dev, we default to a local Postgres instance or SQLite fallback.
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "sqlite+aiosqlite:///./enterprise_health.db" # Fallback so you can test right now without installing Postgres locally
)

engine = create_async_engine(DATABASE_URL, echo=True)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

Base = declarative_base()

async def get_db():
    """FastAPI Dependency to inject database sessions into our endpoints."""
    async with AsyncSessionLocal() as session:
        yield session
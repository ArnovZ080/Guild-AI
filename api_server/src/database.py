from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from guild.src.core.config import settings
import os

# Prefer explicit DATABASE_URL env if present, else fall back to constructed one
explicit_url = os.getenv("DATABASE_URL") or getattr(settings, "DATABASE_URL", None)
resolved_db_url = explicit_url or settings.database_url

# Create the SQLAlchemy engine using the resolved database URL
engine = create_engine(
    resolved_db_url,
)

# Create a configured "Session" class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create a Base class for our models to inherit from
Base = declarative_base()

# Dependency to get a DB session for each request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Force database configuration for Docker environment
def get_database_url():
    """Get database URL with Docker-specific configuration"""
    # Check for explicit DATABASE_URL first
    if os.getenv("DATABASE_URL"):
        return os.getenv("DATABASE_URL")
    
    # Use Docker service names
    host = os.getenv("POSTGRES_HOST", "db")
    port = os.getenv("POSTGRES_PORT", "5432")
    user = os.getenv("POSTGRES_USER", "postgres")
    password = os.getenv("POSTGRES_PASSWORD", "password")
    database = os.getenv("POSTGRES_DB", "workflow_db")
    
    return f"postgresql://{user}:{password}@{host}:{port}/{database}"

# Create the SQLAlchemy engine using the forced database URL
engine = create_engine(
    get_database_url(),
    echo=True  # Enable SQL logging for debugging
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

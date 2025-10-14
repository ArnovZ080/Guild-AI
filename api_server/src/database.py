from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from google.cloud import secretmanager

# Force database configuration for Docker environment or Cloud Run
def get_database_url():
    """Get database URL with support for both local Docker and Cloud Run (Cloud SQL Proxy)"""
    # Check for explicit DATABASE_URL first
    if os.getenv("DATABASE_URL"):
        return os.getenv("DATABASE_URL")
    
    # Check if running on Cloud Run (Cloud SQL Proxy)
    cloudsql_connection_name = os.getenv("CLOUDSQL_CONNECTION_NAME")
    
    if cloudsql_connection_name:
        # Cloud Run environment - use Cloud SQL Proxy Unix socket
        host = f"/cloudsql/{cloudsql_connection_name}"
        user = os.getenv("POSTGRES_USER", "postgres")
        database = os.getenv("POSTGRES_DB", "workflow_db")
        
        # Get password from Secret Manager
        password = get_db_password_from_secret_manager()
        
        return f"postgresql://{user}:{password}@/{database}?host={host}"
    else:
        # Local Docker environment - use standard host/port
        host = os.getenv("POSTGRES_HOST", "db")
        port = os.getenv("POSTGRES_PORT", "5432")
        user = os.getenv("POSTGRES_USER", "postgres")
        password = os.getenv("POSTGRES_PASSWORD", "password")
        database = os.getenv("POSTGRES_DB", "workflow_db")
        
        return f"postgresql://{user}:{password}@{host}:{port}/{database}"

def get_db_password_from_secret_manager():
    """Retrieve database password from Google Cloud Secret Manager"""
    try:
        db_secret_name = os.getenv("DB_SECRET_NAME")
        project_id = os.getenv("GOOGLE_CLOUD_PROJECT")
        
        if not db_secret_name or not project_id:
            raise ValueError("DB_SECRET_NAME and GOOGLE_CLOUD_PROJECT must be set for Cloud Run")
        
        # Create the Secret Manager client
        client = secretmanager.SecretManagerServiceClient()
        
        # Build the resource name of the secret version
        name = f"projects/{project_id}/secrets/{db_secret_name}/versions/latest"
        
        # Access the secret version
        response = client.access_secret_version(request={"name": name})
        
        # Return the decoded payload
        return response.payload.data.decode("UTF-8")
    
    except Exception as e:
        print(f"Error accessing Secret Manager: {e}")
        # Fallback to environment variable if Secret Manager fails
        return os.getenv("POSTGRES_PASSWORD", "password")

# Create the SQLAlchemy engine using the forced database URL with retry logic
engine = create_engine(
    get_database_url(),
    echo=True,  # Enable SQL logging for debugging
    pool_pre_ping=True,  # Verify connections before use
    pool_recycle=3600,   # Recycle connections every hour
    pool_timeout=30,     # Timeout for getting connection from pool
    max_overflow=10,     # Allow 10 extra connections beyond pool_size
    pool_size=5,         # Base number of connections to maintain
    connect_args={
        "connect_timeout": 10,  # Connection timeout in seconds
        "application_name": "guild-ai-api"
    }
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

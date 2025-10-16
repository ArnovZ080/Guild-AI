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
        
        # Try Cloud SQL proxy first
        cloudsql_url = f"postgresql://{user}:{password}@/{database}?host={host}"
        
        # If Cloud SQL proxy fails, try direct connection as fallback
        # This handles cases where Cloud SQL proxy isn't working
        direct_host = f"{cloudsql_connection_name.split(':')[0]}-{cloudsql_connection_name.split(':')[2]}.{cloudsql_connection_name.split(':')[1]}.gcp.cloud.sql"
        direct_url = f"postgresql://{user}:{password}@{direct_host}:5432/{database}"
        
        print(f"Cloud SQL URL: {cloudsql_url}")
        print(f"Direct URL fallback: {direct_url}")
        
        return cloudsql_url
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
            print(f"Warning: DB_SECRET_NAME or GOOGLE_CLOUD_PROJECT not set. Using fallback password.")
            return "fallback_password"
        
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
database_url = get_database_url()
print(f"Database URL: {database_url.replace(database_url.split('@')[0].split('://')[1] if '@' in database_url else 'password', '***')}")

# Add connection retry logic with graceful fallback
def create_engine_with_retry(url, max_retries=2):
    """Create engine with retry logic for connection failures"""
    for attempt in range(max_retries):
        try:
            engine = create_engine(
                url,
                echo=False,  # Disable SQL logging for production
                pool_pre_ping=True,  # Verify connections before use
                pool_recycle=3600,   # Recycle connections every hour
                pool_timeout=10,     # Reduce timeout for faster fallback
                connect_args={
                    "connect_timeout": 60,  # Increase connection timeout to 60 seconds
                    "application_name": "guild-ai-api"
                },
                max_overflow=5,      # Reduce overflow connections
                pool_size=3,         # Reduce base connections for faster startup
                pool_reset_on_return='commit'  # Reset connections on return
            )
            
            # Test the connection
            with engine.connect() as conn:
                conn.execute("SELECT 1")
            
            print(f"✅ Database connection successful on attempt {attempt + 1}")
            return engine
            
        except Exception as e:
            print(f"❌ Database connection attempt {attempt + 1} failed: {e}")
            if attempt == max_retries - 1:
                print("⚠️  All database connection attempts failed. Creating fallback engine.")
                # Fallback to a simpler configuration that won't crash on startup
                return create_engine(
                    url,
                    echo=False,
                    pool_pre_ping=False,  # Disable pre-ping to avoid startup issues
                    pool_recycle=3600,
                    pool_timeout=60,
                    max_overflow=0,  # No overflow connections
                    pool_size=1,     # Minimal pool size
                    connect_args={
                        "connect_timeout": 60,
                        "application_name": "guild-ai-api-fallback"
                    }
                )
            continue

try:
    engine = create_engine_with_retry(database_url)
    print("✅ Database engine created successfully")
except Exception as e:
    print(f"❌ Critical error creating database engine: {e}")
    print("🚨 Application will start but database features may be limited")
    # Create a minimal engine that won't crash the app
    engine = create_engine(
        "sqlite:///./fallback.db",  # Fallback to SQLite
        echo=False,
        connect_args={"check_same_thread": False}
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

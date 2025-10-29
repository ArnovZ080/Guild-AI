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
        # Cloud Run environment - try multiple connection methods
        user = os.getenv("POSTGRES_USER", "postgres")
        database = os.getenv("POSTGRES_DB", "workflow_db")
        
        # Get password from Secret Manager
        password = get_db_password_from_secret_manager()
        
        # URL encode the password for proper connection
        import urllib.parse
        encoded_password = urllib.parse.quote_plus(password)
        
        # Method 1: Try Cloud SQL Proxy Unix socket first
        cloudsql_socket = f"/cloudsql/{cloudsql_connection_name}"
        cloudsql_url = f"postgresql://{user}:{encoded_password}@/{database}?host={cloudsql_socket}"
        
        # Method 2: Try direct connection with public IP as fallback
        # Use the public IP address from the Cloud SQL instance
        public_ip = "34.10.171.92"  # From the instance details you provided
        direct_url = f"postgresql://{user}:{encoded_password}@{public_ip}:5432/{database}"
        
        # Method 3: Try private IP connection
        private_ip = "10.87.65.3"  # From the instance details you provided
        private_url = f"postgresql://{user}:{encoded_password}@{private_ip}:5432/{database}"
        
        print(f"Cloud SQL Socket URL: {cloudsql_url}")
        print(f"Direct Public IP URL: {direct_url}")
        print(f"Private IP URL: {private_url}")
        
        # Return the direct public IP connection as primary method
        # Cloud SQL Proxy might not be working in this environment
        return direct_url
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
        # First try to get from environment variable (for direct testing)
        env_password = os.getenv("POSTGRES_PASSWORD")
        if env_password:
            print("Using password from POSTGRES_PASSWORD environment variable")
            return env_password
        
        # Then try Secret Manager
        db_secret_name = os.getenv("DB_SECRET_NAME")
        project_id = os.getenv("GOOGLE_CLOUD_PROJECT")
        
        if not db_secret_name or not project_id:
            print(f"Warning: DB_SECRET_NAME or GOOGLE_CLOUD_PROJECT not set. Using environment variable.")
            return os.getenv("POSTGRES_PASSWORD", "password")
        
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
        # Fallback to environment variable
        return os.getenv("POSTGRES_PASSWORD", "password")

# Create the SQLAlchemy engine using the forced database URL with retry logic
database_url = get_database_url()
print(f"Database URL: {database_url.replace(database_url.split('@')[0].split('://')[1] if '@' in database_url else 'password', '***')}")

# Add connection retry logic with multiple connection methods
def create_engine_with_retry(url, max_retries=3):
    """Create engine with retry logic for connection failures"""
    # Try multiple connection methods if we're in Cloud Run
    connection_methods = []
    
    if "CLOUDSQL_CONNECTION_NAME" in os.environ:
        cloudsql_connection_name = os.getenv("CLOUDSQL_CONNECTION_NAME")
        user = os.getenv("POSTGRES_USER", "postgres")
        database = os.getenv("POSTGRES_DB", "workflow_db")
        password = get_db_password_from_secret_manager()
        
        # URL encode the password for proper connection
        import urllib.parse
        encoded_password = urllib.parse.quote_plus(password)
        
        # Method 1: Cloud SQL Proxy Unix socket
        cloudsql_socket = f"/cloudsql/{cloudsql_connection_name}"
        connection_methods.append(f"postgresql://{user}:{encoded_password}@/{database}?host={cloudsql_socket}")
        
        # Method 2: Direct public IP connection
        connection_methods.append(f"postgresql://{user}:{encoded_password}@34.10.171.92:5432/{database}")
        
        # Method 3: Private IP connection
        connection_methods.append(f"postgresql://{user}:{encoded_password}@10.87.65.3:5432/{database}")
    else:
        connection_methods = [url]
    
    for method_index, connection_url in enumerate(connection_methods):
        print(f"🔄 Trying connection method {method_index + 1}: {connection_url.split('@')[0]}@***")
        
        for attempt in range(max_retries):
            try:
                engine = create_engine(
                    connection_url,
                    echo=False,  # Disable SQL logging for production
                    pool_pre_ping=True,  # Verify connections before use
                    pool_recycle=3600,   # Recycle connections every hour
                    pool_timeout=10,     # Reduce timeout for faster fallback
                    connect_args={
                        "connect_timeout": 30,  # Reduce timeout for faster fallback
                        "application_name": "guild-ai-api"
                    },
                    max_overflow=2,      # Reduce overflow connections
                    pool_size=2,         # Reduce base connections for faster startup
                    pool_reset_on_return='commit'  # Reset connections on return
                )
                
                # Test the connection
                with engine.connect() as conn:
                    conn.execute("SELECT 1")
                
                print(f"✅ Database connection successful with method {method_index + 1} on attempt {attempt + 1}")
                return engine
                
            except Exception as e:
                print(f"❌ Connection method {method_index + 1} attempt {attempt + 1} failed: {e}")
                if attempt == max_retries - 1:
                    print(f"⚠️  All attempts failed for connection method {method_index + 1}")
                    break
                continue
    
    print("🚨 All connection methods failed. Creating fallback engine.")
    # Fallback to a simpler configuration that won't crash on startup
    return create_engine(
        "sqlite:///./fallback.db",  # Fallback to SQLite
        echo=False,
        connect_args={"check_same_thread": False}
    )

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

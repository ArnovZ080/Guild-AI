import os
from datetime import timedelta

class Config:
    """Base configuration class"""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'asdf#FGSgvasgf$5$WGT'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Database configuration
    DATABASE_URL = os.environ.get('DATABASE_URL')
    if DATABASE_URL:
        SQLALCHEMY_DATABASE_URI = DATABASE_URL
    else:
        SQLALCHEMY_DATABASE_URI = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
    
    # JWT configuration
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or SECRET_KEY
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    # OAuth configuration
    GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
    GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET')
    
    NOTION_CLIENT_ID = os.environ.get('NOTION_CLIENT_ID')
    NOTION_CLIENT_SECRET = os.environ.get('NOTION_CLIENT_SECRET')
    
    MICROSOFT_CLIENT_ID = os.environ.get('MICROSOFT_CLIENT_ID')
    MICROSOFT_CLIENT_SECRET = os.environ.get('MICROSOFT_CLIENT_SECRET')
    
    DROPBOX_CLIENT_ID = os.environ.get('DROPBOX_CLIENT_ID')
    DROPBOX_CLIENT_SECRET = os.environ.get('DROPBOX_CLIENT_SECRET')
    
    # MinIO configuration (for workspace storage)
    MINIO_ENDPOINT = os.environ.get('MINIO_ENDPOINT', 'localhost:9000')
    MINIO_ACCESS_KEY = os.environ.get('MINIO_ACCESS_KEY', 'minioadmin')
    MINIO_SECRET_KEY = os.environ.get('MINIO_SECRET_KEY', 'minioadmin')
    MINIO_SECURE = os.environ.get('MINIO_SECURE', 'false').lower() == 'true'
    
    # Qdrant configuration (for vector storage)
    QDRANT_HOST = os.environ.get('QDRANT_HOST', 'localhost')
    QDRANT_PORT = int(os.environ.get('QDRANT_PORT', 6333))
    QDRANT_API_KEY = os.environ.get('QDRANT_API_KEY')
    
    # OpenAI configuration
    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')
    OPENAI_API_BASE = os.environ.get('OPENAI_API_BASE')
    
    # Agent configuration
    AGENT_CONFIG = {
        'max_iterations': int(os.environ.get('AGENT_MAX_ITERATIONS', 3)),
        'timeout_minutes': int(os.environ.get('AGENT_TIMEOUT_MINUTES', 30)),
        'quality_threshold': float(os.environ.get('AGENT_QUALITY_THRESHOLD', 0.8)),
        'confidence_threshold': float(os.environ.get('AGENT_CONFIDENCE_THRESHOLD', 0.55))
    }

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False
    
    def __init__(self):
        super().__init__()
        # Only require SECRET_KEY in production environment
        if not os.environ.get('SECRET_KEY'):
            raise ValueError("SECRET_KEY environment variable must be set in production")

class TestingConfig(Config):
    """Testing configuration"""
    DEBUG = True
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'

# Configuration mapping
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}


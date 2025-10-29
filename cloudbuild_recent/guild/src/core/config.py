from pydantic_settings import BaseSettings
from typing import Optional, List

class Settings(BaseSettings):
    # Database Configuration
    DATABASE_URL: str = "postgresql://postgres:password@db:5432/workflow_db"
    
    # PostgreSQL Configuration
    POSTGRES_DB: str = "workflow_db"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "password"
    POSTGRES_HOST: str = "db"
    
    # Redis Configuration
    REDIS_HOST: str = "redis"
    REDIS_PORT: str = "6379"
    # Common alias for full URL in local/dev setups
    REDIS_URL: Optional[str] = None

    # Celery Configuration
    CELERY_BROKER_URL: str = "redis://redis:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://redis:6379/1"

    # MinIO Configuration
    MINIO_ENDPOINT: str = "minio:9000"
    MINIO_ROOT_USER: str = "minio_user"
    MINIO_ROOT_PASSWORD: str = "minio_password"
    MINIO_BUCKET_NAME: str = "guild-bucket"

    # Qdrant Configuration
    QDRANT_HOST: str = "qdrant"
    QDRANT_URL: Optional[str] = None

    # FastAPI Configuration
    FASTAPI_APP_ENV: str = "local"
    FASTAPI_SECRET_KEY: str = "a_strong_secret_key_here"
    ALLOWED_ORIGINS: Optional[str] = None

    # LLM Configuration
    LLM_PROVIDER: Optional[str] = None

    # OpenAI Configuration
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_API_BASE: Optional[str] = None

    # Agent Configuration
    AGENT_MAX_ITERATIONS: int = 3
    AGENT_TIMEOUT_MINUTES: int = 30
    AGENT_QUALITY_THRESHOLD: float = 0.8
    AGENT_CONFIDENCE_THRESHOLD: float = 0.55

    # Web scraping configuration
    USER_AGENT: str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"

    # Ollama Configuration
    OLLAMA_HOST: str = "http://ollama:11434"
    OLLAMA_MODEL: str = "llama3"

    # TogetherAI Configuration
    TOGETHER_API_KEY: Optional[str] = None

    # n8n Configuration
    N8N_WEBHOOK_URL: Optional[str] = None

    # HubSpot Configuration
    HUBSPOT_API_KEY: Optional[str] = None

    # MarkItDown Configuration
    MARKITDOWN_ENABLE_PLUGINS: bool = True
    MARKITDOWN_MAX_FILE_SIZE_MB: int = 100
    MARKITDOWN_SUPPORTED_FORMATS: List[str] = [
        "pdf", "docx", "pptx", "xlsx", "doc", "ppt", "xls",
        "txt", "html", "htm", "md", "rtf", "odt", "odp", "ods"
    ]
    MARKITDOWN_AUDIO_TRANSCRIPTION: bool = True
    MARKITDOWN_YOUTUBE_TRANSCRIPTION: bool = True

    @property
    def database_url(self) -> str:
        """Construct database URL from PostgreSQL settings"""
        if self.DATABASE_URL and self.DATABASE_URL != "postgresql://postgres:password@db:5432/workflow_db":
            return self.DATABASE_URL
        
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:5432/{self.POSTGRES_DB}"

    @property
    def qdrant_url(self) -> str:
        """Construct Qdrant URL from host settings"""
        if self.QDRANT_URL:
            return self.QDRANT_URL
        
        return f"http://{self.QDRANT_HOST}:6333"

    @property
    def redis_url(self) -> str:
        """Construct Redis URL from host and port settings"""
        if self.REDIS_URL:
            return self.REDIS_URL
        
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}"

    class Config:
        env_file = ".env"
        case_sensitive = False

# Create a single settings instance to be used throughout the application
settings = Settings()

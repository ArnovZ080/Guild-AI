from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database Configuration
    DATABASE_URL: str = "sqlite:///./guild_app.db"

    # OpenAI Configuration
    OPENAI_API_KEY: str
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

    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'

# Create a single settings instance to be used throughout the application
settings = Settings()

from enum import Enum
from typing import Optional
from pydantic import BaseModel

class LlmModels(str, Enum):
    """Enumeration of available LLM models."""
    LLAMA3_70B = "llama3.2-70b"
    LLAMA3_8B = "llama3.2-8b"
    MIXTRAL = "mistralai/Mixtral-8x7B-Instruct-v0.1"
    GPT4 = "gpt-4"
    GPT35 = "gpt-3.5-turbo"

class Llm(BaseModel):
    """Configuration for an LLM instance."""
    provider: str
    model: str
    api_key: Optional[str] = None
    base_url: Optional[str] = None
    
    class Config:
        use_enum_values = True

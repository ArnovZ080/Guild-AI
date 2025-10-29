from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from guild.src.models.user_input import UserInput

# Re-export Workflow from schemas
from guild.src.core.models.schemas import Workflow

class Task(BaseModel):
    """Represents a task in a workflow."""
    id: str
    name: str
    agent_type: str
    description: str
    dependencies: List[str] = []
    input_data: Optional[Dict[str, Any]] = None
    output_data: Optional[Dict[str, Any]] = None
    status: str = "pending"
    estimated_duration: Optional[str] = None

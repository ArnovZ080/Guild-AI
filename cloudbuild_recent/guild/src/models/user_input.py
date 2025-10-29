from pydantic import BaseModel, ConfigDict
from typing import Optional

class Audience(BaseModel):
    """
    A placeholder for the target audience details.
    """
    model_config = ConfigDict(from_attributes=True)
    
    demographics: Optional[str] = None
    interests: Optional[str] = None
    # Add other relevant audience fields as needed

class UserInput(BaseModel):
    """
    Represents the initial user request for generating a workflow.
    """
    model_config = ConfigDict(from_attributes=True)
    
    objective: str
    audience: Optional[Audience] = None
    additional_notes: Optional[str] = None

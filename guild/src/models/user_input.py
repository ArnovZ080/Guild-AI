from pydantic import BaseModel
from typing import Optional

class Audience(BaseModel):
    """
    A placeholder for the target audience details.
    """
    demographics: Optional[str] = None
    interests: Optional[str] = None
    # Add other relevant audience fields as needed

class UserInput(BaseModel):
    """
    Represents the initial user request for generating a workflow.
    """
    objective: str
    audience: Optional[Audience] = None
    additional_notes: Optional[str] = None

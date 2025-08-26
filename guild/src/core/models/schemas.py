from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid

# Base Pydantic model configuration
class GuildBaseModel(BaseModel):
    class Config:
        from_attributes = True # orm_mode = True for Pydantic v1

# Schemas for Rubric
class RubricCriterion(BaseModel):
    name: str
    description: str
    weight: float = Field(..., gt=0, le=1)

class Rubric(BaseModel):
    quality_threshold: float = Field(0.8, gt=0, le=1)
    criteria: List[RubricCriterion]
    fact_check_required: bool = False
    brand_compliance_required: bool = False
    seo_optimization_required: bool = False

# Schemas for OutcomeContract
class OutcomeContractCreate(GuildBaseModel):

    title: str
    objective: str
    deliverables: List[str]
    data_rooms: List[str]
    context: Optional[str] = None
    special_notes: Optional[str] = None
    target_audience: Optional[str] = None
    zapier_webhook_url: Optional[str] = None


class OutcomeContractBase(OutcomeContractCreate):
    rubric: Rubric

class OutcomeContract(OutcomeContractBase):
    id: str
    status: str
    created_at: datetime
    updated_at: datetime

# Schemas for Workflow
class WorkflowBase(GuildBaseModel):
    contract_id: str
    dag_definition: Dict[str, Any]
    estimated_duration: Optional[str] = None

class WorkflowCreate(WorkflowBase):
    pass

class Workflow(WorkflowBase):
    id: str
    status: str
    progress: float
    current_agent: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime

# Schemas for AgentExecution
class AgentExecutionBase(GuildBaseModel):
    workflow_id: str
    agent_type: str
    agent_name: str
    input_data: Optional[Dict[str, Any]] = None
    output_data: Optional[Dict[str, Any]] = None

class AgentExecutionCreate(AgentExecutionBase):
    pass

class AgentExecution(AgentExecutionBase):
    id: int
    status: str
    error_message: Optional[str] = None
    execution_time: Optional[float] = None
    quality_score: Optional[float] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime

# Schemas for Deliverable
class DeliverableBase(GuildBaseModel):
    workflow_id: str
    type: str
    title: str
    content: Optional[str] = None
    meta_data: Optional[Dict[str, Any]] = None
    file_path: Optional[str] = None

class DeliverableCreate(DeliverableBase):
    pass

class Deliverable(DeliverableBase):
    id: int
    quality_score: Optional[float] = None
    status: str
    created_at: datetime
    updated_at: datetime

# Schemas for EvaluationResult
class EvaluationResultBase(GuildBaseModel):
    deliverable_id: int
    evaluator_type: str
    score: float
    feedback: Optional[str] = None
    criteria: Optional[Dict[str, Any]] = None
    source_citations: Optional[List[Dict[str, Any]]] = None

class EvaluationResultCreate(EvaluationResultBase):
    pass

class EvaluationResult(EvaluationResultBase):
    id: int
    created_at: datetime

# Schemas for Agent Configuration
class AgentTool(BaseModel):
    name: str
    config: Dict[str, Any]

class AgentConfig(BaseModel):
    name: str
    model: str
    temperature: float = 0.7
    max_tokens: int = 2000
    tools: List[AgentTool] = []
    prompt_template: str

# Schema for the main config file
class WorkforceAgents(BaseModel):
    brief_generator: AgentConfig
    ad_copy_writer: AgentConfig
    scraper_agent: AgentConfig
    # ... other workforce agents

class EvaluatorAgents(BaseModel):
    judge_agent: AgentConfig
    fact_checker: AgentConfig
    brand_checker: AgentConfig
    # ... other evaluator agents

class GuildConfig(BaseModel):
    workforce_agents: WorkforceAgents
    evaluator_agents: EvaluatorAgents


# Schemas for DataRoom and Documents
class Document(GuildBaseModel):
    id: int
    source_id: str
    data_room_id: str
    provider: str
    path: str
    mime: Optional[str] = None
    hash: str
    status: str # e.g., 'stale', 'indexed', 'error'
    updated_at: datetime

class DataRoomBase(GuildBaseModel):
    name: str
    provider: str
    config: Dict[str, Any]
    read_only: bool = True

class DataRoomCreate(DataRoomBase):
    pass

class DataRoom(DataRoomBase):
    id: str
    last_sync_at: Optional[datetime] = None
    created_at: datetime


# Schema for RAG search results
class SourceProvenance(GuildBaseModel):
    provider: str
    data_room_id: str
    source_id: str
    path: str
    chunk_ids: List[str]
    confidence: float

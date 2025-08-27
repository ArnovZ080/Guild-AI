import uuid
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List

# Corrected imports to use the actual top-level packages
from models.schemas import (
    Workflow as PydanticWorkflow,
    AgentExecution as PydanticAgentExecution,
)
from models.user_input import UserInput

from .. import models
from ..database import get_db
from ..tasks import run_workflow_task

# Import the new Orchestrator from its top-level package
from core.orchestrator import Orchestrator

router = APIRouter(
    prefix="/workflows",
    tags=["Workflows"],
)


@router.post("/contracts", status_code=201)
async def create_contract_and_plan_workflow(
    user_input: UserInput, db: Session = Depends(get_db)
):
    """
    Main entry point for creating a marketing campaign.
    """
    # 1. Create and save the contract
    contract_id = str(uuid.uuid4())
    db_contract = models.OutcomeContract(
        id=contract_id,
        objective=user_input.objective,
        target_audience=user_input.audience.model_dump() if user_input.audience else {},
        additional_notes=user_input.additional_notes,
    )
    db.add(db_contract)
    db.commit()
    db.refresh(db_contract)

    # 2. Use the Orchestrator to generate the workflow
    orchestrator = Orchestrator(user_input)
    try:
        pydantic_workflow = await orchestrator.generate_workflow()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate workflow from Orchestrator: {e}")

    # 3. Save the workflow
    workflow_id = str(uuid.uuid4())
    db_workflow = models.Workflow(
        id=workflow_id,
        contract_id=contract_id,
        status="pending_approval",
        dag_definition=pydantic_workflow.model_dump(),
    )
    db.add(db_workflow)
    db.commit()
    db.refresh(db_workflow)

    return {
        "contract_id": contract_id,
        "workflow_id": workflow_id,
        "workflow_definition": pydantic_workflow.model_dump(),
    }


@router.post("/{workflow_id}/approve", status_code=202)
async def approve_and_execute_workflow(
    workflow_id: str,
    db: Session = Depends(get_db)
):
    """
    Approves a workflow and queues it for execution via Celery.
    """
    db_workflow = db.query(models.Workflow).filter(models.Workflow.id == workflow_id).first()
    if db_workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")

    if db_workflow.status != "pending_approval":
        raise HTTPException(status_code=400, detail=f"Workflow is not awaiting approval. Current status: {db_workflow.status}")

    db_workflow.status = "pending"
    db.commit()

    run_workflow_task.delay(workflow_id=workflow_id)

    return {"message": "Workflow execution started.", "workflow_id": workflow_id}


@router.get("/{workflow_id}/status", response_model=PydanticWorkflow)
async def get_workflow_status(workflow_id: str, db: Session = Depends(get_db)):
    """
    Get the status and details of a specific workflow, including its execution steps.
    """
    db_workflow = db.query(models.Workflow).filter(models.Workflow.id == workflow_id).first()
    if db_workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")

    workflow_data = db_workflow.__dict__
    workflow_data['tasks'] = db_workflow.dag_definition.get('tasks', [])

    executions = db.query(models.AgentExecution).filter(models.AgentExecution.workflow_id == workflow_id).all()
    workflow_data['executions'] = [PydanticAgentExecution.from_orm(ex) for ex in executions]

    db_contract = db.query(models.OutcomeContract).filter(models.OutcomeContract.id == db_workflow.contract_id).first()
    if db_contract:
        workflow_data['user_input'] = UserInput.from_orm(db_contract)

    return PydanticWorkflow(**workflow_data)


@router.get("/{workflow_id}/executions", response_model=List[PydanticAgentExecution])
async def get_workflow_executions(workflow_id: str, db: Session = Depends(get_db)):
    """
    Get all agent execution records for a specific workflow.
    """
    executions = db.query(models.AgentExecution).filter(models.AgentExecution.workflow_id == workflow_id).all()
    if not executions:
        return []
    return [PydanticAgentExecution.from_orm(ex) for ex in executions]

@router.get("/health", status_code=200)
async def health_check():
    return {"status": "ok"}

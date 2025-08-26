from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from typing import List
import uuid
from datetime import datetime
from sqlalchemy.orm import Session

# Import Pydantic schemas and SQLAlchemy models
from guild.core.models.schemas import (
    OutcomeContract as PydanticOutcomeContract,
    OutcomeContractCreate,
    Workflow as PydanticWorkflow,
    WorkflowCreate
)
from .. import models
from ..database import get_db


router = APIRouter(
    prefix="/workflows",
    tags=["Workflows & Contracts"],
)


from guild.src.agents.judge_agent import generate_rubric

@router.post("/contracts", response_model=PydanticOutcomeContract, status_code=201)
async def create_contract(
    contract_in: OutcomeContractCreate, db: Session = Depends(get_db)
):
    """
    Create a new Outcome Contract, generate its rubric, and save it to the database.
    """
    # Generate the rubric using the Judge Agent
    generated_rubric = generate_rubric(contract_in)

    # Now create the database model with the generated rubric
    new_id = str(uuid.uuid4())
    db_contract = models.OutcomeContract(
        id=new_id,
        rubric=generated_rubric.dict(),
        **contract_in.dict()

    )
    db.add(db_contract)
    db.commit()
    db.refresh(db_contract)
    return db_contract


@router.get("/contracts", response_model=List[PydanticOutcomeContract])
async def get_all_contracts(db: Session = Depends(get_db)):
    """
    Get all existing Outcome Contracts from the database.
    """
    return db.query(models.OutcomeContract).all()


@router.get("/contracts/{contract_id}", response_model=PydanticOutcomeContract)
async def get_contract(contract_id: str, db: Session = Depends(get_db)):
    """
    Get a specific Outcome Contract by its ID from the database.
    """
    db_contract = db.query(models.OutcomeContract).filter(models.OutcomeContract.id == contract_id).first()
    if db_contract is None:
        raise HTTPException(status_code=404, detail="Contract not found")
    return db_contract


from ..tasks import run_workflow_task
from guild.core.orchestrator import compile_contract_to_dag


@router.post("/contracts/{contract_id}/execute", status_code=202)
async def execute_workflow_from_contract(
    contract_id: str,
    db: Session = Depends(get_db)
):
    """
    Creates a workflow from a contract and queues it for execution via Celery.

    """
    db_contract = db.query(models.OutcomeContract).filter(models.OutcomeContract.id == contract_id).first()
    if db_contract is None:
        raise HTTPException(status_code=404, detail="Contract not found")

    # Convert the SQLAlchemy model to a Pydantic schema to pass to the compiler

    pydantic_contract = PydanticOutcomeContract.from_orm(db_contract)

    # Compile the contract to a DAG
    dag_definition = compile_contract_to_dag(pydantic_contract)

    # Create a new workflow instance and save it to the DB
    workflow_id = str(uuid.uuid4())
    db_workflow = models.Workflow(
        id=workflow_id,
        contract_id=contract_id,
        status="pending",  # The task is pending until a worker picks it up

        dag_definition=dag_definition,
    )
    db.add(db_workflow)
    db.commit()

    # Dispatch the execution to a Celery worker
    run_workflow_task.delay(workflow_id=workflow_id)

    return {"message": "Workflow has been queued for execution.", "workflow_id": workflow_id}


@router.get("/{workflow_id}/status", response_model=PydanticWorkflow)
async def get_workflow_status(workflow_id: str, db: Session = Depends(get_db)):
    """
    Get the status and details of a specific workflow from the database.
    """
    db_workflow = db.query(models.Workflow).filter(models.Workflow.id == workflow_id).first()
    if db_workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return db_workflow

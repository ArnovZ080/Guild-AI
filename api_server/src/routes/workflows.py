from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import List, Dict
import uuid
from datetime import datetime

# Import the Pydantic schemas from the guild package
from guild.core.models.schemas import (
    OutcomeContract,
    OutcomeContractCreate,
    Workflow,
    WorkflowCreate
)

router = APIRouter(
    prefix="/workflows",
    tags=["Workflows & Contracts"],
)

# In-memory storage for now. This will be replaced by a database.
db_contracts: Dict[str, OutcomeContract] = {}
db_workflows: Dict[str, Workflow] = {}


@router.post("/contracts", response_model=OutcomeContract, status_code=201)
async def create_contract(contract: OutcomeContractCreate):
    """
    Create a new Outcome Contract.
    """
    # TODO: Replace in-memory dict with a real database call.
    new_id = str(uuid.uuid4())
    db_contract = OutcomeContract(
        id=new_id,
        status="draft",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
        **contract.dict()
    )
    db_contracts[new_id] = db_contract
    return db_contract


@router.get("/contracts", response_model=List[OutcomeContract])
async def get_all_contracts():
    """
    Get all existing Outcome Contracts.
    """
    # TODO: Replace in-memory dict with a real database call.
    return list(db_contracts.values())


@router.get("/contracts/{contract_id}", response_model=OutcomeContract)
async def get_contract(contract_id: str):
    """
    Get a specific Outcome Contract by its ID.
    """
    # TODO: Replace in-memory dict with a real database call.
    if contract_id not in db_contracts:
        raise HTTPException(status_code=404, detail="Contract not found")
    return db_contracts[contract_id]


def execute_workflow_background(workflow_id: str, contract: OutcomeContract):
    """
    This is the function that will be run in the background.
    It will contain the logic to execute the agent workflow.
    """
    print(f"Starting background execution for workflow {workflow_id}...")
    # TODO: Implement the actual agent orchestration logic here.
    # This will involve:
    # 1. Compiling the contract into a DAG.
    # 2. Initializing agents from the guild package.
    # 3. Executing the DAG node by node.
    # 4. Updating the workflow status in the database.
    import time
    time.sleep(10) # Simulate a long-running task
    db_workflows[workflow_id].status = "completed"
    print(f"Finished background execution for workflow {workflow_id}.")


@router.post("/contracts/{contract_id}/execute", status_code=202)
async def execute_workflow_from_contract(
    contract_id: str,
    background_tasks: BackgroundTasks
):
    """
    Execute the workflow defined by a contract.
    This endpoint returns immediately and schedules the workflow to run in the background.
    """
    # TODO: Replace in-memory dict with a real database call.
    if contract_id not in db_contracts:
        raise HTTPException(status_code=404, detail="Contract not found")

    contract = db_contracts[contract_id]

    # Create a new workflow instance
    workflow_id = str(uuid.uuid4())
    workflow = Workflow(
        id=workflow_id,
        contract_id=contract_id,
        status="running",
        progress=0.0,
        created_at=datetime.utcnow(),
        # TODO: The DAG definition should be created by a "Contract Compiler"
        dag_definition={"plan": "Execute agents based on contract objective"},
    )
    db_workflows[workflow_id] = workflow

    # Add the long-running task to the background
    background_tasks.add_task(execute_workflow_background, workflow.id, contract)

    return {"message": "Workflow execution started in the background.", "workflow_id": workflow.id}


@router.get("/{workflow_id}/status", response_model=Workflow)
async def get_workflow_status(workflow_id: str):
    """
    Get the status and details of a specific workflow.
    """
    # TODO: Replace in-memory dict with a real database call.
    if workflow_id not in db_workflows:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return db_workflows[workflow_id]

import asyncio
from datetime import datetime
from typing import Dict, Any

from .celery_app import celery_app
from .database import SessionLocal
from . import models

# Corrected imports for the top-level packages
from core.orchestrator import Orchestrator
from models.user_input import UserInput
from models.workflow import Workflow as PydanticWorkflow, Task as PydanticTask


@celery_app.task(bind=True)
def run_workflow_task(self, workflow_id: str):
    """
    A Celery task to execute a workflow DAG using the new Orchestrator, with robust state management.
    """
    print(f"Celery task started for workflow: {workflow_id}")
    db = SessionLocal()
    try:
        db_workflow = db.query(models.Workflow).filter(models.Workflow.id == workflow_id).first()
        if not db_workflow:
            print(f"Workflow {workflow_id} not found for execution.")
            return "Workflow not found."

        db_workflow.status = "running"
        db_workflow.started_at = datetime.utcnow()
        db.commit()

        db_contract = db.query(models.OutcomeContract).filter(models.OutcomeContract.id == db_workflow.contract_id).first()
        if not db_contract:
            raise Exception(f"Contract {db_workflow.contract_id} not found.")

        # 1. Reconstruct UserInput and Workflow from the database
        user_input = UserInput.from_orm(db_contract)

        tasks_data = db_workflow.dag_definition.get("tasks", [])
        pydantic_tasks = [PydanticTask(**task_data) for task_data in tasks_data]
        pydantic_workflow = PydanticWorkflow(user_input=user_input, tasks=pydantic_tasks)


        def save_step_callback(node_id: str, agent_name: str, output_data: Dict[str, Any], status: str):
            """Callback function to save the result of each agent step to the DB."""
            print(f"  Saving state for node '{node_id}' with status '{status}'...")
            execution_record = models.AgentExecution(
                workflow_id=workflow_id,
                node_id=node_id,
                agent_name=agent_name,
                output_data=output_data,
                status=status
            )
            db.add(execution_record)
            db.commit()

        # 2. Instantiate Orchestrator
        orchestrator = Orchestrator(user_input)

        # 3. Execute the workflow using asyncio.run
        asyncio.run(orchestrator.execute_workflow(pydantic_workflow, on_step_complete=save_step_callback))

        # Mark the main workflow as completed
        db_workflow.status = "completed"
        db_workflow.progress = 1.0
        db_workflow.completed_at = datetime.utcnow()
        db.commit()

        print(f"Celery task finished successfully for workflow: {workflow_id}")
        return "Workflow completed successfully."

    except Exception as e:
        print(f"Error during Celery task for workflow {workflow_id}: {e}")
        db.rollback()
        db_workflow = db.query(models.Workflow).filter(models.Workflow.id == workflow_id).first()
        if db_workflow:
            db_workflow.status = "failed"
            db.commit()
        raise
    finally:
        db.close()

from .celery_app import celery_app
from .database import SessionLocal
from . import models
from guild.core.orchestrator import execute_dag
from datetime import datetime
from typing import Dict, Any
from guild.core.models.schemas import OutcomeContract as PydanticOutcomeContract

@celery_app.task(bind=True)
def run_workflow_task(self, workflow_id: str):
    """
    A Celery task to execute a workflow DAG, with robust state management.
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

        pydantic_contract = PydanticOutcomeContract.from_orm(db_contract)

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

        # Execute the DAG, passing the callback
        execute_dag(db_workflow.dag_definition, pydantic_contract, save_step_callback)

        # Mark the main workflow as completed
        db_workflow.status = "completed"
        db_workflow.progress = 1.0
        db_workflow.completed_at = datetime.utcnow()
        db.commit()

        print(f"Celery task finished successfully for workflow: {workflow_id}")
        return "Workflow completed successfully."

    except Exception as e:
        print(f"Error during Celery task for workflow {workflow_id}: {e}")
        # Rollback any partial changes and set status to 'failed'
        db.rollback()
        db_workflow = db.query(models.Workflow).filter(models.Workflow.id == workflow_id).first()
        if db_workflow:
            db_workflow.status = "failed"
            db.commit()
        # self.update_state(state='FAILURE', meta={'exc': e}) # More advanced error handling
        raise
    finally:
        db.close()

from .celery_app import celery_app
from .database import SessionLocal
from . import models
from guild.core.orchestrator import execute_dag
from datetime import datetime

@celery_app.task(bind=True)
def run_workflow_task(self, workflow_id: str):
    """
    A Celery task to execute a workflow DAG.
    """
    print(f"Celery task started for workflow: {workflow_id}")
    db = SessionLocal()
    try:
        db_workflow = db.query(models.Workflow).filter(models.Workflow.id == workflow_id).first()
        if not db_workflow:
            print(f"Workflow {workflow_id} not found in database for execution.")
            return "Workflow not found."

        # Update status to 'running' now that the task has started
        db_workflow.status = "running"
        db_workflow.started_at = datetime.utcnow()
        db.commit()

from guild.core.models.schemas import OutcomeContract as PydanticOutcomeContract

        # Fetch the associated contract to pass to the orchestrator
        db_contract = db.query(models.OutcomeContract).filter(models.OutcomeContract.id == db_workflow.contract_id).first()
        if not db_contract:
            raise Exception(f"Contract {db_workflow.contract_id} not found for workflow {workflow_id}")

        # Convert to Pydantic model before passing to the guild package
        pydantic_contract = PydanticOutcomeContract.from_orm(db_contract)

        # Execute the DAG from the guild package
        execute_dag(db_workflow.dag_definition, pydantic_contract)

        # Update the workflow status in the database upon completion
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

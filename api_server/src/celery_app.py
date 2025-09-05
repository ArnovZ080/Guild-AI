"""
Celery Application Configuration

This module configures the Celery task queue for background job processing
and scheduled task execution.
"""

import os
from celery import Celery

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'api_server.src.django_settings')

# Create the Celery app
celery_app = Celery('guild_ai')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
celery_app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django app configs.
celery_app.autodiscover_tasks()

# Celery Beat Configuration
celery_app.conf.update(
    # Task serialization
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    
    # Task routing
    task_routes={
        'guild.src.core.blueprint_engine.*': {'queue': 'blueprints'},
        'guild.src.core.workflow_builder.*': {'queue': 'workflows'},
        'guild.src.core.learning.*': {'queue': 'learning'},
    },
    
    # Task execution
    task_always_eager=False,  # Set to True for testing
    task_eager_propagates=True,
    
    # Worker configuration
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
    
    # Result backend
    result_backend='redis://redis:6379/1',
    
    # Broker configuration
    broker_url='redis://redis:6379/0',
    
    # Task time limits
    task_soft_time_limit=300,  # 5 minutes
    task_time_limit=600,       # 10 minutes
    
    # Beat scheduler
    beat_scheduler='django_celery_beat.schedulers:DatabaseScheduler',
)

@celery_app.task(bind=True)
def debug_task(self):
    """Debug task to test Celery functionality."""
    print(f'Request: {self.request!r}')
    return 'Celery is working!'

@celery_app.task
def hello():
    """Simple hello task for testing."""
    return 'Hello from Guild AI Celery!'

@celery_app.task
def execute_blueprint(blueprint_id: str, trigger_data: dict = None):
    """Execute a blueprint as a Celery task."""
    try:
        # Import here to avoid circular imports
        from guild.src.core.blueprint_engine import BlueprintEngine
        from guild.src.core.orchestrator import Orchestrator
        
        # Create mock orchestrator for now
        class MockOrchestrator:
            pass
        
        orchestrator = MockOrchestrator()
        blueprint_engine = BlueprintEngine(orchestrator)
        
        # Execute the blueprint
        result = blueprint_engine.execute_blueprint(blueprint_id, trigger_data)
        return result
        
    except Exception as e:
        return {'error': str(e), 'status': 'failed'}

# Make the app available for import
celery = celery_app

from celery import Celery
from guild.src.core.config import settings

# The Celery broker and backend URLs are taken from our application's settings,
# which are loaded from the .env file.
celery_app = Celery(
    "tasks",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=["api_server.src.tasks"]  # Point to the module where tasks are defined
)

celery_app.conf.update(
    task_track_started=True,
)

from celery import Celery
from guild.src.core.config import settings

# The Redis URL is taken from our application's settings, which are loaded from .env
# This assumes the Redis service is named 'redis' in docker-compose.
# For local development without Docker, it might be 'redis://localhost:6379'
redis_url = settings.REDIS_URL

celery_app = Celery(
    "tasks",
    broker=f"{redis_url}/0",
    backend=f"{redis_url}/1",
    include=["api_server.src.tasks"]  # Point to the module where tasks are defined
)

celery_app.conf.update(
    task_track_started=True,
)

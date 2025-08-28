from fastapi import FastAPI
from guild.src.core.config import settings
from .database import engine, Base
from . import models

# Create all database tables
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Guild API Server",
    description="The API for orchestrating the Guild AI workforce.",
    version="1.0.0"
)


@app.on_event("startup")
async def startup_event():
    print("Starting up Guild API server...")
    print(f"Loaded settings: DATABASE_URL={settings.DATABASE_URL}")


from api_server.src.routes import workflows, data_rooms, onboarding

app.include_router(workflows.router)
app.include_router(data_rooms.router)
app.include_router(onboarding.router)


@app.get("/")
async def root():
    """
    Root endpoint for health checks.
    """
    return {"message": "Guild API Server is running."}

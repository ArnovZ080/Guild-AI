from fastapi import FastAPI
from guild.src.core.config import settings
from .database import engine, Base
from . import models
from fastapi.middleware.cors import CORSMiddleware
import os

# Create all database tables
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Guild API Server",
    description="The API for orchestrating the Guild AI workforce.",
    version="1.0.0"
)

# CORS configuration
origins_env = os.getenv("ALLOWED_ORIGINS", "")
allowed_origins = [o for o in (origins_env.split(",") if origins_env else []) if o]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    print("Starting up Guild API server...")
    print(f"Loaded settings: DATABASE_URL={settings.DATABASE_URL}")


from api_server.src.routes import workflows, data_rooms, onboarding, schedules, webhooks, vision, voice

app.include_router(workflows.router)
app.include_router(data_rooms.router)
app.include_router(onboarding.router)
# app.include_router(workflow_builder.router)  # Temporarily disabled due to vision dependency issues
app.include_router(schedules.router)
app.include_router(webhooks.router)
app.include_router(vision.router)
app.include_router(voice.router)


@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/")
async def root():
    """
    Root endpoint for health checks.
    """
    return {"message": "Guild API Server is running."}

from fastapi import FastAPI
from guild.src.core.config import settings

app = FastAPI(
    title="Guild API Server",
    description="The API for orchestrating the Guild AI workforce.",
    version="1.0.0"
)

# TODO: Set up database connection for FastAPI
# This will involve creating a database session management system
# that can be used with FastAPI's dependency injection.

@app.on_event("startup")
async def startup_event():
    print("Starting up Guild API server...")
    # TODO: Initialize database, etc.
    print(f"Loaded settings: DATABASE_URL={settings.DATABASE_URL}")


from api_server.src.routes import workflows

app.include_router(workflows.router)


@app.get("/")
async def root():
    """
    Root endpoint for health checks.
    """
    return {"message": "Guild API Server is running."}

from fastapi import FastAPI  # type: ignore[reportMissingImports]
from fastapi.staticfiles import StaticFiles  # type: ignore[reportMissingImports]
from fastapi.middleware.cors import CORSMiddleware  # type: ignore[reportMissingImports]
from starlette.middleware.trustedhost import TrustedHostMiddleware
import os
import logging

logger = logging.getLogger(__name__)

# Security imports
from .security.security_middleware import SecurityMiddleware, SecurityHeadersMiddleware
from .security.env_validator import EnvironmentValidator

# Initialize database tables
from .database import engine, Base
from . import models  # noqa: F401
# Base.metadata.create_all(bind=engine)  # Disabled: Migrations handle table creation


app = FastAPI(
    title="Guild API Server",
    description="The API for orchestrating the Guild AI workforce.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Security middleware (applied first)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(SecurityMiddleware)

# Trusted host middleware - allow all hosts in production for Cloud Run compatibility
# TrustedHostMiddleware doesn't support wildcards reliably, so we allow all hosts
# Security is handled by other middleware layers (SecurityMiddleware, rate limiting, etc.)
allowed_hosts = os.getenv("ALLOWED_HOSTS", "").split(",") if os.getenv("ALLOWED_HOSTS") else ["*"]
app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=allowed_hosts
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
    print("Server ready to handle agent interactions!")


# Import routes
from .routes import agents, oauth, document_processing, auth, subscription, credits
from .routes import execution_layer, connectors, onboarding, workspace, orchestrator, quality_control, business_intelligence, waitlist
from .routes import agents_available, analytics, health
from .routes import settings as settings_routes
from .routes import notifications as notifications_routes
from .routes import geocode as geocode_routes
from .routes import content_ws, workflow_websocket
from .routes import profile, content
from .routes import conversations
from .routes import campaign_agents, asset_agents
from .routes import growth_opportunities
from .routes import calendar
from .routes import calendar_oauth

# Include routers
app.include_router(agents.router)
app.include_router(oauth.router)
app.include_router(document_processing.router)
app.include_router(auth.router)
app.include_router(subscription.router)
app.include_router(credits.router)
app.include_router(execution_layer.router)
app.include_router(connectors.router)
app.include_router(onboarding.router)
app.include_router(waitlist.router)
app.include_router(orchestrator.router)
app.include_router(quality_control.router)
app.include_router(business_intelligence.router)
app.include_router(workspace.router)
app.include_router(agents_available.router)
app.include_router(analytics.router)
app.include_router(health.router)
app.include_router(settings_routes.router)
app.include_router(notifications_routes.router)
app.include_router(geocode_routes.router)
# WS routers
app.include_router(content_ws.router)
app.include_router(workflow_websocket.router)
# Business profile and content intelligence routes
app.include_router(profile.router)
app.include_router(content.router)
# Batch A: campaign-related agent endpoints
app.include_router(campaign_agents.router)
# Asset generation agents (image, video, editing)
app.include_router(asset_agents.router)
# Conversations aggregation endpoints
app.include_router(conversations.router)
# Goals router
from .routes import goals
app.include_router(goals.router)
# Achievements router
from .routes import achievements
app.include_router(achievements.router)
# Growth opportunities router
app.include_router(growth_opportunities.router)
# Calendar router
app.include_router(calendar.router)
app.include_router(calendar_oauth.router)
# Serve uploads directory for profile assets
import os
uploads_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "uploads"))
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")
# app.include_router(business_metrics.router)  # Module doesn't exist

# Comment out other routes that depend on database
# from api_server.src.routes import workflows, data_rooms, onboarding, schedules, webhooks, vision, voice
# app.include_router(workflows.router)
# app.include_router(data_rooms.router)
# app.include_router(onboarding.router)
# app.include_router(schedules.router)
# app.include_router(webhooks.router)
# app.include_router(vision.router)
# app.include_router(voice.router)


@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/api/health")
async def api_health():
    """API health check endpoint"""
    return {"message": "Guild API Server is running.", "status": "ok"}

# Serve frontend static files (must be last!)
# This catches all routes not matched by API endpoints
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
if os.path.exists(frontend_dist):
    logger.info(f"Serving frontend from: {frontend_dist}")
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="frontend")
else:
    logger.warning(f"Frontend dist directory not found: {frontend_dist}")
    
    @app.get("/")
    async def root_fallback():
        """Fallback when frontend is not built"""
        return {
            "message": "Guild API Server is running",
            "note": "Frontend not built. Run 'cd frontend && npm run build' to build frontend.",
            "api_docs": "/docs"
        }

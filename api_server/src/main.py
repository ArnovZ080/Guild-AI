from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, FileResponse, JSONResponse
from starlette.middleware.trustedhost import TrustedHostMiddleware
import os
import logging

logger = logging.getLogger(__name__)

try:
    from .security.security_middleware import SecurityMiddleware, SecurityHeadersMiddleware
    SECURITY_AVAILABLE = True
except ImportError as e:
    logger.warning(f"Security middleware not available: {e}")
    SECURITY_AVAILABLE = False

try:
    from .database import engine, Base
    from . import models
    DATABASE_AVAILABLE = True
except ImportError as e:
    logger.warning(f"Database not available: {e}")
    DATABASE_AVAILABLE = False
    engine = None

app = FastAPI(
    title="Guild API Server",
    description="The API for orchestrating the Guild AI workforce.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# --- Middleware ---

if SECURITY_AVAILABLE:
    app.add_middleware(SecurityHeadersMiddleware)
    app.add_middleware(SecurityMiddleware)

allowed_hosts = os.getenv("ALLOWED_HOSTS", "*").split(",")
app.add_middleware(TrustedHostMiddleware, allowed_hosts=allowed_hosts)

allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Event Handlers ---

@app.on_event("startup")
async def startup_event():
    logger.info("🚀 Guild-AI API Server starting up...")
    if DATABASE_AVAILABLE:
        try:
            from sqlalchemy import text
            with engine.connect() as connection:
                connection.execute(text("SELECT 1"))
            logger.info("✅ Database connection successful")
        except Exception as e:
            logger.error(f"❌ Database connection failed: {e}")
    else:
        logger.warning("⚠️ Database not configured, running in limited mode")

# --- API Routers ---

try:
    # Import and include all your API routers here
    from .routes import (
        agents, auth_firebase, business_ceo, calendar, calendar_oauth,
        campaign_agents, content, content_ws, conversations, credits,
        customer_intelligence, dashboard_endpoints, document_processing,
        execution_layer, executive_coordination, geocode, goals,
        growth_opportunities, health, notifications, oauth, onboarding,
        orchestrator_fixed as orchestrator, profile, quality_control,
        settings as settings_routes, subscription, user_config,
        workspace, business_intelligence, waitlist, agents_available,
        analytics, asset_agents
    )

    app.include_router(agents.router)
    app.include_router(auth_firebase.router)
    app.include_router(business_ceo.router)
    app.include_router(calendar.router)
    app.include_router(calendar_oauth.router)
    app.include_router(campaign_agents.router)
    app.include_router(content.router)
    app.include_router(content_ws.router)
    app.include_router(conversations.router)
    app.include_router(credits.router)
    app.include_router(customer_intelligence.router)
    app.include_router(dashboard_endpoints.router)
    app.include_router(document_processing.router)
    app.include_router(execution_layer.router)
    app.include_router(executive_coordination.router)
    app.include_router(geocode.router)
    app.include_router(goals.router)
    app.include_router(growth_opportunities.router)
    app.include_router(health.router)
    app.include_router(notifications.router)
    app.include_router(oauth.router)
    app.include_router(onboarding.router)
    app.include_router(orchestrator.router)
    app.include_router(profile.router)
    app.include_router(quality_control.router)
    app.include_router(settings_routes.router)
    app.include_router(subscription.router)
    app.include_router(user_config.router)
    app.include_router(workspace.router)
    app.include_router(business_intelligence.router)
    app.include_router(waitlist.router)
    app.include_router(agents_available.router)
    app.include_router(analytics.router)
    app.include_router(asset_agents.router)
    
    logger.info("✅ All API routes registered successfully")

except ImportError as e:
    logger.error(f"❌ Failed to import one or more routers: {e}")

# --- SPA and Static Files ---

# Custom 404 handler for SPA routing
@app.exception_handler(404)
async def custom_404_handler(request: Request, exc):
    path = request.url.path
    if path.startswith("/api/"):
        return JSONResponse(
            status_code=404,
            content={"detail": "Not Found"}
        )
    
    frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
    index_path = os.path.join(frontend_dist, "index.html")
    
    if os.path.exists(index_path):
        return FileResponse(index_path)
    
    return HTMLResponse(
        content="<h1>Frontend not found</h1><p>The frontend distribution files were not found.</p>",
        status_code=404
    )

# Serve static files for the frontend
uploads_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "uploads"))
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist), name="static")
else:
    logger.warning(f"Frontend dist directory not found at {frontend_dist}")

@app.get("/")
async def root():
    return {"message": "Guild API Server is running"}

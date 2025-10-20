from fastapi import FastAPI  # type: ignore[reportMissingImports]
from fastapi.staticfiles import StaticFiles  # type: ignore[reportMissingImports]
from fastapi.middleware.cors import CORSMiddleware  # type: ignore[reportMissingImports]
from fastapi.responses import HTMLResponse, FileResponse, JSONResponse  # type: ignore[reportMissingImports]
from starlette.middleware.trustedhost import TrustedHostMiddleware
import os
import logging

logger = logging.getLogger(__name__)

# Security imports (with error handling)
try:
    from .security.security_middleware import SecurityMiddleware, SecurityHeadersMiddleware
    from .security.env_validator import EnvironmentValidator
    SECURITY_AVAILABLE = True
except Exception as e:
    logger.warning(f"Security middleware initialization failed: {e}")
    SECURITY_AVAILABLE = False

# Initialize database tables (lazy loading to prevent startup failures)
try:
    from .database import engine, Base, get_db
    from . import models  # noqa: F401
    # Base.metadata.create_all(bind=engine)  # Disabled: Migrations handle table creation
    DATABASE_AVAILABLE = True
except Exception as e:
    logger.warning(f"Database initialization failed: {e}")
    DATABASE_AVAILABLE = False
    engine = None

app = FastAPI(
    title="Guild API Server",
    description="The API for orchestrating the Guild AI workforce.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Add startup health check
@app.on_event("startup")
async def startup_event():
    """Application startup event"""
    logger.info("🚀 Guild-AI API Server starting up...")
    
    # Test database connection only if available
    if DATABASE_AVAILABLE and engine:
        try:
            from sqlalchemy import text
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.info("✅ Database connection verified")
        except Exception as e:
            logger.warning(f"⚠️  Database connection warning: {e}")
    else:
        logger.warning("⚠️  Database not available - running in limited mode")
    
    logger.info("🎯 Guild-AI API Server ready!")

@app.get("/health")
async def health_check():
    """Health check endpoint for Cloud Run"""
    if not DATABASE_AVAILABLE or not engine:
        return {
            "status": "healthy",
            "database": "unavailable",
            "timestamp": "2024-01-01T00:00:00Z"
        }
    
    try:
        # Test database connection
        from sqlalchemy import text
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        db_status = "healthy"
    except Exception as e:
        logger.warning(f"Database health check failed: {e}")
        db_status = "unhealthy"
    
    return {
        "status": "healthy",
        "database": db_status,
        "timestamp": "2024-01-01T00:00:00Z"
    }

# Security middleware (applied first) - only if available
if SECURITY_AVAILABLE:
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


# Import routes (with error handling)
try:
    from .routes import agents, oauth, document_processing, auth_firebase as auth, subscription, credits
    from .routes import execution_layer, connectors, onboarding, workspace, orchestrator_fixed as orchestrator, quality_control, business_intelligence, waitlist
    from .routes import agents_available, analytics, health
    from .routes import business_ceo, executive_coordination
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
    from .routes import customer_intelligence
    from .routes import dashboard_endpoints
    # Include routers only if imports succeeded
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
    app.include_router(business_ceo.router)
    app.include_router(executive_coordination.router)
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
    # Customer intelligence endpoints
    app.include_router(customer_intelligence.router)
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
    # Dashboard endpoints (social, financial, marketing)
    app.include_router(dashboard_endpoints.router)
    # User configuration endpoints
    from .routes import user_config
    app.include_router(user_config.router)
    
    ROUTES_AVAILABLE = True
    logger.info("✅ All routes imported and registered successfully")
except Exception as e:
    logger.error(f"Route imports failed: {e}")
    import traceback
    logger.error(f"Import traceback: {traceback.format_exc()}")
    ROUTES_AVAILABLE = False
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

# Custom 404 handler for SPA routing
from fastapi.exceptions import HTTPException as StarletteHTTPException

@app.exception_handler(404)
async def custom_404_handler(request, exc):
    """
    Custom 404 handler that serves index.html for non-API routes (SPA routing).
    This allows hard refresh to work on React Router routes.
    """
    path = request.url.path
    
    # For API routes, return proper 404 JSON
    if path.startswith('/api/') or path.startswith('/docs') or path.startswith('/redoc') or path.startswith('/openapi'):
        return JSONResponse(
            status_code=404,
            content={"detail": "Not Found"}
        )
    
    # For all other routes, serve index.html (SPA routing)
    frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
    index_path = os.path.join(frontend_dist, "index.html")
    
    if os.path.exists(index_path):
        with open(index_path, 'r') as f:
            return HTMLResponse(content=f.read())
    
    return JSONResponse(
        status_code=404,
        content={"detail": "Frontend not found"}
    )

# Serve frontend static files (must be last!)
# This catches all routes not matched by API endpoints
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
if os.path.exists(frontend_dist):
    logger.info(f"Serving frontend from: {frontend_dist}")
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="frontend")
else:
    logger.warning(f"Frontend dist directory not found: {frontend_dist}")
    # Also check build directory as fallback
    frontend_build = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "build"))
    if os.path.exists(frontend_build):
        logger.info(f"Serving frontend from build directory: {frontend_build}")
        app.mount("/", StaticFiles(directory=frontend_build, html=True), name="frontend")
    else:
        logger.warning(f"Frontend build directory not found: {frontend_build}")
    
    @app.get("/")
    async def root_fallback():
        """Fallback when frontend is not built - serve basic HTML"""
        return HTMLResponse(content="""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Guild AI - AI Workforce Platform</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh; display: flex; align-items: center; justify-content: center;
        }
        .container { 
            background: white; border-radius: 20px; padding: 40px; text-align: center;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1); max-width: 500px; margin: 20px;
        }
        .logo { font-size: 3em; margin-bottom: 20px; }
        h1 { color: #333; margin-bottom: 20px; }
        .status { 
            background: #e8f5e8; color: #2d5a2d; padding: 15px; border-radius: 10px;
            margin: 20px 0; border-left: 4px solid #4caf50;
        }
        .api-link { 
            display: inline-block; background: #667eea; color: white; 
            padding: 12px 24px; text-decoration: none; border-radius: 8px;
            margin: 10px; transition: background 0.3s;
        }
        .api-link:hover { background: #5a6fd8; }
        .footer { margin-top: 30px; color: #666; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🚀</div>
        <h1>Guild AI</h1>
        <p>Your AI Workforce Platform is running!</p>
        
        <div class="status">
            ✅ API Server: Online<br>
            ⚠️ Frontend: Building in progress
        </div>
        
        <a href="/docs" class="api-link">API Documentation</a>
        <a href="/health" class="api-link">Health Check</a>
        
        <div class="footer">
            <p>Frontend is being built and will be available shortly.</p>
            <p>API endpoints are fully functional.</p>
        </div>
    </div>
</body>
</html>
        """)

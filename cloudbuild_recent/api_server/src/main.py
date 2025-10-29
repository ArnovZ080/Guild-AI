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

    # Optionally skip DB connectivity test on startup to avoid Cloud Run timeouts
    skip_db_check = os.getenv("SKIP_STARTUP_DB_CHECK", "true").lower() == "true"

    if skip_db_check:
        if DATABASE_AVAILABLE and engine:
            logger.info("⏭️  Skipping database health check on startup (SKIP_STARTUP_DB_CHECK=true)")
        else:
            logger.warning("⚠️  Database not available - running in limited mode")
    else:
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

# Ensure orchestrator health routes are always available even if other routes fail
try:
    from .routes import orchestrator_unified as orchestrator
    app.include_router(orchestrator.router)
    logger.info("✅ Orchestrator routes registered (standalone)")
except Exception as e:
    logger.error(f"Orchestrator route import failed: {e}")

# Hardwired orchestrator health as a safety net
@app.get("/api/orchestrator/health")
async def orchestrator_health_direct():
    try:
        import os
        llm_provider = os.getenv("LLM_PROVIDER", "unknown")
        vertex_model = os.getenv("VERTEX_AI_MODEL", "unknown")
        vertex_location = os.getenv("VERTEX_AI_LOCATION", "unknown")
        gemini_ready = False
        try:
            from .llm.gemini_provider import gemini_provider  # type: ignore
            gemini_ready = bool(getattr(gemini_provider, 'initialized', False))
        except Exception:
            gemini_ready = False
        return {
            "status": "healthy",
            "service": "orchestrator",
            "version": "2.0",
            "capabilities": {
                "chat_processing": True,
                "workflow_creation": True,
                "agent_coordination": True
            },
            "llm": {
                "provider": llm_provider,
                "gemini_initialized": gemini_ready,
                "model": vertex_model,
                "location": vertex_location
            }
        }
    except Exception:
        return {
            "status": "healthy",
            "service": "orchestrator",
            "version": "2.0"
        }

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


# Import remaining routes (with error handling)
try:
    from .routes import agents, oauth, document_processing, subscription, credits
    # Try Firebase auth, fallback to basic auth if not available
    try:
        from .routes import auth_firebase as auth
        logger.info("✅ Firebase auth routes loaded")
    except ImportError as e:
        logger.warning(f"Firebase auth not available, using basic auth: {e}")
        from .routes import auth_basic as auth
    from .routes import execution_layer, connectors, workspace, quality_control, business_intelligence, waitlist
    # Try onboarding routes, fallback to basic if Firebase not available
    try:
        from .routes import onboarding
        logger.info("✅ Onboarding routes loaded (Firebase)")
    except ImportError as e:
        logger.warning(f"Firebase onboarding not available, using basic onboarding: {e}")
        from .routes import onboarding_basic as onboarding
    from .routes import agents_available, analytics, health
    # Try agents routes, fallback to basic if Firebase not available
    try:
        from .routes import agents
        logger.info("✅ Agents routes loaded (Firebase)")
    except ImportError as e:
        logger.warning(f"Firebase agents not available, using basic agents: {e}")
        from .routes import agents_basic as agents
    # Add status routes
    from .routes import status_basic as status
    # Try business routes, fallback to basic if Firebase not available
    try:
        from .routes import business_ceo, executive_coordination
        logger.info("✅ Business routes loaded (Firebase)")
    except ImportError as e:
        logger.warning(f"Firebase business routes not available: {e}")
        # Create basic business routes if needed
        business_ceo = None
        executive_coordination = None
    # Try other routes, fallback to basic if Firebase not available
    try:
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
        logger.info("✅ Additional routes loaded (Firebase)")
    except ImportError as e:
        logger.warning(f"Firebase additional routes not available: {e}")
        # Set to None to avoid errors
        settings_routes = None
        notifications_routes = None
        geocode_routes = None
        content_ws = None
        workflow_websocket = None
        profile = None
        content = None
        conversations = None
        campaign_agents = None
        asset_agents = None
        growth_opportunities = None
        calendar = None
        calendar_oauth = None
        customer_intelligence = None
        dashboard_endpoints = None
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
    # Orchestrator router already included above
    app.include_router(quality_control.router)
    app.include_router(business_intelligence.router)
    app.include_router(workspace.router)
    app.include_router(agents_available.router)
    app.include_router(agents.router)
    app.include_router(status.router)
    app.include_router(analytics.router)
    app.include_router(health.router)
    # Include business routes only if available
    if business_ceo:
        app.include_router(business_ceo.router)
    if executive_coordination:
        app.include_router(executive_coordination.router)
    # Include additional routes only if available
    if settings_routes:
        app.include_router(settings_routes.router)
    if notifications_routes:
        app.include_router(notifications_routes.router)
    if geocode_routes:
        app.include_router(geocode_routes.router)
    # WS routers
    if content_ws:
        app.include_router(content_ws.router)
    if workflow_websocket:
        app.include_router(workflow_websocket.router)
    # Business profile and content intelligence routes
    if profile:
        app.include_router(profile.router)
    if content:
        app.include_router(content.router)
    # Batch A: campaign-related agent endpoints
    if campaign_agents:
        app.include_router(campaign_agents.router)
    # Asset generation agents (image, video, editing)
    if asset_agents:
        app.include_router(asset_agents.router)
    # Conversations aggregation endpoints
    if conversations:
        app.include_router(conversations.router)
    # Customer intelligence endpoints
    if customer_intelligence:
        app.include_router(customer_intelligence.router)
    # Goals router
    try:
        from .routes import goals
        app.include_router(goals.router)
    except ImportError:
        logger.warning("Goals routes not available")
    # Achievements router
    try:
        from .routes import achievements
        app.include_router(achievements.router)
    except ImportError:
        logger.warning("Achievements routes not available")
    # Growth opportunities router
    if growth_opportunities:
        app.include_router(growth_opportunities.router)
    # Calendar router
    if calendar:
        app.include_router(calendar.router)
    if calendar_oauth:
        app.include_router(calendar_oauth.router)
    # Dashboard endpoints (social, financial, marketing)
    if dashboard_endpoints:
        app.include_router(dashboard_endpoints.router)
    # User configuration endpoints
    from .routes import user_config
    app.include_router(user_config.router)
    
    # Knowledge Library routes
    from .routes import knowledge
    app.include_router(knowledge.router, prefix="/api/knowledge", tags=["knowledge"])
    
    # Database migration routes
    from .routes import database_migration
    app.include_router(database_migration.router, prefix="/api/migration", tags=["migration"])
    
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

# Try multiple possible paths for frontend dist
possible_paths = [
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist")),
    os.path.abspath(os.path.join("/app", "frontend", "dist")),
    os.path.abspath(os.path.join(os.getcwd(), "frontend", "dist")),
    os.path.abspath(os.path.join(os.getcwd(), "dist"))
]

frontend_served = False
for frontend_path in possible_paths:
    if os.path.exists(frontend_path):
        logger.info(f"✅ Serving frontend from: {frontend_path}")
        logger.info(f"📁 Frontend files: {os.listdir(frontend_path) if os.path.exists(frontend_path) else 'Not found'}")
        # NOTE: Do NOT use html=True - it breaks API POST requests!
        # The 404 exception handler will serve index.html for SPA routing
        app.mount("/", StaticFiles(directory=frontend_path), name="frontend")
        frontend_served = True
        break
    else:
        logger.warning(f"❌ Frontend path not found: {frontend_path}")

if not frontend_served:
    logger.error("❌ No frontend directory found! Available paths:")
    for path in possible_paths:
        logger.error(f"   - {path}")
    logger.error("📁 Current working directory contents:")
    try:
        for item in os.listdir(os.getcwd()):
            logger.error(f"   - {item}")
    except:
        logger.error("   - Could not list directory")
    
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

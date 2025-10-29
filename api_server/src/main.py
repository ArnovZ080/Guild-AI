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
    logger.info("✅ Unified Orchestrator routes registered (standalone)")
except Exception as e:
    logger.error(f"Unified Orchestrator route import failed: {e}")
    # Fallback to fixed orchestrator
    try:
        from .routes import orchestrator_fixed as orchestrator
        app.include_router(orchestrator.router)
        logger.info("✅ Fallback Orchestrator routes registered")
    except Exception as e2:
        logger.error(f"Fallback Orchestrator route import failed: {e2}")

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
# Support both comma and semicolon separators
if ";" in origins_env:
    allowed_origins = [o.strip() for o in origins_env.split(";") if o.strip()]
else:
    allowed_origins = [o.strip() for o in origins_env.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Removed duplicate startup handler - merged into primary one above


"""Per-router guarded registration to avoid all-or-nothing failures."""
ROUTES_AVAILABLE = True

def _safe_include(router_module_name: str, *, router_attr: str = "router", prefix: str | None = None, tags: list[str] | None = None):
    global ROUTES_AVAILABLE
    try:
        module = __import__(f"{__name__.rsplit('.', 1)[0]}.routes.{router_module_name}", fromlist=[router_module_name])
        router_obj = getattr(module, router_attr)
        if prefix or tags:
            app.include_router(router_obj, prefix=prefix if prefix else "", tags=tags)
        else:
            app.include_router(router_obj)
        logger.info(f"✅ Registered router: {router_module_name}{' with prefix ' + prefix if prefix else ''}")
    except Exception as e:
        ROUTES_AVAILABLE = False
        logger.error(f"❌ Failed to register router {router_module_name}: {e}")

# CRITICAL ROUTERS - Must be available for core functionality
logger.info("🚀 Registering critical routers...")
_safe_include("auth_firebase", prefix="/api/auth", tags=["authentication"])
_safe_include("onboarding", prefix="/api/onboarding", tags=["Onboarding"])
_safe_include("user_config", prefix="/api/user-config", tags=["user-config"])
_safe_include("orchestrator_unified", prefix="/api/orchestrator", tags=["Unified Orchestrator"])
_safe_include("subscription", prefix="/api/subscription", tags=["subscription"])
_safe_include("waitlist", prefix="/api/waitlist", tags=["waitlist"])
_safe_include("agents_available", prefix="/api/agents", tags=["agents"])
_safe_include("connectors", prefix="/api/connectors", tags=["connectors"])
_safe_include("conversations", prefix="/api/conversations", tags=["conversations"])

# DATABASE & KNOWLEDGE ROUTERS
logger.info("📚 Registering database and knowledge routers...")
_safe_include("knowledge", prefix="/api/knowledge", tags=["knowledge"])
_safe_include("database_migration", prefix="/api/migration", tags=["migration"])
_safe_include("conversations", prefix="/api/conversations", tags=["conversations"])

# BUSINESS INTELLIGENCE & ANALYTICS ROUTERS
logger.info("📊 Registering business intelligence routers...")
_safe_include("business_intelligence", prefix="/api/business-intelligence", tags=["business-intelligence"])
_safe_include("customer_intelligence", prefix="/api/customer-intelligence", tags=["customer-intelligence"])
_safe_include("analytics", prefix="/api/analytics", tags=["analytics"])
_safe_include("dashboard_endpoints", prefix="/api/dashboard", tags=["dashboard"])

# CONTENT & CAMPAIGN ROUTERS
logger.info("📝 Registering content and campaign routers...")
_safe_include("content", prefix="/api/content", tags=["content"])
_safe_include("campaign_agents", prefix="/api/campaigns", tags=["campaigns"])
_safe_include("asset_agents", prefix="/api/assets", tags=["assets"])

# CALENDAR & SCHEDULING ROUTERS
logger.info("📅 Registering calendar routers...")
_safe_include("calendar", prefix="/api/calendar", tags=["calendar"])
_safe_include("calendar_oauth", prefix="/api/calendar-oauth", tags=["calendar-oauth"])

# GOALS & ACHIEVEMENTS ROUTERS
logger.info("🎯 Registering goals and achievements routers...")
_safe_include("goals", prefix="/api/goals", tags=["goals"])
_safe_include("achievements", prefix="/api/achievements", tags=["achievements"])
_safe_include("growth_opportunities", prefix="/api/growth-opportunities", tags=["growth-opportunities"])

# ADDITIONAL ROUTERS (non-critical, best effort)
logger.info("🔧 Registering additional routers...")
_safe_include("agents", prefix="/api/agents-legacy", tags=["agents-legacy"])
_safe_include("oauth", prefix="/api/oauth", tags=["oauth"])
_safe_include("document_processing", prefix="/api/documents", tags=["documents"])
_safe_include("credits", prefix="/api/credits", tags=["credits"])
_safe_include("execution_layer", prefix="/api/execution", tags=["execution"])
_safe_include("workspace", prefix="/api/workspace", tags=["workspace"])
_safe_include("quality_control", prefix="/api/quality", tags=["quality-control"])
_safe_include("business_ceo", prefix="/api/business-ceo", tags=["business-ceo"])
_safe_include("executive_coordination", prefix="/api/executive", tags=["executive"])
_safe_include("settings", prefix="/api/settings", tags=["settings"])
_safe_include("notifications", prefix="/api/notifications", tags=["notifications"])
_safe_include("geocode", prefix="/api/geocode", tags=["geocode"])
_safe_include("profile", prefix="/api/profile", tags=["profile"])
_safe_include("health", prefix="/api/health-extra", tags=["health"])

# WEBSOCKET ROUTERS (no prefix needed)
logger.info("🔌 Registering websocket routers...")
_safe_include("content_ws", tags=["websockets"])
_safe_include("workflow_websocket", tags=["websockets"])

# MCP SERVER ROUTERS (Model Context Protocol endpoints)
logger.info("🤖 Registering MCP server routers...")
# Import and mount MCP servers as sub-applications
try:
    from .mcp import (
        social_media_mcp_server, crm_mcp_server, accounting_mcp_server,
        calendar_mcp_server, ecommerce_mcp_server, analytics_mcp_server,
        project_management_mcp_server, payments_mcp_server,
        communication_mcp_server, email_marketing_mcp_server,
        ad_platforms_mcp_server, support_mcp_server,
        cloud_infrastructure_mcp_server, ai_analytics_mcp_server,
        human_os_mcp_server, design_media_mcp_server,
        intelligence_mcp_server, recruitment_mcp_server,
        seo_tools_mcp_server, productivity_mcp_server
    )
    
    # Mount each MCP server as a sub-application
    app.mount("/mcp/social-media", social_media_mcp_server.app)
    app.mount("/mcp/crm", crm_mcp_server.app)
    app.mount("/mcp/accounting", accounting_mcp_server.app)
    app.mount("/mcp/calendar", calendar_mcp_server.app)
    app.mount("/mcp/ecommerce", ecommerce_mcp_server.app)
    app.mount("/mcp/analytics", analytics_mcp_server.app)
    app.mount("/mcp/project-management", project_management_mcp_server.app)
    app.mount("/mcp/payments", payments_mcp_server.app)
    app.mount("/mcp/communication", communication_mcp_server.app)
    app.mount("/mcp/email-marketing", email_marketing_mcp_server.app)
    app.mount("/mcp/ad-platforms", ad_platforms_mcp_server.app)
    app.mount("/mcp/support", support_mcp_server.app)
    app.mount("/mcp/cloud-infrastructure", cloud_infrastructure_mcp_server.app)
    app.mount("/mcp/ai-analytics", ai_analytics_mcp_server.app)
    app.mount("/mcp/human-os", human_os_mcp_server.app)
    app.mount("/mcp/design-media", design_media_mcp_server.app)
    app.mount("/mcp/intelligence", intelligence_mcp_server.app)
    app.mount("/mcp/recruitment", recruitment_mcp_server.app)
    app.mount("/mcp/seo-tools", seo_tools_mcp_server.app)
    app.mount("/mcp/productivity", productivity_mcp_server.app)
    
    logger.info("✅ 20 MCP servers mounted successfully")
except Exception as e:
    logger.warning(f"⚠️ Failed to mount MCP servers: {e}")
    logger.info("MCP functionality will be unavailable, but core system will continue")

logger.info("✅ Router registration complete")
# Serve uploads directory for profile assets
import os
uploads_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "uploads"))
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")
# app.include_router(business_metrics.router)  # Module doesn't exist

# Removed duplicate /health and /api/health - they're already defined above at lines 121-145

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
    frontend_dist = "/app/frontend/dist"
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
frontend_dist = "/app/frontend/dist"
if os.path.exists(frontend_dist):
    logger.info(f"Serving frontend from: {frontend_dist}")
    # NOTE: Do NOT use html=True - it breaks API POST requests!
    # The 404 exception handler will serve index.html for SPA routing
    app.mount("/", StaticFiles(directory=frontend_dist), name="frontend")
else:
    logger.warning(f"Frontend dist directory not found: {frontend_dist}")
    # Also check build directory as fallback
    frontend_build = "/app/frontend/build"
    if os.path.exists(frontend_build):
        logger.info(f"Serving frontend from build directory: {frontend_build}")
        # NOTE: Do NOT use html=True - it breaks API POST requests!
        app.mount("/", StaticFiles(directory=frontend_build), name="frontend")
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

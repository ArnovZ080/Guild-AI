"""
Guild-AI Backend Main Application
FastAPI application with agent communication system
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import uvicorn
from contextlib import asynccontextmanager

# Import API routes
from .api.agents.routes import router as agents_router
from .api.onboarding.routes import router as onboarding_router
# from .api.orchestrator.routes import router as orchestrator_router  # Removed - using enhanced orchestrator instead
from .api.enhanced_orchestrator_api import router as enhanced_orchestrator_router
from .api.unified_orchestrator_api import router as unified_orchestrator_router
from .api.subscription_api import router as subscription_router
from .api.integrations.health import router as integrations_health_router
from .api.analytics.token_usage import router as token_usage_router

# Import agent system
from .agents.agent_orchestrator import agent_orchestrator
from .agents.content_creation_agent import ContentCreationAgent
from .websocket.agent_communication import agent_comm_manager

# Import database service
from .services.database_service import db_service

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    logger.info("Starting Guild-AI Backend...")
    
    # Initialize database tables
    try:
        await db_service.create_tables()
        logger.info("Database tables initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database tables: {e}")
    
    # Register agents
    content_agent = ContentCreationAgent()
    agent_orchestrator.register_agent(content_agent)
    
    # Start orchestrator worker
    await agent_orchestrator.start_worker()
    
    logger.info("Guild-AI Backend started successfully!")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Guild-AI Backend...")
    await agent_orchestrator.stop_worker()
    logger.info("Guild-AI Backend shutdown complete!")

# Create FastAPI application
app = FastAPI(
    title="Guild-AI Backend",
    description="AI Agent Communication and Orchestration System",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174", "http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(agents_router)
app.include_router(onboarding_router)
# Enhanced Orchestrator with full agent and integration awareness (PRIMARY)
app.include_router(enhanced_orchestrator_router)
# Unified Orchestrator - Fortune 500 Level Business Intelligence
app.include_router(unified_orchestrator_router)
# Subscription and agent hiring system
app.include_router(subscription_router)
# Integration health monitoring API
app.include_router(integrations_health_router, prefix="/api/integrations", tags=["integrations"])
# Token usage tracking and cost monitoring
app.include_router(token_usage_router, prefix="/api/analytics/token-usage", tags=["analytics"])

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Guild-AI Backend API",
        "version": "1.0.0",
        "status": "running",
        "agents": len(agent_orchestrator.agents)
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "agents_registered": len(agent_orchestrator.agents),
        "active_sessions": len(agent_orchestrator.active_sessions),
        "websocket_connections": len(agent_comm_manager.active_connections)
    }

@app.websocket("/ws/general")
async def websocket_general(websocket: WebSocket):
    """General WebSocket endpoint for testing"""
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"Echo: {data}")
    except WebSocketDisconnect:
        logger.info("General WebSocket disconnected")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )

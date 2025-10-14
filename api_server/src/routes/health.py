"""
Health check endpoints for monitoring system status
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
import os
import time

from ..database import get_db

router = APIRouter(
    prefix="/health",
    tags=["Health Checks"],
)

@router.get("/")
async def health_check():
    """Basic health check"""
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "environment": os.getenv("FASTAPI_APP_ENV", "unknown")
    }

@router.get("/database")
async def database_health_check(db: Session = Depends(get_db)):
    """Database connection health check"""
    try:
        # Test basic connection
        result = db.execute(text("SELECT 1 as test")).fetchone()
        
        if result and result.test == 1:
            return {
                "status": "healthy",
                "database": "connected",
                "timestamp": time.time()
            }
        else:
            return {
                "status": "unhealthy",
                "database": "connection_failed",
                "timestamp": time.time()
            }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "connection_error",
            "error": str(e),
            "timestamp": time.time()
        }

@router.get("/cloud-sql")
async def cloud_sql_health_check():
    """Cloud SQL configuration health check"""
    try:
        cloudsql_connection = os.getenv("CLOUDSQL_CONNECTION_NAME")
        postgres_user = os.getenv("POSTGRES_USER")
        postgres_db = os.getenv("POSTGRES_DB")
        project_id = os.getenv("GOOGLE_CLOUD_PROJECT")
        
        return {
            "status": "configured" if all([cloudsql_connection, postgres_user, postgres_db, project_id]) else "misconfigured",
            "cloudsql_connection_name": cloudsql_connection,
            "postgres_user": postgres_user,
            "postgres_db": postgres_db,
            "project_id": project_id,
            "timestamp": time.time()
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "timestamp": time.time()
        }

@router.get("/full")
async def full_health_check(db: Session = Depends(get_db)):
    """Comprehensive health check including all systems"""
    health_status = {
        "overall": "healthy",
        "timestamp": time.time(),
        "checks": {}
    }
    
    # Database check
    try:
        db.execute(text("SELECT 1"))
        health_status["checks"]["database"] = {"status": "healthy"}
    except Exception as e:
        health_status["checks"]["database"] = {"status": "unhealthy", "error": str(e)}
        health_status["overall"] = "unhealthy"
    
    # Environment check
    try:
        required_env_vars = [
            "GOOGLE_CLOUD_PROJECT",
            "CLOUDSQL_CONNECTION_NAME",
            "POSTGRES_USER",
            "POSTGRES_DB"
        ]
        
        missing_vars = [var for var in required_env_vars if not os.getenv(var)]
        
        if missing_vars:
            health_status["checks"]["environment"] = {
                "status": "unhealthy",
                "missing_variables": missing_vars
            }
            health_status["overall"] = "unhealthy"
        else:
            health_status["checks"]["environment"] = {"status": "healthy"}
    except Exception as e:
        health_status["checks"]["environment"] = {"status": "error", "error": str(e)}
        health_status["overall"] = "unhealthy"
    
    return health_status

"""
Database Migration Routes
Handles database migrations from within the Cloud Run service
"""

from fastapi import APIRouter, HTTPException
from sqlalchemy import text
from ..database import get_db
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/migrate")
async def run_migrations():
    """Run database migrations"""
    try:
        db = next(get_db())
        
        # Create conversations table if it doesn't exist
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS conversations (
                id VARCHAR PRIMARY KEY,
                user_id VARCHAR NOT NULL,
                title VARCHAR(200),
                status VARCHAR(20) DEFAULT 'active',
                total_messages INTEGER DEFAULT 0,
                last_message_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                archived_at TIMESTAMP
            )
        """))
        
        # Create conversation_messages table if it doesn't exist
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS conversation_messages (
                id VARCHAR PRIMARY KEY,
                conversation_id VARCHAR NOT NULL,
                user_id VARCHAR NOT NULL,
                message_type VARCHAR(20) NOT NULL,
                content TEXT NOT NULL,
                model_used VARCHAR(100),
                tokens_used INTEGER,
                processing_time FLOAT,
                workflow_id VARCHAR(50),
                agent_responses JSONB DEFAULT '[]',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """))
        
        # Create indexes
        db.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id)
        """))
        
        db.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_conversation_messages_conversation_id ON conversation_messages(conversation_id)
        """))
        
        db.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_conversation_messages_user_id ON conversation_messages(user_id)
        """))
        
        db.commit()
        
        logger.info("✅ Database migrations completed successfully")
        
        return {
            "success": True,
            "message": "Database migrations completed successfully",
            "tables_created": ["conversations", "conversation_messages"]
        }
        
    except Exception as e:
        logger.error(f"❌ Database migration failed: {e}")
        raise HTTPException(status_code=500, detail=f"Database migration failed: {str(e)}")

@router.get("/status")
async def migration_status():
    """Check migration status"""
    try:
        db = next(get_db())
        
        # Check if tables exist
        conversations_exists = db.execute(text("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'conversations'
            )
        """)).scalar()
        
        messages_exists = db.execute(text("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'conversation_messages'
            )
        """)).scalar()
        
        return {
            "success": True,
            "conversations_table": bool(conversations_exists),
            "conversation_messages_table": bool(messages_exists),
            "migration_needed": not (conversations_exists and messages_exists)
        }
        
    except Exception as e:
        logger.error(f"❌ Migration status check failed: {e}")
        return {
            "success": False,
            "error": str(e),
            "migration_needed": True
        }

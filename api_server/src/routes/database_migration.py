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
        
        # Create users table if it doesn't exist
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(50) PRIMARY KEY,
                firebase_uid VARCHAR(128) UNIQUE,
                supabase_id VARCHAR(128) UNIQUE,
                email VARCHAR(255) UNIQUE NOT NULL,
                name VARCHAR(255),
                avatar_url VARCHAR(500),
                subscription_status VARCHAR(50) DEFAULT 'free',
                subscription_tier VARCHAR(50) DEFAULT 'free',
                credits_used_this_month INTEGER DEFAULT 0,
                credits_limit INTEGER DEFAULT 100,
                bonus_credits INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP,
                is_active BOOLEAN DEFAULT true
            )
        """))
        
        # Create onboarding_data table if it doesn't exist
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS onboarding_data (
                id VARCHAR(50) PRIMARY KEY,
                user_id VARCHAR(50) NOT NULL REFERENCES users(id),
                raw_responses JSONB NOT NULL,
                business_type VARCHAR(100),
                business_description TEXT,
                target_audience VARCHAR(200),
                brand_voice_tone VARCHAR(200),
                completion_percentage FLOAT DEFAULT 0.0,
                needs_follow_up BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """))
        
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
            CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid)
        """))
        
        db.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_users_supabase_id ON users(supabase_id)
        """))
        
        db.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
        """))
        
        db.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_onboarding_data_user_id ON onboarding_data(user_id)
        """))
        
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

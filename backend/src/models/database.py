"""
Database Models for Guild-AI Backend
SQLAlchemy models for onboarding data, follow-up tracking, and user management
"""

from sqlalchemy import Column, String, DateTime, Text, JSON, Boolean, Integer, ForeignKey, Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

Base = declarative_base()

class User(Base):
    """User model for storing user information"""
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    onboarding_data = relationship("OnboardingData", back_populates="user", uselist=False)
    follow_up_sessions = relationship("FollowUpSession", back_populates="user")
    orchestrator_actions = relationship("OrchestratorAction", back_populates="user")

class OnboardingData(Base):
    """Model for storing onboarding questionnaire responses"""
    __tablename__ = "onboarding_data"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    
    # Onboarding responses (JSON field for flexibility)
    business_answers = Column(JSON, nullable=True)  # Business-related questions
    audience_answers = Column(JSON, nullable=True)  # Audience-related questions
    brand_answers = Column(JSON, nullable=True)     # Brand-related questions
    financial_answers = Column(JSON, nullable=True) # Financial-related questions
    goals_answers = Column(JSON, nullable=True)     # Goals-related questions
    preferences_answers = Column(JSON, nullable=True) # Preferences
    integrations_answers = Column(JSON, nullable=True) # Integrations
    
    # Metadata
    completed_at = Column(DateTime, nullable=True)
    onboarding_version = Column(String(50), default="2.0_psychologically_optimized")
    psychological_profile = Column(JSON, nullable=True)
    
    # Follow-up tracking
    has_pending_followups = Column(Boolean, default=False)
    followup_count = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="onboarding_data")
    
    # Indexes for performance
    __table_args__ = (
        Index('idx_onboarding_user_completed', 'user_id', 'completed_at'),
        Index('idx_onboarding_pending_followups', 'has_pending_followups', 'followup_count'),
    )

class FollowUpSession(Base):
    """Model for tracking follow-up question sessions"""
    __tablename__ = "follow_up_sessions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    
    # Follow-up session details
    session_type = Column(String(50), nullable=False)  # 'onboarding_followup', 'brand_development', etc.
    status = Column(String(20), default="active")  # 'active', 'completed', 'paused'
    
    # Session data
    pending_questions = Column(JSON, nullable=True)  # Array of pending follow-up questions
    completed_questions = Column(JSON, nullable=True)  # Array of completed questions
    session_context = Column(JSON, nullable=True)  # Additional context data
    
    # Progress tracking
    total_questions = Column(Integer, default=0)
    completed_count = Column(Integer, default=0)
    priority_score = Column(Integer, default=0)  # Calculated priority score
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="follow_up_sessions")
    
    # Indexes
    __table_args__ = (
        Index('idx_followup_user_status', 'user_id', 'status'),
        Index('idx_followup_priority', 'priority_score', 'created_at'),
    )

class FollowUpQuestion(Base):
    """Model for individual follow-up questions"""
    __tablename__ = "follow_up_questions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("follow_up_sessions.id"), nullable=False, index=True)
    
    # Question details
    original_question_id = Column(String(100), nullable=False)  # e.g., 'brand_voice_tone'
    original_question_text = Column(Text, nullable=False)
    original_answer = Column(Text, nullable=False)
    
    # Follow-up details
    follow_up_question = Column(Text, nullable=False)
    follow_up_answer = Column(Text, nullable=True)
    
    # Action details
    action_type = Column(String(50), nullable=False)  # 'orchestrator_initiate', 'manual_review', etc.
    action_data = Column(JSON, nullable=True)  # Action configuration
    orchestrator_task_id = Column(String(100), nullable=True)  # Reference to orchestrator task
    
    # Status and priority
    status = Column(String(20), default="pending")  # 'pending', 'in_progress', 'completed', 'cancelled'
    priority = Column(String(10), default="medium")  # 'high', 'medium', 'low'
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    answered_at = Column(DateTime, nullable=True)
    action_initiated_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    
    # Indexes
    __table_args__ = (
        Index('idx_followup_question_session_status', 'session_id', 'status'),
        Index('idx_followup_question_priority', 'priority', 'created_at'),
        Index('idx_followup_question_original', 'original_question_id'),
    )

class OrchestratorAction(Base):
    """Model for tracking orchestrator actions initiated from follow-up questions"""
    __tablename__ = "orchestrator_actions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    follow_up_question_id = Column(UUID(as_uuid=True), ForeignKey("follow_up_questions.id"), nullable=True, index=True)
    
    # Action details
    action_type = Column(String(50), nullable=False)  # 'determine_optimal_audience', 'define_brand_voice', etc.
    task_description = Column(Text, nullable=False)
    assigned_agents = Column(JSON, nullable=False)  # Array of agent IDs
    
    # Execution details
    status = Column(String(20), default="initiated")  # 'initiated', 'in_progress', 'completed', 'failed'
    session_id = Column(String(100), nullable=True)  # Orchestrator session ID
    progress_percentage = Column(Integer, default=0)
    
    # Results
    result_data = Column(JSON, nullable=True)
    error_message = Column(Text, nullable=True)
    completion_message = Column(Text, nullable=True)
    
    # Timestamps
    initiated_at = Column(DateTime, default=datetime.utcnow)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="orchestrator_actions")
    
    # Indexes
    __table_args__ = (
        Index('idx_orchestrator_user_status', 'user_id', 'status'),
        Index('idx_orchestrator_action_type', 'action_type', 'initiated_at'),
        Index('idx_orchestrator_followup', 'follow_up_question_id'),
    )

class UserSession(Base):
    """Model for tracking user sessions and chat interactions"""
    __tablename__ = "user_sessions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    
    # Session details
    session_type = Column(String(50), nullable=False)  # 'chat', 'onboarding', 'followup', etc.
    session_name = Column(String(255), nullable=True)
    
    # Session data
    context_data = Column(JSON, nullable=True)
    messages = Column(JSON, nullable=True)  # Array of chat messages
    metadata = Column(JSON, nullable=True)
    
    # Status
    status = Column(String(20), default="active")  # 'active', 'paused', 'completed', 'archived'
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_activity_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Indexes
    __table_args__ = (
        Index('idx_session_user_type', 'user_id', 'session_type'),
        Index('idx_session_status_activity', 'status', 'last_activity_at'),
    )

# ---------------------------------------------------------------------------
# Workflow Draft / Run Models (support for drag-and-drop builder + orchestrator)
# ---------------------------------------------------------------------------

class Workflow(Base):
    """Persisted workflow definition (draft or active)."""
    __tablename__ = "workflows"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text)
    definition = Column(JSONB, nullable=False)  # full node / edge graph
    status = Column(String, default="draft")
    marketplace_visibility = Column(Boolean, default=False)
    rental_price_credits = Column(Integer, default=0)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    activated_at = Column(DateTime)
    completed_at = Column(DateTime)


class WorkflowRun(Base):
    """Each execution of a stored workflow."""
    __tablename__ = "workflow_runs"

    run_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    workflow_id = Column(String, ForeignKey("workflows.id"), nullable=False)
    orchestrator_workflow_id = Column(String)
    status = Column(String, default="running")
    metrics = Column(JSONB)

    started_at = Column(DateTime, default=datetime.utcnow)
    finished_at = Column(DateTime)

    created_at = Column(DateTime, default=datetime.utcnow)

# Database configuration
DATABASE_URL = "postgresql://guild_user:guild_password@localhost:5432/guild_ai"

def get_database_url():
    """Get database URL from environment or use default"""
    import os
    return os.getenv("DATABASE_URL", DATABASE_URL)

def create_tables(engine):
    """Create all database tables"""
    Base.metadata.create_all(bind=engine)

def drop_tables(engine):
    """Drop all database tables"""
    Base.metadata.drop_all(bind=engine)

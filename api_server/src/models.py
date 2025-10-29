from sqlalchemy import Column, String, Text, JSON, DateTime, Float, Integer, ForeignKey, Boolean, Numeric
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from .database import Base

class OutcomeContract(Base):
    __tablename__ = 'outcome_contracts'

    id = Column(String(50), primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    objective = Column(Text, nullable=False)
    target_audience = Column(JSON, default=lambda: {})  # Added missing field
    additional_notes = Column(Text, nullable=True)  # Added missing field
    deliverables = Column(JSON, default=lambda: [])
    data_rooms = Column(JSON, default=lambda: [])
    rubric = Column(JSON, default=lambda: {})
    status = Column(String(20), default='draft', index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    workflows = relationship('Workflow', back_populates='contract')


# --- Goals & Progress Tracking ---
class Goal(Base):
    __tablename__ = 'goals'

    id = Column(String(50), primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    type = Column(String(50), nullable=False, default='general')
    priority = Column(String(20), nullable=False, default='medium')
    timeframe = Column(String(20), nullable=False, default='medium-term')
    target_date = Column(DateTime, nullable=False)
    status = Column(String(20), nullable=False, default='planning')
    progress = Column(Integer, nullable=False, default=0)
    metrics = Column(JSON, default=lambda: {})
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Link to orchestrated workflow (if any)
    workflow_id = Column(String(50), nullable=True)
    contract_id = Column(String(50), nullable=True)

    milestones = relationship('GoalMilestone', back_populates='goal', cascade="all, delete-orphan")
    actions = relationship('AgentActionLog', back_populates='goal', cascade="all, delete-orphan")


class GoalMilestone(Base):
    __tablename__ = 'goal_milestones'

    id = Column(String(50), primary_key=True, index=True)
    goal_id = Column(String(50), ForeignKey('goals.id'), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    due_date = Column(DateTime, nullable=True)
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)

    goal = relationship('Goal', back_populates='milestones')


class AgentActionLog(Base):
    __tablename__ = 'agent_action_logs'

    id = Column(String(50), primary_key=True, index=True)
    goal_id = Column(String(50), ForeignKey('goals.id'), nullable=False, index=True)
    agent_type = Column(String(100), nullable=False)
    action = Column(Text, nullable=False)
    rationale = Column(Text, nullable=True)
    action_metadata = Column(JSON, default=lambda: {})
    created_at = Column(DateTime, default=datetime.utcnow)

    goal = relationship('Goal', back_populates='actions')


class GrowthOpportunity(Base):
    """Model for storing autonomous growth opportunities identified by the Growth Opportunity Agent"""
    __tablename__ = 'growth_opportunities'

    id = Column(String(50), primary_key=True, index=True)
    title = Column(String(300), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(50), nullable=False, index=True)  # marketing, sales, product, operations, financial
    priority = Column(String(20), nullable=False, index=True)  # high, medium, low
    impact = Column(String(20), nullable=False)  # high, medium, low
    effort = Column(String(20), nullable=False)  # high, medium, low
    timeframe = Column(String(100), nullable=False)
    expected_roi = Column(String(200), nullable=False)
    expected_revenue = Column(String(200), nullable=False)
    confidence_score = Column(Float, nullable=False)
    
    # JSON fields for structured data
    data_sources = Column(JSON, default=lambda: [])
    supporting_data = Column(JSON, default=lambda: [])
    requirements = Column(JSON, default=lambda: [])
    risks = Column(JSON, default=lambda: [])
    recommended_agents = Column(JSON, default=lambda: [])
    workflow_steps = Column(JSON, default=lambda: [])
    
    # Transparent reasoning
    reasoning = Column(Text, nullable=True)
    
    # Status tracking
    status = Column(String(20), default='pending', index=True)  # pending, accepted, rejected, in_progress, completed
    workflow_id = Column(String(50), nullable=True)  # Link to created workflow
    rejection_reason = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    accepted_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    
    # Performance tracking for accepted opportunities
    actual_roi = Column(String(200), nullable=True)
    actual_revenue = Column(String(200), nullable=True)
    performance_metrics = Column(JSON, default=lambda: {})


class Workflow(Base):
    __tablename__ = 'workflows'

    id = Column(String(50), primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)  # Add user relationship
    contract_id = Column(String(50), ForeignKey('outcome_contracts.id'), nullable=False)
    dag_definition = Column(JSON, nullable=False)
    status = Column(String(20), default='pending', index=True)
    progress = Column(Float, default=0.0)
    current_agent = Column(String(100), nullable=True)
    estimated_duration = Column(String(50), nullable=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="workflows")
    contract = relationship('OutcomeContract', back_populates='workflows')
    agent_executions = relationship('AgentExecution', back_populates='workflow')
    deliverables = relationship('Deliverable', back_populates='workflow')


class AgentExecution(Base):
    __tablename__ = 'agent_executions'

    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(String(50), ForeignKey('workflows.id'), nullable=False)
    node_id = Column(String(100), nullable=False) # From the DAG definition
    agent_name = Column(String(100), nullable=False)
    status = Column(String(20), default='pending')
    input_data = Column(JSON, default=lambda: {})
    output_data = Column(JSON, default=lambda: {})
    error_message = Column(Text, nullable=True)
    execution_time = Column(Float, nullable=True)

    workflow = relationship('Workflow', back_populates='agent_executions')


class Deliverable(Base):
    __tablename__ = 'deliverables'

    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(String(50), ForeignKey('workflows.id'), nullable=False)
    type = Column(String(50), nullable=False)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=True)
    file_path = Column(String(500), nullable=True)
    status = Column(String(20), default='draft')

    workflow = relationship('Workflow', back_populates='deliverables')


class DataRoom(Base):
    __tablename__ = 'data_rooms'

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    provider = Column(String(50), nullable=False)
    config = Column(JSON, default=lambda: {})
    read_only = Column(Boolean, default=True)
    last_sync_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class ConnectorCredential(Base):
    __tablename__ = 'connector_credentials'

    id = Column(String(50), primary_key=True, index=True)
    provider = Column(String(50), nullable=False)
    account_id = Column(String(200), nullable=False)
    account_name = Column(String(200), nullable=True)
    access_token = Column(Text, nullable=False)
    refresh_token = Column(Text, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    scopes = Column(JSON, default=lambda: [])
    created_at = Column(DateTime, default=datetime.utcnow)

class OAuthState(Base):
    __tablename__ = 'oauth_states'
    
    id = Column(Integer, primary_key=True, index=True)
    state = Column(String(100), unique=True, index=True, nullable=False)
    provider = Column(String(50), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class WaitingList(Base):
    """Waiting list for users who want to join before launch"""
    __tablename__ = "waiting_list"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=False, index=True)
    full_name = Column(String, nullable=True)
    company = Column(String, nullable=True)
    role = Column(String, nullable=True)
    how_heard = Column(String, nullable=True)  # How they heard about Guild AI
    use_case = Column(Text, nullable=True)  # What they plan to use it for
    
    # Status tracking
    status = Column(String, default="pending")  # pending, invited, converted, rejected
    invited_at = Column(DateTime, nullable=True)
    converted_at = Column(DateTime, nullable=True)  # When they became a user
    converted_user_id = Column(String, ForeignKey("users.id"), nullable=True)
    
    # Metadata
    referral_source = Column(String, nullable=True)
    utm_campaign = Column(String, nullable=True)
    utm_source = Column(String, nullable=True)
    utm_medium = Column(String, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Notes from admin
    admin_notes = Column(Text, nullable=True)



class Subscription(Base):
    __tablename__ = "subscriptions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    
    # Paystack details
    paystack_subscription_code = Column(String, unique=True, nullable=True)
    paystack_plan_code = Column(String, nullable=False)
    
    # Subscription details
    status = Column(String, nullable=False)  # active, cancelled, incomplete, past_due
    tier = Column(String, nullable=False)    # starter, professional, enterprise
    amount = Column(Numeric(10, 2), nullable=False)  # Amount in ZAR
    currency = Column(String, default="ZAR")
    
    # Billing cycle
    current_period_start = Column(DateTime, nullable=True)
    current_period_end = Column(DateTime, nullable=True)
    trial_end = Column(DateTime, nullable=True)
    
    # Credits and limits
    monthly_credits = Column(Integer, nullable=False)
    api_calls_limit = Column(Integer, nullable=False)
    features = Column(JSON, nullable=True)  # JSON of enabled features
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    cancelled_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="subscriptions")

class UsageLog(Base):
    __tablename__ = "usage_logs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    
    # Usage details
    action_type = Column(String, nullable=False)  # chat_message, workflow_execution, content_generation
    credits_consumed = Column(Integer, default=1)
    api_endpoint = Column(String, nullable=True)
    
    # Metadata
    extra_data = Column(JSON, nullable=True)  # Store additional context
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="usage_logs")

class CreditTransaction(Base):
    __tablename__ = "credit_transactions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    
    # Package details
    package_id = Column(String, nullable=False)
    credits_purchased = Column(Integer, nullable=False)
    bonus_credits = Column(Integer, default=0)
    total_credits = Column(Integer, nullable=False)
    
    # Pricing details
    usd_amount = Column(Numeric(10, 2), nullable=False)
    zar_amount = Column(Numeric(10, 2), nullable=False)
    exchange_rate = Column(Numeric(10, 4), nullable=False)
    
    # Payment details
    paystack_reference = Column(String, unique=True, nullable=False)
    paystack_transaction_id = Column(String, nullable=True)
    status = Column(String, default="pending")  # pending, completed, failed
    
    # Metadata
    extra_data = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="credit_transactions")


# --- User Model ---
class User(Base):
    __tablename__ = 'users'

    id = Column(String(50), primary_key=True, index=True)
    firebase_uid = Column(String(128), unique=True, index=True)
    supabase_id = Column(String(128), unique=True, index=True)  # For backward compatibility
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    subscription_status = Column(String(50), default='free')
    subscription_tier = Column(String(50), default='free')
    credits_used_this_month = Column(Integer, default=0)
    credits_limit = Column(Integer, default=100)
    bonus_credits = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    workflows = relationship("Workflow", back_populates="user")
    onboarding_data = relationship("OnboardingData", back_populates="user")
    subscriptions = relationship("Subscription", back_populates="user")
    usage_logs = relationship("UsageLog", back_populates="user")
    credit_transactions = relationship("CreditTransaction", back_populates="user")
    conversations = relationship("Conversation", back_populates="user")
    conversation_messages = relationship("ConversationMessage", back_populates="user")


# --- Onboarding Data Model ---
class OnboardingData(Base):
    __tablename__ = 'onboarding_data'

    id = Column(String(50), primary_key=True, index=True)
    user_id = Column(String(50), ForeignKey("users.id"), nullable=False)
    raw_responses = Column(JSON, nullable=False)
    business_type = Column(String(100), nullable=True)
    business_description = Column(Text, nullable=True)
    target_audience = Column(String(200), nullable=True)
    brand_voice_tone = Column(String(200), nullable=True)
    completion_percentage = Column(Float, default=0.0)
    needs_follow_up = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="onboarding_data")


# --- Conversation Models ---
class Conversation(Base):
    __tablename__ = "conversations"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=True)
    status = Column(String(20), default="active")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="conversations")
    messages = relationship("ConversationMessage", back_populates="conversation", cascade="all, delete-orphan")


class ConversationMessage(Base):
    __tablename__ = "conversation_messages"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    conversation_id = Column(String, ForeignKey("conversations.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    message_type = Column(String(20), nullable=False)  # user, assistant, system
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="conversation_messages")
    conversation = relationship("Conversation", back_populates="messages")

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

# User Management
class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    firebase_uid = Column(String, unique=True, nullable=True)  # Firebase user ID
    supabase_id = Column(String, unique=True, nullable=True)  # Legacy Supabase user ID (for backwards compatibility)
    email = Column(String, unique=True, nullable=False)
    full_name = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    
    # Subscription info
    subscription_status = Column(String, default="free")  # free, active, cancelled, past_due
    subscription_tier = Column(String, default="free")    # free, starter, professional, enterprise
    paystack_customer_id = Column(String, nullable=True)
    
    # Beta testing access
    is_beta_tester = Column(Boolean, default=False)  # True for beta testers with full access
    beta_access_granted_at = Column(DateTime, nullable=True)
    beta_access_granted_by = Column(String, nullable=True)  # Admin who granted access
    
    # Admin access
    is_admin = Column(Boolean, default=False)  # True for platform admins/owners
    admin_role = Column(String, nullable=True)  # owner, admin, moderator
    admin_granted_at = Column(DateTime, nullable=True)
    
    # Usage tracking
    credits_used_this_month = Column(Integer, default=0)
    credits_limit = Column(Integer, default=100)  # Free tier limit
    bonus_credits = Column(Integer, default=0)    # Purchased credits that don't expire
    api_calls_this_month = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    
    # Relationships
    subscriptions = relationship("Subscription", back_populates="user")
    workflows = relationship("Workflow", back_populates="user")
    usage_logs = relationship("UsageLog", back_populates="user")
    credit_transactions = relationship("CreditTransaction", back_populates="user")
    onboarding_data = relationship("OnboardingData", back_populates="user", uselist=False)


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


class OnboardingData(Base):
    """Source of truth for user's business information collected during onboarding"""
    __tablename__ = "onboarding_data"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, unique=True)
    
    # Business Information
    business_type = Column(String, nullable=True)
    business_description = Column(Text, nullable=True)
    industry = Column(String, nullable=True)
    
    # Audience Information
    target_audience = Column(Text, nullable=True)
    customer_avatar = Column(JSON, nullable=True)
    audience_problems = Column(Text, nullable=True)
    audience_size = Column(String, nullable=True)
    
    # Brand Information
    brand_voice_tone = Column(String, nullable=True)
    brand_personality = Column(JSON, nullable=True)
    brand_colors = Column(JSON, nullable=True)
    logo_status = Column(String, nullable=True)
    brand_values = Column(JSON, nullable=True)
    brand_story = Column(Text, nullable=True)
    brand_differentiation = Column(Text, nullable=True)
    brand_consistency = Column(String, nullable=True)
    
    # Financial Information
    pricing_status = Column(String, nullable=True)
    pricing_model = Column(String, nullable=True)
    marketing_budget = Column(String, nullable=True)
    revenue_goals = Column(String, nullable=True)
    
    # Goals & Priorities
    priority_3months = Column(Text, nullable=True)
    key_metrics = Column(JSON, nullable=True)
    success_definition = Column(Text, nullable=True)
    
    # Preferences
    communication_style = Column(String, nullable=True)
    data_storage_preference = Column(String, nullable=True)
    security_preference = Column(String, nullable=True)
    
    # Completion tracking
    incomplete_fields = Column(JSON, default=lambda: [])  # List of fields that need follow-up
    completion_percentage = Column(Integer, default=0)
    needs_follow_up = Column(Boolean, default=False)
    
    # Raw onboarding responses (full data)
    raw_responses = Column(JSON, default=lambda: {})
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationship
    user = relationship("User", back_populates="onboarding_data")

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


class UserSettings(Base):
    """Model for storing user-specific settings in a structured way"""
    __tablename__ = 'user_settings'

    id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey('users.id'), nullable=False, unique=True, index=True)

    # JSON blob to store various settings; provides flexibility
    settings_data = Column(JSON, default=lambda: {
        "agent_configurations": {},
        "workflow_templates": {},
        "preferences": {},
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    })

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship to User
    user = relationship("User", back_populates="settings")


# Add relationship to User model
User.settings = relationship("UserSettings", back_populates="user", uselist=False, cascade="all, delete-orphan")

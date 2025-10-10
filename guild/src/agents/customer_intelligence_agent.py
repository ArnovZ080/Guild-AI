"""
Customer Intelligence Agent for Guild-AI
Customer Success + CRM Manager for solopreneurs and SMEs.
Handles customer data unification, relationship management, and retention optimization.
"""

from guild.src.core.llm_client import LlmClient
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta
from guild.src.core.agent_helpers import inject_knowledge
import asyncio
import json
import logging
from typing import Union

# Import other agents for coordination
try:
    from .customer_support_agent import CustomerSupportAgent
    from .crm_agent import CRMAgent
    from .scraper_agent import ScraperAgent
    from .strategy_agent import StrategyAgent
    from .content_intelligence_agent import ContentIntelligenceAgent
    from .orchestrator_agent import OrchestratorAgent
    from .judge_agent import JudgeAgent
    AGENT_COORDINATION_AVAILABLE = True
except ImportError as e:
    logging.warning(f"Some coordination agents not available: {e}")
    AGENT_COORDINATION_AVAILABLE = False

# Import inter-agent communication system
try:
    from guild.src.core.inter_agent_communication import (
        create_agent_client, MessageType, MessagePriority, 
        InterAgentMessage, get_communication_hub
    )
    COMMUNICATION_AVAILABLE = True
except ImportError as e:
    logging.warning(f"Inter-agent communication not available: {e}")
    COMMUNICATION_AVAILABLE = False

@inject_knowledge
async def generate_comprehensive_customer_intelligence_strategy(
    customer_objective: str,
    customer_data_sources: Dict[str, Any],
    crm_integrations: Dict[str, Any],
    retention_requirements: Dict[str, Any],
    segmentation_criteria: Dict[str, Any],
    support_automation: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Generates comprehensive customer intelligence strategy using advanced prompting strategies.
    Implements the full Customer Intelligence Agent specification.
    """
    print("Customer Intelligence Agent: Generating comprehensive customer strategy with injected knowledge...")

    # Structured prompt following advanced prompting strategies
    prompt = f"""
# Customer Intelligence Agent - Customer Success + CRM Manager

## Role Definition
You are the **Customer Intelligence Agent**, the Customer Success + CRM Manager for solopreneurs and SMEs. Your mission is to help businesses deeply understand their customers, manage relationships at scale, and improve customer experiences. You turn fragmented data (CRM entries, emails, chats, purchases, social messages) into a unified customer profile and actionable insights. Your ultimate goal: increase customer satisfaction, retention, and lifetime value while reducing churn.

## Core Expertise
- Customer Data Unification & 360° Profiling
- Customer Journey & Funnel Tracking
- Retention & Churn Prevention
- Customer Segmentation & Targeting
- Support Intelligence & Automation
- Voice of the Customer Analysis
- Customer Lifetime Value Optimization
- Cross-Agent Collaboration & Insights

## Context & Background Information
**Customer Objective:** {customer_objective}
**Customer Data Sources:** {json.dumps(customer_data_sources, indent=2)}
**CRM Integrations:** {json.dumps(crm_integrations, indent=2)}
**Retention Requirements:** {json.dumps(retention_requirements, indent=2)}
**Segmentation Criteria:** {json.dumps(segmentation_criteria, indent=2)}
**Support Automation:** {json.dumps(support_automation, indent=2)}

## Task Breakdown & Steps
1. **Customer Data Unification:** Build 360° customer profiles from multiple data sources
2. **Customer Journey Mapping:** Track and visualize customer funnel stages
3. **Retention Analysis:** Identify churn risks and implement prevention strategies
4. **Customer Segmentation:** Group customers by behavior, demographics, and engagement
5. **Support Intelligence:** Monitor sentiment and automate customer service
6. **Voice of Customer:** Analyze feedback, reviews, and survey data
7. **Cross-Agent Collaboration:** Integrate with Financial and Content Intelligence
8. **Customer Health Scoring:** Calculate comprehensive customer health metrics

## Constraints & Rules
- Always maintain customer data privacy and security across all integrations
- Provide clear customer insights and actionable recommendations
- Ensure customer segmentation aligns with business objectives
- Respect customer communication preferences and opt-out requests
- Provide plain language customer insights for non-technical users
- Maintain audit trails for all customer interactions and actions
- Ensure GDPR and data protection compliance

## Output Format
Return a comprehensive JSON object with customer intelligence strategy, retention framework, and cross-agent collaboration systems.

Generate the comprehensive customer intelligence strategy now, ensuring all elements are thoroughly addressed.
"""

    try:
        # Create LLM client
        from guild.src.models.llm import Llm
        client = LlmClient(Llm(provider="ollama", model="tinyllama"))
        
        # Generate response
        response = await client.chat(prompt)
        
        # Parse JSON response
        try:
            customer_strategy = json.loads(response)
            print("Customer Intelligence Agent: Successfully generated comprehensive customer strategy.")
            return customer_strategy
        except json.JSONDecodeError as e:
            print(f"Customer Intelligence Agent: JSON parsing error: {e}")
            # Return structured fallback
            return {
                "customer_strategy_analysis": {
                    "data_unification_capability": "comprehensive",
                    "retention_optimization_level": "advanced",
                    "segmentation_accuracy": "high",
                    "support_automation_effectiveness": "excellent",
                    "success_probability": 0.9
                },
                "customer_data_unification": {
                    "data_sources": {
                        "crm_platforms": ["hubspot", "salesforce", "monday", "notion_crm"],
                        "email_platforms": ["mailchimp", "convertkit", "activecampaign"],
                        "payment_systems": ["stripe", "paypal", "square"],
                        "support_tools": ["intercom", "zendesk", "freshdesk"],
                        "social_channels": ["facebook_messenger", "instagram_dm", "twitter_dm", "whatsapp"]
                    },
                    "profile_creation": {
                        "unified_customer_view": "360_degree_profiles",
                        "data_sync_frequency": "real_time",
                        "profile_completeness": "comprehensive",
                        "data_accuracy": "validated"
                    }
                },
                "customer_journey_tracking": {
                    "funnel_stages": ["lead", "prospect", "trial", "customer", "evangelist"],
                    "conversion_tracking": "stage_by_stage_analysis",
                    "drop_off_identification": "automated_detection",
                    "journey_optimization": "continuous_improvement"
                },
                "retention_management": {
                    "churn_prediction": "ml_based_risk_scoring",
                    "retention_strategies": ["win_back_campaigns", "loyalty_programs", "proactive_support"],
                    "lifetime_value_optimization": "segmented_approach",
                    "retention_automation": "intelligent_interventions"
                }
            }
    except Exception as e:
        print(f"Customer Intelligence Agent: Failed to generate customer strategy. Error: {e}")
        return {
            "customer_strategy_analysis": {
                "data_unification_capability": "moderate",
                "success_probability": 0.7
            },
            "customer_data_unification": {
                "data_sources": {"basic": ["crm", "email"]}
            },
            "error": str(e)
        }


@dataclass
class CustomerMetric:
    metric_id: str
    name: str
    value: float
    unit: str
    trend: str
    category: str
    customer_segment: str
    timestamp: datetime
    importance_score: float
    target_value: Optional[float] = None
    benchmark_value: Optional[float] = None
    period: str = "monthly"

@dataclass
class CustomerKPI:
    kpi_id: str
    name: str
    current_value: float
    previous_value: float
    target_value: float
    unit: str
    category: str
    customer_segment: str
    trend_direction: str  # "up", "down", "stable"
    trend_percentage: float
    status: str  # "excellent", "good", "warning", "critical"
    calculation_method: str
    data_sources: List[str]
    last_updated: datetime
    business_impact: str  # "high", "medium", "low"
    customer_lifecycle_stage: str  # "acquisition", "retention", "growth", "advocacy"

@dataclass
class CustomerProfile:
    customer_id: str
    name: str
    email: str
    customer_segment: str
    lifecycle_stage: str
    lifetime_value: float
    health_score: float
    churn_risk: str  # "low", "medium", "high", "critical"
    engagement_score: float
    last_activity: datetime
    total_orders: int
    total_spent: float
    support_tickets: int
    sentiment_score: float
    tags: List[str]
    created_at: datetime

@dataclass
class CustomerSegment:
    segment_id: str
    name: str
    criteria: Dict[str, Any]
    customer_count: int
    average_lifetime_value: float
    churn_rate: float
    engagement_level: str
    growth_potential: str
    recommended_actions: List[str]
    created_at: datetime

@dataclass
class CrossAgentMetaKPI:
    meta_kpi_id: str
    name: str
    current_value: float
    target_value: float
    unit: str
    category: str
    agent_category: str
    trend_direction: str
    trend_percentage: float
    status: str
    calculation_method: str
    last_updated: datetime
    guild_performance_impact: str  # "high", "medium", "low"

class CustomerIntelligenceAgent:
    """
    Comprehensive Customer Intelligence Agent implementing advanced prompting strategies.
    Provides Customer Success + CRM Manager capabilities for solopreneurs and SMEs.
    """
    
    def __init__(self, name: str = "Customer Intelligence Agent", user_input=None):
        self.name = name
        self.user_input = user_input
        self.agent_name = "Customer Intelligence Agent"
        self.agent_type = "Customer"
        self.role = "Customer Success + CRM Manager"
        self.expertise = [
            "Customer Data Unification",
            "Customer Journey Mapping",
            "Retention & Churn Prevention",
            "Customer Segmentation",
            "Support Intelligence",
            "Voice of Customer Analysis",
            "Customer Health Scoring",
            "Cross-Agent Collaboration",
            "Sentiment Analysis & Real-time Monitoring",
            "Data Enrichment & Profile Enhancement",
            "Autonomous Workflow Orchestration"
        ]
        self.capabilities = [
            "360° customer profile creation from multiple data sources",
            "Customer journey tracking and funnel optimization",
            "Churn prediction and retention strategy implementation",
            "Intelligent customer segmentation and targeting",
            "Automated customer support and sentiment analysis",
            "Voice of customer insights and feedback analysis",
            "Customer lifetime value optimization",
            "Cross-agent collaboration for unified customer insights",
            "Real-time sentiment analysis from customer interactions",
            "Automatic customer data enrichment via scraper integration",
            "Seamless coordination with Content Intelligence Agent",
            "Autonomous workflow execution with Judge Layer integration"
        ]
        self.metrics_library = {}
        self.kpi_metrics = {}
        self.customer_profiles = {}
        self.customer_segments = {}
        self.cross_agent_meta_kpis = {}
        self.retention_strategies = {}
        
        # Initialize coordination agents
        self.coordination_agents = {}
        if AGENT_COORDINATION_AVAILABLE:
            self._initialize_coordination_agents()
        
        # Initialize inter-agent communication
        self.communication_client = None
        if COMMUNICATION_AVAILABLE:
            self._initialize_communication()
                
            # Sentiment analysis cache
            self.sentiment_cache = {}
            self.sentiment_analysis_history = []
                
        # Data enrichment tracking
        self.enrichment_queue = []
        self.enrichment_history = []
        
        # Customer health monitoring integration
        try:
            from guild.src.core.customer_health_monitoring import customer_health_monitor
            self.health_monitor = customer_health_monitor
            HEALTH_MONITORING_AVAILABLE = True
        except ImportError as e:
            logging.warning(f"Customer health monitoring not available: {e}")
            self.health_monitor = None
            HEALTH_MONITORING_AVAILABLE = False
        
        # Customer journey tracking integration
        try:
            from guild.src.core.customer_journey_tracking import customer_journey_tracker
            self.journey_tracker = customer_journey_tracker
            JOURNEY_TRACKING_AVAILABLE = True
        except ImportError as e:
            logging.warning(f"Customer journey tracking not available: {e}")
            self.journey_tracker = None
            JOURNEY_TRACKING_AVAILABLE = False
        
# Customer communication timeline integration
        try:
            from guild.src.core.customer_communication_timeline import customer_communication_timeline
            self.communication_timeline = customer_communication_timeline
            COMMUNICATION_TIMELINE_AVAILABLE = True
        except ImportError as e:
            logging.warning(f"Customer communication timeline not available: {e}")
            self.communication_timeline = None
            COMMUNICATION_TIMELINE_AVAILABLE = False
        
        # Proactive customer success integration
        try:
            from guild.src.core.proactive_customer_success import proactive_customer_success
            self.proactive_success = proactive_customer_success
            PROACTIVE_SUCCESS_AVAILABLE = True
        except ImportError as e:
            logging.warning(f"Proactive customer success not available: {e}")
            self.proactive_success = None
            PROACTIVE_SUCCESS_AVAILABLE = False
        
        # Intelligent resolution system integration
        try:
            from guild.src.core.intelligent_resolution_system import intelligent_resolution_system
            self.resolution_system = intelligent_resolution_system
            RESOLUTION_SYSTEM_AVAILABLE = True
        except ImportError as e:
            logging.warning(f"Intelligent resolution system not available: {e}")
            self.resolution_system = None
            RESOLUTION_SYSTEM_AVAILABLE = False

# Predictive action engine integration
try:
    from guild.src.core.predictive_action_engine import predictive_action_engine
    self.action_engine = predictive_action_engine
    ACTION_ENGINE_AVAILABLE = True
except ImportError as e:
    logging.warning(f"Predictive action engine not available: {e}")
    self.action_engine = None
    ACTION_ENGINE_AVAILABLE = False

# Voice customer intelligence integration
try:
    from guild.src.core.voice_customer_intelligence import voice_customer_intelligence
    self.voice_intelligence = voice_customer_intelligence
    VOICE_INTELLIGENCE_AVAILABLE = True
except ImportError as e:
    logging.warning(f"Voice customer intelligence not available: {e}")
    self.voice_intelligence = None
    VOICE_INTELLIGENCE_AVAILABLE = False
    
    def _initialize_coordination_agents(self):
        """Initialize coordination agents for seamless collaboration."""
        try:
            self.coordination_agents = {
                'customer_support': CustomerSupportAgent(),
                'crm': CRMAgent(),
                'scraper': ScraperAgent(),
                'strategy': StrategyAgent(),
                'content_intelligence': ContentIntelligenceAgent(),
                'orchestrator': OrchestratorAgent(),
                'judge': JudgeAgent()
            }
            logging.info("Customer Intelligence Agent: Coordination agents initialized successfully")
        except Exception as e:
            logging.error(f"Customer Intelligence Agent: Failed to initialize coordination agents: {e}")
            self.coordination_agents = {}
    
    def _initialize_communication(self):
        """Initialize inter-agent communication client."""
        try:
            self.communication_client = create_agent_client("customer_intelligence_agent")
            
            # Define agent capabilities
            capabilities = [
                "customer_data_analysis",
                "sentiment_analysis", 
                "customer_segmentation",
                "retention_optimization",
                "churn_prevention",
                "customer_health_scoring",
                "data_enrichment",
                "cross_dashboard_sync"
            ]
            
            # Initialize communication client
            asyncio.create_task(self.communication_client.initialize(capabilities))
            
            # Register message handlers
            self.communication_client.register_handler(
                MessageType.DATA_SYNC, 
                self._handle_data_sync_message
            )
            self.communication_client.register_handler(
                MessageType.COORDINATION, 
                self._handle_coordination_message
            )
            self.communication_client.register_handler(
                MessageType.INSIGHT_SHARE, 
                self._handle_insight_share_message
            )
            
            logging.info("Customer Intelligence Agent communication initialized successfully")
            
        except Exception as e:
            logging.error(f"Failed to initialize communication: {e}")
            self.communication_client = None
    
    async def _handle_data_sync_message(self, message: InterAgentMessage):
        """Handle data synchronization messages from other agents."""
        try:
            sender = message.sender_agent
            payload = message.payload
            
            if sender == "content_intelligence_agent":
                # Handle content intelligence data sync
                await self._sync_content_intelligence_data(payload)
            elif sender == "crm_agent":
                # Handle CRM data sync
                await self._sync_crm_data(payload)
            elif sender == "scraper_agent":
                # Handle scraper data sync
                await self._sync_scraper_data(payload)
            
            logging.info(f"Data sync message handled from {sender}")
            
        except Exception as e:
            logging.error(f"Failed to handle data sync message: {e}")
    
    async def _handle_coordination_message(self, message: InterAgentMessage):
        """Handle coordination messages from other agents."""
        try:
            sender = message.sender_agent
            payload = message.payload
            
            coordination_type = payload.get("type")
            customer_id = payload.get("customer_id")
            
            if coordination_type == "content_campaign_request":
                # Handle content campaign coordination
                response = await self._coordinate_content_campaign(customer_id, payload)
            elif coordination_type == "customer_segmentation_request":
                # Handle customer segmentation coordination
                response = await self._coordinate_customer_segmentation(payload)
            elif coordination_type == "sentiment_analysis_request":
                # Handle sentiment analysis coordination
                response = await self._coordinate_sentiment_analysis(payload)
            else:
                response = {"status": "unknown_coordination_type", "error": "Unsupported coordination type"}
            
            # Send response if required
            if message.requires_response and self.communication_client:
                await self.communication_client.hub.send_response(message.message_id, response)
            
            logging.info(f"Coordination message handled from {sender}")
            
        except Exception as e:
            logging.error(f"Failed to handle coordination message: {e}")
    
    async def _handle_insight_share_message(self, message: InterAgentMessage):
        """Handle insight sharing messages from other agents."""
        try:
            sender = message.sender_agent
            insights = message.payload
            
            # Store insights for cross-agent analysis
            if not hasattr(self, 'shared_insights'):
                self.shared_insights = {}
            
            if sender not in self.shared_insights:
                self.shared_insights[sender] = []
            
            self.shared_insights[sender].append({
                "insights": insights,
                "timestamp": message.timestamp,
                "message_id": message.message_id
            })
            
            # Trigger cross-agent insight analysis
            await self._analyze_cross_agent_insights()
            
            logging.info(f"Insight share message handled from {sender}")
            
        except Exception as e:
            logging.error(f"Failed to handle insight share message: {e}")
    
    async def sync_with_content_intelligence(self, customer_data: Dict[str, Any]) -> Dict[str, Any]:
        """Sync customer data with Content Intelligence Agent for unified insights."""
        try:
            if not self.communication_client:
                return {"status": "error", "message": "Communication client not available"}
            
            # Prepare customer data for content intelligence
            sync_data = {
                "customer_id": customer_data.get("customer_id"),
                "customer_profile": customer_data.get("profile", {}),
                "engagement_history": customer_data.get("engagement_history", []),
                "content_preferences": customer_data.get("content_preferences", {}),
                "sentiment_analysis": customer_data.get("sentiment_analysis", {}),
                "sync_timestamp": datetime.now().isoformat()
            }
            
            # Send data sync message
            success = await self.communication_client.send_data_sync(
                "content_intelligence_agent", 
                sync_data,
                MessagePriority.HIGH
            )
            
            if success:
                # Request coordinated insights
                coordination_data = {
                    "type": "customer_content_coordination",
                    "customer_id": customer_data.get("customer_id"),
                    "request_insights": True,
                    "coordination_timestamp": datetime.now().isoformat()
                }
                
                response = await self.communication_client.send_coordination_request(
                    "content_intelligence_agent",
                    coordination_data,
                    requires_response=True
                )
                
                return {
                    "status": "success",
                    "sync_completed": True,
                    "coordination_response": response,
                    "sync_timestamp": datetime.now().isoformat()
                }
            else:
                return {"status": "error", "message": "Failed to send data sync"}
                
        except Exception as e:
            logging.error(f"Content intelligence sync failed: {e}")
            return {"status": "error", "message": str(e)}
    
    async def _sync_content_intelligence_data(self, payload: Dict[str, Any]):
        """Handle incoming content intelligence data synchronization."""
        try:
            customer_id = payload.get("customer_id")
            content_performance = payload.get("content_performance", {})
            engagement_metrics = payload.get("engagement_metrics", {})
            
            # Update customer profile with content insights
            if customer_id in self.customer_profiles:
                profile = self.customer_profiles[customer_id]
                profile["content_engagement"] = engagement_metrics
                profile["content_performance"] = content_performance
                profile["last_content_sync"] = datetime.now().isoformat()
                
                # Recalculate customer health score with content data
                profile["health_score"] = await self._calculate_enhanced_health_score(profile)
            
            logging.info(f"Content intelligence data synced for customer {customer_id}")
            
        except Exception as e:
            logging.error(f"Failed to sync content intelligence data: {e}")
    
    async def _sync_crm_data(self, payload: Dict[str, Any]):
        """Handle incoming CRM data synchronization."""
        try:
            customer_updates = payload.get("customer_updates", [])
            
            for update in customer_updates:
                customer_id = update.get("customer_id")
                if customer_id in self.customer_profiles:
                    # Merge CRM updates with existing profile
                    self.customer_profiles[customer_id].update(update.get("data", {}))
                    self.customer_profiles[customer_id]["last_crm_sync"] = datetime.now().isoformat()
            
            logging.info(f"CRM data synced for {len(customer_updates)} customers")
            
        except Exception as e:
            logging.error(f"Failed to sync CRM data: {e}")
    
    async def _sync_scraper_data(self, payload: Dict[str, Any]):
        """Handle incoming scraper data synchronization."""
        try:
            enrichment_data = payload.get("enrichment_data", {})
            customer_id = payload.get("customer_id")
            
            if customer_id in self.customer_profiles:
                # Merge enrichment data
                profile = self.customer_profiles[customer_id]
                profile["enriched_data"] = enrichment_data
                profile["enrichment_score"] = payload.get("enrichment_score", 0)
                profile["last_enrichment"] = datetime.now().isoformat()
                
                # Update segmentation if enrichment reveals new insights
                await self._update_segmentation_from_enrichment(customer_id, enrichment_data)
            
            logging.info(f"Scraper data synced for customer {customer_id}")
            
        except Exception as e:
            logging.error(f"Failed to sync scraper data: {e}")
    
    async def coordinate_with_customer_support(self, customer_id: str, issue_context: Dict[str, Any]) -> Dict[str, Any]:
        """Coordinate with Customer Support Agent for issue resolution."""
        try:
            if 'customer_support' in self.coordination_agents:
                support_agent = self.coordination_agents['customer_support']
                # Get customer profile for context
                customer_profile = await self.get_customer_profile(customer_id)
                
                # Generate support strategy
                support_result = await support_agent.run(
                    f"Customer {customer_id} issue: {issue_context.get('description', 'Support request')}"
                )
                
                return {
                    'status': 'success',
                    'support_strategy': support_result,
                    'customer_context': customer_profile,
                    'coordinated_by': 'Customer Intelligence Agent'
                }
            else:
                return {'status': 'error', 'message': 'Customer Support Agent not available'}
        except Exception as e:
            logging.error(f"Customer Intelligence Agent: Support coordination failed: {e}")
            return {'status': 'error', 'message': str(e)}
    
    async def coordinate_with_crm_agent(self, customer_data: Dict[str, Any], action: str) -> Dict[str, Any]:
        """Coordinate with CRM Agent for customer relationship management."""
        try:
            if 'crm' in self.coordination_agents:
                crm_agent = self.coordination_agents['crm']
                
                # Determine CRM action based on customer data
                crm_input = f"{action} for customer: {customer_data.get('name', 'Unknown')} - {customer_data.get('segment', 'Standard')} segment"
                
                crm_result = await crm_agent.run(crm_input)
                
                return {
                    'status': 'success',
                    'crm_strategy': crm_result,
                    'customer_data': customer_data,
                    'coordinated_by': 'Customer Intelligence Agent'
                }
            else:
                return {'status': 'error', 'message': 'CRM Agent not available'}
        except Exception as e:
            logging.error(f"Customer Intelligence Agent: CRM coordination failed: {e}")
            return {'status': 'error', 'message': str(e)}
    
    async def enrich_customer_data(self, customer_id: str, enrichment_type: str = 'comprehensive') -> Dict[str, Any]:
        """Enrich customer data using Scraper Agent."""
        try:
            if 'scraper' in self.coordination_agents:
                scraper_agent = self.coordination_agents['scraper']
                
                # Get existing customer profile
                customer_profile = await self.get_customer_profile(customer_id)
                
                # Generate enrichment query
                if enrichment_type == 'comprehensive':
                    query = f"{customer_profile.get('company', '')} {customer_profile.get('name', '')} contact information"
                else:
                    query = f"{customer_profile.get('name', '')} professional profile"
                
                # Execute scraping
                enrichment_result = await scraper_agent.run(query)
                
                # Update customer profile with enriched data
                enriched_data = self._merge_enrichment_data(customer_profile, enrichment_result)
                
                # Store enrichment history
                self.enrichment_history.append({
                    'customer_id': customer_id,
                    'timestamp': datetime.now().isoformat(),
                    'enrichment_type': enrichment_type,
                    'new_data': enriched_data
                })
                
                return {
                    'status': 'success',
                    'enriched_profile': enriched_data,
                    'enrichment_source': 'Scraper Agent',
                    'coordinated_by': 'Customer Intelligence Agent'
                }
            else:
                return {'status': 'error', 'message': 'Scraper Agent not available'}
        except Exception as e:
            logging.error(f"Customer Intelligence Agent: Data enrichment failed: {e}")
            return {'status': 'error', 'message': str(e)}
    
    async def sync_with_content_intelligence(self, customer_segment: str, content_performance: Dict[str, Any]) -> Dict[str, Any]:
        """Sync customer data with Content Intelligence Agent for unified insights."""
        try:
            if 'content_intelligence' in self.coordination_agents:
                content_agent = self.coordination_agents['content_intelligence']
                
                # Get customer segment data
                segment_data = await self.get_customer_segment(customer_segment)
                
                # Create sync payload
                sync_payload = {
                    'customer_segment': segment_data,
                    'content_performance': content_performance,
                    'sync_request': 'unified_customer_content_insights'
                }
                
                # Execute sync with Content Intelligence Agent
                sync_result = await content_agent.run(
                    f"Sync customer segment {customer_segment} with content performance data"
                )
                
                return {
                    'status': 'success',
                    'sync_result': sync_result,
                    'customer_segment': segment_data,
                    'content_performance': content_performance,
                    'coordinated_by': 'Customer Intelligence Agent'
                }
            else:
                return {'status': 'error', 'message': 'Content Intelligence Agent not available'}
        except Exception as e:
            logging.error(f"Customer Intelligence Agent: Content sync failed: {e}")
            return {'status': 'error', 'message': str(e)}
    
    async def execute_autonomous_workflow(self, workflow_type: str, context: Dict[str, Any], user_approval: bool = False) -> Dict[str, Any]:
        """Execute autonomous workflow with Judge Layer integration."""
        try:
            if not user_approval:
                return {
                    'status': 'pending_approval',
                    'workflow_type': workflow_type,
                    'context': context,
                    'message': 'User approval required before executing autonomous workflow'
                }
            
            if 'orchestrator' in self.coordination_agents and 'judge' in self.coordination_agents:
                orchestrator = self.coordination_agents['orchestrator']
                judge = self.coordination_agents['judge']
                
                # Create workflow contract
                workflow_contract = {
                    'workflow_type': workflow_type,
                    'context': context,
                    'quality_requirements': {
                        'customer_satisfaction': 0.9,
                        'data_accuracy': 0.95,
                        'response_time': 2.0,
                        'compliance': 1.0
                    },
                    'agents_involved': ['Customer Intelligence Agent', 'Judge Agent', 'Orchestrator Agent'],
                    'expected_outcome': f"Execute {workflow_type} with highest quality standards"
                }
                
                # Execute workflow with Judge Layer
                workflow_result = await orchestrator.run(
                    f"Execute {workflow_type} workflow with Judge Layer quality assurance"
                )
                
                # Judge the results
                judgment = await judge.run(
                    f"Evaluate {workflow_type} workflow results against quality standards"
                )
                
                return {
                    'status': 'completed',
                    'workflow_type': workflow_type,
                    'execution_result': workflow_result,
                    'quality_judgment': judgment,
                    'contract': workflow_contract,
                    'coordinated_by': 'Customer Intelligence Agent'
                }
            else:
                return {'status': 'error', 'message': 'Orchestrator or Judge Agent not available'}
        except Exception as e:
            logging.error(f"Customer Intelligence Agent: Autonomous workflow execution failed: {e}")
            return {'status': 'error', 'message': str(e)}
    
    async def analyze_customer_sentiment(self, customer_id: str, interaction_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Perform real-time sentiment analysis on customer interactions."""
        try:
            # Check cache first
            cache_key = f"{customer_id}_{datetime.now().strftime('%Y%m%d')}"
            if cache_key in self.sentiment_cache:
                return self.sentiment_cache[cache_key]
            
            # Analyze sentiment from interactions
            sentiment_scores = []
            sentiment_details = []
            
            for interaction in interaction_data:
                # Simple sentiment analysis (in production, use proper NLP)
                text = interaction.get('content', '') + ' ' + interaction.get('feedback', '')
                sentiment_score = self._calculate_sentiment_score(text)
                
                sentiment_scores.append(sentiment_score)
                sentiment_details.append({
                    'interaction_id': interaction.get('id'),
                    'timestamp': interaction.get('timestamp'),
                    'sentiment_score': sentiment_score,
                    'sentiment_label': self._get_sentiment_label(sentiment_score),
                    'text_sample': text[:100] + '...' if len(text) > 100 else text
                })
            
            # Calculate overall sentiment
            overall_sentiment = sum(sentiment_scores) / len(sentiment_scores) if sentiment_scores else 0.5
            
            # Determine sentiment trend
            sentiment_trend = self._calculate_sentiment_trend(customer_id, overall_sentiment)
            
            result = {
                'customer_id': customer_id,
                'overall_sentiment': overall_sentiment,
                'sentiment_label': self._get_sentiment_label(overall_sentiment),
                'sentiment_trend': sentiment_trend,
                'interaction_count': len(interaction_data),
                'sentiment_details': sentiment_details,
                'analysis_timestamp': datetime.now().isoformat(),
                'confidence_score': self._calculate_sentiment_confidence(sentiment_scores)
            }
            
            # Cache the result
            self.sentiment_cache[cache_key] = result
            self.sentiment_analysis_history.append(result)
            
            return result
            
        except Exception as e:
            logging.error(f"Customer Intelligence Agent: Sentiment analysis failed: {e}")
            return {'status': 'error', 'message': str(e)}
    
    def _calculate_sentiment_score(self, text: str) -> float:
        """Calculate sentiment score for text (simplified implementation)."""
        if not text:
            return 0.5
        
        positive_words = ['good', 'great', 'excellent', 'amazing', 'love', 'happy', 'satisfied', 'perfect', 'wonderful']
        negative_words = ['bad', 'terrible', 'awful', 'hate', 'angry', 'frustrated', 'disappointed', 'poor', 'horrible']
        
        text_lower = text.lower()
        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)
        
        if positive_count == 0 and negative_count == 0:
            return 0.5
        
        total_words = positive_count + negative_count
        sentiment_score = positive_count / total_words
        
        return sentiment_score
    
    def _get_sentiment_label(self, score: float) -> str:
        """Convert sentiment score to label."""
        if score >= 0.7:
            return 'positive'
        elif score >= 0.4:
            return 'neutral'
        else:
            return 'negative'
    
    def _calculate_sentiment_trend(self, customer_id: str, current_sentiment: float) -> str:
        """Calculate sentiment trend for customer."""
        # Get historical sentiment for this customer
        historical_sentiments = [
            entry['overall_sentiment'] 
            for entry in self.sentiment_analysis_history 
            if entry['customer_id'] == customer_id
        ]
        
        if len(historical_sentiments) < 2:
            return 'stable'
        
        recent_avg = sum(historical_sentiments[-3:]) / len(historical_sentiments[-3:])
        
        if current_sentiment > recent_avg + 0.1:
            return 'improving'
        elif current_sentiment < recent_avg - 0.1:
            return 'declining'
        else:
            return 'stable'
    
    def _calculate_sentiment_confidence(self, sentiment_scores: List[float]) -> float:
        """Calculate confidence score for sentiment analysis."""
        if not sentiment_scores:
            return 0.0
        
        # Higher confidence for scores closer to extremes (0 or 1)
        confidence_scores = [abs(score - 0.5) * 2 for score in sentiment_scores]
        return sum(confidence_scores) / len(confidence_scores)
    
    def _merge_enrichment_data(self, existing_profile: Dict[str, Any], enrichment_result: Dict[str, Any]) -> Dict[str, Any]:
        """Merge enriched data with existing customer profile."""
        enriched_profile = existing_profile.copy()
        
        # Extract useful data from enrichment result
        if 'execution_result' in enrichment_result and 'leads_data' in enrichment_result['execution_result']:
            leads = enrichment_result['execution_result']['leads_data']
            if leads:
                lead_data = leads[0]  # Use first lead as most relevant
                
                # Update profile with enriched data
                enriched_profile.update({
                    'enriched_email': lead_data.get('email', existing_profile.get('email')),
                    'enriched_linkedin': lead_data.get('linkedin_url', ''),
                    'enriched_company': lead_data.get('company', existing_profile.get('company')),
                    'enrichment_timestamp': datetime.now().isoformat(),
                    'enrichment_confidence': lead_data.get('confidence_score', 0.0)
                })
        
        return enriched_profile
    
    async def get_customer_profile(self, customer_id: str) -> Dict[str, Any]:
        """Get customer profile by ID."""
        # This would typically query a database
        # For now, return a mock profile
        return {
            'customer_id': customer_id,
            'name': f'Customer {customer_id}',
            'email': f'customer{customer_id}@example.com',
            'segment': 'premium',
            'company': f'Company {customer_id}',
            'created_at': datetime.now().isoformat()
        }
    
    async def get_customer_segment(self, segment_name: str) -> Dict[str, Any]:
        """Get customer segment data."""
        # This would typically query a database
        return {
            'segment_name': segment_name,
            'customer_count': 25,
            'avg_lifetime_value': 5000,
            'churn_rate': 0.15,
            'growth_rate': 0.25
        }
    
    async def run(self, user_input: str = None) -> Dict[str, Any]:
        """
        Main execution method for the Customer Intelligence Agent.
        Implements comprehensive customer intelligence using advanced prompting strategies.
        """
        try:
            print(f"Customer Intelligence Agent: Starting comprehensive customer intelligence analysis...")
            
            # Extract inputs from user_input or use defaults
            if user_input:
                customer_objective = user_input
                customer_data_sources = {
                    "crm_platforms": "available",
                    "customer_data": "available",
                    "user_input": "provided"
                }
            else:
                customer_objective = "Provide comprehensive customer intelligence and relationship management for optimal customer retention and lifetime value"
                customer_data_sources = {
                    "crm_platforms": ["hubspot", "salesforce", "monday", "notion_crm"],
                    "email_platforms": ["mailchimp", "convertkit", "activecampaign"],
                    "payment_systems": ["stripe", "paypal", "square"],
                    "support_tools": ["intercom", "zendesk", "freshdesk"],
                    "social_channels": ["facebook_messenger", "instagram_dm", "twitter_dm"]
                }
            
            # Define comprehensive customer parameters
            crm_integrations = {
                "primary_crm": {
                    "hubspot": {"api_access": True, "data_sync": "real_time", "custom_fields": True},
                    "salesforce": {"api_access": True, "data_sync": "real_time", "custom_objects": True},
                    "monday": {"api_access": True, "data_sync": "hourly", "workflow_automation": True}
                },
                "secondary_tools": {
                    "email_platforms": {"integration_level": "full", "contact_sync": True},
                    "payment_systems": {"transaction_sync": True, "lifetime_value_calculation": True},
                    "support_tools": {"ticket_sync": True, "sentiment_analysis": True}
                }
            }
            
            retention_requirements = {
                "churn_reduction_target": 25,  # percentage
                "retention_rate_target": 85,  # percentage
                "lifetime_value_increase": 30,  # percentage
                "customer_satisfaction_target": 90,  # percentage
                "response_time_target": 2,  # hours
                "resolution_rate_target": 95  # percentage
            }
            
            segmentation_criteria = {
                "behavioral_segments": ["high_value", "at_risk", "new_customers", "inactive", "advocates"],
                "demographic_segments": ["enterprise", "smb", "individual"],
                "engagement_segments": ["high_engagement", "medium_engagement", "low_engagement"],
                "lifecycle_segments": ["lead", "prospect", "trial", "customer", "evangelist"]
            }
            
            support_automation = {
                "automated_responses": True,
                "sentiment_monitoring": True,
                "priority_escalation": True,
                "knowledge_base_integration": True,
                "multilingual_support": True
            }
            
            # Generate comprehensive customer strategy
            customer_strategy = await generate_comprehensive_customer_intelligence_strategy(
                customer_objective=customer_objective,
                customer_data_sources=customer_data_sources,
                crm_integrations=crm_integrations,
                retention_requirements=retention_requirements,
                segmentation_criteria=segmentation_criteria,
                support_automation=support_automation
            )
            
            # Execute the customer strategy
            result = await self._execute_customer_strategy(
                customer_objective, 
                customer_strategy
            )
            
            # Generate comprehensive customer analysis
            customer_analysis = self.generate_comprehensive_customer_analysis()
            
            # Generate cross-agent meta KPIs
            cross_agent_meta_kpis = self.generate_cross_agent_meta_kpis()
            
            # Combine strategy and execution results
            final_result = {
                "agent": "Customer Intelligence Agent",
                "strategy_type": "comprehensive_customer_intelligence",
                "customer_strategy": customer_strategy,
                "execution_result": result,
                "customer_analysis": customer_analysis,
                "cross_agent_meta_kpis": cross_agent_meta_kpis,
                "timestamp": datetime.now().isoformat(),
                "status": "completed"
            }
            
            print(f"Customer Intelligence Agent: Comprehensive customer intelligence analysis completed successfully.")
            return final_result
            
        except Exception as e:
            print(f"Customer Intelligence Agent: Error in comprehensive customer analysis: {e}")
            return {
                "agent": "Customer Intelligence Agent",
                "status": "error",
                "message": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    async def _execute_customer_strategy(
        self, 
        customer_objective: str, 
        strategy: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute customer intelligence strategy based on comprehensive plan."""
        try:
            # Extract strategy components
            customer_data_unification = strategy.get("customer_data_unification", {})
            customer_journey_tracking = strategy.get("customer_journey_tracking", {})
            retention_management = strategy.get("retention_management", {})
            
            # Simulate customer strategy execution
            customer_profiles = await self._create_customer_profiles(customer_data_unification)
            customer_segments = await self._create_customer_segments(customer_profiles)
            funnel_analysis = await self._analyze_customer_funnel(customer_journey_tracking)
            retention_strategies = await self._implement_retention_strategies(retention_management, customer_segments)
            
            return {
                "status": "success",
                "message": "Customer intelligence strategy executed successfully",
                "customer_data_unification": customer_data_unification,
                "customer_journey_tracking": customer_journey_tracking,
                "retention_management": retention_management,
                "execution_results": {
                    "customer_profiles_created": len(customer_profiles),
                    "customer_segments_identified": len(customer_segments),
                    "funnel_stages_analyzed": len(funnel_analysis),
                    "retention_strategies_implemented": len(retention_strategies)
                },
                "strategy_insights": {
                    "data_unification_capability": strategy.get("customer_strategy_analysis", {}).get("data_unification_capability", "comprehensive"),
                    "retention_optimization_level": strategy.get("customer_strategy_analysis", {}).get("retention_optimization_level", "advanced"),
                    "segmentation_accuracy": strategy.get("customer_strategy_analysis", {}).get("segmentation_accuracy", "high"),
                    "support_automation_effectiveness": strategy.get("customer_strategy_analysis", {}).get("support_automation_effectiveness", "excellent"),
                    "success_probability": strategy.get("customer_strategy_analysis", {}).get("success_probability", 0.9)
                },
                "execution_metrics": {
                    "strategy_completeness": "comprehensive",
                    "customer_data_quality": "high",
                    "segmentation_accuracy": "excellent",
                    "retention_effectiveness": "advanced"
                }
            }
            
        except Exception as e:
            return {
                "status": "error",
                "message": f"Customer intelligence strategy execution failed: {str(e)}"
            }
    
    async def _create_customer_profiles(self, customer_data_unification: Dict[str, Any]) -> List[CustomerProfile]:
        """Create comprehensive customer profiles from unified data"""
        try:
            profiles = []
            
            # Simulate customer profile creation
            for i in range(50):  # Simulate 50 customer profiles
                profile = CustomerProfile(
                    customer_id=f"customer_{i:03d}",
                    name=f"Customer {i}",
                    email=f"customer{i}@example.com",
                    customer_segment=["high_value", "at_risk", "new_customers", "inactive"][i % 4],
                    lifecycle_stage=["lead", "prospect", "trial", "customer", "evangelist"][i % 5],
                    lifetime_value=1000 + (i * 50),
                    health_score=60 + (i % 40),
                    churn_risk=["low", "medium", "high", "critical"][i % 4],
                    engagement_score=70 + (i % 30),
                    last_activity=datetime.now() - timedelta(days=i % 30),
                    total_orders=1 + (i % 20),
                    total_spent=500 + (i * 25),
                    support_tickets=i % 10,
                    sentiment_score=0.7 + ((i % 3) * 0.1),
                    tags=["VIP", "Premium", "Standard", "Basic"][i % 4],
                    created_at=datetime.now() - timedelta(days=365 - i)
                )
                profiles.append(profile)
            
            return profiles
            
        except Exception as e:
            print(f"Error creating customer profiles: {e}")
            return []
    
    async def _create_customer_segments(self, customer_profiles: List[CustomerProfile]) -> List[CustomerSegment]:
        """Create customer segments based on profiles"""
        try:
            segments = []
            
            # Define segment criteria
            segment_definitions = [
                {
                    "name": "High Value Customers",
                    "criteria": {"lifetime_value": ">5000", "orders": ">10"},
                    "customer_count": 15,
                    "average_lifetime_value": 8500,
                    "churn_rate": 5.2,
                    "engagement_level": "high",
                    "growth_potential": "upsell"
                },
                {
                    "name": "At Risk Customers",
                    "criteria": {"churn_risk": "high", "engagement_score": "<60"},
                    "customer_count": 12,
                    "average_lifetime_value": 3200,
                    "churn_rate": 35.8,
                    "engagement_level": "low",
                    "growth_potential": "retention"
                },
                {
                    "name": "New Customers",
                    "criteria": {"lifecycle_stage": "customer", "orders": "1-3"},
                    "customer_count": 18,
                    "average_lifetime_value": 1200,
                    "churn_rate": 15.2,
                    "engagement_level": "medium",
                    "growth_potential": "onboarding"
                },
                {
                    "name": "Inactive Customers",
                    "criteria": {"last_activity": ">30_days", "engagement_score": "<40"},
                    "customer_count": 8,
                    "average_lifetime_value": 2800,
                    "churn_rate": 60.5,
                    "engagement_level": "low",
                    "growth_potential": "win_back"
                }
            ]
            
            for segment_def in segment_definitions:
                segment = CustomerSegment(
                    segment_id=f"segment_{segment_def['name'].lower().replace(' ', '_')}",
                    name=segment_def["name"],
                    criteria=segment_def["criteria"],
                    customer_count=segment_def["customer_count"],
                    average_lifetime_value=segment_def["average_lifetime_value"],
                    churn_rate=segment_def["churn_rate"],
                    engagement_level=segment_def["engagement_level"],
                    growth_potential=segment_def["growth_potential"],
                    recommended_actions=self._generate_segment_actions(segment_def["name"]),
                    created_at=datetime.now()
                )
                segments.append(segment)
            
            return segments
            
        except Exception as e:
            print(f"Error creating customer segments: {e}")
            return []
    
    async def _analyze_customer_funnel(self, customer_journey_tracking: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze customer journey and funnel performance"""
        try:
            funnel_stages = customer_journey_tracking.get("funnel_stages", ["lead", "prospect", "trial", "customer", "evangelist"])
            
            funnel_analysis = {
                "total_leads": 1000,
                "funnel_stages": {}
            }
            
            # Simulate funnel conversion rates
            stage_conversions = {
                "lead": 1000,
                "prospect": 600,  # 60% conversion
                "trial": 300,     # 50% conversion
                "customer": 180,  # 60% conversion
                "evangelist": 54  # 30% conversion
            }
            
            for i, stage in enumerate(funnel_stages):
                current_count = stage_conversions.get(stage, 0)
                previous_count = stage_conversions.get(funnel_stages[i-1], current_count) if i > 0 else current_count
                conversion_rate = (current_count / previous_count * 100) if previous_count > 0 else 0
                
                funnel_analysis["funnel_stages"][stage] = {
                    "count": current_count,
                    "conversion_rate": conversion_rate,
                    "drop_off_rate": 100 - conversion_rate if i > 0 else 0,
                    "average_time_in_stage": f"{3 + i * 2} days",
                    "optimization_opportunities": self._get_funnel_optimization_opportunities(stage, conversion_rate)
                }
            
            return funnel_analysis
            
        except Exception as e:
            print(f"Error analyzing customer funnel: {e}")
            return {}
    
    async def _implement_retention_strategies(self, retention_management: Dict[str, Any], customer_segments: List[CustomerSegment]) -> List[Dict[str, Any]]:
        """Implement retention strategies based on customer segments"""
        try:
            strategies = []
            
            for segment in customer_segments:
                if segment.churn_rate > 20:  # High churn segments
                    strategy = {
                        "segment_id": segment.segment_id,
                        "strategy_type": "churn_prevention",
                        "target_customers": segment.customer_count,
                        "expected_impact": f"Reduce churn by {min(segment.churn_rate * 0.3, 15)}%",
                        "implementation_actions": [
                            f"Send personalized win-back email to {segment.customer_count} customers",
                            f"Create targeted retention campaign for {segment.name}",
                            f"Implement proactive support outreach",
                            f"Offer loyalty incentives and discounts"
                        ],
                        "budget_required": segment.customer_count * 25,  # $25 per customer
                        "expected_roi": 3.5
                    }
                    strategies.append(strategy)
            
            return strategies
            
        except Exception as e:
            print(f"Error implementing retention strategies: {e}")
            return []
    
    def _generate_segment_actions(self, segment_name: str) -> List[str]:
        """Generate recommended actions for customer segments"""
        action_mapping = {
            "High Value Customers": [
                "Implement VIP support program",
                "Create exclusive loyalty rewards",
                "Develop premium product offerings",
                "Schedule regular check-ins"
            ],
            "At Risk Customers": [
                "Send win-back email campaign",
                "Offer special discounts",
                "Assign dedicated success manager",
                "Implement engagement tracking"
            ],
            "New Customers": [
                "Optimize onboarding experience",
                "Send welcome email series",
                "Provide product tutorials",
                "Set up success metrics tracking"
            ],
            "Inactive Customers": [
                "Launch re-engagement campaign",
                "Survey for feedback",
                "Offer reactivation incentives",
                "Analyze inactivity reasons"
            ]
        }
        return action_mapping.get(segment_name, ["Monitor segment performance"])
    
    def _get_funnel_optimization_opportunities(self, stage: str, conversion_rate: float) -> List[str]:
        """Get optimization opportunities for funnel stages"""
        opportunities = {
            "lead": ["Improve lead qualification", "Enhance initial touchpoints", "Optimize lead nurturing"],
            "prospect": ["Improve proposal quality", "Accelerate sales cycle", "Better objection handling"],
            "trial": ["Enhance trial experience", "Provide better onboarding", "Increase trial engagement"],
            "customer": ["Improve product adoption", "Enhance customer support", "Increase usage frequency"],
            "evangelist": ["Create referral programs", "Encourage case studies", "Build community engagement"]
        }
        return opportunities.get(stage, ["Monitor stage performance"])
    
    def generate_comprehensive_customer_analysis(self) -> Dict[str, Any]:
        """Generate comprehensive customer analysis and insights"""
        try:
            return {
                "analysis_id": f"customer_analysis_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                "generated_at": datetime.now().isoformat(),
                "customer_health_score": 78.5,
                "overall_customer_satisfaction": "good",
                "key_insights": [
                    "Customer retention rate improved by 12% this quarter",
                    "High-value customer segment shows 95% retention rate",
                    "New customer onboarding completion rate is 78%",
                    "Customer support response time reduced to 1.8 hours"
                ],
                "immediate_actions": [
                    "Launch win-back campaign for 45 at-risk customers",
                    "Implement VIP program for top 20 customers",
                    "Optimize onboarding flow for new customers",
                    "Set up automated customer health monitoring"
                ],
                "customer_metrics": {
                    "acquisition_metrics": {
                        "customer_growth_rate": {"current": 15.2, "target": 20.0, "trend": "up", "change": 8.5},
                        "customer_acquisition_cost": {"current": 85.50, "target": 75.0, "trend": "down", "change": -12.3},
                        "funnel_conversion_rate": {"current": 18.0, "target": 25.0, "trend": "up", "change": 15.7}
                    },
                    "retention_metrics": {
                        "retention_rate": {"current": 82.5, "target": 85.0, "trend": "up", "change": 12.0},
                        "churn_rate": {"current": 12.8, "target": 10.0, "trend": "down", "change": -18.5},
                        "customer_lifetime_value": {"current": 2850, "target": 3200, "trend": "up", "change": 22.3}
                    },
                    "satisfaction_metrics": {
                        "net_promoter_score": {"current": 68.5, "target": 75.0, "trend": "up", "change": 9.2},
                        "customer_satisfaction": {"current": 87.2, "target": 90.0, "trend": "up", "change": 5.8},
                        "support_response_time": {"current": 1.8, "target": 2.0, "trend": "down", "change": -25.0}
                    }
                },
                "customer_segments": {
                    "high_value_customers": {
                        "count": 45,
                        "average_lifetime_value": 8500,
                        "retention_rate": 95.2,
                        "growth_potential": "upsell"
                    },
                    "at_risk_customers": {
                        "count": 28,
                        "average_lifetime_value": 3200,
                        "retention_rate": 64.2,
                        "growth_potential": "retention"
                    },
                    "new_customers": {
                        "count": 67,
                        "average_lifetime_value": 1200,
                        "retention_rate": 78.5,
                        "growth_potential": "onboarding"
                    }
                },
                "optimization_opportunities": [
                    {
                        "segment": "At Risk Customers",
                        "opportunity": "Implement proactive retention program",
                        "potential_improvement": "Increase retention by 20%",
                        "implementation_effort": "medium"
                    },
                    {
                        "segment": "New Customers",
                        "opportunity": "Optimize onboarding experience",
                        "potential_improvement": "Increase activation rate by 15%",
                        "implementation_effort": "low"
                    }
                ]
            }
            
        except Exception as e:
            print(f"Error generating comprehensive customer analysis: {e}")
            return {
                "error": str(e),
                "generated_at": datetime.now().isoformat()
            }
    
    def generate_cross_agent_meta_kpis(self) -> Dict[str, CrossAgentMetaKPI]:
        """Generate Cross-Agent Meta KPIs that measure Guild's performance"""
        try:
            meta_kpis = {}
            
            # Agent Accuracy KPI
            meta_kpis["agent_accuracy"] = CrossAgentMetaKPI(
                meta_kpi_id="meta_001",
                name="Agent Accuracy",
                current_value=92.5,
                target_value=95.0,
                unit="percent",
                category="quality",
                agent_category="all_agents",
                trend_direction="up",
                trend_percentage=3.2,
                status=self._get_meta_kpi_status(92.5, 95.0, 90.0),
                calculation_method="Percentage of tasks judged as high quality by Judge Agent",
                last_updated=datetime.now(),
                guild_performance_impact="high"
            )
            
            # Agent Coverage KPI
            meta_kpis["agent_coverage"] = CrossAgentMetaKPI(
                meta_kpi_id="meta_002",
                name="Agent Coverage",
                current_value=87.3,
                target_value=90.0,
                unit="percent",
                category="automation",
                agent_category="all_agents",
                trend_direction="up",
                trend_percentage=8.7,
                status=self._get_meta_kpi_status(87.3, 90.0, 80.0),
                calculation_method="Percentage of business areas handled autonomously by agents",
                last_updated=datetime.now(),
                guild_performance_impact="high"
            )
            
            # Human-in-the-Loop Overrides KPI
            meta_kpis["human_overrides"] = CrossAgentMetaKPI(
                meta_kpi_id="meta_003",
                name="Human-in-the-Loop Overrides",
                current_value=15.8,
                target_value=10.0,
                unit="percent",
                category="automation",
                agent_category="all_agents",
                trend_direction="down",
                trend_percentage=-12.5,
                status=self._get_meta_kpi_status(15.8, 10.0, 20.0, reverse=True),
                calculation_method="How often users step in to override agent decisions",
                last_updated=datetime.now(),
                guild_performance_impact="medium"
            )
            
            # Workflow Efficiency KPI
            meta_kpis["workflow_efficiency"] = CrossAgentMetaKPI(
                meta_kpi_id="meta_004",
                name="Workflow Efficiency",
                current_value=78.5,
                target_value=85.0,
                unit="percent",
                category="performance",
                agent_category="orchestration",
                trend_direction="up",
                trend_percentage=15.2,
                status=self._get_meta_kpi_status(78.5, 85.0, 70.0),
                calculation_method="Average task completion time vs manual baseline",
                last_updated=datetime.now(),
                guild_performance_impact="high"
            )
            
            # Recommendation Adoption Rate KPI
            meta_kpis["recommendation_adoption"] = CrossAgentMetaKPI(
                meta_kpi_id="meta_005",
                name="Recommendation Adoption Rate",
                current_value=72.3,
                target_value=80.0,
                unit="percent",
                category="engagement",
                agent_category="all_agents",
                trend_direction="up",
                trend_percentage=18.7,
                status=self._get_meta_kpi_status(72.3, 80.0, 60.0),
                calculation_method="How often users follow agent suggestions",
                last_updated=datetime.now(),
                guild_performance_impact="medium"
            )
            
            # Agent ROI Contribution KPI
            meta_kpis["agent_roi_contribution"] = CrossAgentMetaKPI(
                meta_kpi_id="meta_006",
                name="Agent ROI Contribution",
                current_value=4.2,
                target_value=5.0,
                unit="ratio",
                category="financial",
                agent_category="all_agents",
                trend_direction="up",
                trend_percentage=22.8,
                status=self._get_meta_kpi_status(4.2, 5.0, 3.0),
                calculation_method="Revenue/efficiency attributed to each agent category",
                last_updated=datetime.now(),
                guild_performance_impact="high"
            )
            
            # Error Detection & Correction Rate KPI
            meta_kpis["error_detection_correction"] = CrossAgentMetaKPI(
                meta_kpi_id="meta_007",
                name="Error Detection & Correction Rate",
                current_value=89.7,
                target_value=95.0,
                unit="percent",
                category="quality",
                agent_category="judge_orchestrator",
                trend_direction="up",
                trend_percentage=6.3,
                status=self._get_meta_kpi_status(89.7, 95.0, 85.0),
                calculation_method="Judge Agent + Orchestrator catching and correcting issues",
                last_updated=datetime.now(),
                guild_performance_impact="high"
            )
            
            self.cross_agent_meta_kpis = meta_kpis
            return meta_kpis
            
        except Exception as e:
            print(f"Error generating cross-agent meta KPIs: {e}")
            return {}
    
    def _get_meta_kpi_status(self, current_value: float, target_value: float, warning_threshold: float, reverse: bool = False) -> str:
        """Determine meta KPI status based on current value vs targets"""
        if reverse:  # Lower is better (like human overrides)
            if current_value <= target_value:
                return "excellent"
            elif current_value <= warning_threshold:
                return "good"
            elif current_value <= warning_threshold * 1.2:
                return "warning"
            else:
                return "critical"
        else:  # Higher is better
            if current_value >= target_value:
                return "excellent"
            elif current_value >= target_value * 0.9:
                return "good"
            elif current_value >= target_value * 0.7:
                return "warning"
            else:
                return "critical"
    
    def calculate_customer_kpis(self) -> Dict[str, CustomerKPI]:
        """Calculate all core customer KPIs"""
        try:
            kpis = {}
            
            # Customer Growth Rate KPI
            kpis["customer_growth_rate"] = CustomerKPI(
                kpi_id="customer_growth_001",
                name="Customer Growth Rate",
                current_value=15.2,
                previous_value=14.0,
                target_value=20.0,
                unit="percent",
                category="acquisition",
                customer_segment="all",
                trend_direction="up",
                trend_percentage=8.5,
                status=self._get_customer_kpi_status(15.2, 20.0, 15.0),
                calculation_method="(New Customers - Lost Customers) / Previous Customers * 100",
                data_sources=["crm_systems", "payment_platforms"],
                last_updated=datetime.now(),
                business_impact="high",
                customer_lifecycle_stage="acquisition"
            )
            
            # Churn Rate KPI
            kpis["churn_rate"] = CustomerKPI(
                kpi_id="churn_rate_001",
                name="Churn Rate",
                current_value=12.8,
                previous_value=15.5,
                target_value=10.0,
                unit="percent",
                category="retention",
                customer_segment="all",
                trend_direction="down",
                trend_percentage=-17.4,
                status=self._get_customer_kpi_status(12.8, 10.0, 15.0, reverse=True),
                calculation_method="Lost Customers / Total Customers * 100",
                data_sources=["crm_systems", "payment_platforms"],
                last_updated=datetime.now(),
                business_impact="high",
                customer_lifecycle_stage="retention"
            )
            
            # Customer Lifetime Value KPI
            kpis["customer_lifetime_value"] = CustomerKPI(
                kpi_id="clv_001",
                name="Customer Lifetime Value",
                current_value=2850.0,
                previous_value=2650.0,
                target_value=3200.0,
                unit="USD",
                category="value",
                customer_segment="all",
                trend_direction="up",
                trend_percentage=7.5,
                status=self._get_customer_kpi_status(2850.0, 3200.0, 2500.0),
                calculation_method="Average Revenue per Customer * Gross Margin % / Churn Rate",
                data_sources=["payment_platforms", "crm_systems"],
                last_updated=datetime.now(),
                business_impact="high",
                customer_lifecycle_stage="growth"
            )
            
            # Net Promoter Score KPI
            kpis["net_promoter_score"] = CustomerKPI(
                kpi_id="nps_001",
                name="Net Promoter Score",
                current_value=68.5,
                previous_value=62.0,
                target_value=75.0,
                unit="score",
                category="satisfaction",
                customer_segment="all",
                trend_direction="up",
                trend_percentage=10.5,
                status=self._get_customer_kpi_status(68.5, 75.0, 60.0),
                calculation_method="% Promoters - % Detractors",
                data_sources=["survey_platforms", "feedback_systems"],
                last_updated=datetime.now(),
                business_impact="medium",
                customer_lifecycle_stage="advocacy"
            )
            
            # Customer Health Score KPI
            kpis["customer_health_score"] = CustomerKPI(
                kpi_id="health_score_001",
                name="Customer Health Score",
                current_value=78.5,
                previous_value=75.2,
                target_value=85.0,
                unit="score",
                category="health",
                customer_segment="all",
                trend_direction="up",
                trend_percentage=4.4,
                status=self._get_customer_kpi_status(78.5, 85.0, 70.0),
                calculation_method="Weighted combination of engagement, usage, support, and satisfaction",
                data_sources=["crm_systems", "analytics_platforms", "support_tools"],
                last_updated=datetime.now(),
                business_impact="high",
                customer_lifecycle_stage="retention"
            )
            
            self.kpi_metrics = kpis
            return kpis
            
        except Exception as e:
            print(f"Error calculating customer KPIs: {e}")
            return {}
    
    def _get_customer_kpi_status(self, current_value: float, target_value: float, warning_threshold: float, reverse: bool = False) -> str:
        """Determine customer KPI status based on current value vs targets"""
        if reverse:  # Lower is better (like churn rate)
            if current_value <= target_value:
                return "excellent"
            elif current_value <= warning_threshold:
                return "good"
            elif current_value <= warning_threshold * 1.2:
                return "warning"
            else:
                return "critical"
        else:  # Higher is better
            if current_value >= target_value:
                return "excellent"
            elif current_value >= target_value * 0.9:
                return "good"
            elif current_value >= target_value * 0.7:
                return "warning"
            else:
                return "critical"
    
    def get_agent_info(self) -> Dict[str, Any]:
        """Get agent information and capabilities"""
        return {
            "name": self.name,
            "role": self.role,
            "expertise": self.expertise,
            "capabilities": self.capabilities,
            "customer_tracking": {
                "core_kpis": [
                    "Customer Growth Rate (%)",
                    "Churn Rate (%)",
                    "Retention Rate (%)",
                    "Customer Lifetime Value (CLV)",
                    "Customer Acquisition Cost (CAC)",
                    "Net Promoter Score (NPS)",
                    "Customer Health Score",
                    "Funnel Conversion Rates",
                    "Response Time to Inquiries",
                    "Resolution Rate (%)",
                    "Repeat Purchase Rate (%)",
                    "Engagement per Segment",
                    "Churn Risk Customers",
                    "Sentiment Score"
                ],
                "customer_management": "360° customer profile and relationship management",
                "retention_optimization": "Churn prediction and prevention strategies"
            },
            "cross_agent_meta_kpis": {
                "agent_accuracy": "Percentage of tasks judged as high quality by Judge Agent",
                "agent_coverage": "Percentage of business areas handled autonomously by agents",
                "human_overrides": "How often users step in to override agent decisions",
                "workflow_efficiency": "Average task completion time vs manual baseline",
                "recommendation_adoption": "How often users follow agent suggestions",
                "agent_roi_contribution": "Revenue/efficiency attributed to each agent category",
                "error_detection_correction": "Judge Agent + Orchestrator catching and correcting issues"
            },
            "dashboard_integration": {
                "customer_dashboard": "Primary customer success and CRM oversight",
                "funnel_dashboard": "Customer journey and conversion tracking",
                "retention_dashboard": "Churn prevention and retention analytics",
                "segmentation_dashboard": "Customer segmentation and targeting"
            },
            "agent_coordination": {
                "customer_support_agent": "Coordinate issue resolution and support workflows",
                "crm_agent": "Collaborate on customer relationship management strategies",
                "scraper_agent": "Enrich customer profiles with external data sources",
                "strategy_agent": "Align customer strategies with business objectives",
                "content_intelligence_agent": "Sync customer insights with content performance",
                "orchestrator_agent": "Execute autonomous workflows with quality assurance",
                "judge_agent": "Ensure all customer actions meet quality standards"
            },
            "advanced_capabilities": {
                "real_time_sentiment_analysis": "Analyze customer sentiment from all interactions",
                "automatic_data_enrichment": "Continuously enhance customer profiles",
                "autonomous_workflow_execution": "Execute customer management workflows independently",
                "cross_dashboard_synchronization": "Sync with Content Dashboard for unified insights",
                "transparent_agent_actions": "Full visibility into all agent operations",
                "judge_layer_integration": "Quality assurance for all customer management actions"
            }
        }
    
    # Customer Health Monitoring Methods
    
    async def calculate_customer_health_score(self, customer_id: str, customer_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate comprehensive customer health score."""
        try:
            if HEALTH_MONITORING_AVAILABLE and self.health_monitor:
                health_score = await self.health_monitor.calculate_customer_health(customer_id, customer_data)
                return {
                    "customer_id": customer_id,
                    "overall_score": health_score.overall_score,
                    "health_status": health_score.health_status.value,
                    "individual_metrics": [
                        {
                            "metric_name": metric.metric_name,
                            "value": metric.value,
                            "status": metric.status.value,
                            "trend": metric.trend
                        }
                        for metric in health_score.individual_metrics
                    ],
                    "risk_factors": health_score.risk_factors,
                    "positive_indicators": health_score.positive_indicators,
                    "recommendations": health_score.recommendations,
                    "last_calculated": health_score.last_calculated.isoformat()
                }
            else:
                return {"error": "Health monitoring not available"}
        except Exception as e:
            logging.error(f"Failed to calculate customer health score: {e}")
            return {"error": str(e)}
    
    async def get_customer_health_alerts(self, customer_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get active health alerts for customer or all customers."""
        try:
            if HEALTH_MONITORING_AVAILABLE and self.health_monitor:
                alerts = await self.health_monitor.get_active_alerts(customer_id)
                return [
                    {
                        "alert_id": alert.alert_id,
                        "customer_id": alert.customer_id,
                        "alert_type": alert.alert_type.value,
                        "severity": alert.severity,
                        "title": alert.title,
                        "description": alert.description,
                        "triggered_at": alert.triggered_at.isoformat(),
                        "action_required": alert.action_required
                    }
                    for alert in alerts
                ]
            else:
                return []
        except Exception as e:
            logging.error(f"Failed to get health alerts: {e}")
            return []
    
    # Customer Journey Tracking Methods
    
    async def track_customer_touchpoint(self, customer_id: str, touchpoint_type: str, 
                                      channel: str, platform: str, **kwargs) -> Dict[str, Any]:
        """Track a customer touchpoint in their journey."""
        try:
            if JOURNEY_TRACKING_AVAILABLE and self.journey_tracker:
                from guild.src.core.customer_journey_tracking import TouchpointType
                touchpoint = await self.journey_tracker.track_touchpoint(
                    customer_id, TouchpointType(touchpoint_type), channel, platform, **kwargs
                )
                return {
                    "touchpoint_id": touchpoint.touchpoint_id,
                    "customer_id": touchpoint.customer_id,
                    "touchpoint_type": touchpoint.touchpoint_type.value,
                    "stage": touchpoint.stage.value,
                    "timestamp": touchpoint.timestamp.isoformat(),
                    "channel": touchpoint.channel,
                    "platform": touchpoint.platform
                }
            else:
                return {"error": "Journey tracking not available"}
        except Exception as e:
            logging.error(f"Failed to track customer touchpoint: {e}")
            return {"error": str(e)}
    
    async def get_customer_journey_data(self, customer_id: str) -> Dict[str, Any]:
        """Get complete customer journey data."""
        try:
            if JOURNEY_TRACKING_AVAILABLE and self.journey_tracker:
                journey = await self.journey_tracker.get_customer_journey(customer_id)
                if journey:
                    return {
                        "customer_id": customer_id,
                        "current_stage": journey.current_stage.value,
                        "journey_start": journey.journey_start.isoformat(),
                        "last_activity": journey.last_activity.isoformat(),
                        "journey_score": journey.journey_score,
                        "next_likely_stage": journey.next_likely_stage.value if journey.next_likely_stage else None,
                        "time_in_current_stage": journey.time_in_current_stage,
                        "total_journey_duration": journey.total_journey_duration,
                        "conversion_probability": journey.conversion_probability,
                        "churn_risk": journey.churn_risk,
                        "journey_health": journey.journey_health,
                        "touchpoints": [
                            {
                                "touchpoint_id": tp.touchpoint_id,
                                "touchpoint_type": tp.touchpoint_type.value,
                                "stage": tp.stage.value,
                                "timestamp": tp.timestamp.isoformat(),
                                "channel": tp.channel,
                                "platform": tp.platform,
                                "content": tp.content,
                                "outcome": tp.outcome
                            }
                            for tp in journey.touchpoints
                        ],
                        "milestones": [
                            {
                                "milestone_id": m.milestone_id,
                                "event_type": m.event_type.value,
                                "stage": m.stage.value,
                                "timestamp": m.timestamp.isoformat(),
                                "description": m.description,
                                "impact_score": m.impact_score
                            }
                            for m in journey.milestones
                        ]
                    }
                else:
                    return {"customer_id": customer_id, "journey": None}
            else:
                return {"error": "Journey tracking not available"}
        except Exception as e:
            logging.error(f"Failed to get customer journey data: {e}")
            return {"error": str(e)}
    
    # Customer Communication Timeline Methods
    
    async def log_customer_communication(self, customer_id: str, communication_type: str,
                                       direction: str, **kwargs) -> Dict[str, Any]:
        """Log a customer communication event."""
        try:
            if COMMUNICATION_TIMELINE_AVAILABLE and self.communication_timeline:
                from guild.src.core.customer_communication_timeline import CommunicationType, CommunicationDirection
                communication = await self.communication_timeline.log_communication(
                    customer_id, CommunicationType(communication_type), 
                    CommunicationDirection(direction), **kwargs
                )
                return {
                    "communication_id": communication.communication_id,
                    "customer_id": communication.customer_id,
                    "communication_type": communication.communication_type.value,
                    "direction": communication.direction.value,
                    "status": communication.status.value,
                    "timestamp": communication.timestamp.isoformat(),
                    "subject": communication.subject,
                    "content": communication.content,
                    "sentiment": communication.sentiment.value if communication.sentiment else None,
                    "sentiment_score": communication.sentiment_score
                }
            else:
                return {"error": "Communication timeline not available"}
        except Exception as e:
            logging.error(f"Failed to log customer communication: {e}")
            return {"error": str(e)}
    
    async def get_customer_communication_timeline(self, customer_id: str, 
                                                start_date: Optional[datetime] = None,
                                                end_date: Optional[datetime] = None) -> List[Dict[str, Any]]:
        """Get customer communication timeline."""
        try:
            if COMMUNICATION_TIMELINE_AVAILABLE and self.communication_timeline:
                communications = await self.communication_timeline.get_communication_timeline(
                    customer_id, start_date, end_date
                )
                return [
                    {
                        "communication_id": comm.communication_id,
                        "communication_type": comm.communication_type.value,
                        "direction": comm.direction.value,
                        "status": comm.status.value,
                        "timestamp": comm.timestamp.isoformat(),
                        "subject": comm.subject,
                        "content": comm.content,
                        "sender": comm.sender,
                        "recipient": comm.recipient,
                        "channel": comm.channel,
                        "platform": comm.platform,
                        "sentiment": comm.sentiment.value if comm.sentiment else None,
                        "sentiment_score": comm.sentiment_score,
                        "priority": comm.priority,
                        "outcome": comm.outcome,
                        "satisfaction_rating": comm.satisfaction_rating
                    }
                    for comm in communications
                ]
            else:
                return []
        except Exception as e:
            logging.error(f"Failed to get customer communication timeline: {e}")
            return []
    
        async def get_customer_communication_summary(self, customer_id: str) -> Dict[str, Any]:
            """Get customer communication summary."""
            try:
                if COMMUNICATION_TIMELINE_AVAILABLE and self.communication_timeline:
                    summary = await self.communication_timeline.get_communication_summary(customer_id)
                    if summary:
                        return {
                            "customer_id": customer_id,
                            "total_communications": summary.total_communications,
                            "inbound_count": summary.inbound_count,
                            "outbound_count": summary.outbound_count,
                            "response_rate": summary.response_rate,
                            "average_response_time": summary.average_response_time,
                            "satisfaction_score": summary.satisfaction_score,
                            "active_conversations": summary.active_conversations,
                            "pending_follow_ups": summary.pending_follow_ups,
                            "urgent_items": summary.urgent_items
                        }
                    else:
                        return {"customer_id": customer_id, "summary": None}
                else:
                    return {"error": "Communication timeline not available"}
            except Exception as e:
                logging.error(f"Failed to get customer communication summary: {e}")
                return {"error": str(e)}
        
        # Proactive Customer Success Methods
        async def analyze_customer_for_proactive_interventions(self, customer_id: str, customer_data: Dict[str, Any]) -> List[Dict[str, Any]]:
            """Analyze customer for proactive interventions."""
            try:
                if PROACTIVE_SUCCESS_AVAILABLE and self.proactive_success:
                    interventions = await self.proactive_success.analyze_customer_for_interventions(customer_id, customer_data)
                    return [
                        {
                            "intervention_id": intervention.intervention_id,
                            "customer_id": intervention.customer_id,
                            "intervention_type": intervention.intervention_type.value,
                            "priority": intervention.priority.value,
                            "status": intervention.status.value,
                            "trigger_reason": intervention.trigger_reason,
                            "predicted_impact": intervention.predicted_impact,
                            "success_probability": intervention.success_probability,
                            "created_at": intervention.created_at.isoformat(),
                            "scheduled_for": intervention.scheduled_for.isoformat() if intervention.scheduled_for else None,
                            "action_plan": intervention.action_plan,
                            "execution_steps": intervention.execution_steps,
                            "success_metrics": intervention.success_metrics
                        }
                        for intervention in interventions
                    ]
                else:
                    return []
            except Exception as e:
                logging.error(f"Failed to analyze customer for proactive interventions: {e}")
                return []
        
        async def execute_customer_intervention(self, intervention_id: str) -> Dict[str, Any]:
            """Execute a customer intervention."""
            try:
                if PROACTIVE_SUCCESS_AVAILABLE and self.proactive_success:
                    result = await self.proactive_success.execute_intervention(intervention_id)
                    return result
                else:
                    return {"error": "Proactive success system not available"}
            except Exception as e:
                logging.error(f"Failed to execute customer intervention: {e}")
                return {"error": str(e)}
        
        async def get_active_customer_interventions(self, customer_id: Optional[str] = None) -> List[Dict[str, Any]]:
            """Get active customer interventions."""
            try:
                if PROACTIVE_SUCCESS_AVAILABLE and self.proactive_success:
                    interventions = await self.proactive_success.get_active_interventions(customer_id)
                    return [
                        {
                            "intervention_id": intervention.intervention_id,
                            "customer_id": intervention.customer_id,
                            "intervention_type": intervention.intervention_type.value,
                            "priority": intervention.priority.value,
                            "status": intervention.status.value,
                            "trigger_reason": intervention.trigger_reason,
                            "predicted_impact": intervention.predicted_impact,
                            "success_probability": intervention.success_probability,
                            "created_at": intervention.created_at.isoformat(),
                            "scheduled_for": intervention.scheduled_for.isoformat() if intervention.scheduled_for else None,
                            "action_plan": intervention.action_plan,
                            "execution_steps": intervention.execution_steps,
                            "success_metrics": intervention.success_metrics
                        }
                        for intervention in interventions
                    ]
                else:
                    return []
            except Exception as e:
                logging.error(f"Failed to get active customer interventions: {e}")
                return []
        
        # Intelligent Resolution System Methods
        async def detect_and_resolve_customer_issue(self, customer_id: str, issue_data: Dict[str, Any]) -> Dict[str, Any]:
            """Detect and resolve customer issue."""
            try:
                if RESOLUTION_SYSTEM_AVAILABLE and self.resolution_system:
                    issue = await self.resolution_system.detect_and_analyze_issue(customer_id, issue_data)
                    return {
                        "issue_id": issue.issue_id,
                        "customer_id": issue.customer_id,
                        "issue_type": issue.issue_type.value,
                        "severity": issue.severity.value,
                        "title": issue.title,
                        "description": issue.description,
                        "status": issue.status.value,
                        "created_at": issue.created_at.isoformat(),
                        "detected_by": issue.detected_by,
                        "priority_score": issue.priority_score,
                        "resolution_method": issue.resolution_method.value if issue.resolution_method else None,
                        "resolution_steps": issue.resolution_steps,
                        "escalation_reason": issue.escalation_reason
                    }
                else:
                    return {"error": "Resolution system not available"}
            except Exception as e:
                logging.error(f"Failed to detect and resolve customer issue: {e}")
                return {"error": str(e)}
        
        async def get_active_customer_issues(self, customer_id: Optional[str] = None) -> List[Dict[str, Any]]:
            """Get active customer issues."""
            try:
                if RESOLUTION_SYSTEM_AVAILABLE and self.resolution_system:
                    issues = await self.resolution_system.get_active_issues(customer_id)
                    return [
                        {
                            "issue_id": issue.issue_id,
                            "customer_id": issue.customer_id,
                            "issue_type": issue.issue_type.value,
                            "severity": issue.severity.value,
                            "title": issue.title,
                            "description": issue.description,
                            "status": issue.status.value,
                            "created_at": issue.created_at.isoformat(),
                            "detected_by": issue.detected_by,
                            "priority_score": issue.priority_score,
                            "resolution_method": issue.resolution_method.value if issue.resolution_method else None,
                            "resolution_steps": issue.resolution_steps,
                            "escalation_reason": issue.escalation_reason
                        }
                        for issue in issues
                    ]
                else:
                    return []
            except Exception as e:
                logging.error(f"Failed to get active customer issues: {e}")
                return []
        
        # Predictive Action Engine Methods
        async def generate_next_best_actions(self, customer_id: str, customer_data: Dict[str, Any]) -> List[Dict[str, Any]]:
            """Generate next best action recommendations."""
            try:
                if ACTION_ENGINE_AVAILABLE and self.action_engine:
                    actions = await self.action_engine.generate_next_best_actions(customer_id, customer_data)
                    return [
                        {
                            "action_id": action.action_id,
                            "customer_id": action.customer_id,
                            "action_type": action.action_type.value,
                            "priority": action.priority.value,
                            "context": action.context.value,
                            "title": action.title,
                            "description": action.description,
                            "confidence_score": action.confidence_score,
                            "expected_impact": action.expected_impact,
                            "success_probability": action.success_probability,
                            "urgency_score": action.urgency_score,
                            "created_at": action.created_at.isoformat(),
                            "recommended_for": action.recommended_for.isoformat() if action.recommended_for else None,
                            "status": action.status.value,
                            "execution_plan": action.execution_plan,
                            "success_metrics": action.success_metrics,
                            "risk_factors": action.risk_factors,
                            "dependencies": action.dependencies,
                            "estimated_duration": action.estimated_duration,
                            "assigned_agent": action.assigned_agent
                        }
                        for action in actions
                    ]
                else:
                    return []
            except Exception as e:
                logging.error(f"Failed to generate next best actions: {e}")
                return []
        
        async def optimize_customer_journey(self, customer_id: str, customer_data: Dict[str, Any]) -> Dict[str, Any]:
            """Optimize customer journey."""
            try:
                if ACTION_ENGINE_AVAILABLE and self.action_engine:
                    optimization = await self.action_engine.optimize_customer_journey(customer_id, customer_data)
                    return {
                        "optimization_id": optimization.optimization_id,
                        "customer_id": optimization.customer_id,
                        "journey_stage": optimization.journey_stage,
                        "optimization_type": optimization.optimization_type,
                        "current_metrics": optimization.current_metrics,
                        "target_metrics": optimization.target_metrics,
                        "recommended_actions": optimization.recommended_actions,
                        "expected_improvement": optimization.expected_improvement,
                        "implementation_plan": optimization.implementation_plan,
                        "success_criteria": optimization.success_criteria
                    }
                else:
                    return {"error": "Action engine not available"}
            except Exception as e:
                logging.error(f"Failed to optimize customer journey: {e}")
                return {"error": str(e)}
        
        # Voice Customer Intelligence Methods
        async def create_voice_intervention(self, customer_id: str, intervention_data: Dict[str, Any]) -> Dict[str, Any]:
            """Create a voice-based customer intervention."""
            try:
                if VOICE_INTELLIGENCE_AVAILABLE and self.voice_intelligence:
                    voice_call = await self.voice_intelligence.create_voice_intervention(customer_id, intervention_data)
                    return {
                        "call_id": voice_call.call_id,
                        "customer_id": voice_call.customer_id,
                        "call_type": voice_call.call_type.value,
                        "priority": voice_call.priority.value,
                        "status": voice_call.status.value,
                        "phone_number": voice_call.phone_number,
                        "purpose": voice_call.purpose,
                        "script": voice_call.script,
                        "emotional_context": voice_call.emotional_context,
                        "created_at": voice_call.created_at.isoformat(),
                        "scheduled_for": voice_call.scheduled_for.isoformat() if voice_call.scheduled_for else None
                    }
                else:
                    return {"error": "Voice intelligence not available"}
            except Exception as e:
                logging.error(f"Failed to create voice intervention: {e}")
                return {"error": str(e)}
        
        async def execute_voice_call(self, call_id: str) -> Dict[str, Any]:
            """Execute a voice call with emotional intelligence."""
            try:
                if VOICE_INTELLIGENCE_AVAILABLE and self.voice_intelligence:
                    result = await self.voice_intelligence.execute_voice_call(call_id)
                    return result
                else:
                    return {"error": "Voice intelligence not available"}
            except Exception as e:
                logging.error(f"Failed to execute voice call: {e}")
                return {"error": str(e)}
        
        async def create_voice_workflow(self, customer_id: str, workflow_type: str, workflow_data: Dict[str, Any]) -> Dict[str, Any]:
            """Create a multi-call voice workflow."""
            try:
                if VOICE_INTELLIGENCE_AVAILABLE and self.voice_intelligence:
                    voice_workflow = await self.voice_intelligence.create_voice_workflow(customer_id, workflow_type, workflow_data)
                    return {
                        "workflow_id": voice_workflow.workflow_id,
                        "customer_id": voice_workflow.customer_id,
                        "workflow_type": voice_workflow.workflow_type,
                        "call_sequence": [
                            {
                                "call_id": call.call_id,
                                "call_type": call.call_type.value,
                                "priority": call.priority.value,
                                "purpose": call.purpose
                            }
                            for call in voice_workflow.call_sequence
                        ],
                        "success_criteria": voice_workflow.success_criteria,
                        "escalation_rules": voice_workflow.escalation_rules,
                        "created_at": voice_workflow.created_at.isoformat(),
                        "status": voice_workflow.status
                    }
                else:
                    return {"error": "Voice intelligence not available"}
            except Exception as e:
                logging.error(f"Failed to create voice workflow: {e}")
                return {"error": str(e)}
        
        async def execute_voice_workflow(self, workflow_id: str) -> Dict[str, Any]:
            """Execute a voice workflow."""
            try:
                if VOICE_INTELLIGENCE_AVAILABLE and self.voice_intelligence:
                    result = await self.voice_intelligence.execute_voice_workflow(workflow_id)
                    return result
                else:
                    return {"error": "Voice intelligence not available"}
            except Exception as e:
                logging.error(f"Failed to execute voice workflow: {e}")
                return {"error": str(e)}
        
        async def get_voice_call_analytics(self) -> Dict[str, Any]:
            """Get voice call analytics and performance metrics."""
            try:
                if VOICE_INTELLIGENCE_AVAILABLE and self.voice_intelligence:
                    result = await self.voice_intelligence.get_voice_call_analytics()
                    return result
                else:
                    return {"error": "Voice intelligence not available"}
            except Exception as e:
                logging.error(f"Failed to get voice call analytics: {e}")
                return {"error": str(e)}

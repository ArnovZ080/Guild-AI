"""
Voice-Enabled Customer Intelligence System for Guild-AI
Integrates emotional intelligence voice capabilities with autonomous customer relations management.
"""

import asyncio
import json
import logging
from typing import Dict, List, Any, Optional, Union
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
import uuid

class VoiceCallType(Enum):
    """Types of voice calls for customer relations"""
    SALES_OUTREACH = "sales_outreach"
    RETENTION_CALL = "retention_call"
    SUPPORT_CALL = "support_call"
    SUCCESS_CHECK_IN = "success_check_in"
    ONBOARDING_CALL = "onboarding_call"
    FEEDBACK_CALL = "feedback_call"
    WIN_BACK_CALL = "win_back_call"
    UPSELL_CALL = "upsell_call"
    TRAINING_CALL = "training_call"
    ESCALATION_CALL = "escalation_call"

class CallPriority(Enum):
    """Call priority levels"""
    CRITICAL = "critical"    # Immediate call required
    HIGH = "high"           # Within 2 hours
    MEDIUM = "medium"       # Within 24 hours
    LOW = "low"            # Within 3 days

class CallStatus(Enum):
    """Call status"""
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    ESCALATED = "escalated"

@dataclass
class VoiceCall:
    """Voice call for customer relations"""
    call_id: str
    customer_id: str
    call_type: VoiceCallType
    priority: CallPriority
    status: CallStatus
    phone_number: str
    purpose: str
    script: str
    emotional_context: Dict[str, Any]
    created_at: datetime
    scheduled_for: Optional[datetime]
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    duration_seconds: Optional[int]
    transcription: Optional[str]
    emotion_analysis: Optional[Dict[str, Any]]
    outcome: Optional[str]
    follow_up_required: bool
    follow_up_actions: List[Dict[str, Any]]
    customer_satisfaction: Optional[int]  # 1-5
    success_metrics: Dict[str, Any]

@dataclass
class VoiceWorkflow:
    """Voice-based autonomous workflow"""
    workflow_id: str
    customer_id: str
    workflow_type: str
    call_sequence: List[VoiceCall]
    success_criteria: Dict[str, Any]
    escalation_rules: Dict[str, Any]
    created_at: datetime
    status: str
    results: Optional[Dict[str, Any]]

class VoiceCustomerIntelligence:
    """
    Voice-enabled customer intelligence system with emotional awareness.
    """
    
    def __init__(self):
        self.active_calls: Dict[str, VoiceCall] = {}
        self.call_history: List[VoiceCall] = []
        self.voice_workflows: Dict[str, VoiceWorkflow] = {}
        self.voice_agents: Dict[str, Any] = {}
        self.emotion_patterns: Dict[str, Any] = {}
        
        # Initialize voice system components
        self._initialize_voice_system()
        self._initialize_voice_agents()
        self._initialize_call_templates()
    
    def _initialize_voice_system(self):
        """Initialize voice system components"""
        try:
            # Import voice system components
            from guild.src.core.voice import VoiceAgent, TTSEngine, EmotionDetector
            from guild.src.agents.voice_agent import VoiceAgent as GuildVoiceAgent
            
            # Initialize core voice components
            self.voice_agent = VoiceAgent()
            self.tts_engine = TTSEngine()
            self.emotion_detector = EmotionDetector()
            self.guild_voice_agent = GuildVoiceAgent()
            
            # Set voice system configuration
            self.voice_config = {
                "tts": {
                    "primary_model": "kokoro",
                    "quality_threshold": 0.8,
                    "max_latency_ms": 500
                },
                "emotion_detection": {
                    "enabled": True,
                    "real_time": True,
                    "confidence_threshold": 0.6,
                    "trend_analysis": True,
                    "escalation_detection": True
                },
                "telephony": {
                    "primary_provider": "twilio",
                    "call_settings": {
                        "max_duration_minutes": 30,
                        "recording_enabled": True
                    }
                }
            }
            
            logging.info("Voice system initialized successfully")
            
        except ImportError as e:
            logging.warning(f"Voice system components not available: {e}")
            self.voice_agent = None
            self.tts_engine = None
            self.emotion_detector = None
            self.guild_voice_agent = None
    
    def _initialize_voice_agents(self):
        """Initialize specialized voice agents for different purposes"""
        self.voice_agents = {
            "sales_agent": {
                "name": "Sarah",
                "gender": "female",
                "tone": "professional_friendly",
                "emotional_styles": {
                    "calm_empathetic": {"speed": 0.9, "pitch": -0.2, "prosody": "gentle"},
                    "enthusiastic": {"speed": 1.1, "pitch": 0.2, "prosody": "energetic"},
                    "reassuring": {"speed": 0.95, "pitch": 0.0, "prosody": "steady"}
                }
            },
            "support_agent": {
                "name": "Michael",
                "gender": "male",
                "tone": "helpful_calm",
                "emotional_styles": {
                    "very_calm_empathetic": {"speed": 0.85, "pitch": -0.3, "prosody": "very_gentle"},
                    "supportive_patient": {"speed": 0.9, "pitch": -0.1, "prosody": "patient"},
                    "clear_patient": {"speed": 0.95, "pitch": 0.0, "prosody": "clear"}
                }
            },
            "retention_agent": {
                "name": "Emma",
                "gender": "female",
                "tone": "empathetic_understanding",
                "emotional_styles": {
                    "very_empathetic": {"speed": 0.8, "pitch": -0.4, "prosody": "very_gentle"},
                    "understanding": {"speed": 0.9, "pitch": -0.2, "prosody": "patient"},
                    "reassuring": {"speed": 0.95, "pitch": 0.0, "prosody": "steady"}
                }
            },
            "success_agent": {
                "name": "David",
                "gender": "male",
                "tone": "encouraging_professional",
                "emotional_styles": {
                    "encouraging": {"speed": 1.0, "pitch": 0.1, "prosody": "positive"},
                    "professional": {"speed": 0.95, "pitch": 0.0, "prosody": "clear"},
                    "supportive": {"speed": 0.9, "pitch": -0.1, "prosody": "gentle"}
                }
            }
        }
    
    def _initialize_call_templates(self):
        """Initialize call templates for different scenarios"""
        self.call_templates = {
            VoiceCallType.SALES_OUTREACH: {
                "opening": "Hello {customer_name}, this is {agent_name} from {company}. I hope you're doing well today.",
                "purpose": "I'm calling to share some exciting opportunities that could really benefit your business.",
                "value_proposition": "Based on what I see in your account, I believe we can help you {specific_benefit}.",
                "closing": "Would you be open to a brief conversation about how we can help you achieve {goal}?",
                "agent_type": "sales_agent"
            },
            VoiceCallType.RETENTION_CALL: {
                "opening": "Hi {customer_name}, this is {agent_name} from {company}. I wanted to personally reach out to check in with you.",
                "purpose": "I've noticed some changes in your usage patterns and wanted to see how we can better support you.",
                "empathy": "I understand that business needs change, and I want to make sure we're still the right fit for you.",
                "value_reminder": "I wanted to remind you of the great value you've been getting from {specific_features}.",
                "closing": "What can we do to ensure you're getting the most value from our partnership?",
                "agent_type": "retention_agent"
            },
            VoiceCallType.SUPPORT_CALL: {
                "opening": "Hello {customer_name}, this is {agent_name} from {company} support team.",
                "purpose": "I'm calling to follow up on the {issue_type} you reported and see how we can resolve this for you.",
                "empathy": "I understand how frustrating this must be, and I want to personally ensure we get this resolved quickly.",
                "solution": "I have a few options that should resolve this issue. Let me walk you through them.",
                "closing": "I want to make sure this is completely resolved for you. Do you have any other questions?",
                "agent_type": "support_agent"
            },
            VoiceCallType.SUCCESS_CHECK_IN: {
                "opening": "Hi {customer_name}, this is {agent_name}, your customer success manager.",
                "purpose": "I wanted to check in and see how things are going with your {product/service} implementation.",
                "progress": "I can see you've been making great progress with {specific_achievements}. That's fantastic!",
                "support": "Is there anything specific you'd like to focus on or any challenges you're facing?",
                "closing": "I'm here to ensure your success. What can we work on together to help you achieve your goals?",
                "agent_type": "success_agent"
            },
            VoiceCallType.WIN_BACK_CALL: {
                "opening": "Hello {customer_name}, this is {agent_name} from {company}. I hope you're doing well.",
                "purpose": "I wanted to personally reach out because I noticed you haven't been using our service recently.",
                "understanding": "I completely understand that business priorities change, and I respect your decision.",
                "value_proposition": "I wanted to share some exciting new features we've added that might be valuable for your current needs.",
                "closing": "Would you be open to a brief conversation about how we might be able to support you again?",
                "agent_type": "retention_agent"
            }
        }
    
    async def create_voice_intervention(self, customer_id: str, intervention_data: Dict[str, Any]) -> VoiceCall:
        """Create a voice-based customer intervention"""
        try:
            # Determine call type based on intervention
            call_type = self._determine_call_type(intervention_data)
            priority = self._determine_call_priority(intervention_data)
            
            # Get customer phone number (would come from customer data)
            phone_number = await self._get_customer_phone_number(customer_id)
            
            # Generate personalized script
            script = await self._generate_personalized_script(customer_id, call_type, intervention_data)
            
            # Create voice call
            voice_call = VoiceCall(
                call_id=str(uuid.uuid4()),
                customer_id=customer_id,
                call_type=call_type,
                priority=priority,
                status=CallStatus.SCHEDULED,
                phone_number=phone_number,
                purpose=intervention_data.get("purpose", "Customer intervention"),
                script=script,
                emotional_context=intervention_data.get("emotional_context", {}),
                created_at=datetime.now(),
                scheduled_for=self._calculate_optimal_call_time(priority),
                started_at=None,
                completed_at=None,
                duration_seconds=None,
                transcription=None,
                emotion_analysis=None,
                outcome=None,
                follow_up_required=False,
                follow_up_actions=[],
                customer_satisfaction=None,
                success_metrics={}
            )
            
            # Store call
            self.active_calls[voice_call.call_id] = voice_call
            
            return voice_call
            
        except Exception as e:
            logging.error(f"Failed to create voice intervention: {e}")
            raise
    
    def _determine_call_type(self, intervention_data: Dict[str, Any]) -> VoiceCallType:
        """Determine appropriate call type based on intervention data"""
        intervention_type = intervention_data.get("intervention_type", "")
        
        if "retention" in intervention_type.lower():
            return VoiceCallType.RETENTION_CALL
        elif "support" in intervention_type.lower():
            return VoiceCallType.SUPPORT_CALL
        elif "upsell" in intervention_type.lower():
            return VoiceCallType.UPSELL_CALL
        elif "onboarding" in intervention_type.lower():
            return VoiceCallType.ONBOARDING_CALL
        elif "health_check" in intervention_type.lower():
            return VoiceCallType.SUCCESS_CHECK_IN
        elif "win_back" in intervention_type.lower():
            return VoiceCallType.WIN_BACK_CALL
        else:
            return VoiceCallType.SUCCESS_CHECK_IN
    
    def _determine_call_priority(self, intervention_data: Dict[str, Any]) -> CallPriority:
        """Determine call priority based on intervention data"""
        priority = intervention_data.get("priority", "medium").lower()
        
        if priority == "critical":
            return CallPriority.CRITICAL
        elif priority == "high":
            return CallPriority.HIGH
        elif priority == "medium":
            return CallPriority.MEDIUM
        else:
            return CallPriority.LOW
    
    async def _get_customer_phone_number(self, customer_id: str) -> str:
        """Get customer phone number from customer data"""
        try:
            # In real implementation, this would query customer database
            # For now, return a placeholder
            return "+1234567890"
        except Exception as e:
            logging.error(f"Failed to get customer phone number: {e}")
            return "+1234567890"
    
    async def _generate_personalized_script(self, customer_id: str, call_type: VoiceCallType, intervention_data: Dict[str, Any]) -> str:
        """Generate personalized script for the call"""
        try:
            # Get call template
            template = self.call_templates.get(call_type, {})
            
            # Get customer data for personalization
            customer_data = await self._get_customer_data(customer_id)
            customer_name = customer_data.get("name", "there")
            
            # Get agent info
            agent_type = template.get("agent_type", "support_agent")
            agent_info = self.voice_agents.get(agent_type, {})
            agent_name = agent_info.get("name", "Alex")
            
            # Personalize script
            script_parts = []
            
            if "opening" in template:
                script_parts.append(template["opening"].format(
                    customer_name=customer_name,
                    agent_name=agent_name,
                    company="Guild AI"
                ))
            
            if "purpose" in template:
                script_parts.append(template["purpose"])
            
            if "value_proposition" in template:
                script_parts.append(template["value_proposition"].format(
                    specific_benefit="increase your team's productivity by 40%",
                    goal="streamline your operations"
                ))
            
            if "empathy" in template:
                script_parts.append(template["empathy"])
            
            if "closing" in template:
                script_parts.append(template["closing"].format(
                    goal="streamline your operations"
                ))
            
            return " ".join(script_parts)
            
        except Exception as e:
            logging.error(f"Failed to generate personalized script: {e}")
            return "Hello, this is a call from Guild AI. I hope you're doing well today."
    
    async def _get_customer_data(self, customer_id: str) -> Dict[str, Any]:
        """Get customer data for personalization"""
        try:
            # In real implementation, this would query customer database
            # For now, return mock data
            return {
                "name": "John",
                "company": "TechCorp",
                "tier": "enterprise",
                "health_score": 75
            }
        except Exception as e:
            logging.error(f"Failed to get customer data: {e}")
            return {"name": "there"}
    
    def _calculate_optimal_call_time(self, priority: CallPriority) -> datetime:
        """Calculate optimal time for the call"""
        now = datetime.now()
        
        if priority == CallPriority.CRITICAL:
            return now + timedelta(minutes=30)
        elif priority == CallPriority.HIGH:
            return now + timedelta(hours=2)
        elif priority == CallPriority.MEDIUM:
            return now + timedelta(hours=12)
        else:  # LOW
            return now + timedelta(days=1)
    
    async def execute_voice_call(self, call_id: str) -> Dict[str, Any]:
        """Execute a voice call with emotional intelligence"""
        try:
            voice_call = self.active_calls.get(call_id)
            if not voice_call:
                return {"error": "Call not found"}
            
            voice_call.status = CallStatus.IN_PROGRESS
            voice_call.started_at = datetime.now()
            
            # Get agent profile for the call
            call_template = self.call_templates.get(voice_call.call_type, {})
            agent_type = call_template.get("agent_type", "support_agent")
            agent_profile = self.voice_agents.get(agent_type, {})
            
            # Set up voice agent with emotional context
            if self.voice_agent:
                await self.voice_agent.set_agent_profile(
                    agent_id=f"{agent_type}_{call_id}",
                    agent_type=agent_type,
                    voice_profile=agent_type
                )
            
            # Execute the call (simulated)
            call_result = await self._simulate_voice_call(voice_call, agent_profile)
            
            # Update call status
            voice_call.status = CallStatus.COMPLETED
            voice_call.completed_at = datetime.now()
            voice_call.duration_seconds = int((voice_call.completed_at - voice_call.started_at).total_seconds())
            voice_call.transcription = call_result.get("transcription", "")
            voice_call.emotion_analysis = call_result.get("emotion_analysis", {})
            voice_call.outcome = call_result.get("outcome", "completed")
            voice_call.customer_satisfaction = call_result.get("customer_satisfaction", 5)
            voice_call.follow_up_required = call_result.get("follow_up_required", False)
            voice_call.follow_up_actions = call_result.get("follow_up_actions", [])
            
            # Move to history
            self.call_history.append(voice_call)
            del self.active_calls[call_id]
            
            return {
                "call_id": call_id,
                "status": "completed",
                "duration_seconds": voice_call.duration_seconds,
                "transcription": voice_call.transcription,
                "emotion_analysis": voice_call.emotion_analysis,
                "outcome": voice_call.outcome,
                "customer_satisfaction": voice_call.customer_satisfaction,
                "follow_up_required": voice_call.follow_up_required,
                "follow_up_actions": voice_call.follow_up_actions
            }
            
        except Exception as e:
            logging.error(f"Failed to execute voice call {call_id}: {e}")
            return {"error": str(e)}
    
    async def _simulate_voice_call(self, voice_call: VoiceCall, agent_profile: Dict[str, Any]) -> Dict[str, Any]:
        """Simulate voice call execution with emotional intelligence"""
        try:
            # Simulate call duration
            await asyncio.sleep(0.1)  # Simulate call time
            
            # Simulate emotion analysis
            emotion_analysis = {
                "primary_emotion": "neutral",
                "secondary_emotion": "satisfied",
                "confidence_score": 0.85,
                "escalation_risk": 0.2,
                "emotional_trend": "positive",
                "recommended_tone": "professional_friendly"
            }
            
            # Simulate transcription
            transcription = f"Call with {voice_call.customer_id}: {voice_call.script}"
            
            # Simulate outcome based on call type
            if voice_call.call_type == VoiceCallType.RETENTION_CALL:
                outcome = "customer_retained"
                follow_up_required = True
                follow_up_actions = [
                    "Schedule follow-up success call",
                    "Send personalized success plan",
                    "Assign dedicated success manager"
                ]
            elif voice_call.call_type == VoiceCallType.SUPPORT_CALL:
                outcome = "issue_resolved"
                follow_up_required = False
                follow_up_actions = [
                    "Send resolution confirmation email",
                    "Monitor for related issues"
                ]
            elif voice_call.call_type == VoiceCallType.UPSELL_CALL:
                outcome = "upsell_discussed"
                follow_up_required = True
                follow_up_actions = [
                    "Send detailed proposal",
                    "Schedule demo call",
                    "Follow up on decision timeline"
                ]
            else:
                outcome = "call_completed"
                follow_up_required = False
                follow_up_actions = []
            
            return {
                "transcription": transcription,
                "emotion_analysis": emotion_analysis,
                "outcome": outcome,
                "customer_satisfaction": 5,
                "follow_up_required": follow_up_required,
                "follow_up_actions": follow_up_actions
            }
            
        except Exception as e:
            logging.error(f"Failed to simulate voice call: {e}")
            return {
                "transcription": "Call simulation failed",
                "emotion_analysis": {},
                "outcome": "failed",
                "customer_satisfaction": 1,
                "follow_up_required": True,
                "follow_up_actions": ["Investigate call failure"]
            }
    
    async def create_voice_workflow(self, customer_id: str, workflow_type: str, workflow_data: Dict[str, Any]) -> VoiceWorkflow:
        """Create a multi-call voice workflow"""
        try:
            # Create call sequence based on workflow type
            call_sequence = []
            
            if workflow_type == "retention_workflow":
                # Retention workflow: Health check → Retention call → Follow-up
                call_sequence = [
                    await self.create_voice_intervention(customer_id, {
                        "intervention_type": "health_check",
                        "priority": "high",
                        "purpose": "Initial health assessment"
                    }),
                    await self.create_voice_intervention(customer_id, {
                        "intervention_type": "retention_campaign",
                        "priority": "high",
                        "purpose": "Retention intervention"
                    })
                ]
            elif workflow_type == "onboarding_workflow":
                # Onboarding workflow: Welcome → Training → Success check
                call_sequence = [
                    await self.create_voice_intervention(customer_id, {
                        "intervention_type": "onboarding_acceleration",
                        "priority": "medium",
                        "purpose": "Welcome and orientation"
                    }),
                    await self.create_voice_intervention(customer_id, {
                        "intervention_type": "training",
                        "priority": "medium",
                        "purpose": "Feature training session"
                    })
                ]
            elif workflow_type == "upsell_workflow":
                # Upsell workflow: Success review → Upsell discussion → Follow-up
                call_sequence = [
                    await self.create_voice_intervention(customer_id, {
                        "intervention_type": "success_milestone",
                        "priority": "low",
                        "purpose": "Success review and opportunity identification"
                    }),
                    await self.create_voice_intervention(customer_id, {
                        "intervention_type": "upsell_opportunity",
                        "priority": "medium",
                        "purpose": "Upsell discussion"
                    })
                ]
            
            # Create workflow
            voice_workflow = VoiceWorkflow(
                workflow_id=str(uuid.uuid4()),
                customer_id=customer_id,
                workflow_type=workflow_type,
                call_sequence=call_sequence,
                success_criteria=workflow_data.get("success_criteria", {}),
                escalation_rules=workflow_data.get("escalation_rules", {}),
                created_at=datetime.now(),
                status="active",
                results=None
            )
            
            # Store workflow
            self.voice_workflows[voice_workflow.workflow_id] = voice_workflow
            
            return voice_workflow
            
        except Exception as e:
            logging.error(f"Failed to create voice workflow: {e}")
            raise
    
    async def execute_voice_workflow(self, workflow_id: str) -> Dict[str, Any]:
        """Execute a voice workflow"""
        try:
            workflow = self.voice_workflows.get(workflow_id)
            if not workflow:
                return {"error": "Workflow not found"}
            
            results = {
                "workflow_id": workflow_id,
                "status": "in_progress",
                "call_results": [],
                "overall_outcome": None,
                "success_metrics": {}
            }
            
            # Execute each call in sequence
            for call in workflow.call_sequence:
                call_result = await self.execute_voice_call(call.call_id)
                results["call_results"].append(call_result)
                
                # Check for escalation
                if call_result.get("emotion_analysis", {}).get("escalation_risk", 0) > 0.7:
                    workflow.status = "escalated"
                    results["overall_outcome"] = "escalated"
                    break
            
            # Calculate overall success
            if not results["overall_outcome"]:
                success_count = sum(1 for result in results["call_results"] if result.get("outcome") in ["completed", "customer_retained", "issue_resolved"])
                total_calls = len(results["call_results"])
                success_rate = success_count / total_calls if total_calls > 0 else 0
                
                if success_rate >= 0.7:
                    results["overall_outcome"] = "successful"
                    workflow.status = "completed"
                else:
                    results["overall_outcome"] = "partial_success"
                    workflow.status = "completed"
            
            workflow.results = results
            
            return results
            
        except Exception as e:
            logging.error(f"Failed to execute voice workflow {workflow_id}: {e}")
            return {"error": str(e)}
    
    async def get_voice_call_analytics(self) -> Dict[str, Any]:
        """Get voice call analytics"""
        try:
            total_calls = len(self.call_history)
            completed_calls = len([c for c in self.call_history if c.status == CallStatus.COMPLETED])
            
            # Calculate success rates by call type
            success_rates = {}
            for call_type in VoiceCallType:
                type_calls = [c for c in self.call_history if c.call_type == call_type]
                if type_calls:
                    successful = len([c for c in type_calls if c.outcome in ["completed", "customer_retained", "issue_resolved"]])
                    success_rates[call_type.value] = successful / len(type_calls)
            
            # Calculate average satisfaction
            satisfaction_scores = [c.customer_satisfaction for c in self.call_history if c.customer_satisfaction]
            avg_satisfaction = sum(satisfaction_scores) / len(satisfaction_scores) if satisfaction_scores else 0
            
            # Calculate average call duration
            durations = [c.duration_seconds for c in self.call_history if c.duration_seconds]
            avg_duration = sum(durations) / len(durations) if durations else 0
            
            return {
                "total_calls": total_calls,
                "completed_calls": completed_calls,
                "active_calls": len(self.active_calls),
                "success_rates_by_type": success_rates,
                "average_satisfaction": avg_satisfaction,
                "average_call_duration": avg_duration,
                "voice_workflows": len(self.voice_workflows),
                "last_updated": datetime.now().isoformat()
            }
            
        except Exception as e:
            logging.error(f"Failed to get voice call analytics: {e}")
            return {}

# Global voice customer intelligence instance
voice_customer_intelligence = VoiceCustomerIntelligence()

# Convenience functions
async def create_voice_intervention(customer_id: str, intervention_data: Dict[str, Any]) -> VoiceCall:
    """Create a voice-based customer intervention"""
    return await voice_customer_intelligence.create_voice_intervention(customer_id, intervention_data)

async def execute_voice_call(call_id: str) -> Dict[str, Any]:
    """Execute a voice call"""
    return await voice_customer_intelligence.execute_voice_call(call_id)

async def create_voice_workflow(customer_id: str, workflow_type: str, workflow_data: Dict[str, Any]) -> VoiceWorkflow:
    """Create a voice workflow"""
    return await voice_customer_intelligence.create_voice_workflow(customer_id, workflow_type, workflow_data)

async def execute_voice_workflow(workflow_id: str) -> Dict[str, Any]:
    """Execute a voice workflow"""
    return await voice_customer_intelligence.execute_voice_workflow(workflow_id)

def get_voice_call_analytics() -> Dict[str, Any]:
    """Get voice call analytics"""
    return voice_customer_intelligence.get_voice_call_analytics()

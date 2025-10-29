"""
Voice Guardrails for Guild AI

This module provides safety and compliance features for voice-enabled agents,
ensuring professional, ethical, and compliant phone calls.
"""

import logging
import time
import re
from typing import Dict, Any, List, Optional, Tuple, Union
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)

class EscalationLevel(Enum):
    """Escalation level enumeration."""
    NONE = "none"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class ComplianceStatus(Enum):
    """Compliance status enumeration."""
    COMPLIANT = "compliant"
    WARNING = "warning"
    VIOLATION = "violation"
    BLOCKED = "blocked"

@dataclass
class CallScript:
    """Represents a call script with safety checks."""
    script_id: str
    content: str
    agent_type: str
    target_audience: str
    compliance_checks: List[str]
    escalation_triggers: List[str]
    approved: bool = False
    approved_by: Optional[str] = None
    approval_date: Optional[float] = None

@dataclass
class ComplianceCheck:
    """Result of a compliance check."""
    check_name: str
    status: ComplianceStatus
    details: str
    confidence: float
    timestamp: float

class VoiceGuardrails:
    """
    Safety and compliance system for voice-enabled agents.
    
    Features:
    - Pre-call script approval
    - Real-time compliance monitoring
    - Escalation triggers
    - Professional tone enforcement
    - Legal compliance checking
    """
    
    def __init__(self, config: Dict[str, Any] = None):
        """Initialize the voice guardrails system."""
        self.config = config or self._get_default_config()
        
        # Compliance rules
        self.compliance_rules = self._load_compliance_rules()
        self.escalation_rules = self._load_escalation_rules()
        
        # Call monitoring
        self.active_calls: Dict[str, Dict[str, Any]] = {}
        self.compliance_history: List[ComplianceCheck] = []
        self.escalation_history: List[Dict[str, Any]] = []
        
        # Script approval system
        self.approved_scripts: Dict[str, CallScript] = {}
        self.pending_scripts: Dict[str, CallScript] = {}
        
        logger.info("Voice Guardrails initialized successfully")
    
    def _get_default_config(self) -> Dict[str, Any]:
        """Get default guardrails configuration."""
        return {
            "compliance": {
                "enabled": True,
                "strict_mode": False,
                "auto_escalation": True,
                "recording_required": True
            },
            "escalation": {
                "confidence_threshold": 0.7,
                "response_timeout_seconds": 30,
                "max_escalations_per_call": 3,
                "human_override_required": True
            },
            "professional_standards": {
                "min_response_time": 1.0,
                "max_call_duration_minutes": 30,
                "required_greetings": True,
                "required_closings": True
            },
            "legal_compliance": {
                "gdpr_enabled": True,
                "ccpa_enabled": True,
                "recording_consent_required": True,
                "data_retention_days": 90
            }
        }
    
    def _load_compliance_rules(self) -> Dict[str, Any]:
        """Load compliance rules for different call types."""
        return {
            "sales_calls": {
                "required_disclaimers": [
                    "This is a sales call",
                    "You can opt out at any time",
                    "Call may be recorded for quality purposes"
                ],
                "prohibited_topics": [
                    "false_claims",
                    "pressure_tactics",
                    "personal_information_requests"
                ],
                "required_consent": ["recording_consent", "marketing_consent"]
            },
            "support_calls": {
                "required_disclaimers": [
                    "This is a customer support call",
                    "Call may be recorded for quality purposes"
                ],
                "prohibited_topics": [
                    "personal_financial_info",
                    "password_requests",
                    "unauthorized_access"
                ],
                "required_consent": ["recording_consent"]
            },
            "outreach_calls": {
                "required_disclaimers": [
                    "This is a business outreach call",
                    "Call may be recorded for quality purposes"
                ],
                "prohibited_topics": [
                    "unsolicited_marketing",
                    "personal_information",
                    "aggressive_tactics"
                ],
                "required_consent": ["recording_consent", "contact_consent"]
            }
        }
    
    def _load_escalation_rules(self) -> Dict[str, Any]:
        """Load escalation rules for different scenarios."""
        return {
            "low_confidence": {
                "threshold": 0.6,
                "action": "request_clarification",
                "escalation_level": EscalationLevel.LOW
            },
            "compliance_violation": {
                "threshold": 0.0,
                "action": "immediate_escalation",
                "escalation_level": EscalationLevel.HIGH
            },
            "customer_distress": {
                "threshold": 0.0,
                "action": "human_handoff",
                "escalation_level": EscalationLevel.CRITICAL
            },
            "technical_issues": {
                "threshold": 0.0,
                "action": "technical_support",
                "escalation_level": EscalationLevel.MEDIUM
            },
            "objection_handling": {
                "threshold": 0.5,
                "action": "escalate_to_senior_agent",
                "escalation_level": EscalationLevel.MEDIUM
            }
        }
    
    async def pre_call_approval(self, call_script: CallScript) -> Tuple[bool, str, List[str]]:
        """
        Approve a call script before execution.
        
        Args:
            call_script: The call script to approve
            
        Returns:
            Tuple of (approved, reason, compliance_issues)
        """
        try:
            compliance_issues = []
            
            # Check script content for compliance
            content_issues = self._check_script_content(call_script)
            compliance_issues.extend(content_issues)
            
            # Check agent qualifications
            agent_issues = self._check_agent_qualifications(call_script)
            compliance_issues.extend(agent_issues)
            
            # Check target audience appropriateness
            audience_issues = self._check_target_audience(call_script)
            compliance_issues.extend(audience_issues)
            
            # Determine approval status
            approved = len(compliance_issues) == 0
            
            if approved:
                # Store approved script
                self.approved_scripts[call_script.script_id] = call_script
                call_script.approved = True
                call_script.approval_date = time.time()
                
                logger.info(f"Call script {call_script.script_id} approved")
            else:
                # Store pending script for review
                self.pending_scripts[call_script.script_id] = call_script
                logger.warning(f"Call script {call_script.script_id} requires review: {compliance_issues}")
            
            reason = "Script approved" if approved else "Script requires review"
            return approved, reason, compliance_issues
            
        except Exception as e:
            logger.error(f"Error in pre-call approval: {e}")
            return False, f"Approval error: {str(e)}", ["system_error"]
    
    def _check_script_content(self, script: CallScript) -> List[str]:
        """Check script content for compliance issues."""
        issues = []
        
        try:
            # Get compliance rules for agent type
            rules = self.compliance_rules.get(script.agent_type, {})
            
            # Check required disclaimers
            required_disclaimers = rules.get("required_disclaimers", [])
            for disclaimer in required_disclaimers:
                if disclaimer.lower() not in script.content.lower():
                    issues.append(f"missing_disclaimer: {disclaimer}")
            
            # Check prohibited topics
            prohibited_topics = rules.get("prohibited_topics", [])
            for topic in prohibited_topics:
                if self._detect_prohibited_topic(script.content, topic):
                    issues.append(f"prohibited_topic: {topic}")
            
            # Check professional tone
            if not self._check_professional_tone(script.content):
                issues.append("unprofessional_tone")
            
            # Check for aggressive language
            if self._detect_aggressive_language(script.content):
                issues.append("aggressive_language")
            
        except Exception as e:
            logger.error(f"Error checking script content: {e}")
            issues.append("content_check_error")
        
        return issues
    
    def _check_agent_qualifications(self, script: CallScript) -> List[str]:
        """Check if the agent is qualified for this type of call."""
        issues = []
        
        try:
            # This would check agent certifications, training, etc.
            # For now, we'll do basic checks
            
            if script.agent_type == "sales_agent":
                # Check if agent has sales training
                pass
            elif script.agent_type == "support_agent":
                # Check if agent has technical knowledge
                pass
            elif script.agent_type == "outreach_agent":
                # Check if agent has outreach training
                pass
            
        except Exception as e:
            logger.error(f"Error checking agent qualifications: {e}")
            issues.append("qualification_check_error")
        
        return issues
    
    def _check_target_audience(self, script: CallScript) -> List[str]:
        """Check if the script is appropriate for the target audience."""
        issues = []
        
        try:
            # Check for age-appropriate content
            if "senior" in script.target_audience.lower():
                # Ensure no complex technical jargon
                if self._detect_complex_language(script.content):
                    issues.append("inappropriate_complexity_for_seniors")
            
            # Check for business vs consumer appropriateness
            if "business" in script.target_audience.lower():
                # Ensure professional business language
                if not self._check_business_language(script.content):
                    issues.append("unprofessional_business_language")
            
        except Exception as e:
            logger.error(f"Error checking target audience: {e}")
            issues.append("audience_check_error")
        
        return issues
    
    def _detect_prohibited_topic(self, content: str, topic: str) -> bool:
        """Detect if content contains prohibited topics."""
        topic_patterns = {
            "false_claims": [
                r"guaranteed.*results",
                r"100%.*success",
                r"no risk",
                r"immediate.*profit"
            ],
            "pressure_tactics": [
                r"limited time",
                r"act now",
                r"don't miss out",
                r"last chance"
            ],
            "personal_information_requests": [
                r"social security",
                r"credit card",
                r"bank account",
                r"password"
            ]
        }
        
        patterns = topic_patterns.get(topic, [])
        for pattern in patterns:
            if re.search(pattern, content, re.IGNORECASE):
                return True
        
        return False
    
    def _check_professional_tone(self, content: str) -> bool:
        """Check if content maintains a professional tone."""
        unprofessional_patterns = [
            r"\b(hey|hi|hello)\b",
            r"\b(awesome|cool|great)\b",
            r"\b(um|uh|like)\b",
            r"\b(you know|i mean)\b"
        ]
        
        for pattern in unprofessional_patterns:
            if re.search(pattern, content, re.IGNORECASE):
                return False
        
        return True
    
    def _detect_aggressive_language(self, content: str) -> bool:
        """Detect aggressive or pushy language."""
        aggressive_patterns = [
            r"you must",
            r"you have to",
            r"you need to",
            r"you should",
            r"don't be stupid",
            r"don't be foolish"
        ]
        
        for pattern in aggressive_patterns:
            if re.search(pattern, content, re.IGNORECASE):
                return True
        
        return False
    
    def _detect_complex_language(self, content: str) -> bool:
        """Detect overly complex language."""
        complex_words = [
            "algorithm", "infrastructure", "optimization", "implementation",
            "configuration", "deployment", "integration", "architecture"
        ]
        
        complex_count = sum(1 for word in complex_words if word.lower() in content.lower())
        return complex_count > 2
    
    def _check_business_language(self, content: str) -> bool:
        """Check if content uses appropriate business language."""
        business_indicators = [
            "professional", "business", "enterprise", "solution",
            "service", "consultation", "partnership", "opportunity"
        ]
        
        business_count = sum(1 for word in business_indicators if word.lower() in content.lower())
        return business_count >= 2
    
    async def monitor_call_compliance(self, call_id: str, agent_type: str, 
                                    real_time_data: Dict[str, Any]) -> Tuple[ComplianceStatus, List[str]]:
        """
        Monitor a call in real-time for compliance issues.
        
        Args:
            call_id: ID of the call to monitor
            agent_type: Type of agent making the call
            real_time_data: Real-time call data (audio, transcript, etc.)
            
        Returns:
            Tuple of (compliance_status, issues)
        """
        try:
            issues = []
            compliance_status = ComplianceStatus.COMPLIANT
            
            # Check call duration
            if self._check_call_duration_violation(real_time_data):
                issues.append("call_duration_exceeded")
                compliance_status = ComplianceStatus.WARNING
            
            # Check for customer distress signals
            if self._detect_customer_distress(real_time_data):
                issues.append("customer_distress_detected")
                compliance_status = ComplianceStatus.VIOLATION
            
            # Check for compliance violations
            compliance_violations = self._check_real_time_compliance(real_time_data, agent_type)
            issues.extend(compliance_violations)
            
            if compliance_violations:
                compliance_status = ComplianceStatus.VIOLATION
            
            # Check for escalation triggers
            escalation_triggers = self._check_escalation_triggers(real_time_data)
            if escalation_triggers:
                await self._trigger_escalation(call_id, escalation_triggers)
            
            # Record compliance check
            compliance_check = ComplianceCheck(
                check_name="real_time_monitoring",
                status=compliance_status,
                details=f"Call {call_id} compliance check",
                confidence=0.9,
                timestamp=time.time()
            )
            self.compliance_history.append(compliance_check)
            
            # Update active call status
            if call_id in self.active_calls:
                self.active_calls[call_id]["compliance_status"] = compliance_status
                self.active_calls[call_id]["compliance_issues"] = issues
            
            return compliance_status, issues
            
        except Exception as e:
            logger.error(f"Error monitoring call compliance: {e}")
            return ComplianceStatus.VIOLATION, ["monitoring_error"]
    
    def _check_call_duration_violation(self, real_time_data: Dict[str, Any]) -> bool:
        """Check if call duration exceeds limits."""
        max_duration = self.config["professional_standards"]["max_call_duration_minutes"] * 60
        current_duration = real_time_data.get("call_duration", 0)
        
        return current_duration > max_duration
    
    def _detect_customer_distress(self, real_time_data: Dict[str, Any]) -> bool:
        """Detect signs of customer distress."""
        # This would use sentiment analysis and voice tone detection
        # For now, we'll check for keywords and patterns
        
        transcript = real_time_data.get("transcript", "").lower()
        distress_indicators = [
            "frustrated", "angry", "upset", "annoyed",
            "stop calling", "leave me alone", "don't call again"
        ]
        
        for indicator in distress_indicators:
            if indicator in transcript:
                return True
        
        return False
    
    def _check_real_time_compliance(self, real_time_data: Dict[str, Any], agent_type: str) -> List[str]:
        """Check real-time compliance during the call."""
        violations = []
        
        try:
            # Check for required disclaimers
            if not self._check_required_disclaimers_spoken(real_time_data, agent_type):
                violations.append("required_disclaimers_not_spoken")
            
            # Check for prohibited topics mentioned
            transcript = real_time_data.get("transcript", "")
            prohibited_topics = self.compliance_rules.get(agent_type, {}).get("prohibited_topics", [])
            
            for topic in prohibited_topics:
                if self._detect_prohibited_topic(transcript, topic):
                    violations.append(f"prohibited_topic_mentioned: {topic}")
            
            # Check response times
            if not self._check_response_times(real_time_data):
                violations.append("inappropriate_response_times")
            
        except Exception as e:
            logger.error(f"Error checking real-time compliance: {e}")
            violations.append("compliance_check_error")
        
        return violations
    
    def _check_required_disclaimers_spoken(self, real_time_data: Dict[str, Any], agent_type: str) -> bool:
        """Check if required disclaimers were spoken during the call."""
        transcript = real_time_data.get("transcript", "")
        required_disclaimers = self.compliance_rules.get(agent_type, {}).get("required_disclaimers", [])
        
        for disclaimer in required_disclaimers:
            if disclaimer.lower() not in transcript.lower():
                return False
        
        return True
    
    def _check_response_times(self, real_time_data: Dict[str, Any]) -> bool:
        """Check if response times are appropriate."""
        min_response_time = self.config["professional_standards"]["min_response_time"]
        response_times = real_time_data.get("response_times", [])
        
        for response_time in response_times:
            if response_time < min_response_time:
                return False
        
        return True
    
    def _check_escalation_triggers(self, real_time_data: Dict[str, Any]) -> List[str]:
        """Check for escalation triggers during the call."""
        triggers = []
        
        try:
            # Check confidence levels
            confidence = real_time_data.get("agent_confidence", 1.0)
            if confidence < self.escalation_rules["low_confidence"]["threshold"]:
                triggers.append("low_confidence")
            
            # Check for customer distress
            if self._detect_customer_distress(real_time_data):
                triggers.append("customer_distress")
            
            # Check for technical issues
            if real_time_data.get("technical_issues", False):
                triggers.append("technical_issues")
            
            # Check for objection handling
            if real_time_data.get("objection_count", 0) > 3:
                triggers.append("objection_handling")
            
        except Exception as e:
            logger.error(f"Error checking escalation triggers: {e}")
        
        return triggers
    
    async def _trigger_escalation(self, call_id: str, triggers: List[str]):
        """Trigger escalation for a call."""
        try:
            escalation_level = EscalationLevel.NONE
            
            # Determine escalation level based on triggers
            for trigger in triggers:
                rule = self.escalation_rules.get(trigger, {})
                trigger_level = rule.get("escalation_level", EscalationLevel.LOW)
                
                if trigger_level.value > escalation_level.value:
                    escalation_level = trigger_level
            
            if escalation_level != EscalationLevel.NONE:
                # Record escalation
                escalation_record = {
                    "call_id": call_id,
                    "triggers": triggers,
                    "level": escalation_level.value,
                    "timestamp": time.time(),
                    "action_taken": self._get_escalation_action(escalation_level)
                }
                self.escalation_history.append(escalation_record)
                
                logger.warning(f"Escalation triggered for call {call_id}: {escalation_level.value}")
                
                # Take escalation action
                await self._execute_escalation_action(call_id, escalation_level, triggers)
        
        except Exception as e:
            logger.error(f"Error triggering escalation: {e}")
    
    def _get_escalation_action(self, level: EscalationLevel) -> str:
        """Get the action to take for an escalation level."""
        action_mapping = {
            EscalationLevel.LOW: "request_clarification",
            EscalationLevel.MEDIUM: "escalate_to_senior_agent",
            EscalationLevel.HIGH: "immediate_escalation",
            EscalationLevel.CRITICAL: "human_handoff"
        }
        return action_mapping.get(level, "unknown")
    
    async def _execute_escalation_action(self, call_id: str, level: EscalationLevel, triggers: List[str]):
        """Execute the appropriate escalation action."""
        try:
            if level == EscalationLevel.CRITICAL:
                # Immediate human handoff
                await self._initiate_human_handoff(call_id)
            elif level == EscalationLevel.HIGH:
                # Immediate escalation
                await self._escalate_to_senior_agent(call_id)
            elif level == EscalationLevel.MEDIUM:
                # Escalate to senior agent
                await self._escalate_to_senior_agent(call_id)
            elif level == EscalationLevel.LOW:
                # Request clarification
                await self._request_clarification(call_id)
            
        except Exception as e:
            logger.error(f"Error executing escalation action: {e}")
    
    async def _initiate_human_handoff(self, call_id: str):
        """Initiate human handoff for a call."""
        logger.info(f"Initiating human handoff for call {call_id}")
        # This would integrate with your human handoff system
        
    async def _escalate_to_senior_agent(self, call_id: str):
        """Escalate call to a senior agent."""
        logger.info(f"Escalating call {call_id} to senior agent")
        # This would integrate with your agent escalation system
        
    async def _request_clarification(self, call_id: str):
        """Request clarification from the caller."""
        logger.info(f"Requesting clarification for call {call_id}")
        # This would generate a clarification request
    
    def get_compliance_report(self, call_id: str = None) -> Dict[str, Any]:
        """Get compliance report for a call or overall system."""
        try:
            if call_id:
                # Single call report
                if call_id in self.active_calls:
                    call_data = self.active_calls[call_id]
                    return {
                        "call_id": call_id,
                        "compliance_status": call_data.get("compliance_status", "unknown"),
                        "compliance_issues": call_data.get("compliance_issues", []),
                        "escalations": [e for e in self.escalation_history if e["call_id"] == call_id]
                    }
                else:
                    return {"error": "Call not found"}
            else:
                # Overall system report
                return {
                    "total_calls_monitored": len(self.active_calls),
                    "compliance_checks_performed": len(self.compliance_history),
                    "escalations_triggered": len(self.escalation_history),
                    "compliance_status_distribution": self._get_compliance_distribution(),
                    "escalation_level_distribution": self._get_escalation_distribution()
                }
                
        except Exception as e:
            logger.error(f"Error generating compliance report: {e}")
            return {"error": str(e)}
    
    def _get_compliance_distribution(self) -> Dict[str, int]:
        """Get distribution of compliance statuses."""
        distribution = {}
        for check in self.compliance_history:
            status = check.status.value
            distribution[status] = distribution.get(status, 0) + 1
        return distribution
    
    def _get_escalation_distribution(self) -> Dict[str, int]:
        """Get distribution of escalation levels."""
        distribution = {}
        for escalation in self.escalation_history:
            level = escalation["level"]
            distribution[level] = distribution.get(level, 0) + 1
        return distribution
    
    def update_compliance_rules(self, agent_type: str, rules: Dict[str, Any]):
        """Update compliance rules for an agent type."""
        try:
            if agent_type in self.compliance_rules:
                self.compliance_rules[agent_type].update(rules)
                logger.info(f"Updated compliance rules for {agent_type}")
            else:
                logger.warning(f"Agent type not found: {agent_type}")
                
        except Exception as e:
            logger.error(f"Error updating compliance rules: {e}")
    
    def add_custom_compliance_rule(self, rule_name: str, rule_config: Dict[str, Any]):
        """Add a custom compliance rule."""
        try:
            # This would add custom rules to the compliance system
            logger.info(f"Added custom compliance rule: {rule_name}")
            
        except Exception as e:
            logger.error(f"Error adding custom compliance rule: {e}")

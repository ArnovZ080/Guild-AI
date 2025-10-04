"""
Intelligent Resolution System for Guild-AI
Provides autonomous issue resolution, self-healing customer service, and intelligent escalation management.
"""

import asyncio
import json
import logging
from typing import Dict, List, Any, Optional, Union
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
import uuid

class IssueType(Enum):
    """Types of customer issues"""
    TECHNICAL = "technical"
    BILLING = "billing"
    ACCOUNT = "account"
    FEATURE = "feature"
    INTEGRATION = "integration"
    PERFORMANCE = "performance"
    SECURITY = "security"
    TRAINING = "training"
    CUSTOMIZATION = "customization"
    GENERAL = "general"

class ResolutionMethod(Enum):
    """Methods of issue resolution"""
    AUTOMATED_FIX = "automated_fix"
    KNOWLEDGE_BASE = "knowledge_base"
    AGENT_ASSISTED = "agent_assisted"
    ESCALATION = "escalation"
    WORKAROUND = "workaround"
    FEATURE_REQUEST = "feature_request"
    TRAINING = "training"

class IssueSeverity(Enum):
    """Issue severity levels"""
    CRITICAL = "critical"    # System down, data loss, security breach
    HIGH = "high"           # Major functionality broken
    MEDIUM = "medium"       # Minor functionality affected
    LOW = "low"            # Cosmetic or minor inconvenience

class ResolutionStatus(Enum):
    """Resolution status"""
    IDENTIFIED = "identified"
    ANALYZING = "analyzing"
    RESOLVING = "resolving"
    RESOLVED = "resolved"
    ESCALATED = "escalated"
    FAILED = "failed"
    CANCELLED = "cancelled"

@dataclass
class CustomerIssue:
    """Customer issue for resolution"""
    issue_id: str
    customer_id: str
    issue_type: IssueType
    severity: IssueSeverity
    title: str
    description: str
    status: ResolutionStatus
    created_at: datetime
    detected_by: str  # "customer", "system", "agent"
    priority_score: float  # 0-100
    resolution_method: Optional[ResolutionMethod]
    resolution_steps: List[Dict[str, Any]]
    resolution_time: Optional[int]  # minutes
    resolved_at: Optional[datetime]
    escalation_reason: Optional[str]
    customer_satisfaction: Optional[int]  # 1-5
    resolution_effectiveness: Optional[float]  # 0-1

@dataclass
class ResolutionRule:
    """Rule for automated issue resolution"""
    rule_id: str
    condition: str
    issue_type: IssueType
    resolution_method: ResolutionMethod
    resolution_script: str
    success_rate: float
    average_resolution_time: int  # minutes
    escalation_threshold: float  # 0-1

class IntelligentResolutionSystem:
    """
    Autonomous issue resolution and self-healing customer service system.
    """
    
    def __init__(self):
        self.active_issues: Dict[str, CustomerIssue] = {}
        self.resolution_history: List[CustomerIssue] = []
        self.resolution_rules: List[ResolutionRule] = []
        self.knowledge_base: Dict[str, Any] = {}
        self.escalation_matrix: Dict[str, Any] = {}
        
        # Initialize resolution rules
        self._initialize_resolution_rules()
        
        # Initialize knowledge base
        self._initialize_knowledge_base()
        
        # Initialize escalation matrix
        self._initialize_escalation_matrix()
    
    def _initialize_resolution_rules(self):
        """Initialize automated resolution rules"""
        self.resolution_rules = [
            ResolutionRule(
                rule_id="billing_payment_failed",
                condition="issue_type == 'billing' AND description contains 'payment failed'",
                issue_type=IssueType.BILLING,
                resolution_method=ResolutionMethod.AUTOMATED_FIX,
                resolution_script="""
                1. Check payment method status
                2. Retry payment with backup method
                3. Send payment confirmation email
                4. Update customer account status
                """,
                success_rate=0.85,
                average_resolution_time=5,
                escalation_threshold=0.3
            ),
            ResolutionRule(
                rule_id="password_reset",
                condition="issue_type == 'account' AND description contains 'password'",
                issue_type=IssueType.ACCOUNT,
                resolution_method=ResolutionMethod.AUTOMATED_FIX,
                resolution_script="""
                1. Verify customer identity
                2. Generate password reset link
                3. Send reset email
                4. Log security event
                """,
                success_rate=0.95,
                average_resolution_time=2,
                escalation_threshold=0.2
            ),
            ResolutionRule(
                rule_id="feature_access",
                condition="issue_type == 'feature' AND description contains 'access denied'",
                issue_type=IssueType.FEATURE,
                resolution_method=ResolutionMethod.KNOWLEDGE_BASE,
                resolution_script="""
                1. Check user permissions
                2. Provide access instructions
                3. Offer feature training
                4. Schedule follow-up call
                """,
                success_rate=0.75,
                average_resolution_time=15,
                escalation_threshold=0.4
            ),
            ResolutionRule(
                rule_id="integration_setup",
                condition="issue_type == 'integration' AND description contains 'setup'",
                issue_type=IssueType.INTEGRATION,
                resolution_method=ResolutionMethod.AGENT_ASSISTED,
                resolution_script="""
                1. Analyze integration requirements
                2. Provide setup documentation
                3. Schedule setup call
                4. Monitor integration health
                """,
                success_rate=0.70,
                average_resolution_time=60,
                escalation_threshold=0.5
            ),
            ResolutionRule(
                rule_id="performance_slow",
                condition="issue_type == 'performance' AND description contains 'slow'",
                issue_type=IssueType.PERFORMANCE,
                resolution_method=ResolutionMethod.AUTOMATED_FIX,
                resolution_script="""
                1. Analyze system performance
                2. Optimize database queries
                3. Clear cache if needed
                4. Provide performance tips
                """,
                success_rate=0.80,
                average_resolution_time=10,
                escalation_threshold=0.3
            ),
            ResolutionRule(
                rule_id="training_request",
                condition="issue_type == 'training' AND description contains 'how to'",
                issue_type=IssueType.TRAINING,
                resolution_method=ResolutionMethod.TRAINING,
                resolution_script="""
                1. Identify training needs
                2. Provide relevant tutorials
                3. Schedule training session
                4. Create custom learning path
                """,
                success_rate=0.90,
                average_resolution_time=30,
                escalation_threshold=0.2
            )
        ]
    
    def _initialize_knowledge_base(self):
        """Initialize knowledge base for issue resolution"""
        self.knowledge_base = {
            "common_solutions": {
                "login_issues": [
                    "Clear browser cache and cookies",
                    "Try incognito/private browsing mode",
                    "Check if Caps Lock is enabled",
                    "Reset password using forgot password link"
                ],
                "payment_problems": [
                    "Verify payment method is valid and has sufficient funds",
                    "Check billing address matches payment method",
                    "Try alternative payment method",
                    "Contact bank to ensure no blocks on account"
                ],
                "feature_access": [
                    "Check user permissions and role assignments",
                    "Verify subscription tier includes feature",
                    "Clear browser cache and refresh page",
                    "Log out and log back in"
                ],
                "integration_issues": [
                    "Verify API credentials are correct",
                    "Check API rate limits and quotas",
                    "Ensure webhook URLs are accessible",
                    "Review integration documentation"
                ]
            },
            "escalation_triggers": {
                "customer_tier": {
                    "enterprise": "immediate_escalation",
                    "premium": "priority_escalation",
                    "standard": "normal_escalation"
                },
                "issue_frequency": {
                    "high": "escalate_to_engineering",
                    "medium": "escalate_to_senior_support",
                    "low": "standard_resolution"
                }
            }
        }
    
    def _initialize_escalation_matrix(self):
        """Initialize escalation matrix for issue routing"""
        self.escalation_matrix = {
            IssueSeverity.CRITICAL: {
                "escalation_time": 0,  # Immediate
                "assigned_team": "engineering_team",
                "notification_channels": ["slack_critical", "email_executives", "phone_call"],
                "sla_minutes": 30
            },
            IssueSeverity.HIGH: {
                "escalation_time": 30,  # 30 minutes
                "assigned_team": "senior_support",
                "notification_channels": ["slack_urgent", "email_managers"],
                "sla_minutes": 120
            },
            IssueSeverity.MEDIUM: {
                "escalation_time": 240,  # 4 hours
                "assigned_team": "support_team",
                "notification_channels": ["email_support"],
                "sla_minutes": 480
            },
            IssueSeverity.LOW: {
                "escalation_time": 1440,  # 24 hours
                "assigned_team": "support_team",
                "notification_channels": ["email_support"],
                "sla_minutes": 1440
            }
        }
    
    async def detect_and_analyze_issue(self, customer_id: str, issue_data: Dict[str, Any]) -> CustomerIssue:
        """Detect and analyze customer issue for resolution"""
        try:
            # Analyze issue to determine type and severity
            issue_type = await self._classify_issue_type(issue_data)
            severity = await self._determine_issue_severity(issue_data, customer_id)
            priority_score = await self._calculate_priority_score(issue_data, customer_id, severity)
            
            # Create issue record
            issue = CustomerIssue(
                issue_id=str(uuid.uuid4()),
                customer_id=customer_id,
                issue_type=issue_type,
                severity=severity,
                title=issue_data.get("title", "Customer Issue"),
                description=issue_data.get("description", ""),
                status=ResolutionStatus.IDENTIFIED,
                created_at=datetime.now(),
                detected_by=issue_data.get("detected_by", "system"),
                priority_score=priority_score,
                resolution_method=None,
                resolution_steps=[],
                resolution_time=None,
                resolved_at=None,
                escalation_reason=None,
                customer_satisfaction=None,
                resolution_effectiveness=None
            )
            
            # Store issue
            self.active_issues[issue.issue_id] = issue
            
            # Start resolution process
            await self._initiate_resolution(issue)
            
            return issue
            
        except Exception as e:
            logging.error(f"Failed to detect and analyze issue: {e}")
            raise
    
    async def _classify_issue_type(self, issue_data: Dict[str, Any]) -> IssueType:
        """Classify issue type based on content analysis"""
        try:
            description = issue_data.get("description", "").lower()
            title = issue_data.get("title", "").lower()
            combined_text = f"{title} {description}"
            
            # Keyword-based classification
            if any(keyword in combined_text for keyword in ["payment", "billing", "invoice", "charge", "refund"]):
                return IssueType.BILLING
            elif any(keyword in combined_text for keyword in ["password", "login", "account", "access"]):
                return IssueType.ACCOUNT
            elif any(keyword in combined_text for keyword in ["feature", "function", "tool", "option"]):
                return IssueType.FEATURE
            elif any(keyword in combined_text for keyword in ["integration", "api", "webhook", "connect"]):
                return IssueType.INTEGRATION
            elif any(keyword in combined_text for keyword in ["slow", "performance", "speed", "timeout"]):
                return IssueType.PERFORMANCE
            elif any(keyword in combined_text for keyword in ["security", "breach", "unauthorized", "hack"]):
                return IssueType.SECURITY
            elif any(keyword in combined_text for keyword in ["training", "tutorial", "how to", "learn"]):
                return IssueType.TRAINING
            elif any(keyword in combined_text for keyword in ["customize", "configure", "setup", "settings"]):
                return IssueType.CUSTOMIZATION
            else:
                return IssueType.GENERAL
                
        except Exception as e:
            logging.error(f"Failed to classify issue type: {e}")
            return IssueType.GENERAL
    
    async def _determine_issue_severity(self, issue_data: Dict[str, Any], customer_id: str) -> IssueSeverity:
        """Determine issue severity based on impact and customer profile"""
        try:
            description = issue_data.get("description", "").lower()
            title = issue_data.get("title", "").lower()
            combined_text = f"{title} {description}"
            
            # Check for critical keywords
            critical_keywords = ["down", "broken", "not working", "error", "crash", "data loss", "security breach"]
            high_keywords = ["issue", "problem", "bug", "incorrect", "wrong", "failed"]
            medium_keywords = ["question", "help", "confused", "unclear"]
            
            # Get customer tier for severity adjustment
            customer_tier = await self._get_customer_tier(customer_id)
            
            if any(keyword in combined_text for keyword in critical_keywords):
                base_severity = IssueSeverity.CRITICAL
            elif any(keyword in combined_text for keyword in high_keywords):
                base_severity = IssueSeverity.HIGH
            elif any(keyword in combined_text for keyword in medium_keywords):
                base_severity = IssueSeverity.MEDIUM
            else:
                base_severity = IssueSeverity.LOW
            
            # Adjust severity based on customer tier
            if customer_tier == "enterprise" and base_severity == IssueSeverity.HIGH:
                base_severity = IssueSeverity.CRITICAL
            elif customer_tier == "premium" and base_severity == IssueSeverity.MEDIUM:
                base_severity = IssueSeverity.HIGH
            
            return base_severity
            
        except Exception as e:
            logging.error(f"Failed to determine issue severity: {e}")
            return IssueSeverity.MEDIUM
    
    async def _get_customer_tier(self, customer_id: str) -> str:
        """Get customer tier for severity adjustment"""
        try:
            # In real implementation, this would query customer data
            # For now, return a default tier
            return "standard"
        except Exception as e:
            logging.error(f"Failed to get customer tier: {e}")
            return "standard"
    
    async def _calculate_priority_score(self, issue_data: Dict[str, Any], customer_id: str, severity: IssueSeverity) -> float:
        """Calculate priority score for issue resolution"""
        try:
            base_score = {
                IssueSeverity.CRITICAL: 90,
                IssueSeverity.HIGH: 70,
                IssueSeverity.MEDIUM: 50,
                IssueSeverity.LOW: 30
            }.get(severity, 50)
            
            # Adjust based on customer tier
            customer_tier = await self._get_customer_tier(customer_id)
            tier_adjustment = {
                "enterprise": 20,
                "premium": 10,
                "standard": 0
            }.get(customer_tier, 0)
            
            # Adjust based on issue frequency
            issue_frequency = await self._get_issue_frequency(issue_data.get("title", ""))
            frequency_adjustment = {
                "high": 15,
                "medium": 5,
                "low": 0
            }.get(issue_frequency, 0)
            
            final_score = base_score + tier_adjustment + frequency_adjustment
            return min(100.0, max(0.0, final_score))
            
        except Exception as e:
            logging.error(f"Failed to calculate priority score: {e}")
            return 50.0
    
    async def _get_issue_frequency(self, issue_title: str) -> str:
        """Get issue frequency for priority calculation"""
        try:
            # In real implementation, this would analyze historical issue data
            # For now, return a default frequency
            return "medium"
        except Exception as e:
            logging.error(f"Failed to get issue frequency: {e}")
            return "medium"
    
    async def _initiate_resolution(self, issue: CustomerIssue):
        """Initiate resolution process for an issue"""
        try:
            issue.status = ResolutionStatus.ANALYZING
            
            # Find applicable resolution rule
            resolution_rule = await self._find_applicable_rule(issue)
            
            if resolution_rule:
                # Attempt automated resolution
                issue.resolution_method = resolution_rule.resolution_method
                await self._execute_resolution_rule(issue, resolution_rule)
            else:
                # Escalate to human agent
                await self._escalate_issue(issue, "No automated resolution rule found")
                
        except Exception as e:
            logging.error(f"Failed to initiate resolution for issue {issue.issue_id}: {e}")
            await self._escalate_issue(issue, f"Resolution initiation failed: {str(e)}")
    
    async def _find_applicable_rule(self, issue: CustomerIssue) -> Optional[ResolutionRule]:
        """Find applicable resolution rule for the issue"""
        try:
            for rule in self.resolution_rules:
                if rule.issue_type == issue.issue_type:
                    # Check if rule conditions match
                    if await self._evaluate_rule_condition(rule.condition, issue):
                        return rule
            
            return None
            
        except Exception as e:
            logging.error(f"Failed to find applicable rule: {e}")
            return None
    
    async def _evaluate_rule_condition(self, condition: str, issue: CustomerIssue) -> bool:
        """Evaluate rule condition against issue"""
        try:
            # Simple condition evaluation (in real implementation, use proper expression evaluator)
            description = issue.description.lower()
            
            if "payment failed" in condition.lower():
                return "payment" in description and "failed" in description
            elif "password" in condition.lower():
                return "password" in description or "login" in description
            elif "access denied" in condition.lower():
                return "access" in description and ("denied" in description or "permission" in description)
            elif "setup" in condition.lower():
                return "setup" in description or "configure" in description
            elif "slow" in condition.lower():
                return "slow" in description or "performance" in description
            elif "how to" in condition.lower():
                return "how to" in description or "tutorial" in description
            
            return False
            
        except Exception as e:
            logging.error(f"Failed to evaluate rule condition: {e}")
            return False
    
    async def _execute_resolution_rule(self, issue: CustomerIssue, rule: ResolutionRule):
        """Execute resolution rule for the issue"""
        try:
            issue.status = ResolutionStatus.RESOLVING
            start_time = datetime.now()
            
            # Create resolution steps
            resolution_steps = rule.resolution_script.strip().split('\n')
            issue.resolution_steps = [
                {
                    "step_id": f"step_{i}",
                    "step_description": step.strip(),
                    "status": "pending",
                    "started_at": None,
                    "completed_at": None,
                    "result": None
                }
                for i, step in enumerate(resolution_steps) if step.strip()
            ]
            
            # Execute each step
            success_count = 0
            for step in issue.resolution_steps:
                step["started_at"] = datetime.now()
                
                # Simulate step execution
                success = await self._execute_resolution_step(step, issue)
                step["completed_at"] = datetime.now()
                step["status"] = "completed" if success else "failed"
                
                if success:
                    success_count += 1
                else:
                    break  # Stop on first failure
            
            # Calculate resolution effectiveness
            effectiveness = success_count / len(issue.resolution_steps)
            
            if effectiveness >= rule.escalation_threshold:
                # Resolution successful
                issue.status = ResolutionStatus.RESOLVED
                issue.resolved_at = datetime.now()
                issue.resolution_time = int((issue.resolved_at - start_time).total_seconds() / 60)
                issue.resolution_effectiveness = effectiveness
                
                # Move to history
                self.resolution_history.append(issue)
                del self.active_issues[issue.issue_id]
                
                logging.info(f"Successfully resolved issue {issue.issue_id} with effectiveness {effectiveness}")
            else:
                # Resolution failed, escalate
                await self._escalate_issue(issue, f"Automated resolution failed with effectiveness {effectiveness}")
                
        except Exception as e:
            logging.error(f"Failed to execute resolution rule: {e}")
            await self._escalate_issue(issue, f"Resolution execution failed: {str(e)}")
    
    async def _execute_resolution_step(self, step: Dict[str, Any], issue: CustomerIssue) -> bool:
        """Execute a single resolution step"""
        try:
            # Simulate step execution (in real implementation, this would call appropriate services)
            await asyncio.sleep(0.1)  # Simulate execution time
            
            # Simulate success/failure based on rule success rate
            rule = await self._find_applicable_rule(issue)
            success_rate = rule.success_rate if rule else 0.7
            
            # Add some randomness to simulate real-world scenarios
            import random
            success = random.random() < success_rate
            
            step["result"] = f"Step executed successfully" if success else f"Step execution failed"
            
            return success
            
        except Exception as e:
            logging.error(f"Failed to execute resolution step: {e}")
            step["result"] = f"Step execution error: {str(e)}"
            return False
    
    async def _escalate_issue(self, issue: CustomerIssue, reason: str):
        """Escalate issue to human agents"""
        try:
            issue.status = ResolutionStatus.ESCALATED
            issue.escalation_reason = reason
            
            # Get escalation configuration
            escalation_config = self.escalation_matrix.get(issue.severity, {})
            
            # Create escalation notification
            escalation_notification = {
                "issue_id": issue.issue_id,
                "customer_id": issue.customer_id,
                "severity": issue.severity.value,
                "priority_score": issue.priority_score,
                "escalation_reason": reason,
                "assigned_team": escalation_config.get("assigned_team", "support_team"),
                "sla_minutes": escalation_config.get("sla_minutes", 480),
                "escalated_at": datetime.now().isoformat()
            }
            
            # Send notifications (in real implementation, this would integrate with notification systems)
            await self._send_escalation_notifications(escalation_notification, escalation_config.get("notification_channels", []))
            
            logging.info(f"Issue {issue.issue_id} escalated to {escalation_config.get('assigned_team')} - Reason: {reason}")
            
        except Exception as e:
            logging.error(f"Failed to escalate issue {issue.issue_id}: {e}")
    
    async def _send_escalation_notifications(self, notification: Dict[str, Any], channels: List[str]):
        """Send escalation notifications through various channels"""
        try:
            for channel in channels:
                if channel == "slack_critical":
                    # Send to critical issues Slack channel
                    logging.info(f"Sending critical escalation to Slack: {notification}")
                elif channel == "slack_urgent":
                    # Send to urgent issues Slack channel
                    logging.info(f"Sending urgent escalation to Slack: {notification}")
                elif channel == "email_executives":
                    # Send email to executives
                    logging.info(f"Sending escalation email to executives: {notification}")
                elif channel == "email_managers":
                    # Send email to managers
                    logging.info(f"Sending escalation email to managers: {notification}")
                elif channel == "email_support":
                    # Send email to support team
                    logging.info(f"Sending escalation email to support: {notification}")
                elif channel == "phone_call":
                    # Make phone call to on-call engineer
                    logging.info(f"Making phone call for critical escalation: {notification}")
            
        except Exception as e:
            logging.error(f"Failed to send escalation notifications: {e}")
    
    async def get_resolution_analytics(self) -> Dict[str, Any]:
        """Get resolution system analytics"""
        try:
            total_issues = len(self.resolution_history)
            resolved_issues = len([i for i in self.resolution_history if i.status == ResolutionStatus.RESOLVED])
            escalated_issues = len([i for i in self.resolution_history if i.status == ResolutionStatus.ESCALATED])
            
            # Calculate resolution rates by method
            resolution_methods = {}
            for method in ResolutionMethod:
                method_issues = [i for i in self.resolution_history if i.resolution_method == method]
                if method_issues:
                    resolved_count = len([i for i in method_issues if i.status == ResolutionStatus.RESOLVED])
                    resolution_methods[method.value] = {
                        "total_issues": len(method_issues),
                        "resolved_issues": resolved_count,
                        "success_rate": resolved_count / len(method_issues),
                        "average_resolution_time": sum(i.resolution_time for i in method_issues if i.resolution_time) / len(method_issues)
                    }
            
            # Calculate average effectiveness
            effectiveness_scores = [i.resolution_effectiveness for i in self.resolution_history if i.resolution_effectiveness]
            avg_effectiveness = sum(effectiveness_scores) / len(effectiveness_scores) if effectiveness_scores else 0
            
            return {
                "total_issues": total_issues,
                "resolved_issues": resolved_issues,
                "escalated_issues": escalated_issues,
                "resolution_rate": resolved_issues / total_issues if total_issues > 0 else 0,
                "escalation_rate": escalated_issues / total_issues if total_issues > 0 else 0,
                "resolution_methods": resolution_methods,
                "average_effectiveness": avg_effectiveness,
                "active_issues": len(self.active_issues),
                "last_updated": datetime.now().isoformat()
            }
            
        except Exception as e:
            logging.error(f"Failed to get resolution analytics: {e}")
            return {}

# Global intelligent resolution system instance
intelligent_resolution_system = IntelligentResolutionSystem()

# Convenience functions
async def detect_and_resolve_issue(customer_id: str, issue_data: Dict[str, Any]) -> CustomerIssue:
    """Detect and resolve customer issue"""
    return await intelligent_resolution_system.detect_and_analyze_issue(customer_id, issue_data)

async def get_active_issues(customer_id: Optional[str] = None) -> List[CustomerIssue]:
    """Get active customer issues"""
    if customer_id:
        return [issue for issue in intelligent_resolution_system.active_issues.values() if issue.customer_id == customer_id]
    else:
        return list(intelligent_resolution_system.active_issues.values())

def get_resolution_analytics() -> Dict[str, Any]:
    """Get resolution system analytics"""
    return intelligent_resolution_system.get_resolution_analytics()

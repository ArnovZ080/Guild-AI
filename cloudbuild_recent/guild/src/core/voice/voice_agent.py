"""
Voice Agent for Guild AI

This module provides a complete voice calling solution that integrates:
- Text-to-Speech (TTS) for natural voice generation
- Telephony infrastructure for making/receiving calls
- Voice guardrails for safety and compliance
- Real-time call monitoring and escalation
"""

import logging
import asyncio
import time
from typing import Dict, Any, List, Optional, Tuple, Union
from pathlib import Path

from .tts_engine import TTSEngine
from .telephony_manager import TelephonyManager, CallInfo, CallStatus, CallDirection
from .voice_guardrails import VoiceGuardrails, CallScript, ComplianceStatus
from .emotion_detector import EmotionDetector, EmotionResult, EmotionContext

logger = logging.getLogger(__name__)

class VoiceAgent:
    """
    Complete voice calling solution for Guild AI agents.
    
    Features:
    - Make outbound calls with professional scripts
    - Handle inbound calls with intelligent responses
    - Real-time compliance monitoring
    - Automatic escalation and human handoff
    - Call recording and transcription
    - Professional voice profiles for different agent types
    """
    
    def __init__(self, config: Dict[str, Any] = None):
        """Initialize the Voice Agent with all components."""
        self.config = config or self._get_default_config()
        
        # Initialize core components
        self.tts_engine = TTSEngine(self.config.get("tts", {}))
        self.telephony_manager = TelephonyManager(self.config.get("telephony", {}))
        self.guardrails = VoiceGuardrails(self.config.get("guardrails", {}))
        self.emotion_detector = EmotionDetector(self.config.get("emotion_detection", {}))
        
        # Agent state
        self.agent_id = None
        self.agent_type = None
        self.voice_profile = None
        self.active_calls: Dict[str, Dict[str, Any]] = {}
        self.call_history: List[Dict[str, Any]] = []
        
        # Performance tracking
        self.total_calls_made = 0
        self.successful_calls = 0
        self.escalations_triggered = 0
        
        logger.info("Voice Agent initialized successfully")
    
    def _get_default_config(self) -> Dict[str, Any]:
        """Get default Voice Agent configuration."""
        return {
            "tts": {
                "primary_model": "kokoro",
                "voice_profiles": {
                    "sales_agent": "sales_agent",
                    "support_agent": "support_agent",
                    "outreach_agent": "outreach_agent"
                }
            },
            "telephony": {
                "primary_provider": "twilio",
                "call_settings": {
                    "max_duration_minutes": 30,
                    "recording_enabled": True
                }
            },
            "guardrails": {
                "compliance": {
                    "enabled": True,
                    "strict_mode": False
                },
                "escalation": {
                    "auto_escalation": True,
                    "human_override_required": True
                }
            },
            "emotion_detection": {
                "enabled": True,
                "real_time": True,
                "confidence_threshold": 0.6,
                "trend_analysis": True,
                "escalation_detection": True
            }
        }
    
    def set_agent_profile(self, agent_id: str, agent_type: str, voice_profile: str = None):
        """Set the agent profile for voice calls."""
        self.agent_id = agent_id
        self.agent_type = agent_type
        self.voice_profile = voice_profile or self.config["tts"]["voice_profiles"].get(agent_type, "sales_agent")
        
        logger.info(f"Voice Agent profile set: {agent_type} ({voice_profile})")
    
    async def make_call(self, phone_number: str, call_script: str = None, 
                       metadata: Dict[str, Any] = None) -> str:
        """
        Make an outbound phone call with safety checks and monitoring.
        
        Args:
            phone_number: Phone number to call
            call_script: Optional call script (will be validated)
            metadata: Additional call metadata
            
        Returns:
            Call ID for tracking
        """
        try:
            if not self.agent_id or not self.agent_type:
                raise RuntimeError("Agent profile not set")
            
            # Validate and approve call script if provided
            if call_script:
                script = CallScript(
                    script_id=f"script_{int(time.time())}",
                    content=call_script,
                    agent_type=self.agent_type,
                    target_audience=metadata.get("target_audience", "general"),
                    compliance_checks=[],
                    escalation_triggers=[]
                )
                
                approved, reason, issues = await self.guardrails.pre_call_approval(script)
                if not approved:
                    raise RuntimeError(f"Call script not approved: {issues}")
                
                logger.info(f"Call script approved: {reason}")
            else:
                script = None
            
            # Make the call
            call_id = await self.telephony_manager.make_call(
                phone_number=phone_number,
                agent_id=self.agent_id,
                call_script=call_script,
                metadata=metadata or {}
            )
            
            # Initialize call monitoring
            self.active_calls[call_id] = {
                "start_time": time.time(),
                "phone_number": phone_number,
                "script": script,
                "metadata": metadata or {},
                "compliance_status": ComplianceStatus.COMPLIANT,
                "compliance_issues": [],
                "escalations": []
            }
            
            # Start real-time monitoring
            asyncio.create_task(self._monitor_call(call_id))
            
            self.total_calls_made += 1
            logger.info(f"Outbound call {call_id} initiated to {phone_number}")
            
            return call_id
            
        except Exception as e:
            logger.error(f"Error making call: {e}")
            raise
    
    async def _monitor_call(self, call_id: str):
        """Monitor a call in real-time for compliance and escalation."""
        try:
            while call_id in self.active_calls:
                # Get current call status
                call_info = self.telephony_manager.get_call_status(call_id)
                if not call_info or call_info.status in [CallStatus.ENDED, CallStatus.FAILED, CallStatus.NO_ANSWER]:
                    break
                
                # Prepare real-time data for monitoring
                real_time_data = self._prepare_real_time_data(call_id, call_info)
                
                # Monitor compliance
                compliance_status, issues = await self.guardrails.monitor_call_compliance(
                    call_id, self.agent_type, real_time_data
                )
                
                # Monitor emotions if enabled
                if self.config["emotion_detection"]["enabled"]:
                    emotion_context = await self.emotion_detector.get_emotion_context(call_id)
                    if emotion_context:
                        # Update call data with emotion information
                        self.active_calls[call_id]["emotion_context"] = emotion_context
                        
                        # Check for emotional escalation
                        if emotion_context.escalation_risk > 0.7:
                            await self._handle_emotional_escalation(call_id, emotion_context)
                
                # Update call status
                if call_id in self.active_calls:
                    self.active_calls[call_id]["compliance_status"] = compliance_status
                    self.active_calls[call_id]["compliance_issues"] = issues
                
                # Check if call should be escalated
                if compliance_status == ComplianceStatus.VIOLATION:
                    await self._handle_compliance_violation(call_id, issues)
                
                # Wait before next monitoring cycle
                await asyncio.sleep(5)
            
            # Call ended, finalize
            await self._finalize_call(call_id)
            
        except Exception as e:
            logger.error(f"Error monitoring call {call_id}: {e}")
            await self._finalize_call(call_id)
    
    def _prepare_real_time_data(self, call_id: str, call_info: CallInfo) -> Dict[str, Any]:
        """Prepare real-time data for compliance monitoring."""
        try:
            call_data = self.active_calls.get(call_id, {})
            
            real_time_data = {
                "call_duration": time.time() - call_data.get("start_time", time.time()),
                "call_status": call_info.status.value,
                "transcript": call_data.get("transcript", ""),
                "agent_confidence": call_data.get("agent_confidence", 1.0),
                "response_times": call_data.get("response_times", []),
                "objection_count": call_data.get("objection_count", 0),
                "technical_issues": call_data.get("technical_issues", False)
            }
            
            return real_time_data
            
        except Exception as e:
            logger.error(f"Error preparing real-time data: {e}")
            return {}
    
    async def _handle_compliance_violation(self, call_id: str, issues: List[str]):
        """Handle compliance violations during a call."""
        try:
            logger.warning(f"Compliance violation detected in call {call_id}: {issues}")
            
            # Record escalation
            if call_id in self.active_calls:
                self.active_calls[call_id]["escalations"].append({
                    "type": "compliance_violation",
                    "issues": issues,
                    "timestamp": time.time()
                })
            
            # Determine action based on violation severity
            if "customer_distress" in issues:
                # Immediate human handoff
                await self._escalate_to_human(call_id, "customer_distress")
            elif "prohibited_topic" in str(issues):
                # End call gracefully
                await self._end_call_gracefully(call_id, "prohibited_topic")
            else:
                # Continue with warning
                logger.info(f"Call {call_id} continued with compliance warning")
                
        except Exception as e:
            logger.error(f"Error handling compliance violation: {e}")
    
    async def _handle_emotional_escalation(self, call_id: str, emotion_context: EmotionContext):
        """Handle emotional escalation during a call."""
        try:
            logger.warning(f"Emotional escalation detected in call {call_id}: {emotion_context.current_emotion.primary_emotion.value}")
            
            # Record emotional escalation
            if call_id in self.active_calls:
                self.active_calls[call_id]["escalations"].append({
                    "type": "emotional_escalation",
                    "emotion": emotion_context.current_emotion.primary_emotion.value,
                    "escalation_risk": emotion_context.escalation_risk,
                    "recommended_tone": emotion_context.recommended_tone,
                    "timestamp": time.time()
                })
            
            # Determine action based on emotion and risk
            if emotion_context.escalation_risk > 0.9:
                # Critical emotional state - immediate human handoff
                await self._escalate_to_human(call_id, f"critical_emotional_state_{emotion_context.current_emotion.primary_emotion.value}")
            elif emotion_context.escalation_risk > 0.7:
                # High emotional state - use de-escalation techniques
                await self._apply_emotional_de_escalation(call_id, emotion_context)
            else:
                # Moderate emotional state - continue with emotional awareness
                logger.info(f"Call {call_id} continuing with emotional awareness: {emotion_context.recommended_tone}")
                
        except Exception as e:
            logger.error(f"Error handling emotional escalation: {e}")
    
    async def _apply_emotional_de_escalation(self, call_id: str, emotion_context: EmotionContext):
        """Apply emotional de-escalation techniques."""
        try:
            logger.info(f"Applying emotional de-escalation for call {call_id}")
            
            # Generate de-escalation message based on emotion
            de_escalation_message = self._generate_emotional_response(
                emotion_context.current_emotion.primary_emotion.value,
                emotion_context.recommended_tone,
                emotion_context.response_strategy
            )
            
            # Generate speech with appropriate emotional tone
            audio_data = await self.tts_engine.generate_speech(
                de_escalation_message,
                voice_profile=self.voice_profile,
                emotional_context={
                    "emotion": emotion_context.current_emotion.primary_emotion.value,
                    "intensity": emotion_context.current_emotion.intensity.value,
                    "trend": emotion_context.trend,
                    "escalation_risk": emotion_context.escalation_risk
                }
            )
            
            # Stream de-escalation audio (in real implementation)
            logger.info(f"Emotional de-escalation applied to call {call_id}")
            
        except Exception as e:
            logger.error(f"Error applying emotional de-escalation: {e}")
    
    def _generate_emotional_response(self, emotion: str, recommended_tone: str, strategy: str) -> str:
        """Generate emotionally appropriate response text."""
        try:
            if emotion in ["angry", "frustrated", "impatient"]:
                if strategy == "immediate_de_escalation":
                    return "I can hear that you're very frustrated, and I want to help resolve this for you right away. Let me take care of this immediately."
                elif strategy == "acknowledge_concerns":
                    return "I completely understand your frustration, and I apologize for the inconvenience. Let me address this concern right now."
                else:
                    return "I appreciate you bringing this to my attention. Let me help you get this resolved quickly."
            
            elif emotion in ["sad", "fearful"]:
                if strategy == "empathetic_support":
                    return "I can sense that this has been difficult for you, and I want you to know that I'm here to help. Let's work through this together."
                else:
                    return "I understand this situation has been challenging. Let me help you find a solution that works for you."
            
            elif emotion in ["confused", "surprised"]:
                if strategy == "clear_patient":
                    return "I can see this might be confusing, so let me explain this clearly and make sure you understand each step."
                else:
                    return "Let me break this down in a way that's easy to understand. I want to make sure you have all the information you need."
            
            else:
                return "Thank you for your patience. I'm here to help and want to make sure we get this resolved for you."
                
        except Exception as e:
            logger.error(f"Error generating emotional response: {e}")
            return "I appreciate you bringing this to my attention. Let me help you resolve this."
    
    async def _escalate_to_human(self, call_id: str, reason: str):
        """Escalate call to human agent."""
        try:
            logger.info(f"Escalating call {call_id} to human: {reason}")
            
            # This would integrate with your human handoff system
            # For now, we'll just log the escalation
            
            self.escalations_triggered += 1
            
            # Update call status
            if call_id in self.active_calls:
                self.active_calls[call_id]["escalations"].append({
                    "type": "human_handoff",
                    "reason": reason,
                    "timestamp": time.time()
                })
            
        except Exception as e:
            logger.error(f"Error escalating to human: {e}")
    
    async def _end_call_gracefully(self, call_id: str, reason: str):
        """End a call gracefully due to compliance issues."""
        try:
            logger.info(f"Ending call {call_id} gracefully: {reason}")
            
            # Generate graceful ending message
            ending_message = "I apologize, but I need to end this call. Thank you for your time."
            
            # Generate speech for ending
            audio_data = await self.tts_engine.generate_speech(
                ending_message, 
                voice_profile=self.voice_profile
            )
            
            # Stream ending audio (in real implementation)
            logger.info(f"Call {call_id} ended gracefully")
            
            # End the call
            await self.telephony_manager._end_call(call_id, CallStatus.ENDED)
            
        except Exception as e:
            logger.error(f"Error ending call gracefully: {e}")
    
    async def _finalize_call(self, call_id: str):
        """Finalize call data and move to history."""
        try:
            if call_id in self.active_calls:
                call_data = self.active_calls[call_id]
                
                # Get final call info
                call_info = self.telephony_manager.get_call_status(call_id)
                
                # Prepare call summary
                call_summary = {
                    "call_id": call_id,
                    "phone_number": call_data["phone_number"],
                    "start_time": call_data["start_time"],
                    "end_time": time.time(),
                    "duration": time.time() - call_data["start_time"],
                    "compliance_status": call_data["compliance_status"].value,
                    "compliance_issues": call_data["compliance_issues"],
                    "escalations": call_data["escalations"],
                    "script_used": call_data["script"] is not None,
                    "metadata": call_data["metadata"]
                }
                
                # Add to call history
                self.call_history.append(call_summary)
                
                # Update success count if call was successful
                if call_info and call_info.status == CallStatus.ENDED:
                    self.successful_calls += 1
                
                # Remove from active calls
                del self.active_calls[call_id]
                
                logger.info(f"Call {call_id} finalized and added to history")
                
        except Exception as e:
            logger.error(f"Error finalizing call {call_id}: {e}")
    
    async def receive_call(self, phone_number: str, caller_info: Dict[str, Any] = None) -> str:
        """
        Handle an incoming phone call with intelligent responses.
        
        Args:
            phone_number: Phone number receiving the call
            caller_info: Information about the caller
            
        Returns:
            Call ID for tracking
        """
        try:
            # Receive the call
            call_id = await self.telephony_manager.receive_call(phone_number, caller_info)
            
            # Initialize inbound call monitoring
            self.active_calls[call_id] = {
                "start_time": time.time(),
                "phone_number": phone_number,
                "direction": "inbound",
                "caller_info": caller_info or {},
                "compliance_status": ComplianceStatus.COMPLIANT,
                "compliance_issues": [],
                "escalations": []
            }
            
            # Start monitoring
            asyncio.create_task(self._monitor_call(call_id))
            
            logger.info(f"Inbound call {call_id} received from {phone_number}")
            return call_id
            
        except Exception as e:
            logger.error(f"Error receiving call: {e}")
            raise
    
    async def generate_call_script(self, call_purpose: str, target_audience: str, 
                                 call_type: str = "outbound") -> str:
        """
        Generate a professional call script using AI.
        
        Args:
            call_purpose: Purpose of the call
            target_audience: Target audience description
            call_type: Type of call (outbound, follow_up, etc.)
            
        Returns:
            Generated call script
        """
        try:
            # This would integrate with your LLM system to generate scripts
            # For now, we'll create a template-based script
            
            script_template = self._get_script_template(call_type, target_audience)
            
            # Fill in the template
            script = script_template.format(
                purpose=call_purpose,
                audience=target_audience,
                agent_name=self._get_agent_name()
            )
            
            logger.info(f"Generated call script for {call_purpose}")
            return script
            
        except Exception as e:
            logger.error(f"Error generating call script: {e}")
            return self._get_fallback_script(call_purpose)
    
    def _get_script_template(self, call_type: str, target_audience: str) -> str:
        """Get script template based on call type and audience."""
        if call_type == "outbound":
            if "business" in target_audience.lower():
                return """Hello, this is {agent_name} calling from Guild AI. I'm reaching out regarding {purpose}. Is this a good time to discuss how we can help your business? I understand you're busy, so I'll be brief and focused on value."""
            else:
                return """Hi, this is {agent_name} from Guild AI. I'm calling about {purpose}. I hope I'm not catching you at a bad time. Would you have a few minutes to discuss how we might be able to help you?"""
        elif call_type == "follow_up":
            return """Hi {audience}, this is {agent_name} from Guild AI following up on our previous conversation about {purpose}. I wanted to see if you had any questions or if there's anything I can clarify for you."""
        else:
            return """Hello, this is {agent_name} from Guild AI calling about {purpose}. I hope you're having a good day. Do you have a moment to discuss this?"""
    
    def _get_fallback_script(self, call_purpose: str) -> str:
        """Get a fallback script if generation fails."""
        return f"Hello, this is {self._get_agent_name()} from Guild AI. I'm calling about {call_purpose}. Is this a good time to talk?"
    
    def _get_agent_name(self) -> str:
        """Get the agent's name for the script."""
        if self.voice_profile == "sales_agent":
            return "Sarah"
        elif self.voice_profile == "support_agent":
            return "Michael"
        elif self.voice_profile == "outreach_agent":
            return "Emma"
        else:
            return "your Guild AI representative"
    
    def get_call_status(self, call_id: str) -> Optional[Dict[str, Any]]:
        """Get the status of a specific call."""
        if call_id in self.active_calls:
            return self.active_calls[call_id]
        return None
    
    def get_active_calls(self) -> List[Dict[str, Any]]:
        """Get all currently active calls."""
        return list(self.active_calls.values())
    
    def get_call_history(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Get call history."""
        return self.call_history[-limit:] if self.call_history else []
    
    def get_performance_stats(self) -> Dict[str, Any]:
        """Get Voice Agent performance statistics."""
        return {
            "total_calls_made": self.total_calls_made,
            "successful_calls": self.successful_calls,
            "success_rate": self.successful_calls / max(self.total_calls_made, 1),
            "escalations_triggered": self.escalations_triggered,
            "active_calls": len(self.active_calls),
            "call_history_size": len(self.call_history),
            "voice_profile": self.voice_profile,
            "agent_type": self.agent_type
        }
    
    def get_voice_profiles(self) -> Dict[str, Any]:
        """Get available voice profiles."""
        return self.tts_engine.get_voice_profiles()
    
    def update_voice_profile(self, profile_name: str, updates: Dict[str, Any]):
        """Update a voice profile configuration."""
        self.tts_engine.update_voice_profile(profile_name, updates)
    
    def get_telephony_status(self) -> Dict[str, Any]:
        """Get telephony system status."""
        return self.telephony_manager.get_provider_status()
    
    def get_compliance_report(self, call_id: str = None) -> Dict[str, Any]:
        """Get compliance report for a call or overall system."""
        return self.guardrails.get_compliance_report(call_id)
    
    async def test_voice_system(self) -> Dict[str, Any]:
        """Test the voice system components."""
        try:
            test_results = {
                "tts_engine": "ok",
                "telephony_manager": "ok",
                "guardrails": "ok",
                "overall": "ok"
            }
            
            # Test TTS engine
            try:
                test_audio = await self.tts_engine.generate_speech(
                    "This is a test of the voice system.",
                    voice_profile="sales_agent"
                )
                if not test_audio:
                    test_results["tts_engine"] = "error"
                    test_results["overall"] = "error"
            except Exception as e:
                test_results["tts_engine"] = f"error: {e}"
                test_results["overall"] = "error"
            
            # Test telephony manager
            try:
                provider_status = self.telephony_manager.get_provider_status()
                if not provider_status.get("available_providers", 0):
                    test_results["telephony_manager"] = "warning: no providers available"
            except Exception as e:
                test_results["telephony_manager"] = f"error: {e}"
                test_results["overall"] = "error"
            
            # Test guardrails
            try:
                compliance_report = self.guardrails.get_compliance_report()
                if "error" in compliance_report:
                    test_results["guardrails"] = "error"
                    test_results["overall"] = "error"
            except Exception as e:
                test_results["guardrails"] = f"error: {e}"
                test_results["overall"] = "error"
            
            logger.info(f"Voice system test completed: {test_results}")
            return test_results
            
        except Exception as e:
            logger.error(f"Error testing voice system: {e}")
            return {"overall": f"error: {e}"}

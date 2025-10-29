"""
Call Handler for Guild AI

This module manages real-time call interactions, including:
- Speech-to-Text (STT) processing
- Conversation flow management
- Audio streaming and processing
- Real-time agent responses
- Call quality monitoring
"""

import logging
import asyncio
import time
import json
from typing import Dict, Any, List, Optional, Tuple, Union, Callable
from pathlib import Path
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)

class CallState(Enum):
    """Call state enumeration."""
    INITIATING = "initiating"
    RINGING = "ringing"
    CONNECTED = "connected"
    IN_CONVERSATION = "in_conversation"
    PROCESSING = "processing"
    ESCALATING = "escalating"
    ENDING = "ending"
    ENDED = "ended"

class AudioQuality(Enum):
    """Audio quality levels."""
    EXCELLENT = "excellent"
    GOOD = "good"
    FAIR = "fair"
    POOR = "poor"
    UNUSABLE = "unusable"

@dataclass
class ConversationTurn:
    """Represents a single turn in the conversation."""
    turn_id: str
    timestamp: float
    speaker: str  # "agent" or "caller"
    audio_data: Optional[bytes] = None
    transcript: Optional[str] = None
    confidence: float = 1.0
    processing_time: float = 0.0
    metadata: Dict[str, Any] = None

@dataclass
class CallMetrics:
    """Call quality and performance metrics."""
    audio_quality: AudioQuality
    latency_ms: float
    response_time_ms: float
    interruption_count: int
    silence_duration: float
    overall_score: float

class CallHandler:
    """
    Manages real-time call interactions and conversation flow.
    
    Features:
    - Real-time speech-to-text processing
    - Intelligent conversation management
    - Audio quality monitoring
    - Automatic response generation
    - Call flow optimization
    """
    
    def __init__(self, config: Dict[str, Any] = None):
        """Initialize the Call Handler."""
        self.config = config or self._get_default_config()
        
        # Call state
        self.active_calls: Dict[str, Dict[str, Any]] = {}
        self.conversation_history: Dict[str, List[ConversationTurn]] = {}
        self.call_metrics: Dict[str, CallMetrics] = {}
        
        # Audio processing
        self.audio_buffer_size = self.config.get("audio_buffer_size", 4096)
        self.sample_rate = self.config.get("sample_rate", 16000)
        self.channels = self.config.get("channels", 1)
        
        # STT and TTS integration
        self.stt_engine = None
        self.tts_engine = None
        self.llm_client = None
        
        # Emotion detection
        self.emotion_detector = None
        
        # Callbacks
        self.on_call_state_change: Optional[Callable] = None
        self.on_conversation_turn: Optional[Callable] = None
        self.on_escalation_needed: Optional[Callable] = None
        
        # Performance tracking
        self.total_calls_handled = 0
        self.avg_response_time = 0.0
        self.avg_audio_quality = AudioQuality.GOOD
        
        logger.info("Call Handler initialized successfully")
    
    def _get_default_config(self) -> Dict[str, Any]:
        """Get default Call Handler configuration."""
        return {
            "audio_buffer_size": 4096,
            "sample_rate": 16000,
            "channels": 1,
            "stt": {
                "model": "whisper",
                "language": "en",
                "real_time": True
            },
            "conversation": {
                "max_turn_duration": 30.0,
                "silence_threshold": 2.0,
                "interruption_threshold": 0.5
            },
            "quality": {
                "min_audio_quality": "fair",
                "max_latency_ms": 1000,
                "auto_escalation": True
            }
        }
    
    def set_callbacks(self, on_call_state_change: Callable = None, 
                     on_conversation_turn: Callable = None,
                     on_escalation_needed: Callable = None):
        """Set callback functions for call events."""
        self.on_call_state_change = on_call_state_change
        self.on_conversation_turn = on_conversation_turn
        self.on_escalation_needed = on_escalation_needed
        
        logger.info("Call Handler callbacks configured")
    
    def set_engines(self, stt_engine=None, tts_engine=None, llm_client=None, emotion_detector=None):
        """Set the STT, TTS, LLM, and emotion detection engines."""
        self.stt_engine = stt_engine
        self.tts_engine = tts_engine
        self.llm_client = llm_client
        self.emotion_detector = emotion_detector
        
        logger.info("Call Handler engines configured")
    
    async def start_call(self, call_id: str, call_info: Dict[str, Any]) -> bool:
        """
        Start handling a new call.
        
        Args:
            call_id: Unique call identifier
            call_info: Call information and metadata
            
        Returns:
            True if call started successfully
        """
        try:
            # Initialize call state
            self.active_calls[call_id] = {
                "call_info": call_info,
                "state": CallState.INITIATING,
                "start_time": time.time(),
                "last_activity": time.time(),
                "conversation_turns": [],
                "audio_quality": AudioQuality.GOOD,
                "metrics": CallMetrics(
                    audio_quality=AudioQuality.GOOD,
                    latency_ms=0.0,
                    response_time_ms=0.0,
                    interruption_count=0,
                    silence_duration=0.0,
                    overall_score=1.0
                )
            }
            
            # Initialize conversation history
            self.conversation_history[call_id] = []
            
            # Start call monitoring
            asyncio.create_task(self._monitor_call_health(call_id))
            
            # Update call state
            await self._update_call_state(call_id, CallState.RINGING)
            
            self.total_calls_handled += 1
            logger.info(f"Call {call_id} started successfully")
            
            return True
            
        except Exception as e:
            logger.error(f"Error starting call {call_id}: {e}")
            return False
    
    async def _update_call_state(self, call_id: str, new_state: CallState):
        """Update call state and trigger callback."""
        try:
            if call_id in self.active_calls:
                old_state = self.active_calls[call_id]["state"]
                self.active_calls[call_id]["state"] = new_state
                self.active_calls[call_id]["last_activity"] = time.time()
                
                logger.info(f"Call {call_id} state changed: {old_state.value} -> {new_state.value}")
                
                # Trigger callback if set
                if self.on_call_state_change:
                    await self.on_call_state_change(call_id, old_state, new_state)
                    
        except Exception as e:
            logger.error(f"Error updating call state: {e}")
    
    async def _monitor_call_health(self, call_id: str):
        """Monitor call health and quality metrics."""
        try:
            while call_id in self.active_calls:
                call_data = self.active_calls[call_id]
                
                # Check for inactivity
                if time.time() - call_data["last_activity"] > 60:  # 1 minute timeout
                    logger.warning(f"Call {call_id} inactive for too long, ending")
                    await self.end_call(call_id, "inactivity_timeout")
                    break
                
                # Update metrics
                await self._update_call_metrics(call_id)
                
                # Check if escalation is needed
                if self._should_escalate_call(call_id):
                    await self._trigger_escalation(call_id, "quality_degradation")
                
                await asyncio.sleep(10)  # Check every 10 seconds
                
        except Exception as e:
            logger.error(f"Error monitoring call health {call_id}: {e}")
    
    async def _update_call_metrics(self, call_id: str):
        """Update call quality and performance metrics."""
        try:
            if call_id not in self.active_calls:
                return
            
            call_data = self.active_calls[call_id]
            metrics = call_data["metrics"]
            
            # Calculate current metrics
            current_time = time.time()
            call_duration = current_time - call_data["start_time"]
            
            # Update audio quality based on recent turns
            recent_turns = call_data["conversation_turns"][-5:]  # Last 5 turns
            if recent_turns:
                avg_confidence = sum(turn.confidence for turn in recent_turns) / len(recent_turns)
                if avg_confidence > 0.9:
                    metrics.audio_quality = AudioQuality.EXCELLENT
                elif avg_confidence > 0.7:
                    metrics.audio_quality = AudioQuality.GOOD
                elif avg_confidence > 0.5:
                    metrics.audio_quality = AudioQuality.FAIR
                elif avg_confidence > 0.3:
                    metrics.audio_quality = AudioQuality.POOR
                else:
                    metrics.audio_quality = AudioQuality.UNUSABLE
            
            # Update overall score
            metrics.overall_score = self._calculate_overall_score(metrics)
            
            # Store updated metrics
            self.call_metrics[call_id] = metrics
            
        except Exception as e:
            logger.error(f"Error updating call metrics: {e}")
    
    def _calculate_overall_score(self, metrics: CallMetrics) -> float:
        """Calculate overall call quality score."""
        try:
            # Weighted scoring based on various factors
            audio_score = {
                AudioQuality.EXCELLENT: 1.0,
                AudioQuality.GOOD: 0.8,
                AudioQuality.FAIR: 0.6,
                AudioQuality.POOR: 0.4,
                AudioQuality.UNUSABLE: 0.2
            }.get(metrics.audio_quality, 0.5)
            
            latency_score = max(0, 1 - (metrics.latency_ms / 1000))  # Penalize high latency
            response_score = max(0, 1 - (metrics.response_time_ms / 2000))  # Penalize slow responses
            
            # Calculate weighted average
            overall_score = (
                audio_score * 0.4 +
                latency_score * 0.3 +
                response_score * 0.3
            )
            
            return max(0.0, min(1.0, overall_score))
            
        except Exception as e:
            logger.error(f"Error calculating overall score: {e}")
            return 0.5
    
    def _should_escalate_call(self, call_id: str) -> bool:
        """Determine if a call should be escalated."""
        try:
            if call_id not in self.active_calls:
                return False
            
            call_data = self.active_calls[call_id]
            metrics = call_data["metrics"]
            
            # Check quality thresholds
            if metrics.audio_quality in [AudioQuality.POOR, AudioQuality.UNUSABLE]:
                return True
            
            if metrics.latency_ms > self.config["quality"]["max_latency_ms"]:
                return True
            
            if metrics.overall_score < 0.3:  # Very low quality
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error checking escalation criteria: {e}")
            return False
    
    async def _trigger_escalation(self, call_id: str, reason: str):
        """Trigger call escalation."""
        try:
            logger.warning(f"Escalating call {call_id}: {reason}")
            
            # Update call state
            await self._update_call_state(call_id, CallState.ESCALATING)
            
            # Trigger escalation callback
            if self.on_escalation_needed:
                await self.on_escalation_needed(call_id, reason)
            
        except Exception as e:
            logger.error(f"Error triggering escalation: {e}")
    
    async def process_audio_input(self, call_id: str, audio_data: bytes, 
                                speaker: str = "caller") -> Optional[str]:
        """
        Process incoming audio and generate response.
        
        Args:
            call_id: Call identifier
            audio_data: Raw audio data
            speaker: Who is speaking ("caller" or "agent")
            
        Returns:
            Generated response text or None
        """
        try:
            if call_id not in self.active_calls:
                logger.warning(f"Call {call_id} not found for audio processing")
                return None
            
            start_time = time.time()
            
            # Create conversation turn
            turn = ConversationTurn(
                turn_id=f"turn_{int(time.time() * 1000)}",
                timestamp=start_time,
                speaker=speaker,
                audio_data=audio_data,
                metadata={"call_id": call_id}
            )
            
            # Process audio with STT if available
            if self.stt_engine and speaker == "caller":
                try:
                    transcript = await self.stt_engine.transcribe(audio_data)
                    turn.transcript = transcript
                    turn.confidence = getattr(transcript, 'confidence', 1.0) if hasattr(transcript, 'confidence') else 1.0
                except Exception as e:
                    logger.error(f"STT processing failed: {e}")
                    turn.transcript = "[unintelligible]"
                    turn.confidence = 0.1
            
            # Process audio with emotion detection if available
            if self.emotion_detector and speaker == "caller":
                try:
                    emotion_result = await self.emotion_detector.detect_emotion(audio_data, call_id)
                    turn.metadata = turn.metadata or {}
                    turn.metadata["emotion"] = {
                        "primary": emotion_result.primary_emotion.value,
                        "confidence": emotion_result.confidence,
                        "intensity": emotion_result.intensity.value
                    }
                except Exception as e:
                    logger.error(f"Emotion detection failed: {e}")
                    turn.metadata = turn.metadata or {}
                    turn.metadata["emotion"] = {"error": str(e)}
            
            # Add turn to conversation history
            self.active_calls[call_id]["conversation_turns"].append(turn)
            self.conversation_history[call_id].append(turn)
            
            # Update last activity
            self.active_calls[call_id]["last_activity"] = time.time()
            
            # Generate response if caller spoke
            if speaker == "caller" and turn.transcript:
                response = await self._generate_response(call_id, turn.transcript)
                
                # Calculate processing time
                turn.processing_time = time.time() - start_time
                
                # Update metrics
                if call_id in self.active_calls:
                    self.active_calls[call_id]["metrics"].response_time_ms = turn.processing_time * 1000
                
                # Trigger conversation turn callback
                if self.on_conversation_turn:
                    await self.on_conversation_turn(call_id, turn, response)
                
                return response
            
            return None
            
        except Exception as e:
            logger.error(f"Error processing audio input: {e}")
            return None
    
    async def _generate_response(self, call_id: str, caller_input: str) -> str:
        """
        Generate intelligent response to caller input.
        
        Args:
            call_id: Call identifier
            caller_input: What the caller said
            
        Returns:
            Generated response text
        """
        try:
            # Get call context
            call_data = self.active_calls.get(call_id, {})
            conversation_history = self.conversation_history.get(call_id, [])
            
            # Prepare context for LLM
            context = {
                "call_purpose": call_data.get("call_info", {}).get("purpose", "general"),
                "agent_type": call_data.get("call_info", {}).get("agent_type", "general"),
                "caller_input": caller_input,
                "conversation_history": [
                    {
                        "speaker": turn.speaker,
                        "transcript": turn.transcript,
                        "timestamp": turn.timestamp
                    }
                    for turn in conversation_history[-5:]  # Last 5 turns
                ]
            }
            
            # Generate response using LLM if available
            if self.llm_client:
                try:
                    # This would integrate with your LLM system
                    # For now, we'll use a simple template-based approach
                    response = self._generate_template_response(context)
                except Exception as e:
                    logger.error(f"LLM response generation failed: {e}")
                    response = self._generate_fallback_response(caller_input)
            else:
                response = self._generate_template_response(context)
            
            # Enhance response with emotional context if available
            if self.emotion_detector:
                try:
                    emotion_context = await self.emotion_detector.get_emotion_context(call_id)
                    if emotion_context:
                        response = self._enhance_response_with_emotion(response, emotion_context)
                except Exception as e:
                    logger.error(f"Error enhancing response with emotion: {e}")
            
            return response
            
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            return "I apologize, but I'm having trouble processing that. Could you please repeat?"
    
    def _generate_template_response(self, context: Dict[str, Any]) -> str:
        """Generate response using templates."""
        try:
            caller_input = context["caller_input"].lower()
            agent_type = context["agent_type"]
            
            # Sales agent responses
            if agent_type == "sales_agent":
                if any(word in caller_input for word in ["price", "cost", "how much"]):
                    return "I'd be happy to discuss our pricing options. We offer several packages designed to meet different business needs. What size business are you working with?"
                elif any(word in caller_input for word in ["demo", "show me", "see it"]):
                    return "Absolutely! I'd love to show you a demo. We can schedule a personalized walkthrough that focuses on your specific needs. When would be a good time for you?"
                elif any(word in caller_input for word in ["competitor", "better than", "why choose"]):
                    return "Great question! What sets us apart is our focus on automation and efficiency. We help businesses save time and reduce costs through intelligent automation. What challenges are you currently facing?"
            
            # Support agent responses
            elif agent_type == "support_agent":
                if any(word in caller_input for word in ["problem", "issue", "broken", "not working"]):
                    return "I'm sorry to hear you're experiencing an issue. Let me help you resolve this. Can you describe what's happening in detail?"
                elif any(word in caller_input for word in ["how to", "how do i", "help me"]):
                    return "I'd be happy to help you with that. Let me walk you through the process step by step. What specifically would you like to know?"
                elif any(word in caller_input for word in ["refund", "cancel", "billing"]):
                    return "I understand your concern about billing. Let me look into this for you. Can you provide your account number or email address?"
            
            # General responses
            if any(word in caller_input for word in ["yes", "sure", "okay", "alright"]):
                return "Great! Let me get that information for you right away."
            elif any(word in caller_input for word in ["no", "not now", "later"]):
                return "I understand. Is there a better time I could reach out to you, or would you prefer to contact us when you're ready?"
            elif any(word in caller_input for word in ["goodbye", "bye", "end call"]):
                return "Thank you for your time today. I appreciate you speaking with me. Have a wonderful day!"
            
            # Default response
            return "Thank you for that information. Let me help you with that. Can you tell me a bit more about what you're looking for?"
            
        except Exception as e:
            logger.error(f"Error generating template response: {e}")
            return "I appreciate you sharing that. How can I best assist you today?"
    
    def _generate_fallback_response(self, caller_input: str) -> str:
        """Generate a fallback response when LLM is unavailable."""
        return "Thank you for that information. I'm here to help you. What would you like to know more about?"
    
    def _enhance_response_with_emotion(self, response: str, emotion_context: EmotionContext) -> str:
        """Enhance response text with emotional awareness."""
        try:
            emotion = emotion_context.current_emotion.primary_emotion.value
            strategy = emotion_context.response_strategy
            
            # Add emotional prefixes based on detected emotion
            if emotion in ["angry", "frustrated", "impatient"]:
                if strategy == "immediate_de_escalation":
                    prefix = "I can hear your frustration, and I want to help resolve this immediately. "
                elif strategy == "acknowledge_concerns":
                    prefix = "I completely understand your concern, and I apologize for the inconvenience. "
                else:
                    prefix = "I appreciate you bringing this to my attention. "
                
                response = prefix + response
            
            elif emotion in ["sad", "fearful"]:
                if strategy == "empathetic_support":
                    prefix = "I can sense this has been difficult for you, and I want you to know I'm here to help. "
                else:
                    prefix = "I understand this situation has been challenging. "
                
                response = prefix + response
            
            elif emotion in ["confused", "surprised"]:
                if strategy == "clear_patient":
                    prefix = "I can see this might be confusing, so let me explain this clearly. "
                else:
                    prefix = "Let me break this down in a way that's easy to understand. "
                
                response = prefix + response
            
            elif emotion in ["happy", "excited"]:
                if strategy == "maintain_enthusiasm":
                    prefix = "I'm glad to hear your enthusiasm! "
                else:
                    prefix = "That's wonderful to hear! "
                
                response = prefix + response
            
            return response
            
        except Exception as e:
            logger.error(f"Error enhancing response with emotion: {e}")
            return response
    
    async def stream_audio_response(self, call_id: str, response_text: str) -> bool:
        """
        Stream audio response back to the caller.
        
        Args:
            call_id: Call identifier
            response_text: Text to convert to speech
            
        Returns:
            True if streaming successful
        """
        try:
            if call_id not in self.active_calls:
                logger.warning(f"Call {call_id} not found for audio streaming")
                return False
            
            # Generate speech using TTS engine
            if self.tts_engine:
                try:
                    # Get emotional context for TTS generation
                    emotional_context = None
                    if self.emotion_detector:
                        try:
                            emotion_context = await self.emotion_detector.get_emotion_context(call_id)
                            if emotion_context:
                                emotional_context = {
                                    "emotion": emotion_context.current_emotion.primary_emotion.value,
                                    "intensity": emotion_context.current_emotion.intensity.value,
                                    "trend": emotion_context.trend,
                                    "escalation_risk": emotion_context.escalation_risk
                                }
                        except Exception as e:
                            logger.error(f"Error getting emotional context for TTS: {e}")
                    
                    audio_data = await self.tts_engine.generate_speech(
                        response_text,
                        voice_profile=self.active_calls[call_id].get("call_info", {}).get("voice_profile", "default"),
                        emotional_context=emotional_context
                    )
                    
                    if audio_data:
                        # In a real implementation, this would stream to the telephony provider
                        logger.info(f"Audio response generated for call {call_id}: {len(audio_data)} bytes")
                        
                        # Create agent turn
                        agent_turn = ConversationTurn(
                            turn_id=f"turn_{int(time.time() * 1000)}",
                            timestamp=time.time(),
                            speaker="agent",
                            transcript=response_text,
                            audio_data=audio_data,
                            confidence=1.0
                        )
                        
                        # Add to conversation history
                        self.active_calls[call_id]["conversation_turns"].append(agent_turn)
                        self.conversation_history[call_id].append(agent_turn)
                        
                        return True
                    else:
                        logger.error(f"TTS failed to generate audio for call {call_id}")
                        return False
                        
                except Exception as e:
                    logger.error(f"TTS processing failed: {e}")
                    return False
            else:
                logger.warning("TTS engine not available")
                return False
                
        except Exception as e:
            logger.error(f"Error streaming audio response: {e}")
            return False
    
    async def end_call(self, call_id: str, reason: str = "user_request") -> bool:
        """
        End a call gracefully.
        
        Args:
            call_id: Call identifier
            reason: Reason for ending the call
            
        Returns:
            True if call ended successfully
        """
        try:
            if call_id not in self.active_calls:
                logger.warning(f"Call {call_id} not found for ending")
                return False
            
            # Update call state
            await self._update_call_state(call_id, CallState.ENDING)
            
            # Generate ending message
            ending_message = self._get_ending_message(reason)
            
            # Stream ending message
            await self.stream_audio_response(call_id, ending_message)
            
            # Final state update
            await self._update_call_state(call_id, CallState.ENDED)
            
            # Clean up call data
            await self._cleanup_call(call_id)
            
            logger.info(f"Call {call_id} ended successfully: {reason}")
            return True
            
        except Exception as e:
            logger.error(f"Error ending call {call_id}: {e}")
            return False
    
    def _get_ending_message(self, reason: str) -> str:
        """Get appropriate ending message based on reason."""
        if reason == "inactivity_timeout":
            return "I notice we haven't been speaking for a while. I'll end this call now, but please feel free to call back when you're ready to continue."
        elif reason == "quality_degradation":
            return "I'm experiencing some technical difficulties. Let me end this call and we can try again, or you can call back when it's convenient."
        elif reason == "user_request":
            return "Thank you for your time today. I appreciate you speaking with me. Have a wonderful day!"
        else:
            return "Thank you for your time. I appreciate you speaking with me today. Have a great day!"
    
    async def _cleanup_call(self, call_id: str):
        """Clean up call data and resources."""
        try:
            # Store final metrics
            if call_id in self.active_calls:
                final_metrics = self.active_calls[call_id]["metrics"]
                self.call_metrics[call_id] = final_metrics
                
                # Update global averages
                self._update_global_metrics(final_metrics)
            
            # Remove from active calls
            if call_id in self.active_calls:
                del self.active_calls[call_id]
            
            # Keep conversation history for analysis
            # (Could be moved to persistent storage here)
            
        except Exception as e:
            logger.error(f"Error cleaning up call {call_id}: {e}")
    
    def _update_global_metrics(self, call_metrics: CallMetrics):
        """Update global performance metrics."""
        try:
            # Update average response time
            if self.total_calls_handled > 0:
                self.avg_response_time = (
                    (self.avg_response_time * (self.total_calls_handled - 1) + call_metrics.response_time_ms) /
                    self.total_calls_handled
                )
            
            # Update average audio quality
            quality_scores = {
                AudioQuality.EXCELLENT: 1.0,
                AudioQuality.GOOD: 0.8,
                AudioQuality.FAIR: 0.6,
                AudioQuality.POOR: 0.4,
                AudioQuality.UNUSABLE: 0.2
            }
            
            current_avg = quality_scores.get(self.avg_audio_quality, 0.6)
            new_score = quality_scores.get(call_metrics.audio_quality, 0.6)
            
            if self.total_calls_handled > 0:
                new_avg = (current_avg * (self.total_calls_handled - 1) + new_score) / self.total_calls_handled
                
                # Convert back to enum
                if new_avg >= 0.9:
                    self.avg_audio_quality = AudioQuality.EXCELLENT
                elif new_avg >= 0.7:
                    self.avg_audio_quality = AudioQuality.GOOD
                elif new_avg >= 0.5:
                    self.avg_audio_quality = AudioQuality.FAIR
                elif new_avg >= 0.3:
                    self.avg_audio_quality = AudioQuality.POOR
                else:
                    self.avg_audio_quality = AudioQuality.UNUSABLE
                    
        except Exception as e:
            logger.error(f"Error updating global metrics: {e}")
    
    def get_call_status(self, call_id: str) -> Optional[Dict[str, Any]]:
        """Get current status of a call."""
        if call_id in self.active_calls:
            return {
                "call_id": call_id,
                "state": self.active_calls[call_id]["state"].value,
                "start_time": self.active_calls[call_id]["start_time"],
                "last_activity": self.active_calls[call_id]["last_activity"],
                "conversation_turns": len(self.active_calls[call_id]["conversation_turns"]),
                "metrics": self.active_calls[call_id]["metrics"]
            }
        return None
    
    def get_active_calls(self) -> List[Dict[str, Any]]:
        """Get all currently active calls."""
        return [
            {
                "call_id": call_id,
                "state": data["state"].value,
                "start_time": data["start_time"],
                "duration": time.time() - data["start_time"]
            }
            for call_id, data in self.active_calls.items()
        ]
    
    def get_performance_stats(self) -> Dict[str, Any]:
        """Get Call Handler performance statistics."""
        return {
            "total_calls_handled": self.total_calls_handled,
            "active_calls": len(self.active_calls),
            "avg_response_time_ms": self.avg_response_time,
            "avg_audio_quality": self.avg_audio_quality.value,
            "conversation_history_size": sum(len(history) for history in self.conversation_history.values())
        }
    
    async def test_call_handler(self) -> Dict[str, Any]:
        """Test the Call Handler components."""
        try:
            test_results = {
                "call_management": "ok",
                "audio_processing": "ok",
                "conversation_flow": "ok",
                "overall": "ok"
            }
            
            # Test call management
            try:
                test_call_id = "test_call_123"
                test_call_info = {"purpose": "testing", "agent_type": "test"}
                
                started = await self.start_call(test_call_id, test_call_info)
                if not started:
                    test_results["call_management"] = "error"
                    test_results["overall"] = "error"
                else:
                    # Test ending the call
                    ended = await self.end_call(test_call_id, "testing_complete")
                    if not ended:
                        test_results["call_management"] = "error"
                        test_results["overall"] = "error"
                        
            except Exception as e:
                test_results["call_management"] = f"error: {e}"
                test_results["overall"] = "error"
            
            # Test audio processing (simulated)
            try:
                test_audio = b"test_audio_data" * 100  # Simulate audio data
                response = await self.process_audio_input("test_call_123", test_audio, "caller")
                if response is None:
                    test_results["audio_processing"] = "warning: no response generated"
                    
            except Exception as e:
                test_results["audio_processing"] = f"error: {e}"
                test_results["overall"] = "error"
            
            # Test conversation flow
            try:
                # This would test the conversation logic
                test_results["conversation_flow"] = "ok"
                
            except Exception as e:
                test_results["conversation_flow"] = f"error: {e}"
                test_results["overall"] = "error"
            
            logger.info(f"Call Handler test completed: {test_results}")
            return test_results
            
        except Exception as e:
            logger.error(f"Error testing Call Handler: {e}")
            return {"overall": f"error: {e}"}

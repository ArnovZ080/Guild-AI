"""
Telephony Manager for Guild AI

This module manages phone call infrastructure, supporting both cloud APIs (Twilio)
and self-hosted solutions (Asterisk/SIP). Handles call placement, receiving,
and real-time audio streaming.
"""

import logging
import asyncio
import json
import time
from typing import Dict, Any, List, Optional, Callable, Union
from pathlib import Path
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)

class CallStatus(Enum):
    """Call status enumeration."""
    IDLE = "idle"
    DIALING = "dialing"
    RINGING = "ringing"
    CONNECTED = "connected"
    IN_PROGRESS = "in_progress"
    ENDED = "ended"
    FAILED = "failed"
    BUSY = "busy"
    NO_ANSWER = "no_answer"

class CallDirection(Enum):
    """Call direction enumeration."""
    OUTBOUND = "outbound"
    INBOUND = "inbound"

@dataclass
class CallInfo:
    """Information about a phone call."""
    call_id: str
    phone_number: str
    direction: CallDirection
    status: CallStatus
    start_time: float
    end_time: Optional[float] = None
    duration: Optional[float] = None
    agent_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class TelephonyManager:
    """
    Manages phone call infrastructure for Guild AI agents.
    
    Supports:
    - Cloud telephony APIs (Twilio, Vonage, Telnyx)
    - Self-hosted SIP/Asterisk systems
    - Real-time audio streaming
    - Call recording and transcription
    """
    
    def __init__(self, config: Dict[str, Any] = None):
        """Initialize the telephony manager."""
        self.config = config or self._get_default_config()
        
        # Call management
        self.active_calls: Dict[str, CallInfo] = {}
        self.call_history: List[CallInfo] = []
        self.call_counter = 0
        
        # Telephony providers
        self.primary_provider = None
        self.fallback_providers = []
        
        # Audio streaming
        self.audio_streams: Dict[str, Any] = {}
        self.stream_callbacks: Dict[str, List[Callable]] = {}
        
        # Initialize providers
        self._initialize_providers()
        
        logger.info("Telephony Manager initialized successfully")
    
    def _get_default_config(self) -> Dict[str, Any]:
        """Get default telephony configuration."""
        return {
            "primary_provider": "twilio",
            "providers": {
                "twilio": {
                    "enabled": True,
                    "account_sid": None,
                    "auth_token": None,
                    "phone_number": None,
                    "webhook_url": None
                },
                "vonage": {
                    "enabled": False,
                    "api_key": None,
                    "api_secret": None,
                    "phone_number": None
                },
                "sip": {
                    "enabled": False,
                    "server": "localhost",
                    "port": 5060,
                    "username": None,
                    "password": None
                }
            },
            "call_settings": {
                "max_duration_minutes": 30,
                "recording_enabled": True,
                "transcription_enabled": True,
                "fallback_number": None
            },
            "audio_settings": {
                "sample_rate": 8000,
                "channels": 1,
                "bit_depth": 16,
                "codec": "pcm"
            }
        }
    
    def _initialize_providers(self):
        """Initialize telephony providers based on configuration."""
        try:
            # Initialize primary provider
            primary_name = self.config["primary_provider"]
            if primary_name in self.config["providers"] and self.config["providers"][primary_name]["enabled"]:
                self.primary_provider = self._create_provider(primary_name)
                logger.info(f"Primary telephony provider ({primary_name}) initialized")
            
            # Initialize fallback providers
            for provider_name, provider_config in self.config["providers"].items():
                if (provider_name != primary_name and 
                    provider_config["enabled"] and 
                    self._validate_provider_config(provider_name, provider_config)):
                    
                    provider = self._create_provider(provider_name)
                    self.fallback_providers.append(provider)
                    logger.info(f"Fallback telephony provider ({provider_name}) initialized")
            
            if not self.primary_provider and not self.fallback_providers:
                logger.warning("No telephony providers available - voice calls disabled")
                
        except Exception as e:
            logger.error(f"Error initializing telephony providers: {e}")
    
    def _create_provider(self, provider_name: str):
        """Create a telephony provider instance."""
        try:
            if provider_name == "twilio":
                return self._create_twilio_provider()
            elif provider_name == "vonage":
                return self._create_vonage_provider()
            elif provider_name == "sip":
                return self._create_sip_provider()
            else:
                logger.warning(f"Unknown telephony provider: {provider_name}")
                return None
                
        except Exception as e:
            logger.error(f"Error creating provider {provider_name}: {e}")
            return None
    
    def _create_twilio_provider(self):
        """Create Twilio telephony provider."""
        try:
            # This would create an actual Twilio client
            # For now, we'll create a placeholder that simulates the behavior
            return {
                "name": "twilio",
                "type": "cloud_api",
                "connected": True,
                "capabilities": ["outbound_calls", "inbound_calls", "sms", "recording"],
                "client": None  # Would be actual Twilio client
            }
        except Exception as e:
            logger.error(f"Failed to create Twilio provider: {e}")
            return None
    
    def _create_vonage_provider(self):
        """Create Vonage telephony provider."""
        try:
            return {
                "name": "vonage",
                "type": "cloud_api",
                "connected": True,
                "capabilities": ["outbound_calls", "inbound_calls", "sms"],
                "client": None  # Would be actual Vonage client
            }
        except Exception as e:
            logger.error(f"Failed to create Vonage provider: {e}")
            return None
    
    def _create_sip_provider(self):
        """Create SIP/Asterisk telephony provider."""
        try:
            return {
                "name": "sip",
                "type": "self_hosted",
                "connected": True,
                "capabilities": ["outbound_calls", "inbound_calls", "recording"],
                "client": None  # Would be actual SIP client
            }
        except Exception as e:
            logger.error(f"Failed to create SIP provider: {e}")
            return None
    
    def _validate_provider_config(self, provider_name: str, config: Dict[str, Any]) -> bool:
        """Validate provider configuration."""
        try:
            if provider_name == "twilio":
                required_fields = ["account_sid", "auth_token", "phone_number"]
            elif provider_name == "vonage":
                required_fields = ["api_key", "api_secret", "phone_number"]
            elif provider_name == "sip":
                required_fields = ["username", "password"]
            else:
                return False
            
            return all(config.get(field) for field in required_fields)
            
        except Exception as e:
            logger.error(f"Error validating provider config: {e}")
            return False
    
    async def make_call(self, phone_number: str, agent_id: str, 
                       call_script: str = None, metadata: Dict[str, Any] = None) -> str:
        """
        Make an outbound phone call.
        
        Args:
            phone_number: Phone number to call
            agent_id: ID of the agent making the call
            call_script: Optional script for the agent
            metadata: Additional call metadata
            
        Returns:
            Call ID for tracking
        """
        try:
            if not self.primary_provider and not self.fallback_providers:
                raise RuntimeError("No telephony providers available")
            
            # Generate call ID
            call_id = f"call_{int(time.time())}_{self.call_counter}"
            self.call_counter += 1
            
            # Create call info
            call_info = CallInfo(
                call_id=call_id,
                phone_number=phone_number,
                direction=CallDirection.OUTBOUND,
                status=CallStatus.DIALING,
                start_time=time.time(),
                agent_id=agent_id,
                metadata=metadata or {}
            )
            
            # Store call info
            self.active_calls[call_id] = call_info
            
            # Start the call process
            asyncio.create_task(self._execute_call(call_id, call_script))
            
            logger.info(f"Initiated outbound call {call_id} to {phone_number}")
            return call_id
            
        except Exception as e:
            logger.error(f"Error making call: {e}")
            raise
    
    async def _execute_call(self, call_id: str, call_script: str = None):
        """Execute the actual phone call."""
        try:
            call_info = self.active_calls[call_id]
            
            # Update status to ringing
            call_info.status = CallStatus.RINGING
            logger.info(f"Call {call_id} is ringing")
            
            # Simulate call progression (in real implementation, this would be handled by the telephony provider)
            await asyncio.sleep(2)  # Simulate ring time
            
            # Simulate call connection (randomly decide if call connects)
            import random
            if random.random() > 0.3:  # 70% connection rate
                call_info.status = CallStatus.CONNECTED
                logger.info(f"Call {call_id} connected")
                
                # Start call processing
                await self._process_active_call(call_id, call_script)
            else:
                call_info.status = CallStatus.NO_ANSWER
                call_info.end_time = time.time()
                call_info.duration = call_info.end_time - call_info.start_time
                logger.info(f"Call {call_id} - no answer")
            
        except Exception as e:
            logger.error(f"Error executing call {call_id}: {e}")
            call_info = self.active_calls.get(call_id)
            if call_info:
                call_info.status = CallStatus.FAILED
                call_info.end_time = time.time()
    
    async def _process_active_call(self, call_id: str, call_script: str = None):
        """Process an active phone call."""
        try:
            call_info = self.active_calls[call_id]
            call_info.status = CallStatus.IN_PROGRESS
            
            # Start audio streaming
            await self._start_audio_stream(call_id)
            
            # Process call based on script
            if call_script:
                await self._execute_call_script(call_id, call_script)
            else:
                # Default call handling
                await self._handle_default_call(call_id)
            
            # End call
            await self._end_call(call_id)
            
        except Exception as e:
            logger.error(f"Error processing call {call_id}: {e}")
            await self._end_call(call_id, status=CallStatus.FAILED)
    
    async def _start_audio_stream(self, call_id: str):
        """Start audio streaming for a call."""
        try:
            # Initialize audio stream
            self.audio_streams[call_id] = {
                "status": "active",
                "start_time": time.time(),
                "audio_chunks": [],
                "stream_quality": "good"
            }
            
            logger.info(f"Audio stream started for call {call_id}")
            
        except Exception as e:
            logger.error(f"Error starting audio stream for call {call_id}: {e}")
    
    async def _execute_call_script(self, call_id: str, call_script: str):
        """Execute a call script for the agent."""
        try:
            # Parse call script
            script_parts = self._parse_call_script(call_script)
            
            for part in script_parts:
                # Generate speech for this part
                audio_data = await self._generate_speech_for_script(part)
                
                # Stream audio to the call
                await self._stream_audio_to_call(call_id, audio_data)
                
                # Wait for response or continue
                await asyncio.sleep(part.get("duration", 2))
            
        except Exception as e:
            logger.error(f"Error executing call script for call {call_id}: {e}")
    
    def _parse_call_script(self, script: str) -> List[Dict[str, Any]]:
        """Parse a call script into executable parts."""
        # Simple script parsing - in practice, this would be more sophisticated
        parts = []
        
        # Split script into sentences
        sentences = script.split('.')
        
        for i, sentence in enumerate(sentences):
            sentence = sentence.strip()
            if sentence:
                parts.append({
                    "text": sentence,
                    "order": i,
                    "duration": len(sentence) * 0.1,  # Rough timing estimate
                    "type": "speech"
                })
        
        return parts
    
    async def _generate_speech_for_script(self, script_part: Dict[str, Any]) -> bytes:
        """Generate speech audio for a script part."""
        try:
            # This would integrate with the TTS engine
            # For now, we'll return simulated audio
            from .tts_engine import TTSEngine
            
            tts_engine = TTSEngine()
            audio_data = await tts_engine.generate_speech(
                script_part["text"], 
                voice_profile="sales_agent"
            )
            
            return audio_data
            
        except Exception as e:
            logger.error(f"Error generating speech for script: {e}")
            # Return empty audio as fallback
            return b""
    
    async def _stream_audio_to_call(self, call_id: str, audio_data: bytes):
        """Stream audio data to an active call."""
        try:
            if call_id in self.audio_streams:
                stream = self.audio_streams[call_id]
                stream["audio_chunks"].append({
                    "timestamp": time.time(),
                    "size": len(audio_data),
                    "data": audio_data
                })
                
                # In real implementation, this would send audio to the telephony provider
                logger.debug(f"Streamed {len(audio_data)} bytes to call {call_id}")
                
        except Exception as e:
            logger.error(f"Error streaming audio to call {call_id}: {e}")
    
    async def _handle_default_call(self, call_id: str):
        """Handle a call without a specific script."""
        try:
            # Default call behavior
            default_messages = [
                "Hello, this is an automated call from Guild AI.",
                "I'm calling to follow up on our previous conversation.",
                "Is this a good time to talk?",
                "Thank you for your time. Have a great day!"
            ]
            
            for message in default_messages:
                audio_data = await self._generate_speech_for_script({"text": message})
                await self._stream_audio_to_call(call_id, audio_data)
                await asyncio.sleep(3)  # Wait between messages
            
        except Exception as e:
            logger.error(f"Error in default call handling for call {call_id}: {e}")
    
    async def _end_call(self, call_id: str, status: CallStatus = CallStatus.ENDED):
        """End a phone call."""
        try:
            if call_id in self.active_calls:
                call_info = self.active_calls[call_id]
                call_info.status = status
                call_info.end_time = time.time()
                call_info.duration = call_info.end_time - call_info.start_time
                
                # Stop audio streaming
                if call_id in self.audio_streams:
                    del self.audio_streams[call_id]
                
                # Move to call history
                self.call_history.append(call_info)
                del self.active_calls[call_id]
                
                logger.info(f"Call {call_id} ended with status: {status.value}")
                
        except Exception as e:
            logger.error(f"Error ending call {call_id}: {e}")
    
    async def receive_call(self, phone_number: str, caller_info: Dict[str, Any] = None) -> str:
        """
        Handle an incoming phone call.
        
        Args:
            phone_number: Phone number receiving the call
            caller_info: Information about the caller
            
        Returns:
            Call ID for tracking
        """
        try:
            # Generate call ID
            call_id = f"inbound_{int(time.time())}_{self.call_counter}"
            self.call_counter += 1
            
            # Create call info
            call_info = CallInfo(
                call_id=call_id,
                phone_number=phone_number,
                direction=CallDirection.INBOUND,
                status=CallStatus.RINGING,
                start_time=time.time(),
                metadata=caller_info or {}
            )
            
            # Store call info
            self.active_calls[call_id] = call_info
            
            # Start inbound call handling
            asyncio.create_task(self._handle_inbound_call(call_id, caller_info))
            
            logger.info(f"Received inbound call {call_id} from {phone_number}")
            return call_id
            
        except Exception as e:
            logger.error(f"Error receiving call: {e}")
            raise
    
    async def _handle_inbound_call(self, call_id: str, caller_info: Dict[str, Any] = None):
        """Handle an incoming phone call."""
        try:
            call_info = self.active_calls[call_id]
            
            # Simulate call connection
            await asyncio.sleep(1)
            call_info.status = CallStatus.CONNECTED
            
            # Start audio streaming
            await self._start_audio_stream(call_id)
            
            # Handle inbound call logic
            await self._process_inbound_call(call_id, caller_info)
            
            # End call
            await self._end_call(call_id)
            
        except Exception as e:
            logger.error(f"Error handling inbound call {call_id}: {e}")
            await self._end_call(call_id, status=CallStatus.FAILED)
    
    async def _process_inbound_call(self, call_id: str, caller_info: Dict[str, Any] = None):
        """Process an inbound call."""
        try:
            # Default inbound call handling
            welcome_message = "Thank you for calling Guild AI. How can I help you today?"
            
            audio_data = await self._generate_speech_for_script({"text": welcome_message})
            await self._stream_audio_to_call(call_id, audio_data)
            
            # Wait for caller response (in real implementation, this would handle actual audio input)
            await asyncio.sleep(5)
            
        except Exception as e:
            logger.error(f"Error processing inbound call {call_id}: {e}")
    
    def get_call_status(self, call_id: str) -> Optional[CallInfo]:
        """Get the status of a specific call."""
        return self.active_calls.get(call_id)
    
    def get_active_calls(self) -> List[CallInfo]:
        """Get all currently active calls."""
        return list(self.active_calls.values())
    
    def get_call_history(self, limit: int = 100) -> List[CallInfo]:
        """Get call history."""
        return self.call_history[-limit:] if self.call_history else []
    
    def get_provider_status(self) -> Dict[str, Any]:
        """Get status of all telephony providers."""
        status = {
            "primary_provider": None,
            "fallback_providers": [],
            "total_providers": 0,
            "available_providers": 0
        }
        
        if self.primary_provider:
            status["primary_provider"] = {
                "name": self.primary_provider["name"],
                "connected": self.primary_provider["connected"],
                "capabilities": self.primary_provider["capabilities"]
            }
            status["total_providers"] += 1
            if self.primary_provider["connected"]:
                status["available_providers"] += 1
        
        for provider in self.fallback_providers:
            status["fallback_providers"].append({
                "name": provider["name"],
                "connected": provider["connected"],
                "capabilities": provider["capabilities"]
            })
            status["total_providers"] += 1
            if provider["connected"]:
                status["available_providers"] += 1
        
        return status
    
    def update_provider_config(self, provider_name: str, config: Dict[str, Any]):
        """Update configuration for a telephony provider."""
        try:
            if provider_name in self.config["providers"]:
                self.config["providers"][provider_name].update(config)
                logger.info(f"Updated configuration for provider: {provider_name}")
                
                # Reinitialize if this is the primary provider
                if provider_name == self.config["primary_provider"]:
                    self._initialize_providers()
            else:
                logger.warning(f"Provider not found: {provider_name}")
                
        except Exception as e:
            logger.error(f"Error updating provider config: {e}")
    
    def add_audio_stream_callback(self, call_id: str, callback: Callable):
        """Add a callback for audio stream events."""
        if call_id not in self.stream_callbacks:
            self.stream_callbacks[call_id] = []
        self.stream_callbacks[call_id].append(callback)
    
    def remove_audio_stream_callback(self, call_id: str, callback: Callable):
        """Remove a callback for audio stream events."""
        if call_id in self.stream_callbacks and callback in self.stream_callbacks[call_id]:
            self.stream_callbacks[call_id].remove(callback)

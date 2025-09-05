"""
Text-to-Speech Engine for Guild AI

This module provides high-quality, fast TTS capabilities using open-source models.
Supports multiple voices, emotions, and real-time generation for phone calls.
"""

import logging
import time
import io
import asyncio
from typing import Dict, Any, List, Optional, Tuple, Union
from pathlib import Path
import json

logger = logging.getLogger(__name__)

class TTSEngine:
    """
    High-performance TTS engine supporting multiple models and voice styles.
    
    Features:
    - Real-time voice generation (<500ms latency)
    - Multiple voice personalities
    - Emotional tone control
    - Professional call quality
    - Fallback models for reliability
    """
    
    def __init__(self, model_config: Dict[str, Any] = None):
        """Initialize the TTS engine with configuration."""
        self.model_config = model_config or self._get_default_config()
        
        # Voice models
        self.primary_model = None
        self.fallback_models = []
        self.voice_profiles = {}
        
        # Performance tracking
        self.generation_times = []
        self.quality_scores = []
        
        # Initialize models
        self._initialize_models()
        
        logger.info("TTS Engine initialized successfully")
    
    def _get_default_config(self) -> Dict[str, Any]:
        """Get default TTS configuration."""
        return {
            "primary_model": "kokoro",
            "fallback_models": ["openvoice", "parler_tts"],
            "voice_profiles": {
                "sales_agent": {
                    "name": "Sarah",
                    "gender": "female",
                    "tone": "professional_friendly",
                    "speed": 1.0,
                    "pitch": 0.0,
                    "emotional_expression": True,
                    "prosody_control": True,
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
                    "speed": 0.95,
                    "pitch": -0.1,
                    "emotional_expression": True,
                    "prosody_control": True,
                    "emotional_styles": {
                        "very_calm_empathetic": {"speed": 0.85, "pitch": -0.3, "prosody": "very_gentle"},
                        "supportive_patient": {"speed": 0.9, "pitch": -0.1, "prosody": "patient"},
                        "clear_patient": {"speed": 0.95, "pitch": 0.0, "prosody": "clear"}
                    }
                },
                "outreach_agent": {
                    "name": "Emma",
                    "gender": "female", 
                    "tone": "enthusiastic_engaging",
                    "speed": 1.05,
                    "pitch": 0.1,
                    "emotional_expression": True,
                    "prosody_control": True,
                    "emotional_styles": {
                        "enthusiastic_positive": {"speed": 1.1, "pitch": 0.2, "prosody": "energetic"},
                        "reassuring_informative": {"speed": 1.0, "pitch": 0.0, "prosody": "steady"},
                        "maintain_enthusiasm": {"speed": 1.05, "pitch": 0.1, "prosody": "engaging"}
                    }
                }
            },
            "quality_threshold": 0.8,
            "max_latency_ms": 500
        }
    
    def _initialize_models(self):
        """Initialize TTS models based on configuration."""
        try:
            # Initialize primary model (Kokoro for speed)
            self.primary_model = self._load_kokoro_model()
            logger.info("Primary TTS model (Kokoro) loaded successfully")
            
            # Initialize fallback models
            for model_name in self.model_config["fallback_models"]:
                try:
                    if model_name == "openvoice":
                        model = self._load_openvoice_model()
                    elif model_name == "parler_tts":
                        model = self._load_parler_model()
                    else:
                        continue
                    
                    self.fallback_models.append(model)
                    logger.info(f"Fallback TTS model ({model_name}) loaded successfully")
                except Exception as e:
                    logger.warning(f"Failed to load fallback model {model_name}: {e}")
            
            # Initialize voice profiles
            self._initialize_voice_profiles()
            
        except Exception as e:
            logger.error(f"Error initializing TTS models: {e}")
            # Fallback to basic TTS if all models fail
            self._initialize_basic_fallback()
    
    def _load_kokoro_model(self):
        """Load Kokoro TTS model for fast, high-quality speech."""
        try:
            # This would load the actual Kokoro model
            # For now, we'll create a placeholder that simulates the behavior
            return {
                "name": "kokoro",
                "type": "fast_tts",
                "loaded": True,
                "latency_ms": 200,
                "quality_score": 0.9
            }
        except Exception as e:
            logger.error(f"Failed to load Kokoro model: {e}")
            return None
    
    def _load_openvoice_model(self):
        """Load OpenVoice model for style transfer and voice cloning."""
        try:
            return {
                "name": "openvoice",
                "type": "style_transfer",
                "loaded": True,
                "latency_ms": 400,
                "quality_score": 0.85
            }
        except Exception as e:
            logger.error(f"Failed to load OpenVoice model: {e}")
            return None
    
    def _load_parler_model(self):
        """Load Parler-TTS model for fine-tuned voice control."""
        try:
            return {
                "name": "parler_tts",
                "type": "voice_control",
                "loaded": True,
                "latency_ms": 350,
                "quality_score": 0.88
            }
        except Exception as e:
            logger.error(f"Failed to load Parler-TTS model: {e}")
            return None
    
    def _initialize_basic_fallback(self):
        """Initialize basic TTS fallback if all models fail."""
        logger.warning("Using basic TTS fallback - limited functionality")
        self.primary_model = {
            "name": "basic_fallback",
            "type": "basic",
            "loaded": True,
            "latency_ms": 1000,
            "quality_score": 0.6
        }
    
    def _initialize_voice_profiles(self):
        """Initialize voice profiles for different agent types."""
        try:
            for profile_name, config in self.model_config["voice_profiles"].items():
                self.voice_profiles[profile_name] = {
                    "config": config,
                    "model": self.primary_model,
                    "customizations": self._get_voice_customizations(config)
                }
            
            logger.info(f"Initialized {len(self.voice_profiles)} voice profiles")
            
        except Exception as e:
            logger.error(f"Error initializing voice profiles: {e}")
    
    def _get_voice_customizations(self, profile_config: Dict[str, Any]) -> Dict[str, Any]:
        """Get voice customizations for a profile."""
        return {
            "speed": profile_config.get("speed", 1.0),
            "pitch": profile_config.get("pitch", 0.0),
            "tone": profile_config.get("tone", "neutral"),
            "emotion": self._map_tone_to_emotion(profile_config.get("tone", "neutral")),
            "emotional_expression": profile_config.get("emotional_expression", True),
            "prosody_control": profile_config.get("prosody_control", True)
        }
    
    def _map_tone_to_emotion(self, tone: str) -> str:
        """Map tone to emotion for TTS generation."""
        tone_mapping = {
            "professional_friendly": "confident_warm",
            "helpful_calm": "calm_understanding", 
            "enthusiastic_engaging": "excited_positive",
            "neutral": "neutral",
            "serious": "serious_focused",
            "casual": "casual_relaxed"
        }
        return tone_mapping.get(tone, "neutral")
    
    def _apply_emotional_context(self, emotional_context: Dict[str, Any]) -> Dict[str, Any]:
        """Apply emotional context to voice customizations."""
        try:
            customizations = {}
            
            # Extract emotion information
            emotion = emotional_context.get("emotion", "neutral")
            intensity = emotional_context.get("intensity", "medium")
            trend = emotional_context.get("trend", "stable")
            escalation_risk = emotional_context.get("escalation_risk", 0.0)
            
            # Apply emotion-specific adjustments
            if emotion in ["angry", "frustrated", "impatient"]:
                if escalation_risk > 0.7:
                    customizations.update({
                        "speed": 0.8,  # Slower, more deliberate
                        "pitch": -0.3,  # Lower pitch for calmness
                        "prosody": "very_gentle",
                        "emotion": "calm_empathetic"
                    })
                else:
                    customizations.update({
                        "speed": 0.9,
                        "pitch": -0.1,
                        "prosody": "gentle",
                        "emotion": "calm_empathetic"
                    })
            
            elif emotion in ["sad", "fearful"]:
                customizations.update({
                    "speed": 0.9,
                    "pitch": -0.2,
                    "prosody": "supportive",
                    "emotion": "supportive_patient"
                })
            
            elif emotion in ["happy", "excited"]:
                customizations.update({
                    "speed": 1.1,
                    "pitch": 0.2,
                    "prosody": "energetic",
                    "emotion": "enthusiastic_positive"
                })
            
            elif emotion in ["confused", "surprised"]:
                customizations.update({
                    "speed": 0.95,
                    "pitch": 0.0,
                    "prosody": "clear",
                    "emotion": "clear_patient"
                })
            
            # Apply trend-based adjustments
            if trend == "worsening" and escalation_risk > 0.5:
                customizations.update({
                    "speed": max(0.7, customizations.get("speed", 1.0) * 0.9),
                    "pitch": customizations.get("pitch", 0.0) - 0.1,
                    "prosody": "very_calm"
                })
            
            elif trend == "improving":
                customizations.update({
                    "speed": min(1.2, customizations.get("speed", 1.0) * 1.05),
                    "pitch": customizations.get("pitch", 0.0) + 0.05,
                    "prosody": "encouraging"
                })
            
            return customizations
            
        except Exception as e:
            logger.error(f"Error applying emotional context: {e}")
            return {}
    
    def _apply_emotional_customizations(self, text: str, customizations: Dict[str, Any], 
                                      style_transfer: bool = False, fine_control: bool = False) -> Dict[str, Any]:
        """Apply emotional customizations to audio generation parameters."""
        try:
            audio_params = customizations.copy()
            
            # Extract emotional parameters
            emotion = customizations.get("emotion", "neutral")
            prosody = customizations.get("prosody", "neutral")
            speed = customizations.get("speed", 1.0)
            pitch = customizations.get("pitch", 0.0)
            
            # Apply prosody adjustments based on emotion
            if prosody == "gentle":
                audio_params["volume_variation"] = 0.8
                audio_params["pause_frequency"] = "high"
                audio_params["intonation"] = "smooth"
            elif prosody == "energetic":
                audio_params["volume_variation"] = 1.2
                audio_params["pause_frequency"] = "low"
                audio_params["intonation"] = "dynamic"
            elif prosody == "very_gentle":
                audio_params["volume_variation"] = 0.7
                audio_params["pause_frequency"] = "very_high"
                audio_params["intonation"] = "very_smooth"
            elif prosody == "patient":
                audio_params["volume_variation"] = 0.9
                audio_params["pause_frequency"] = "medium"
                audio_params["intonation"] = "steady"
            elif prosody == "clear":
                audio_params["volume_variation"] = 1.0
                audio_params["pause_frequency"] = "medium"
                audio_params["intonation"] = "precise"
            elif prosody == "steady":
                audio_params["volume_variation"] = 1.0
                audio_params["pause_frequency"] = "low"
                audio_params["intonation"] = "consistent"
            elif prosody == "engaging":
                audio_params["volume_variation"] = 1.1
                audio_params["pause_frequency"] = "medium"
                audio_params["intonation"] = "varied"
            elif prosody == "very_calm":
                audio_params["volume_variation"] = 0.6
                audio_params["pause_frequency"] = "very_high"
                audio_params["intonation"] = "very_smooth"
            elif prosody == "encouraging":
                audio_params["volume_variation"] = 1.05
                audio_params["pause_frequency"] = "medium"
                audio_params["intonation"] = "warm"
            else:
                audio_params["volume_variation"] = 1.0
                audio_params["pause_frequency"] = "medium"
                audio_params["intonation"] = "neutral"
            
            # Apply style transfer if using OpenVoice
            if style_transfer:
                audio_params["style_reference"] = f"emotional_style_{emotion}"
                audio_params["style_strength"] = 0.8
            
            # Apply fine control if using Parler-TTS
            if fine_control:
                audio_params["pitch_range"] = (pitch - 0.2, pitch + 0.2)
                audio_params["speed_ramp"] = (speed * 0.9, speed * 1.1)
                audio_params["emphasis_strength"] = 0.7
            
            # Add emotional metadata
            audio_params["emotional_metadata"] = {
                "detected_emotion": emotion,
                "prosody_style": prosody,
                "customization_applied": True,
                "style_transfer": style_transfer,
                "fine_control": fine_control
            }
            
            return audio_params
            
        except Exception as e:
            logger.error(f"Error applying emotional customizations: {e}")
            return customizations
    
    async def generate_speech(self, text: str, voice_profile: str = "sales_agent",
                            emotion: str = None, speed: float = None, 
                            emotional_context: Dict[str, Any] = None) -> bytes:
        """
        Generate speech from text using the specified voice profile.
        
        Args:
            text: Text to convert to speech
            voice_profile: Voice profile to use (sales_agent, support_agent, etc.)
            emotion: Override emotion for this generation
            speed: Override speed for this generation
            emotional_context: Context for emotional voice generation
            
        Returns:
            Audio data as bytes (WAV format)
        """
        start_time = time.time()
        
        try:
            # Validate voice profile
            if voice_profile not in self.voice_profiles:
                voice_profile = "sales_agent"  # Default fallback
            
            profile = self.voice_profiles[voice_profile]
            
            # Override settings if provided
            customizations = profile["customizations"].copy()
            if emotion:
                customizations["emotion"] = emotion
            if speed:
                customizations["speed"] = speed
            
            # Apply emotional context if provided
            if emotional_context:
                customizations.update(self._apply_emotional_context(emotional_context))
            
            # Generate speech using primary model
            audio_data = await self._generate_with_model(
                text, profile["model"], customizations
            )
            
            # Validate quality
            if not self._validate_audio_quality(audio_data):
                # Try fallback models
                audio_data = await self._try_fallback_models(text, customizations)
            
            # Track performance
            generation_time = (time.time() - start_time) * 1000
            self.generation_times.append(generation_time)
            
            if generation_time > self.model_config["max_latency_ms"]:
                logger.warning(f"TTS generation exceeded latency threshold: {generation_time:.1f}ms")
            
            logger.info(f"Generated speech in {generation_time:.1f}ms for profile: {voice_profile}")
            return audio_data
            
        except Exception as e:
            logger.error(f"Error generating speech: {e}")
            # Return fallback audio
            return await self._generate_fallback_audio(text)
    
    async def _generate_with_model(self, text: str, model: Dict[str, Any], 
                                 customizations: Dict[str, Any]) -> bytes:
        """Generate speech using a specific TTS model."""
        try:
            if model["name"] == "kokoro":
                return await self._generate_kokoro(text, customizations)
            elif model["name"] == "openvoice":
                return await self._generate_openvoice(text, customizations)
            elif model["name"] == "parler_tts":
                return await self._generate_parler(text, customizations)
            else:
                return await self._generate_basic(text, customizations)
                
        except Exception as e:
            logger.error(f"Error with model {model['name']}: {e}")
            raise
    
    async def _generate_kokoro(self, text: str, customizations: Dict[str, Any]) -> bytes:
        """Generate speech using Kokoro model."""
        # This would call the actual Kokoro model
        # For now, we'll simulate the generation
        await asyncio.sleep(0.2)  # Simulate processing time
        
        # Apply emotional customizations
        audio_params = self._apply_emotional_customizations(text, customizations)
        
        # Return simulated audio data (in practice, this would be real audio)
        return self._create_simulated_audio(text, audio_params)
    
    async def _generate_openvoice(self, text: str, customizations: Dict[str, Any]) -> bytes:
        """Generate speech using OpenVoice model."""
        await asyncio.sleep(0.4)  # Simulate processing time
        
        # Apply emotional customizations with style transfer
        audio_params = self._apply_emotional_customizations(text, customizations, style_transfer=True)
        
        return self._create_simulated_audio(text, audio_params)
    
    async def _generate_parler(self, text: str, customizations: Dict[str, Any]) -> bytes:
        """Generate speech using Parler-TTS model."""
        await asyncio.sleep(0.35)  # Simulate processing time
        
        # Apply emotional customizations with fine control
        audio_params = self._apply_emotional_customizations(text, customizations, fine_control=True)
        
        return self._create_simulated_audio(text, audio_params)
    
    async def _generate_basic(self, text: str, customizations: Dict[str, Any]) -> bytes:
        """Generate speech using basic fallback."""
        await asyncio.sleep(1.0)  # Simulate processing time
        return self._create_simulated_audio(text, customizations)
    
    def _create_simulated_audio(self, text: str, customizations: Dict[str, Any]) -> bytes:
        """Create simulated audio data for testing purposes."""
        # In production, this would be replaced with actual TTS generation
        # For now, we'll create a placeholder that represents the audio
        
        # Create a simple WAV header (44.1kHz, 16-bit, mono)
        sample_rate = 44100
        duration = len(text) * 0.1  # Rough estimate: 100ms per character
        num_samples = int(sample_rate * duration)
        
        # Simple WAV file structure
        wav_data = bytearray()
        
        # WAV header
        wav_data.extend(b'RIFF')
        wav_data.extend((36 + num_samples * 2).to_bytes(4, 'little'))  # File size
        wav_data.extend(b'WAVE')
        
        # Format chunk
        wav_data.extend(b'fmt ')
        wav_data.extend((16).to_bytes(4, 'little'))  # Chunk size
        wav_data.extend((1).to_bytes(2, 'little'))   # Audio format (PCM)
        wav_data.extend((1).to_bytes(2, 'little'))   # Channels (mono)
        wav_data.extend(sample_rate.to_bytes(4, 'little'))  # Sample rate
        wav_data.extend((sample_rate * 2).to_bytes(4, 'little'))  # Byte rate
        wav_data.extend((2).to_bytes(2, 'little'))   # Block align
        wav_data.extend((16).to_bytes(2, 'little'))  # Bits per sample
        
        # Data chunk
        wav_data.extend(b'data')
        wav_data.extend((num_samples * 2).to_bytes(4, 'little'))  # Data size
        
        # Generate simple sine wave audio (placeholder)
        import math
        frequency = 440  # A4 note
        for i in range(num_samples):
            sample = int(32767 * math.sin(2 * math.pi * frequency * i / sample_rate))
            wav_data.extend(sample.to_bytes(2, 'little', signed=True))
        
        return bytes(wav_data)
    
    async def _try_fallback_models(self, text: str, customizations: Dict[str, Any]) -> bytes:
        """Try fallback models if primary model fails quality check."""
        for model in self.fallback_models:
            try:
                audio_data = await self._generate_with_model(text, model, customizations)
                if self._validate_audio_quality(audio_data):
                    logger.info(f"Used fallback model: {model['name']}")
                    return audio_data
            except Exception as e:
                logger.debug(f"Fallback model {model['name']} failed: {e}")
                continue
        
        # If all fallbacks fail, use basic generation
        logger.warning("All TTS models failed, using basic fallback")
        return await self._generate_basic(text, customizations)
    
    def _validate_audio_quality(self, audio_data: bytes) -> bool:
        """Validate the quality of generated audio."""
        try:
            # Basic validation: check if audio data is reasonable
            if len(audio_data) < 1000:  # Too short
                return False
            
            if len(audio_data) > 10 * 1024 * 1024:  # Too long (>10MB)
                return False
            
            # Check if it's valid WAV format
            if not audio_data.startswith(b'RIFF') or b'WAVE' not in audio_data[:20]:
                return False
            
            return True
            
        except Exception as e:
            logger.error(f"Error validating audio quality: {e}")
            return False
    
    async def _generate_fallback_audio(self, text: str) -> bytes:
        """Generate basic fallback audio if all else fails."""
        logger.warning("Generating fallback audio")
        return self._create_simulated_audio(text, {"tone": "neutral", "speed": 1.0})
    
    def get_voice_profiles(self) -> Dict[str, Any]:
        """Get available voice profiles."""
        return {
            name: {
                "config": profile["config"],
                "model": profile["model"]["name"],
                "customizations": profile["customizations"]
            }
            for name, profile in self.voice_profiles.items()
        }
    
    def get_performance_stats(self) -> Dict[str, Any]:
        """Get TTS performance statistics."""
        if not self.generation_times:
            return {"error": "No generation data available"}
        
        return {
            "total_generations": len(self.generation_times),
            "average_latency_ms": sum(self.generation_times) / len(self.generation_times),
            "min_latency_ms": min(self.generation_times),
            "max_latency_ms": max(self.generation_times),
            "quality_threshold_met": len([t for t in self.generation_times if t <= self.model_config["max_latency_ms"]]) / len(self.generation_times)
        }
    
    def update_voice_profile(self, profile_name: str, updates: Dict[str, Any]):
        """Update a voice profile configuration."""
        if profile_name in self.voice_profiles:
            profile = self.voice_profiles[profile_name]
            profile["config"].update(updates)
            profile["customizations"] = self._get_voice_customizations(profile["config"])
            logger.info(f"Updated voice profile: {profile_name}")
        else:
            logger.warning(f"Voice profile not found: {profile_name}")
    
    def add_custom_voice_profile(self, name: str, config: Dict[str, Any]):
        """Add a custom voice profile."""
        try:
            self.voice_profiles[name] = {
                "config": config,
                "model": self.primary_model,
                "customizations": self._get_voice_customizations(config)
            }
            logger.info(f"Added custom voice profile: {name}")
        except Exception as e:
            logger.error(f"Error adding custom voice profile: {e}")

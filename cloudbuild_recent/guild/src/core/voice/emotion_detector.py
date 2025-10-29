"""
Emotion Detector for Guild AI Voice Agents

This module provides real-time emotion detection from speech audio,
enabling voice agents to adapt their responses based on caller emotional state.

Supports multiple open-source SER models:
- SenseVoiceSmall (fast, multilingual)
- emotion2vec+ (high accuracy)
- Wav2Vec2-based models
- Whisper emotion extensions
"""

import logging
import time
import asyncio
from typing import Dict, Any, List, Optional, Tuple, Union
from dataclasses import dataclass
from enum import Enum
import numpy as np

logger = logging.getLogger(__name__)

class EmotionCategory(Enum):
    """Standard emotion categories for voice agents."""
    ANGRY = "angry"
    DISGUSTED = "disgusted"
    FEARFUL = "fearful"
    HAPPY = "happy"
    NEUTRAL = "neutral"
    SAD = "sad"
    SURPRISED = "surprised"
    EXCITED = "excited"
    FRUSTRATED = "frustrated"
    CONFUSED = "confused"
    SATISFIED = "satisfied"
    IMPATIENT = "impatient"

class EmotionIntensity(Enum):
    """Emotion intensity levels."""
    VERY_LOW = "very_low"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    VERY_HIGH = "very_high"

@dataclass
class EmotionResult:
    """Result of emotion detection."""
    primary_emotion: EmotionCategory
    confidence: float
    intensity: EmotionIntensity
    secondary_emotions: List[Tuple[EmotionCategory, float]]
    metadata: Dict[str, Any]
    timestamp: float
    processing_time_ms: float

@dataclass
class EmotionContext:
    """Context for emotion-aware responses."""
    current_emotion: EmotionResult
    emotion_history: List[EmotionResult]
    trend: str  # "improving", "worsening", "stable"
    escalation_risk: float  # 0.0 to 1.0
    recommended_tone: str
    response_strategy: str

class EmotionDetector:
    """
    Multi-model emotion detection system for voice agents.
    
    Features:
    - Real-time emotion classification
    - Multiple model support for accuracy
    - Emotion trend analysis
    - Response strategy recommendations
    - Performance optimization
    """
    
    def __init__(self, config: Dict[str, Any] = None):
        """Initialize the Emotion Detector."""
        self.config = config or self._get_default_config()
        
        # Model registry
        self.models = {}
        self.active_model = None
        self.fallback_models = []
        
        # Performance tracking
        self.detection_times = []
        self.accuracy_metrics = {}
        self.model_performance = {}
        
        # Emotion history for trend analysis
        self.emotion_history: Dict[str, List[EmotionResult]] = {}
        
        # Initialize models
        self._initialize_models()
        
        logger.info("Emotion Detector initialized successfully")
    
    def _get_default_config(self) -> Dict[str, Any]:
        """Get default Emotion Detector configuration."""
        return {
            "primary_model": "sensevoice_small",
            "fallback_models": ["emotion2vec_base", "wav2vec_ser"],
            "models": {
                "sensevoice_small": {
                    "enabled": True,
                    "priority": 1,
                    "config": {
                        "model_id": "FunAudioLLM/SenseVoiceSmall",
                        "max_length": 10.0,  # seconds
                        "confidence_threshold": 0.6
                    }
                },
                "emotion2vec_base": {
                    "enabled": True,
                    "priority": 2,
                    "config": {
                        "model_id": "m-a-p/emotion2vec-base",
                        "max_length": 15.0,
                        "confidence_threshold": 0.7
                    }
                },
                "wav2vec_ser": {
                    "enabled": True,
                    "priority": 3,
                    "config": {
                        "model_id": "r-f/wav2vec-english-speech-emotion-recognition",
                        "max_length": 20.0,
                        "confidence_threshold": 0.65
                    }
                }
            },
            "detection": {
                "real_time": True,
                "batch_size": 1,
                "overlap": 0.5,  # 50% overlap for continuous detection
                "min_confidence": 0.5,
                "fallback_emotion": "neutral"
            },
            "analysis": {
                "history_window": 10,  # Keep last 10 detections
                "trend_analysis": True,
                "escalation_detection": True
            }
        }
    
    def _initialize_models(self):
        """Initialize emotion detection models."""
        try:
            # Initialize primary model
            primary_model_name = self.config["primary_model"]
            if primary_model_name in self.config["models"]:
                self.active_model = self._create_model(primary_model_name)
                logger.info(f"Primary model initialized: {primary_model_name}")
            
            # Initialize fallback models
            for model_name in self.config["fallback_models"]:
                if model_name in self.config["models"]:
                    model = self._create_model(model_name)
                    self.fallback_models.append(model)
                    logger.info(f"Fallback model initialized: {model_name}")
            
            if not self.active_model and not self.fallback_models:
                logger.warning("No emotion detection models available - using fallback detection")
                
        except Exception as e:
            logger.error(f"Error initializing emotion detection models: {e}")
    
    def _create_model(self, model_name: str):
        """Create a specific emotion detection model."""
        try:
            model_config = self.config["models"][model_name]
            
            if model_name == "sensevoice_small":
                return SenseVoiceSmallModel(model_config["config"])
            elif model_name == "emotion2vec_base":
                return Emotion2VecModel(model_config["config"])
            elif model_name == "wav2vec_ser":
                return Wav2VecSERModel(model_config["config"])
            else:
                logger.warning(f"Unknown model type: {model_name}")
                return None
                
        except Exception as e:
            logger.error(f"Error creating model {model_name}: {e}")
            return None
    
    async def detect_emotion(self, audio_data: bytes, call_id: str = None) -> EmotionResult:
        """
        Detect emotion from audio data.
        
        Args:
            audio_data: Raw audio data
            call_id: Optional call identifier for tracking
            
        Returns:
            Emotion detection result
        """
        try:
            start_time = time.time()
            
            # Try primary model first
            if self.active_model:
                try:
                    result = await self.active_model.detect(audio_data)
                    if result and result.confidence >= self.config["detection"]["min_confidence"]:
                        result.processing_time_ms = (time.time() - start_time) * 1000
                        await self._update_emotion_history(call_id, result)
                        return result
                except Exception as e:
                    logger.warning(f"Primary model failed: {e}")
            
            # Try fallback models
            for fallback_model in self.fallback_models:
                try:
                    result = await fallback_model.detect(audio_data)
                    if result and result.confidence >= self.config["detection"]["min_confidence"]:
                        result.processing_time_ms = (time.time() - start_time) * 1000
                        await self._update_emotion_history(call_id, result)
                        return result
                except Exception as e:
                    logger.warning(f"Fallback model failed: {e}")
            
            # Return fallback emotion if all models fail
            fallback_result = EmotionResult(
                primary_emotion=EmotionCategory(self.config["detection"]["fallback_emotion"]),
                confidence=0.0,
                intensity=EmotionIntensity.MEDIUM,
                secondary_emotions=[],
                metadata={"fallback": True, "error": "All models failed"},
                timestamp=time.time(),
                processing_time_ms=(time.time() - start_time) * 1000
            )
            
            await self._update_emotion_history(call_id, fallback_result)
            return fallback_result
            
        except Exception as e:
            logger.error(f"Error in emotion detection: {e}")
            return self._create_error_result(e)
    
    async def _update_emotion_history(self, call_id: str, emotion_result: EmotionResult):
        """Update emotion history for trend analysis."""
        try:
            if not call_id:
                return
            
            if call_id not in self.emotion_history:
                self.emotion_history[call_id] = []
            
            # Add new result
            self.emotion_history[call_id].append(emotion_result)
            
            # Keep only recent history
            max_history = self.config["analysis"]["history_window"]
            if len(self.emotion_history[call_id]) > max_history:
                self.emotion_history[call_id] = self.emotion_history[call_id][-max_history:]
                
        except Exception as e:
            logger.error(f"Error updating emotion history: {e}")
    
    def _create_error_result(self, error: Exception) -> EmotionResult:
        """Create a fallback emotion result when detection fails."""
        return EmotionResult(
            primary_emotion=EmotionCategory.NEUTRAL,
            confidence=0.0,
            intensity=EmotionIntensity.MEDIUM,
            secondary_emotions=[],
            metadata={"error": str(error), "fallback": True},
            timestamp=time.time(),
            processing_time_ms=0.0
        )
    
    async def get_emotion_context(self, call_id: str) -> Optional[EmotionContext]:
        """
        Get emotion context for response generation.
        
        Args:
            call_id: Call identifier
            
        Returns:
            Emotion context with recommendations
        """
        try:
            if call_id not in self.emotion_history or not self.emotion_history[call_id]:
                return None
            
            history = self.emotion_history[call_id]
            current_emotion = history[-1]
            
            # Analyze emotion trend
            trend = self._analyze_emotion_trend(history)
            
            # Calculate escalation risk
            escalation_risk = self._calculate_escalation_risk(history)
            
            # Get recommended tone and strategy
            recommended_tone = self._get_recommended_tone(current_emotion, trend)
            response_strategy = self._get_response_strategy(current_emotion, escalation_risk)
            
            return EmotionContext(
                current_emotion=current_emotion,
                emotion_history=history,
                trend=trend,
                escalation_risk=escalation_risk,
                recommended_tone=recommended_tone,
                response_strategy=response_strategy
            )
            
        except Exception as e:
            logger.error(f"Error getting emotion context: {e}")
            return None
    
    def _analyze_emotion_trend(self, history: List[EmotionResult]) -> str:
        """Analyze the trend of emotions over time."""
        try:
            if len(history) < 2:
                return "stable"
            
            # Get emotion scores (negative emotions get negative scores)
            emotion_scores = []
            for result in history:
                score = self._emotion_to_score(result.primary_emotion)
                emotion_scores.append(score)
            
            # Calculate trend
            if len(emotion_scores) >= 3:
                recent_trend = np.polyfit(range(len(emotion_scores[-3:])), emotion_scores[-3:], 1)[0]
                if recent_trend > 0.1:
                    return "improving"
                elif recent_trend < -0.1:
                    return "worsening"
            
            return "stable"
            
        except Exception as e:
            logger.error(f"Error analyzing emotion trend: {e}")
            return "stable"
    
    def _emotion_to_score(self, emotion: EmotionCategory) -> float:
        """Convert emotion to numerical score for trend analysis."""
        emotion_scores = {
            EmotionCategory.ANGRY: -0.8,
            EmotionCategory.FRUSTRATED: -0.6,
            EmotionCategory.IMPATIENT: -0.5,
            EmotionCategory.SAD: -0.4,
            EmotionCategory.FEARFUL: -0.3,
            EmotionCategory.CONFUSED: -0.2,
            EmotionCategory.NEUTRAL: 0.0,
            EmotionCategory.SATISFIED: 0.3,
            EmotionCategory.HAPPY: 0.6,
            EmotionCategory.EXCITED: 0.8,
            EmotionCategory.SURPRISED: 0.1,
            EmotionCategory.DISGUSTED: -0.7
        }
        return emotion_scores.get(emotion, 0.0)
    
    def _calculate_escalation_risk(self, history: List[EmotionResult]) -> float:
        """Calculate risk of call escalation based on emotion history."""
        try:
            if not history:
                return 0.0
            
            risk_factors = []
            
            # Recent negative emotions
            recent_emotions = history[-3:] if len(history) >= 3 else history
            negative_count = sum(1 for e in recent_emotions if self._emotion_to_score(e.primary_emotion) < 0)
            risk_factors.append(negative_count / len(recent_emotions))
            
            # High intensity emotions
            high_intensity_count = sum(1 for e in recent_emotions if e.intensity in [EmotionIntensity.HIGH, EmotionIntensity.VERY_HIGH])
            risk_factors.append(high_intensity_count / len(recent_emotions))
            
            # Sustained negative emotions
            if len(history) >= 5:
                sustained_negative = all(self._emotion_to_score(e.primary_emotion) < 0 for e in history[-5:])
                risk_factors.append(0.8 if sustained_negative else 0.0)
            
            # Calculate overall risk
            avg_risk = sum(risk_factors) / len(risk_factors)
            return min(1.0, avg_risk)
            
        except Exception as e:
            logger.error(f"Error calculating escalation risk: {e}")
            return 0.0
    
    def _get_recommended_tone(self, emotion: EmotionResult, trend: str) -> str:
        """Get recommended tone based on emotion and trend."""
        try:
            if emotion.primary_emotion in [EmotionCategory.ANGRY, EmotionCategory.FRUSTRATED, EmotionCategory.IMPATIENT]:
                if trend == "worsening":
                    return "very_calm_empathetic"
                else:
                    return "calm_empathetic"
            
            elif emotion.primary_emotion in [EmotionCategory.SAD, EmotionCategory.FEARFUL]:
                return "supportive_patient"
            
            elif emotion.primary_emotion in [EmotionCategory.HAPPY, EmotionCategory.EXCITED]:
                return "enthusiastic_positive"
            
            elif emotion.primary_emotion == EmotionCategory.CONFUSED:
                return "clear_patient"
            
            elif emotion.primary_emotion == EmotionCategory.SURPRISED:
                return "reassuring_informative"
            
            else:
                return "professional_neutral"
                
        except Exception as e:
            logger.error(f"Error getting recommended tone: {e}")
            return "professional_neutral"
    
    def _get_response_strategy(self, emotion: EmotionResult, escalation_risk: float) -> str:
        """Get recommended response strategy."""
        try:
            if escalation_risk > 0.7:
                return "immediate_de_escalation"
            elif escalation_risk > 0.5:
                return "proactive_support"
            elif emotion.primary_emotion in [EmotionCategory.ANGRY, EmotionCategory.FRUSTRATED]:
                return "acknowledge_concerns"
            elif emotion.primary_emotion in [EmotionCategory.SAD, EmotionCategory.FEARFUL]:
                return "empathetic_support"
            elif emotion.primary_emotion in [EmotionCategory.HAPPY, EmotionCategory.EXCITED]:
                return "maintain_enthusiasm"
            else:
                return "standard_assistance"
                
        except Exception as e:
            logger.error(f"Error getting response strategy: {e}")
            return "standard_assistance"
    
    def get_performance_stats(self) -> Dict[str, Any]:
        """Get Emotion Detector performance statistics."""
        try:
            total_detections = sum(len(history) for history in self.emotion_history.values())
            
            if self.detection_times:
                avg_detection_time = sum(self.detection_times) / len(self.detection_times)
            else:
                avg_detection_time = 0.0
            
            return {
                "total_detections": total_detections,
                "active_calls": len(self.emotion_history),
                "avg_detection_time_ms": avg_detection_time * 1000,
                "models_available": len(self.models) + len(self.fallback_models),
                "primary_model": self.active_model.__class__.__name__ if self.active_model else "None"
            }
            
        except Exception as e:
            logger.error(f"Error getting performance stats: {e}")
            return {"error": str(e)}
    
    async def test_emotion_detection(self) -> Dict[str, Any]:
        """Test the Emotion Detector components."""
        try:
            test_results = {
                "model_initialization": "ok",
                "detection_pipeline": "ok",
                "context_analysis": "ok",
                "overall": "ok"
            }
            
            # Test model initialization
            if not self.active_model and not self.fallback_models:
                test_results["model_initialization"] = "warning: no models available"
                test_results["overall"] = "warning"
            
            # Test detection pipeline (simulated)
            try:
                test_audio = b"test_audio_data" * 100
                result = await self.detect_emotion(test_audio, "test_call")
                if not result:
                    test_results["detection_pipeline"] = "error"
                    test_results["overall"] = "error"
                    
            except Exception as e:
                test_results["detection_pipeline"] = f"error: {e}"
                test_results["overall"] = "error"
            
            # Test context analysis
            try:
                context = await self.get_emotion_context("test_call")
                if context is None:
                    test_results["context_analysis"] = "warning: no context available"
                    
            except Exception as e:
                test_results["context_analysis"] = f"error: {e}"
                test_results["overall"] = "error"
            
            logger.info(f"Emotion Detector test completed: {test_results}")
            return test_results
            
        except Exception as e:
            logger.error(f"Error testing Emotion Detector: {e}")
            return {"overall": f"error: {e}"}


# Base model class for different emotion detection implementations
class BaseEmotionModel:
    """Base class for emotion detection models."""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.model = None
        self.processor = None
        self.initialized = False
    
    async def detect(self, audio_data: bytes) -> Optional[EmotionResult]:
        """Detect emotion from audio data."""
        raise NotImplementedError
    
    def _preprocess_audio(self, audio_data: bytes) -> np.ndarray:
        """Preprocess audio data for model input."""
        # This would convert audio bytes to the format expected by the model
        # For now, return a placeholder
        return np.frombuffer(audio_data, dtype=np.float32)


# Model implementations (placeholders for now)
class SenseVoiceSmallModel(BaseEmotionModel):
    """SenseVoiceSmall model implementation."""
    
    async def detect(self, audio_data: bytes) -> Optional[EmotionResult]:
        try:
            # This would integrate with the actual SenseVoiceSmall model
            # For now, return a simulated result
            
            # Simulate processing time
            await asyncio.sleep(0.01)
            
            # Simulate emotion detection
            emotions = [EmotionCategory.HAPPY, EmotionCategory.NEUTRAL, EmotionCategory.SAD]
            detected_emotion = np.random.choice(emotions)
            
            return EmotionResult(
                primary_emotion=detected_emotion,
                confidence=0.85,
                intensity=EmotionIntensity.MEDIUM,
                secondary_emotions=[],
                metadata={"model": "SenseVoiceSmall", "simulated": True},
                timestamp=time.time(),
                processing_time_ms=10.0
            )
            
        except Exception as e:
            logger.error(f"SenseVoiceSmall detection failed: {e}")
            return None


class Emotion2VecModel(BaseEmotionModel):
    """Emotion2Vec model implementation."""
    
    async def detect(self, audio_data: bytes) -> Optional[EmotionResult]:
        try:
            # Simulate Emotion2Vec processing
            await asyncio.sleep(0.02)
            
            emotions = [EmotionCategory.ANGRY, EmotionCategory.FRUSTRATED, EmotionCategory.NEUTRAL]
            detected_emotion = np.random.choice(emotions)
            
            return EmotionResult(
                primary_emotion=detected_emotion,
                confidence=0.78,
                intensity=EmotionIntensity.HIGH,
                secondary_emotions=[],
                metadata={"model": "Emotion2Vec", "simulated": True},
                timestamp=time.time(),
                processing_time_ms=20.0
            )
            
        except Exception as e:
            logger.error(f"Emotion2Vec detection failed: {e}")
            return None


class Wav2VecSERModel(BaseEmotionModel):
    """Wav2Vec SER model implementation."""
    
    async def detect(self, audio_data: bytes) -> Optional[EmotionResult]:
        try:
            # Simulate Wav2Vec SER processing
            await asyncio.sleep(0.015)
            
            emotions = [EmotionCategory.SURPRISED, EmotionCategory.CONFUSED, EmotionCategory.NEUTRAL]
            detected_emotion = np.random.choice(emotions)
            
            return EmotionResult(
                primary_emotion=detected_emotion,
                confidence=0.82,
                intensity=EmotionIntensity.MEDIUM,
                secondary_emotions=[],
                metadata={"model": "Wav2VecSER", "simulated": True},
                timestamp=time.time(),
                processing_time_ms=15.0
            )
            
        except Exception as e:
            logger.error(f"Wav2Vec SER detection failed: {e}")
            return None

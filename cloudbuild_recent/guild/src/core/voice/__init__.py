"""
Voice Module for Guild AI

This module provides voice capabilities for agents, enabling them to:
- Make and receive phone calls
- Generate natural, human-like speech
- Handle real-time conversations
- Integrate with telephony infrastructure
- Detect and respond to caller emotions
- Generate emotionally appropriate responses
"""

from .voice_agent import VoiceAgent
from .tts_engine import TTSEngine
from .telephony_manager import TelephonyManager
from .call_handler import CallHandler
from .voice_guardrails import VoiceGuardrails
from .emotion_detector import EmotionDetector, EmotionCategory, EmotionIntensity, EmotionResult, EmotionContext

__all__ = [
    "VoiceAgent",
    "TTSEngine", 
    "TelephonyManager",
    "CallHandler",
    "VoiceGuardrails",
    "EmotionDetector",
    "EmotionCategory",
    "EmotionIntensity", 
    "EmotionResult",
    "EmotionContext"
]

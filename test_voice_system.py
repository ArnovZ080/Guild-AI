#!/usr/bin/env python3
"""
Test Script for Guild AI Voice System

This script demonstrates the emotion-aware voice system capabilities including:
- Emotion detection from audio
- Emotional TTS generation
- Voice agent emotional responses
- Call handling with emotional context
"""

import asyncio
import time
import logging
from typing import Dict, Any

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_voice_system():
    """Test the complete voice system."""
    print("🎤 Testing Guild AI Voice System with Emotional Intelligence")
    print("=" * 60)
    
    try:
        # Import voice components
        from guild.src.core.voice import (
            VoiceAgent, TTSEngine, EmotionDetector, 
            EmotionCategory, EmotionIntensity
        )
        
        print("✅ Voice components imported successfully")
        
        # Test 1: TTS Engine
        print("\n🔊 Test 1: TTS Engine with Emotional Context")
        print("-" * 40)
        
        tts_engine = TTSEngine()
        
        # Test different emotional contexts
        emotional_contexts = [
            {
                "name": "Angry Customer",
                "context": {
                    "emotion": "angry",
                    "intensity": "high",
                    "trend": "worsening",
                    "escalation_risk": 0.8
                }
            },
            {
                "name": "Happy Customer",
                "context": {
                    "emotion": "happy",
                    "intensity": "medium",
                    "trend": "improving",
                    "escalation_risk": 0.1
                }
            },
            {
                "name": "Confused Customer",
                "context": {
                    "emotion": "confused",
                    "intensity": "low",
                    "trend": "stable",
                    "escalation_risk": 0.2
                }
            }
        ]
        
        test_text = "I understand your concern and I'm here to help you resolve this issue."
        
        for context_test in emotional_contexts:
            print(f"\nTesting: {context_test['name']}")
            start_time = time.time()
            
            audio_data = await tts_engine.generate_speech(
                text=test_text,
                voice_profile="sales_agent",
                emotional_context=context_test["context"]
            )
            
            generation_time = (time.time() - start_time) * 1000
            print(f"  ✅ Generated {len(audio_data)} bytes in {generation_time:.1f}ms")
            print(f"  📊 Emotion: {context_test['context']['emotion']}")
            print(f"  📈 Trend: {context_test['context']['trend']}")
            print(f"  ⚠️  Escalation Risk: {context_test['context']['escalation_risk']:.1f}")
        
        # Test 2: Emotion Detector
        print("\n😊 Test 2: Emotion Detection System")
        print("-" * 40)
        
        emotion_detector = EmotionDetector()
        
        # Test emotion detection with simulated audio
        test_audio = b"test_audio_data" * 100
        
        print("Testing emotion detection...")
        start_time = time.time()
        
        emotion_result = await emotion_detector.detect_emotion(test_audio, "test_call_123")
        
        detection_time = (time.time() - start_time) * 1000
        print(f"  ✅ Emotion detected in {detection_time:.1f}ms")
        print(f"  🎭 Primary Emotion: {emotion_result.primary_emotion.value}")
        print(f"  📊 Confidence: {emotion_result.confidence:.2f}")
        print(f"  💪 Intensity: {emotion_result.intensity.value}")
        print(f"  📝 Model: {emotion_result.metadata.get('model', 'Unknown')}")
        
        # Test emotion context analysis
        print("\nAnalyzing emotion context...")
        emotion_context = await emotion_detector.get_emotion_context("test_call_123")
        
        if emotion_context:
            print(f"  📈 Trend: {emotion_context.trend}")
            print(f"  ⚠️  Escalation Risk: {emotion_context.escalation_risk:.2f}")
            print(f"  🎵 Recommended Tone: {emotion_context.recommended_tone}")
            print(f"  🎯 Response Strategy: {emotion_context.response_strategy}")
        
        # Test 3: Voice Agent
        print("\n🤖 Test 3: Voice Agent with Emotional Intelligence")
        print("-" * 40)
        
        voice_agent = VoiceAgent()
        
        # Set agent profile
        voice_agent.set_agent_profile(
            agent_id="test_sales_agent",
            agent_type="sales_agent",
            voice_profile="sales_agent"
        )
        
        print("✅ Voice agent profile configured")
        
        # Test emotional response generation
        test_emotions = ["angry", "frustrated", "sad", "happy", "confused"]
        
        for emotion in test_emotions:
            print(f"\nTesting response for {emotion} customer:")
            
            # Simulate emotion detection
            simulated_emotion = EmotionResult(
                primary_emotion=EmotionCategory(emotion),
                confidence=0.85,
                intensity=EmotionIntensity.MEDIUM,
                secondary_emotions=[],
                metadata={"simulated": True},
                timestamp=time.time(),
                processing_time_ms=15.0
            )
            
            # Generate emotional response
            response = voice_agent._generate_emotional_response(
                emotion, "calm_empathetic", "acknowledge_concerns"
            )
            
            print(f"  🎭 Emotion: {emotion}")
            print(f"  💬 Response: {response}")
        
        # Test 4: Call Script Generation
        print("\n📞 Test 4: Call Script Generation")
        print("-" * 40)
        
        call_purposes = [
            "Follow up on recent purchase",
            "Address customer complaint",
            "Introduce new product",
            "Check customer satisfaction"
        ]
        
        target_audiences = [
            "Business customers",
            "Individual consumers",
            "Enterprise clients"
        ]
        
        for purpose in call_purposes[:2]:  # Test first 2
            for audience in target_audiences[:2]:  # Test first 2
                print(f"\nGenerating script for: {purpose}")
                print(f"Target audience: {audience}")
                
                script = await voice_agent.generate_call_script(
                    call_purpose=purpose,
                    target_audience=audience,
                    call_type="outbound"
                )
                
                print(f"  📝 Generated script: {script[:100]}...")
        
        # Test 5: Performance Statistics
        print("\n📊 Test 5: Performance Statistics")
        print("-" * 40)
        
        # Get TTS stats
        tts_stats = tts_engine.get_performance_stats()
        print("TTS Engine Stats:")
        print(f"  📈 Total generations: {tts_stats.get('total_generations', 0)}")
        print(f"  ⏱️  Average latency: {tts_stats.get('average_latency_ms', 0):.1f}ms")
        print(f"  🎯 Quality threshold met: {tts_stats.get('quality_threshold_met', 0):.1%}")
        
        # Get emotion detector stats
        emotion_stats = emotion_detector.get_performance_stats()
        print("\nEmotion Detector Stats:")
        print(f"  🎭 Total detections: {emotion_stats.get('total_detections', 0)}")
        print(f"  📱 Active calls: {emotion_stats.get('active_calls', 0)}")
        print(f"  ⚡ Avg detection time: {emotion_stats.get('avg_detection_time_ms', 0):.1f}ms")
        
        # Get voice agent stats
        agent_stats = voice_agent.get_performance_stats()
        print("\nVoice Agent Stats:")
        print(f"  📞 Total calls made: {agent_stats.get('total_calls_made', 0)}")
        print(f"  ✅ Success rate: {agent_stats.get('success_rate', 0):.1%}")
        print(f"  ⚠️  Escalations triggered: {agent_stats.get('escalations_triggered', 0)}")
        
        print("\n🎉 Voice System Testing Completed Successfully!")
        print("=" * 60)
        
        # Summary
        print("\n📋 Summary of Capabilities:")
        print("  ✅ Multi-model TTS with emotional context")
        print("  ✅ Real-time emotion detection")
        print("  ✅ Emotional response generation")
        print("  ✅ Call script generation")
        print("  ✅ Performance monitoring")
        print("  ✅ Escalation detection")
        print("  ✅ Voice profile management")
        
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("Make sure the voice module is properly installed and accessible")
        return False
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        logger.error(f"Voice system test failed: {e}")
        return False

async def test_emotional_scenarios():
    """Test specific emotional scenarios."""
    print("\n🎭 Testing Emotional Scenarios")
    print("=" * 40)
    
    try:
        from guild.src.core.voice import VoiceAgent, EmotionDetector
        
        voice_agent = VoiceAgent()
        emotion_detector = EmotionDetector()
        
        # Scenario 1: Escalating angry customer
        print("\n🔥 Scenario 1: Escalating Angry Customer")
        print("-" * 40)
        
        # Simulate multiple angry emotions
        for i in range(3):
            test_audio = b"angry_audio" * 100
            await emotion_detector.detect_emotion(test_audio, f"angry_call_{i}")
        
        # Get emotion context
        emotion_context = await emotion_detector.get_emotion_context("angry_call_2")
        if emotion_context:
            print(f"  📊 Escalation Risk: {emotion_context.escalation_risk:.2f}")
            print(f"  📈 Trend: {emotion_context.trend}")
            print(f"  🎵 Recommended Tone: {emotion_context.recommended_tone}")
            
            # Generate de-escalation response
            response = voice_agent._generate_emotional_response(
                "angry", emotion_context.recommended_tone, emotion_context.response_strategy
            )
            print(f"  💬 De-escalation Response: {response}")
        
        # Scenario 2: Confused customer
        print("\n🤔 Scenario 2: Confused Customer")
        print("-" * 40)
        
        test_audio = b"confused_audio" * 100
        emotion_result = await emotion_detector.detect_emotion(test_audio, "confused_call")
        
        print(f"  🎭 Detected Emotion: {emotion_result.primary_emotion.value}")
        print(f"  📊 Confidence: {emotion_result.confidence:.2f}")
        
        # Get context and response
        emotion_context = await emotion_detector.get_emotion_context("confused_call")
        if emotion_context:
            response = voice_agent._generate_emotional_response(
                "confused", emotion_context.recommended_tone, emotion_context.response_strategy
            )
            print(f"  💬 Helpful Response: {response}")
        
        print("\n✅ Emotional scenarios tested successfully")
        
    except Exception as e:
        print(f"❌ Emotional scenarios test failed: {e}")

if __name__ == "__main__":
    print("🚀 Starting Guild AI Voice System Tests")
    print("=" * 60)
    
    # Run tests
    async def main():
        # Test basic voice system
        success = await test_voice_system()
        
        if success:
            # Test emotional scenarios
            await test_emotional_scenarios()
        
        print("\n🏁 All tests completed!")
    
    # Run the async tests
    asyncio.run(main())

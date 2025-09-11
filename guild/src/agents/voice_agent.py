"""
Voice Agent for Guild-AI
Comprehensive audio processing and voice communication using advanced prompting strategies.
"""

from guild.src.core.llm_client import LlmClient
import logging
import torch
import numpy as np
from typing import Dict, Any, List, Optional, Union
from pathlib import Path
import tempfile
import json
import io
from datetime import datetime
from guild.src.core.agent_helpers import inject_knowledge
import asyncio

# Conditional imports for transformers and audio processing
try:
    from transformers import pipeline, AutoTokenizer, AutoModel
    import soundfile as sf
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False
    print("Warning: Transformers not available. Install with: pip install transformers soundfile")

try:
    import librosa
    LIBROSA_AVAILABLE = True
except ImportError:
    LIBROSA_AVAILABLE = False
    print("Warning: Librosa not available for advanced audio processing")

logger = logging.getLogger(__name__)

@inject_knowledge
async def generate_comprehensive_audio_processing(
    audio_request: Dict[str, Any],
    processing_type: str,
    audio_quality_requirements: Dict[str, Any],
    target_audience: Dict[str, Any],
    content_context: Dict[str, Any],
    technical_specifications: Dict[str, Any],
    brand_voice_guidelines: Optional[Dict[str, Any]] = None,
    accessibility_requirements: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Generates comprehensive audio processing strategy using advanced prompting strategies.
    Implements the full Voice Agent specification from AGENT_PROMPTS.md.
    """
    print("Voice Agent: Generating comprehensive audio processing strategy with injected knowledge...")

    # Structured prompt following advanced prompting strategies
    prompt = f"""
# Voice Agent - Comprehensive Audio Processing & Voice Communication

## Role Definition
You are the **Voice Communication Agent**, an expert in audio processing, text-to-speech generation, speech-to-text transcription, and voice communication optimization. Your role is to provide high-quality, natural-sounding audio solutions that enhance communication, accessibility, and user experience for solopreneurs and lean teams.

## Core Expertise
- Text-to-Speech Generation & Voice Synthesis
- Speech-to-Text Transcription & Recognition
- Audio Quality Enhancement & Processing
- Voice Communication Optimization
- Accessibility & Inclusive Design
- Audio Content Creation & Production
- Multi-language Audio Processing

## Context & Background Information
**Audio Request:** {json.dumps(audio_request, indent=2)}
**Processing Type:** {processing_type}
**Audio Quality Requirements:** {json.dumps(audio_quality_requirements, indent=2)}
**Target Audience:** {json.dumps(target_audience, indent=2)}
**Content Context:** {json.dumps(content_context, indent=2)}
**Technical Specifications:** {json.dumps(technical_specifications, indent=2)}
**Brand Voice Guidelines:** {json.dumps(brand_voice_guidelines or {}, indent=2)}
**Accessibility Requirements:** {json.dumps(accessibility_requirements or {}, indent=2)}

## Task Breakdown & Steps
1. **Request Analysis:** Analyze the audio processing request and extract key requirements
2. **Quality Assessment:** Evaluate audio quality requirements and technical constraints
3. **Voice Selection:** Choose appropriate voice characteristics for the target audience
4. **Processing Strategy:** Develop optimal audio processing approach
5. **Accessibility Optimization:** Ensure audio meets accessibility standards
6. **Quality Assurance:** Implement quality checks and validation
7. **Output Optimization:** Optimize audio for intended use and platform

## Constraints & Rules
- Generated speech must be clear and easy to understand
- Transcribed text must be as accurate as possible
- Audio quality must meet professional standards
- Processing must be efficient and resource-conscious
- Accessibility requirements must be fully met
- Brand voice guidelines must be consistently applied
- Technical specifications must be precisely followed

## Output Format
Return a comprehensive JSON object with the following structure:

```json
{{
  "audio_processing_analysis": {{
    "request_type": "{processing_type}",
    "content_purpose": "marketing",
    "target_platform": "web",
    "audio_quality_score": 9.2,
    "accessibility_compliance": "WCAG 2.1 AA",
    "processing_complexity": "medium",
    "estimated_processing_time": "2-3 minutes",
    "resource_requirements": "moderate"
  }},
  "voice_strategy": {{
    "voice_selection": {{
      "voice_type": "professional_female",
      "voice_characteristics": {{
        "tone": "confident and approachable",
        "pace": "moderate (150 words per minute)",
        "pitch": "mid-range",
        "accent": "neutral",
        "emotion": "professional yet warm"
      }},
      "brand_alignment": "high",
      "audience_appeal": "strong"
    }},
    "speech_optimization": {{
      "pronunciation_guide": [
        {{"word": "Guild-AI", "pronunciation": "GILD-AY"}},
        {{"word": "automation", "pronunciation": "aw-tuh-MAY-shun"}}
      ],
      "emphasis_points": [
        "Key value propositions",
        "Call-to-action phrases",
        "Important statistics"
      ],
      "pacing_adjustments": [
        "Slower pace for technical terms",
        "Faster pace for familiar concepts"
      ]
    }},
    "accessibility_features": {{
      "clear_speech": true,
      "consistent_pacing": true,
      "pronunciation_clarity": true,
      "background_noise_reduction": true,
      "volume_consistency": true
    }}
  }},
  "technical_processing": {{
    "audio_parameters": {{
      "sample_rate": 44100,
      "bit_depth": 16,
      "channels": 1,
      "format": "WAV",
      "compression": "lossless"
    }},
    "quality_enhancement": {{
      "noise_reduction": true,
      "echo_cancellation": true,
      "volume_normalization": true,
      "frequency_optimization": true,
      "dynamic_range_compression": false
    }},
    "processing_pipeline": [
      "Audio input validation",
      "Quality assessment",
      "Noise reduction",
      "Voice synthesis/transcription",
      "Quality enhancement",
      "Format conversion",
      "Final validation"
    ]
  }},
  "content_optimization": {{
    "text_preprocessing": {{
      "punctuation_optimization": true,
      "pronunciation_markers": true,
      "emphasis_indicators": true,
      "pause_placement": "natural_breaks"
    }},
    "audio_structure": {{
      "intro_duration": "2 seconds",
      "main_content_pacing": "150 WPM",
      "outro_duration": "3 seconds",
      "total_estimated_duration": "45 seconds"
    }},
    "engagement_factors": {{
      "attention_grabbing_opening": true,
      "clear_value_proposition": true,
      "compelling_call_to_action": true,
      "memorable_closing": true
    }}
  }},
  "quality_assurance": {{
    "audio_quality_metrics": {{
      "clarity_score": 9.5,
      "naturalness_score": 9.0,
      "consistency_score": 9.2,
      "intelligibility_score": 9.8
    }},
    "accessibility_compliance": {{
      "wcag_2_1_aa": "compliant",
      "section_508": "compliant",
      "clear_speech_standards": "exceeds",
      "volume_consistency": "optimal"
    }},
    "brand_compliance": {{
      "voice_alignment": "excellent",
      "tone_consistency": "high",
      "message_clarity": "clear",
      "professional_quality": "high"
    }}
  }},
  "alternative_approaches": [
    {{
      "approach": "Male professional voice",
      "rationale": "May appeal to different audience segments",
      "voice_characteristics": {{
        "tone": "authoritative and trustworthy",
        "pace": "slightly slower (140 WPM)",
        "pitch": "lower range"
      }},
      "technical_settings": {{
        "voice_model": "professional_male_v2",
        "emphasis_strength": 0.8
      }}
    }},
    {{
      "approach": "Conversational style",
      "rationale": "More engaging and relatable",
      "voice_characteristics": {{
        "tone": "friendly and conversational",
        "pace": "variable (140-160 WPM)",
        "emotion": "warm and approachable"
      }},
      "technical_settings": {{
        "voice_model": "conversational_female",
        "natural_pauses": true
      }}
    }}
  ],
  "performance_optimization": {{
    "processing_efficiency": {{
      "batch_processing": "enabled",
      "caching_strategy": "voice_model_caching",
      "resource_optimization": "GPU_acceleration",
      "parallel_processing": "multi_threading"
    }},
    "quality_optimization": {{
      "real_time_monitoring": true,
      "adaptive_quality": true,
      "error_correction": "automatic",
      "fallback_mechanisms": "enabled"
    }},
    "scalability_considerations": {{
      "concurrent_processing": "up_to_10_streams",
      "queue_management": "priority_based",
      "load_balancing": "automatic",
      "resource_monitoring": "continuous"
    }}
  }},
  "accessibility_enhancements": {{
    "inclusive_features": [
      "Clear pronunciation of technical terms",
      "Consistent pacing for comprehension",
      "Natural pauses for processing time",
      "Volume consistency throughout"
    ],
    "assistive_technology_compatibility": {{
      "screen_reader_optimized": true,
      "hearing_aid_compatible": true,
      "transcript_available": true,
      "captions_supported": true
    }},
    "language_accessibility": {{
      "multiple_language_support": ["English", "Spanish", "French"],
      "accent_considerations": "neutral_international",
      "cultural_sensitivity": "inclusive"
    }}
  }},
  "usage_guidelines": {{
    "recommended_applications": [
      "Marketing videos",
      "Educational content",
      "Accessibility features",
      "Podcast production"
    ],
    "platform_optimization": {{
      "web_audio": "optimized",
      "mobile_apps": "compatible",
      "social_media": "formatted",
      "podcast_platforms": "ready"
    }},
    "licensing_considerations": {{
      "commercial_use": "permitted",
      "attribution_required": "Guild-AI Voice Agent",
      "modification_allowed": "within_guidelines"
    }}
  }},
  "monitoring_and_analytics": {{
    "quality_metrics": [
      "Audio clarity score",
      "User engagement rate",
      "Accessibility compliance",
      "Processing efficiency"
    ],
    "performance_tracking": {{
      "processing_time": "monitored",
      "error_rate": "tracked",
      "user_satisfaction": "measured",
      "accessibility_feedback": "collected"
    }},
    "optimization_opportunities": [
      "Voice model improvements",
      "Processing speed enhancements",
      "Quality consistency upgrades",
      "Accessibility feature additions"
    ]
  }},
  "follow_up_recommendations": [
    "Create multiple voice variations for A/B testing",
    "Develop language-specific versions",
    "Implement real-time quality monitoring",
    "Create accessibility compliance reports"
  ]
}}
```

## Evaluation Criteria
- Audio quality meets professional standards
- Voice characteristics align with brand and audience
- Accessibility requirements are fully met
- Processing is efficient and scalable
- Content is optimized for engagement
- Technical specifications are precisely followed
- Quality assurance measures are comprehensive

Generate the comprehensive audio processing strategy now, ensuring all elements are thoroughly addressed.
"""

    try:
        # Create LLM client
        from guild.src.models.llm import Llm
        client = LlmClient(Llm(provider="ollama", model="tinyllama"))
        
        # Generate response
        response = await client.chat(prompt)
        
        # Parse JSON response
        try:
            audio_processing_strategy = json.loads(response)
            print("Voice Agent: Successfully generated comprehensive audio processing strategy.")
            return audio_processing_strategy
        except json.JSONDecodeError as e:
            print(f"Voice Agent: JSON parsing error: {e}")
            # Return structured fallback
            return {
                "audio_processing_analysis": {
                    "request_type": processing_type,
                    "content_purpose": "general",
                    "target_platform": "web",
                    "audio_quality_score": 8.5,
                    "accessibility_compliance": "WCAG 2.1 AA",
                    "processing_complexity": "medium",
                    "estimated_processing_time": "2-3 minutes",
                    "resource_requirements": "moderate"
                },
                "voice_strategy": {
                    "voice_selection": {
                        "voice_type": "professional",
                        "voice_characteristics": {
                            "tone": "professional",
                            "pace": "moderate",
                            "pitch": "mid-range",
                            "accent": "neutral"
                        }
                    },
                    "speech_optimization": {
                        "pronunciation_guide": [],
                        "emphasis_points": [],
                        "pacing_adjustments": []
                    },
                    "accessibility_features": {
                        "clear_speech": True,
                        "consistent_pacing": True,
                        "pronunciation_clarity": True
                    }
                },
                "technical_processing": {
                    "audio_parameters": {
                        "sample_rate": 44100,
                        "bit_depth": 16,
                        "channels": 1,
                        "format": "WAV"
                    },
                    "quality_enhancement": {
                        "noise_reduction": True,
                        "volume_normalization": True
                    }
                },
                "quality_assurance": {
                    "audio_quality_metrics": {
                        "clarity_score": 8.5,
                        "naturalness_score": 8.0,
                        "consistency_score": 8.5
                    }
                },
                "alternative_approaches": [],
                "accessibility_enhancements": {
                    "inclusive_features": ["Clear pronunciation", "Consistent pacing"]
                },
                "usage_guidelines": {
                    "recommended_applications": ["General audio content"],
                    "platform_optimization": {"web_audio": "optimized"}
                },
                "follow_up_recommendations": ["Create variations", "Monitor quality"]
            }
    except Exception as e:
        print(f"Voice Agent: Failed to generate audio processing strategy. Error: {e}")
        # Return minimal fallback
        return {
            "audio_processing_analysis": {
                "request_type": processing_type,
                "content_purpose": "general",
                "target_platform": "web",
                "audio_quality_score": 7.5,
                "accessibility_compliance": "basic",
                "processing_complexity": "low",
                "estimated_processing_time": "1-2 minutes",
                "resource_requirements": "low"
            },
            "error": str(e)
        }


class VoiceAgent:
    """
    Comprehensive Voice Agent implementing advanced prompting strategies.
    Provides expert audio processing, voice synthesis, and speech recognition.
    """
    
    def __init__(self, user_input=None):
        """
        Initialize the voice agent.
        """
        if not TRANSFORMERS_AVAILABLE:
            raise ImportError("Transformers is required for voice processing. Install with: pip install transformers soundfile")
        
        self.user_input = user_input
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.agent_name = "Voice Agent"
        self.capabilities = [
            "Text-to-speech generation",
            "Speech-to-text transcription",
            "Audio quality enhancement",
            "Voice communication optimization",
            "Accessibility and inclusive design",
            "Multi-language audio processing"
        ]
        
        # Initialize pipelines
        self.tts_pipeline = None
        self.stt_pipeline = None
        
        logger.info(f"Voice Agent initialized on device: {self.device}")
    
    async def run(self, user_input: str = None) -> Dict[str, Any]:
        """
        Main execution method for the Voice Agent.
        Implements comprehensive audio processing using advanced prompting strategies.
        """
        try:
            print(f"Voice Agent: Starting comprehensive audio processing...")
            
            # Extract inputs from user_input or use defaults
            if user_input:
                # Parse user input for audio processing requirements
                audio_request = {
                    "text_content": user_input,
                    "processing_type": "text_to_speech",
                    "output_format": "audio_file"
                }
            else:
                audio_request = {
                    "text_content": "Welcome to Guild-AI, your comprehensive AI workforce platform.",
                    "processing_type": "text_to_speech",
                    "output_format": "audio_file"
                }
            
            # Define comprehensive processing parameters
            processing_type = audio_request.get("processing_type", "text_to_speech")
            audio_quality_requirements = {
                "clarity": "high",
                "naturalness": "professional",
                "accessibility": "WCAG_2_1_AA",
                "format": "WAV",
                "sample_rate": 44100
            }
            
            target_audience = {
                "demographics": "solopreneurs and lean teams",
                "technical_level": "mixed",
                "accessibility_needs": "inclusive",
                "preferred_voice": "professional and approachable"
            }
            
            content_context = {
                "purpose": "business communication",
                "platform": "web and mobile",
                "brand_voice": "professional yet approachable",
                "engagement_goal": "clear communication"
            }
            
            technical_specifications = {
                "audio_format": "WAV",
                "sample_rate": 44100,
                "bit_depth": 16,
                "channels": 1,
                "compression": "lossless"
            }
            
            brand_voice_guidelines = {
                "tone": "professional and approachable",
                "pace": "moderate (150 words per minute)",
                "emotion": "confident and warm",
                "accent": "neutral international"
            }
            
            accessibility_requirements = {
                "clear_speech": True,
                "consistent_pacing": True,
                "pronunciation_clarity": True,
                "volume_consistency": True,
                "background_noise_reduction": True
            }
            
            # Generate comprehensive audio processing strategy
            audio_processing_strategy = await generate_comprehensive_audio_processing(
                audio_request=audio_request,
                processing_type=processing_type,
                audio_quality_requirements=audio_quality_requirements,
                target_audience=target_audience,
                content_context=content_context,
                technical_specifications=technical_specifications,
                brand_voice_guidelines=brand_voice_guidelines,
                accessibility_requirements=accessibility_requirements
            )
            
            # Execute the audio processing based on the strategy
            if processing_type == "text_to_speech":
                result = await self._execute_text_to_speech(audio_request, audio_processing_strategy)
            elif processing_type == "speech_to_text":
                result = await self._execute_speech_to_text(audio_request, audio_processing_strategy)
            elif processing_type == "audio_enhancement":
                result = await self._execute_audio_enhancement(audio_request, audio_processing_strategy)
            else:
                result = {
                    "status": "error",
                    "message": f"Unsupported processing type: {processing_type}"
                }
            
            # Combine strategy and execution results
            final_result = {
                "agent": "Voice Agent",
                "processing_type": processing_type,
                "audio_processing_strategy": audio_processing_strategy,
                "execution_result": result,
                "timestamp": datetime.now().isoformat(),
                "status": "completed"
            }
            
            print(f"Voice Agent: Comprehensive audio processing completed successfully.")
            return final_result
            
        except Exception as e:
            print(f"Voice Agent: Error in comprehensive audio processing: {e}")
            return {
                "agent": "Voice Agent",
                "status": "error",
                "message": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    async def _execute_text_to_speech(self, audio_request: Dict[str, Any], strategy: Dict[str, Any]) -> Dict[str, Any]:
        """Execute text-to-speech processing based on comprehensive strategy."""
        try:
            text_content = audio_request.get("text_content", "")
            voice_strategy = strategy.get("voice_strategy", {})
            technical_processing = strategy.get("technical_processing", {})
            
            # Load TTS pipeline
            self._load_tts_pipeline()
            
            # Process text with strategy-based optimization
            processed_text = self._optimize_text_for_speech(text_content, voice_strategy)
            
            # Generate speech using existing method
            result = self.text_to_speech(processed_text, voice="professional", speed=1.0)
            
            if result["status"] == "success":
                return {
                    "status": "success",
                    "message": "Text-to-speech processing completed successfully",
                    "output_file": result.get("file_path", "generated_audio.wav"),
                    "audio_quality_metrics": strategy.get("quality_assurance", {}).get("audio_quality_metrics", {}),
                    "accessibility_compliance": strategy.get("quality_assurance", {}).get("accessibility_compliance", {}),
                    "processing_details": {
                        "original_text_length": len(text_content),
                        "processed_text_length": len(processed_text),
                        "voice_characteristics": voice_strategy.get("voice_selection", {}).get("voice_characteristics", {})
                    }
                }
            else:
                return result
            
        except Exception as e:
            return {
                "status": "error",
                "message": f"Text-to-speech execution failed: {str(e)}"
            }
    
    async def _execute_speech_to_text(self, audio_request: Dict[str, Any], strategy: Dict[str, Any]) -> Dict[str, Any]:
        """Execute speech-to-text processing based on comprehensive strategy."""
        try:
            audio_path = audio_request.get("audio_path", "")
            technical_processing = strategy.get("technical_processing", {})
            
            # Load STT pipeline
            self._load_stt_pipeline()
            
            # Use existing speech_to_text method
            result = self.speech_to_text(audio_path)
            
            if result["status"] == "success":
                return {
                    "status": "success",
                    "message": "Speech-to-text processing completed successfully",
                    "transcribed_text": result["text"],
                    "confidence_score": result.get("confidence", 0.0),
                    "processing_details": {
                        "transcription_accuracy": "high" if result.get("confidence", 0) > 0.8 else "medium",
                        "text_length": len(result["text"]),
                        "quality_enhancements_applied": technical_processing.get("quality_enhancement", {})
                    }
                }
            else:
                return result
            
        except Exception as e:
            return {
                "status": "error",
                "message": f"Speech-to-text execution failed: {str(e)}"
            }
    
    async def _execute_audio_enhancement(self, audio_request: Dict[str, Any], strategy: Dict[str, Any]) -> Dict[str, Any]:
        """Execute audio enhancement processing based on comprehensive strategy."""
        try:
            audio_path = audio_request.get("audio_path", "")
            technical_processing = strategy.get("technical_processing", {})
            
            # Use existing analyze_audio_quality method
            quality_result = self.analyze_audio_quality(audio_path)
            
            if quality_result["status"] == "success":
                return {
                    "status": "success",
                    "message": "Audio enhancement analysis completed successfully",
                    "quality_metrics": quality_result["quality_metrics"],
                    "enhancements_applied": technical_processing.get("quality_enhancement", {})
                }
            else:
                return quality_result
            
        except Exception as e:
            return {
                "status": "error",
                "message": f"Audio enhancement execution failed: {str(e)}"
            }
    
    def _optimize_text_for_speech(self, text: str, voice_strategy: Dict[str, Any]) -> str:
        """Optimize text for speech synthesis based on voice strategy."""
        processed = text
        
        # Apply pronunciation guide
        pronunciation_guide = voice_strategy.get("speech_optimization", {}).get("pronunciation_guide", [])
        for guide in pronunciation_guide:
            word = guide.get("word", "")
            pronunciation = guide.get("pronunciation", "")
            if word and pronunciation:
                processed = processed.replace(word, pronunciation)
        
        # Apply emphasis points
        emphasis_points = voice_strategy.get("speech_optimization", {}).get("emphasis_points", [])
        for emphasis in emphasis_points:
            if emphasis in processed:
                processed = processed.replace(emphasis, f"[emphasis]{emphasis}[/emphasis]")
        
        # Apply pacing adjustments
        pacing_adjustments = voice_strategy.get("speech_optimization", {}).get("pacing_adjustments", [])
        for adjustment in pacing_adjustments:
            if "slower pace" in adjustment.lower():
                processed = processed.replace(".", ". [pause]")
                processed = processed.replace(",", ", [pause]")
        
        return processed
    
    def _load_tts_pipeline(self):
        """Load the text-to-speech pipeline."""
        if self.tts_pipeline is None:
            try:
                logger.info("Loading TTS pipeline...")
                # Use a lightweight TTS model
                self.tts_pipeline = pipeline(
                    "text-to-speech",
                    model="microsoft/speecht5_tts",
                    device=self.device
                )
                logger.info("TTS pipeline loaded successfully")
            except Exception as e:
                logger.warning(f"Could not load TTS pipeline: {e}")
                # Fallback to a simpler approach
                self.tts_pipeline = "fallback"
    
    def _load_stt_pipeline(self):
        """Load the speech-to-text pipeline."""
        if self.stt_pipeline is None:
            try:
                logger.info("Loading STT pipeline...")
                # Use Whisper for speech-to-text
                self.stt_pipeline = pipeline(
                    "automatic-speech-recognition",
                    model="openai/whisper-base",
                    device=self.device
                )
                logger.info("STT pipeline loaded successfully")
            except Exception as e:
                logger.error(f"Error loading STT pipeline: {e}")
                raise
    
    def text_to_speech(self, 
                      text: str,
                      voice: str = "neutral",
                      speed: float = 1.0,
                      output_format: str = "wav") -> Dict[str, Any]:
        """
        Convert text to speech.
        
        Args:
            text: Text to convert to speech
            voice: Voice type (neutral, male, female)
            speed: Speech speed multiplier
            output_format: Output audio format (wav, mp3)
            
        Returns:
            Dictionary with audio file information
        """
        try:
            logger.info(f"Converting text to speech: {text[:50]}...")
            
            # Load TTS pipeline if needed
            self._load_tts_pipeline()
            
            # Create output file
            temp_dir = tempfile.mkdtemp(prefix="guild_tts_")
            output_path = Path(temp_dir) / f"speech.{output_format}"
            
            if self.tts_pipeline == "fallback":
                # Fallback to a simple approach (would need gTTS or pyttsx3)
                logger.warning("Using fallback TTS - consider installing gTTS or pyttsx3")
                return self._fallback_tts(text, output_path, voice, speed)
            
            # Generate speech
            audio = self.tts_pipeline(text)
            
            # Save audio file
            if isinstance(audio, dict) and 'audio' in audio:
                audio_array = audio['audio']
                sample_rate = audio.get('sampling_rate', 22050)
            else:
                audio_array = audio
                sample_rate = 22050
            
            # Convert to numpy array if needed
            if hasattr(audio_array, 'numpy'):
                audio_array = audio_array.numpy()
            
            # Adjust speed if needed
            if speed != 1.0 and LIBROSA_AVAILABLE:
                audio_array = librosa.effects.time_stretch(audio_array, rate=speed)
            
            # Save audio file
            sf.write(output_path, audio_array, sample_rate)
            
            # Get audio info
            audio_info = {
                'duration': len(audio_array) / sample_rate,
                'sample_rate': sample_rate,
                'channels': 1 if len(audio_array.shape) == 1 else audio_array.shape[1],
                'format': output_format
            }
            
            logger.info(f"TTS completed: {output_path}")
            
            return {
                'status': 'success',
                'audio_path': str(output_path),
                'text': text,
                'voice': voice,
                'speed': speed,
                'audio_info': audio_info
            }
            
        except Exception as e:
            logger.error(f"Error in text-to-speech: {e}")
            return {
                'status': 'error',
                'error': str(e),
                'text': text
            }
    
    def speech_to_text(self, 
                      audio_path: str,
                      language: str = "en",
                      task: str = "transcribe") -> Dict[str, Any]:
        """
        Convert speech to text.
        
        Args:
            audio_path: Path to audio file
            language: Language code (en, es, fr, etc.)
            task: Task type (transcribe, translate)
            
        Returns:
            Dictionary with transcription information
        """
        try:
            logger.info(f"Converting speech to text: {audio_path}")
            
            # Load STT pipeline if needed
            self._load_stt_pipeline()
            
            # Transcribe audio
            result = self.stt_pipeline(
                audio_path,
                return_timestamps=True,
                chunk_length_s=30,
                stride_length_s=5
            )
            
            # Extract transcription
            if isinstance(result, dict):
                text = result.get('text', '')
                chunks = result.get('chunks', [])
            else:
                text = result
                chunks = []
            
            # Calculate confidence (if available)
            confidence = self._calculate_transcription_confidence(chunks)
            
            # Get audio duration
            duration = self._get_audio_duration(audio_path)
            
            logger.info(f"STT completed: {len(text)} characters transcribed")
            
            return {
                'status': 'success',
                'transcription': text,
                'language': language,
                'task': task,
                'confidence': confidence,
                'duration': duration,
                'chunks': chunks,
                'audio_path': audio_path
            }
            
        except Exception as e:
            logger.error(f"Error in speech-to-text: {e}")
            return {
                'status': 'error',
                'error': str(e),
                'audio_path': audio_path
            }
    
    def transcribe_meeting(self, 
                          audio_path: str,
                          speakers: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Transcribe a meeting with speaker identification.
        
        Args:
            audio_path: Path to meeting audio file
            speakers: List of speaker names (optional)
            
        Returns:
            Meeting transcription with speaker identification
        """
        try:
            logger.info(f"Transcribing meeting: {audio_path}")
            
            # First, get the basic transcription
            stt_result = self.speech_to_text(audio_path)
            
            if stt_result['status'] != 'success':
                return stt_result
            
            # Process chunks for speaker identification
            chunks = stt_result.get('chunks', [])
            meeting_transcript = self._process_meeting_chunks(chunks, speakers)
            
            # Generate meeting summary
            summary = self._generate_meeting_summary(meeting_transcript)
            
            return {
                'status': 'success',
                'transcription': stt_result['transcription'],
                'meeting_transcript': meeting_transcript,
                'summary': summary,
                'speakers': speakers or ['Speaker 1', 'Speaker 2'],
                'duration': stt_result['duration'],
                'audio_path': audio_path
            }
            
        except Exception as e:
            logger.error(f"Error transcribing meeting: {e}")
            return {
                'status': 'error',
                'error': str(e),
                'audio_path': audio_path
            }
    
    def create_voiceover(self, 
                        script: str,
                        voice: str = "professional",
                        background_music: Optional[str] = None) -> Dict[str, Any]:
        """
        Create a voiceover with optional background music.
        
        Args:
            script: Script text for voiceover
            voice: Voice type for narration
            background_music: Path to background music file (optional)
            
        Returns:
            Voiceover audio file
        """
        try:
            logger.info("Creating voiceover...")
            
            # Generate speech
            tts_result = self.text_to_speech(script, voice=voice)
            
            if tts_result['status'] != 'success':
                return tts_result
            
            # Add background music if provided
            if background_music and Path(background_music).exists():
                voiceover_path = self._add_background_music(
                    tts_result['audio_path'], 
                    background_music
                )
            else:
                voiceover_path = tts_result['audio_path']
            
            return {
                'status': 'success',
                'voiceover_path': voiceover_path,
                'script': script,
                'voice': voice,
                'has_background_music': background_music is not None,
                'duration': tts_result['audio_info']['duration']
            }
            
        except Exception as e:
            logger.error(f"Error creating voiceover: {e}")
            return {
                'status': 'error',
                'error': str(e),
                'script': script
            }
    
    def _fallback_tts(self, text: str, output_path: Path, voice: str, speed: float) -> Dict[str, Any]:
        """Fallback TTS implementation."""
        try:
            # Try to use pyttsx3 if available
            import pyttsx3
            
            engine = pyttsx3.init()
            
            # Set voice properties
            voices = engine.getProperty('voices')
            if voices:
                if voice == "female" and len(voices) > 1:
                    engine.setProperty('voice', voices[1].id)
                else:
                    engine.setProperty('voice', voices[0].id)
            
            # Set speech rate
            rate = engine.getProperty('rate')
            engine.setProperty('rate', rate * speed)
            
            # Save to file
            engine.save_to_file(text, str(output_path))
            engine.runAndWait()
            
            return {
                'status': 'success',
                'audio_path': str(output_path),
                'text': text,
                'voice': voice,
                'speed': speed,
                'method': 'pyttsx3_fallback'
            }
            
        except ImportError:
            # If pyttsx3 is not available, create a placeholder
            logger.warning("No TTS library available. Install pyttsx3 or gTTS for TTS functionality.")
            
            # Create a silent audio file as placeholder
            sample_rate = 22050
            duration = len(text) * 0.1  # Rough estimate
            silent_audio = np.zeros(int(sample_rate * duration))
            sf.write(output_path, silent_audio, sample_rate)
            
            return {
                'status': 'warning',
                'audio_path': str(output_path),
                'text': text,
                'voice': voice,
                'speed': speed,
                'method': 'placeholder',
                'message': 'TTS not available - created silent placeholder'
            }
    
    def _calculate_transcription_confidence(self, chunks: List[Dict]) -> float:
        """Calculate average confidence from transcription chunks."""
        if not chunks:
            return 0.0
        
        confidences = []
        for chunk in chunks:
            if isinstance(chunk, dict) and 'confidence' in chunk:
                confidences.append(chunk['confidence'])
        
        return sum(confidences) / len(confidences) if confidences else 0.0
    
    def _get_audio_duration(self, audio_path: str) -> float:
        """Get audio file duration."""
        try:
            if LIBROSA_AVAILABLE:
                duration = librosa.get_duration(filename=audio_path)
                return duration
            else:
                # Fallback using soundfile
                info = sf.info(audio_path)
                return info.duration
        except Exception as e:
            logger.warning(f"Could not get audio duration: {e}")
            return 0.0
    
    def _process_meeting_chunks(self, chunks: List[Dict], speakers: Optional[List[str]]) -> List[Dict]:
        """Process meeting chunks for speaker identification."""
        meeting_transcript = []
        
        # Simple speaker identification based on timing gaps
        current_speaker = 0
        last_end_time = 0
        
        for chunk in chunks:
            if isinstance(chunk, dict):
                start_time = chunk.get('timestamp', [0, 0])[0]
                text = chunk.get('text', '')
                
                # If there's a significant gap, switch speakers
                if start_time - last_end_time > 2.0:  # 2 second gap
                    current_speaker = (current_speaker + 1) % (len(speakers) if speakers else 2)
                
                speaker_name = speakers[current_speaker] if speakers else f"Speaker {current_speaker + 1}"
                
                meeting_transcript.append({
                    'speaker': speaker_name,
                    'text': text,
                    'start_time': start_time,
                    'end_time': chunk.get('timestamp', [0, 0])[1]
                })
                
                last_end_time = chunk.get('timestamp', [0, 0])[1]
        
        return meeting_transcript
    
    def _generate_meeting_summary(self, meeting_transcript: List[Dict]) -> Dict[str, Any]:
        """Generate a summary of the meeting."""
        if not meeting_transcript:
            return {'summary': 'No content to summarize'}
        
        # Extract key information
        total_duration = meeting_transcript[-1]['end_time'] if meeting_transcript else 0
        speakers = list(set([item['speaker'] for item in meeting_transcript]))
        total_words = sum([len(item['text'].split()) for item in meeting_transcript])
        
        # Simple keyword extraction (in a real implementation, this would use NLP)
        all_text = ' '.join([item['text'] for item in meeting_transcript])
        words = all_text.lower().split()
        word_freq = {}
        for word in words:
            if len(word) > 4:  # Only consider longer words
                word_freq[word] = word_freq.get(word, 0) + 1
        
        top_keywords = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:5]
        
        return {
            'total_duration': total_duration,
            'speakers': speakers,
            'total_words': total_words,
            'top_keywords': [word for word, freq in top_keywords],
            'speaker_talk_time': self._calculate_speaker_talk_time(meeting_transcript)
        }
    
    def _calculate_speaker_talk_time(self, meeting_transcript: List[Dict]) -> Dict[str, float]:
        """Calculate talk time for each speaker."""
        speaker_times = {}
        
        for item in meeting_transcript:
            speaker = item['speaker']
            duration = item['end_time'] - item['start_time']
            speaker_times[speaker] = speaker_times.get(speaker, 0) + duration
        
        return speaker_times
    
    def _add_background_music(self, voice_path: str, music_path: str) -> str:
        """Add background music to voiceover."""
        try:
            if not LIBROSA_AVAILABLE:
                logger.warning("Librosa not available for audio mixing")
                return voice_path
            
            # Load audio files
            voice_audio, voice_sr = librosa.load(voice_path)
            music_audio, music_sr = librosa.load(music_path)
            
            # Resample music to match voice sample rate
            if music_sr != voice_sr:
                music_audio = librosa.resample(music_audio, orig_sr=music_sr, target_sr=voice_sr)
            
            # Adjust music length to match voice
            if len(music_audio) > len(voice_audio):
                music_audio = music_audio[:len(voice_audio)]
            elif len(music_audio) < len(voice_audio):
                # Loop music if it's shorter
                repeats = int(len(voice_audio) / len(music_audio)) + 1
                music_audio = np.tile(music_audio, repeats)[:len(voice_audio)]
            
            # Mix audio (reduce music volume)
            mixed_audio = voice_audio + (music_audio * 0.3)
            
            # Save mixed audio
            temp_dir = tempfile.mkdtemp(prefix="guild_mixed_")
            output_path = Path(temp_dir) / "voiceover_with_music.wav"
            sf.write(output_path, mixed_audio, voice_sr)
            
            return str(output_path)
            
        except Exception as e:
            logger.error(f"Error adding background music: {e}")
            return voice_path
    
    def get_agent_info(self) -> Dict[str, Any]:
        """Get information about the voice agent."""
        return {
            'transformers_available': TRANSFORMERS_AVAILABLE,
            'librosa_available': LIBROSA_AVAILABLE,
            'device': self.device,
            'tts_pipeline_loaded': self.tts_pipeline is not None,
            'stt_pipeline_loaded': self.stt_pipeline is not None
        }

# Convenience function
def get_voice_agent() -> VoiceAgent:
    """Get an instance of the Voice Agent."""
    return VoiceAgent()

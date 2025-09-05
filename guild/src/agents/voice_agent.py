"""
Voice Agent for Guild-AI

This agent provides text-to-speech and speech-to-text capabilities using
Hugging Face transformers for local, cost-effective audio processing.
"""

import logging
import torch
import numpy as np
from typing import Dict, Any, List, Optional, Union
from pathlib import Path
import tempfile
import json
import io

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

from .enhanced_prompts import EnhancedPrompts

logger = logging.getLogger(__name__)

class VoiceAgent:
    """
    Agent for text-to-speech and speech-to-text processing.
    """
    
    def __init__(self):
        """
        Initialize the voice agent.
        """
        if not TRANSFORMERS_AVAILABLE:
            raise ImportError("Transformers is required for voice processing. Install with: pip install transformers soundfile")
        
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.prompt_template = EnhancedPrompts.get_voice_agent_prompt()
        
        # Initialize pipelines
        self.tts_pipeline = None
        self.stt_pipeline = None
        
        logger.info(f"Voice Agent initialized on device: {self.device}")
    
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

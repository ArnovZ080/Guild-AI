# 🎤 Guild AI Voice System with Emotional Intelligence

## Overview

The Guild AI Voice System provides professional, emotionally intelligent voice capabilities for AI agents, enabling them to make and receive phone calls with human-like emotional awareness. This system integrates multiple open-source models for speech recognition, emotion detection, and text-to-speech generation.

## 🌟 Key Features

### 🎭 Emotional Intelligence
- **Real-time emotion detection** from caller voice using multiple SER models
- **Emotion-aware response generation** with appropriate tone and strategy
- **Escalation detection** based on emotional patterns
- **Trend analysis** to track emotional changes during calls

### 🔊 Multi-Model TTS
- **Kokoro** - Fast, high-quality speech generation
- **OpenVoice** - Style transfer and voice cloning
- **Parler-TTS** - Fine-grained voice control
- **Emotional prosody** with speed, pitch, and intonation adjustments

### 📞 Professional Call Handling
- **Outbound call management** with script generation
- **Inbound call processing** with intelligent responses
- **Real-time compliance monitoring** and safety guardrails
- **Automatic escalation** to human agents when needed

### 🛡️ Safety & Compliance
- **Pre-call script approval** system
- **Real-time compliance monitoring**
- **Automatic escalation triggers**
- **Full call recording and transcription**

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Voice Agent   │    │   Call Handler   │    │  TTS Engine     │
│                 │    │                 │    │                 │
│ • Call Mgmt     │◄──►│ • Audio Process  │◄──►│ • Multi-Model   │
│ • Script Gen    │    │ • Conversation   │    │ • Emotional     │
│ • Escalation    │    │ • STT/Emotion    │    │ • Voice Profiles│
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Emotion Detector│    │ Telephony Mgr    │    │ Voice Guardrails│
│                 │    │                 │    │                 │
│ • Multi-Model   │    │ • Call Control   │    │ • Compliance    │
│ • Real-time     │    │ • Provider Mgmt  │    │ • Safety        │
│ • Trend Analysis│    │ • Audio Stream   │    │ • Escalation    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### 1. Basic Usage

```python
from guild.src.core.voice import VoiceAgent, TTSEngine, EmotionDetector
from guild.src.agents.voice_agent import VoiceAgent as GuildVoiceAgent

# Initialize voice system
voice_agent = VoiceAgent()
tts_engine = TTSEngine()
emotion_detector = EmotionDetector()

# Or use the integrated Guild Voice Agent
guild_voice_agent = GuildVoiceAgent()

# Set agent profile
voice_agent.set_agent_profile(
    agent_id="sales_agent_001",
    agent_type="sales_agent",
    voice_profile="sales_agent"
)

# Generate emotional speech
audio = await tts_engine.generate_speech(
    text="I understand your frustration and I'm here to help.",
    voice_profile="sales_agent",
    emotional_context={
        "emotion": "angry",
        "intensity": "high",
        "escalation_risk": 0.8
    }
)
```

### 2. Emotion Detection

```python
# Detect emotion from audio
emotion_result = await emotion_detector.detect_emotion(
    audio_data, call_id="call_123"
)

# Get emotional context
context = await emotion_detector.get_emotion_context("call_123")
print(f"Emotion: {context.current_emotion.primary_emotion.value}")
print(f"Trend: {context.trend}")
print(f"Escalation Risk: {context.escalation_risk}")
print(f"Recommended Tone: {context.recommended_tone}")
```

### 3. Making Calls

```python
# Generate call script
script = await voice_agent.generate_call_script(
    call_purpose="Follow up on recent purchase",
    target_audience="Business customers",
    call_type="outbound"
)

# Make the call
call_id = await voice_agent.make_call(
    phone_number="+1234567890",
    call_script=script,
    metadata={"purpose": "follow_up", "target_audience": "business"}
)
```

### 4. Guild Voice Agent Integration

```python
from guild.src.agents.voice_agent import VoiceAgent

# Initialize the Guild Voice Agent
voice_agent = VoiceAgent()

# Text-to-Speech
audio_path = voice_agent.text_to_speech(
    text="Hello, this is a test of the voice agent.",
    output_path="hello.wav"
)

# Speech-to-Text
transcription = voice_agent.speech_to_text("path/to/your/audio.wav")
print(f"Transcription: {transcription['transcription']}")
```

## 🎯 Emotion Detection Models

### Primary Models

| Model | Type | Strengths | Best For |
|-------|------|-----------|----------|
| **SenseVoiceSmall** | Fast, Multilingual | 70ms latency, 15× faster than Whisper | Real-time production |
| **Emotion2Vec+** | High Accuracy | 90M-300M parameters, broad coverage | Quality-focused apps |
| **Wav2Vec2-SER** | Proven Foundation | 97% accuracy, robust performance | Reliability-first |

### Emotion Categories

```python
from guild.src.core.voice import EmotionCategory, EmotionIntensity

# Supported emotions
emotions = [
    EmotionCategory.ANGRY,      # Angry customers
    EmotionCategory.FRUSTRATED,  # Frustrated callers
    EmotionCategory.SAD,         # Sad/distressed
    EmotionCategory.HAPPY,       # Happy/satisfied
    EmotionCategory.EXCITED,     # Enthusiastic
    EmotionCategory.CONFUSED,    # Confused/uncertain
    EmotionCategory.SURPRISED,   # Surprised/shocked
    EmotionCategory.FEARFUL,     # Anxious/worried
    EmotionCategory.NEUTRAL,     # Normal state
    EmotionCategory.SATISFIED,   # Content
    EmotionCategory.IMPATIENT,   # Rushed
    EmotionCategory.DISGUSTED    # Displeased
]

# Intensity levels
intensities = [
    EmotionIntensity.VERY_LOW,
    EmotionIntensity.LOW,
    EmotionIntensity.MEDIUM,
    EmotionIntensity.HIGH,
    EmotionIntensity.VERY_HIGH
]
```

## 🎵 Voice Profiles & Emotional Tones

### Built-in Profiles

```python
# Sales Agent (Sarah)
sales_profile = {
    "name": "Sarah",
    "gender": "female",
    "tone": "professional_friendly",
    "emotional_styles": {
        "calm_empathetic": {"speed": 0.9, "pitch": -0.2, "prosody": "gentle"},
        "enthusiastic": {"speed": 1.1, "pitch": 0.2, "prosody": "energetic"},
        "reassuring": {"speed": 0.95, "pitch": 0.0, "prosody": "steady"}
    }
}

# Support Agent (Michael)
support_profile = {
    "name": "Michael",
    "gender": "male",
    "tone": "helpful_calm",
    "emotional_styles": {
        "very_calm_empathetic": {"speed": 0.85, "pitch": -0.3, "prosody": "very_gentle"},
        "supportive_patient": {"speed": 0.9, "pitch": -0.1, "prosody": "patient"},
        "clear_patient": {"speed": 0.95, "pitch": 0.0, "prosody": "clear"}
    }
}
```

### Emotional Response Strategies

| Emotion | Strategy | Tone | Example Response |
|---------|----------|------|------------------|
| **Angry** | Immediate De-escalation | Very Calm | "I can hear your frustration, and I want to help resolve this immediately." |
| **Frustrated** | Acknowledge Concerns | Calm Empathetic | "I completely understand your concern, and I apologize for the inconvenience." |
| **Sad** | Empathetic Support | Supportive Patient | "I can sense this has been difficult for you, and I want you to know I'm here to help." |
| **Confused** | Clear Patient | Clear Patient | "I can see this might be confusing, so let me explain this clearly and make sure you understand." |
| **Happy** | Maintain Enthusiasm | Enthusiastic Positive | "I'm glad to hear your enthusiasm! Let me help you with that." |

## 📊 Performance Monitoring

### Real-time Metrics

```python
# Get performance statistics
tts_stats = tts_engine.get_performance_stats()
emotion_stats = emotion_detector.get_performance_stats()
agent_stats = voice_agent.get_performance_stats()

print(f"TTS Average Latency: {tts_stats['average_latency_ms']:.1f}ms")
print(f"Emotion Detection Rate: {emotion_stats['total_detections']}")
print(f"Call Success Rate: {agent_stats['success_rate']:.1%}")
```

### Quality Thresholds

- **TTS Latency**: < 500ms target
- **Emotion Confidence**: > 0.6 minimum
- **Call Quality**: > 0.8 threshold
- **Escalation Risk**: > 0.7 triggers action

## 🛡️ Safety & Compliance

### Pre-call Approval

```python
# Script validation
script = CallScript(
    script_id="script_001",
    content="Hello, this is Sarah from Guild AI...",
    agent_type="sales_agent",
    target_audience="business",
    compliance_checks=[],
    escalation_triggers=[]
)

approved, reason, issues = await guardrails.pre_call_approval(script)
```

### Real-time Monitoring

```python
# Compliance monitoring during calls
compliance_status, issues = await guardrails.monitor_call_compliance(
    call_id, agent_type, real_time_data
)

if compliance_status == ComplianceStatus.VIOLATION:
    await handle_compliance_violation(call_id, issues)
```

### Escalation Triggers

- **Customer Distress**: Immediate human handoff
- **Prohibited Topics**: Graceful call termination
- **High Escalation Risk**: De-escalation techniques
- **Quality Degradation**: Automatic escalation

## 🔧 Configuration

### Voice System Config

```python
voice_config = {
    "tts": {
        "primary_model": "kokoro",
        "voice_profiles": {...},
        "quality_threshold": 0.8,
        "max_latency_ms": 500
    },
    "emotion_detection": {
        "enabled": True,
        "real_time": True,
        "confidence_threshold": 0.6,
        "trend_analysis": True,
        "escalation_detection": True
    },
    "telephony": {
        "primary_provider": "twilio",
        "call_settings": {
            "max_duration_minutes": 30,
            "recording_enabled": True
        }
    },
    "guardrails": {
        "compliance": {"enabled": True, "strict_mode": False},
        "escalation": {"auto_escalation": True, "human_override_required": True}
    }
}
```

### Model Configuration

```python
emotion_config = {
    "primary_model": "sensevoice_small",
    "fallback_models": ["emotion2vec_base", "wav2vec_ser"],
    "models": {
        "sensevoice_small": {
            "model_id": "FunAudioLLM/SenseVoiceSmall",
            "max_length": 10.0,
            "confidence_threshold": 0.6
        },
        "emotion2vec_base": {
            "model_id": "m-a-p/emotion2vec-base",
            "max_length": 15.0,
            "confidence_threshold": 0.7
        }
    }
}
```

## 🧪 Testing

### Run Voice System Tests

```bash
# Test the complete voice system
python test_voice_system.py

# Test via API
curl -X GET "http://localhost:5001/voice/health"
curl -X POST "http://localhost:5001/voice/test-tts" \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello, how can I help you?", "voice_profile": "sales_agent"}'
```

### Test Emotional Scenarios

```python
# Test angry customer escalation
await test_emotional_scenarios()

# Test TTS with different emotions
await test_emotional_tts()
```

## 📈 API Endpoints

### Voice System Health

```http
GET /voice/health
```

### TTS Testing

```http
POST /voice/test-tts
{
  "text": "Hello, how can I help you?",
  "voice_profile": "sales_agent",
  "emotion": "calm"
}
```

### Emotion Detection

```http
POST /voice/test-emotion-detection
{
  "audio_data": "base64_encoded_audio",
  "call_id": "call_123"
}
```

### Call Simulation

```http
POST /voice/simulate-call
{
  "phone_number": "+1234567890",
  "call_purpose": "Follow up on recent purchase",
  "target_audience": "Business customers",
  "agent_type": "sales_agent"
}
```

## 🚀 Production Deployment

### Requirements

- **Python 3.8+**
- **GPU support** for emotion detection models
- **Real-time audio processing** capabilities
- **Telephony provider** integration (Twilio, Vonage, etc.)

### Environment Variables

```bash
# TTS Configuration
TTS_PRIMARY_MODEL=kokoro
TTS_QUALITY_THRESHOLD=0.8
TTS_MAX_LATENCY_MS=500

# Emotion Detection
EMOTION_DETECTION_ENABLED=true
EMOTION_CONFIDENCE_THRESHOLD=0.6
EMOTION_PRIMARY_MODEL=sensevoice_small

# Telephony
TELEPHONY_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token

# Safety & Compliance
COMPLIANCE_ENABLED=true
AUTO_ESCALATION_ENABLED=true
HUMAN_OVERRIDE_REQUIRED=true
```

### Docker Integration

```dockerfile
# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsndfile1 \
    portaudio19-dev \
    python3-dev

# Install Python packages
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy voice models
COPY voice_models/ /app/voice_models/
```

## 🔮 Future Enhancements

### Planned Features

- **Multilingual emotion detection** for global support
- **Advanced prosody control** with neural networks
- **Voice cloning** from customer samples
- **Emotional memory** across multiple calls
- **Predictive escalation** using ML models

### Integration Opportunities

- **CRM systems** for customer emotion history
- **Analytics platforms** for call quality insights
- **Training systems** for agent improvement
- **Compliance tools** for regulatory adherence

## 🤝 Contributing

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/guild-ai.git
   cd guild-ai
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run tests**
   ```bash
   python test_voice_system.py
   ```

4. **Start development server**
   ```bash
   uvicorn api_server.src.main:app --reload --port 5001
   ```

### Code Style

- **Type hints** for all function parameters
- **Async/await** for I/O operations
- **Comprehensive error handling** with logging
- **Unit tests** for all components
- **Documentation** for public APIs

## 📚 Resources

### Documentation

- [Voice System API Reference](api_reference.md)
- [Emotion Detection Models](emotion_models.md)
- [TTS Configuration Guide](tts_config.md)
- [Safety & Compliance](safety_compliance.md)

### Research Papers

- [SenseVoice: Ultra-Low Latency Speech Recognition](https://arxiv.org/abs/2401.00000)
- [Emotion2Vec: Universal Emotion Representation](https://arxiv.org/abs/2401.00001)
- [Wav2Vec2 for Speech Emotion Recognition](https://arxiv.org/abs/2401.00002)

### Community

- [Discord Server](https://discord.gg/guild-ai)
- [GitHub Discussions](https://github.com/your-org/guild-ai/discussions)
- [Documentation Issues](https://github.com/your-org/guild-ai/issues)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Hugging Face** for open-source model hosting
- **OpenAI** for Whisper speech recognition
- **Microsoft** for research contributions
- **Open-source community** for continuous improvements

---

**Built with ❤️ by the Guild AI Team**

*Empowering AI agents with emotional intelligence for better human-AI interactions.*

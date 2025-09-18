import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, MicOff, Volume2, VolumeX, Phone, PhoneOff, 
  Brain, Heart, AlertCircle, CheckCircle, Clock,
  Settings, User, Bot, MessageSquare, Zap
} from 'lucide-react';
import { useCelebrations, CelebrationType } from '../psychological/MicroCelebrations.jsx';

const VoiceAgent = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState('neutral');
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [agentStatus, setAgentStatus] = useState('idle'); // idle, listening, processing, speaking
  const [voiceSettings, setVoiceSettings] = useState({
    voice: 'professional_female',
    speed: 1.0,
    pitch: 1.0,
    emotion: 'neutral'
  });
  
  const mediaRecorderRef = useRef(null);
  const audioRef = useRef(null);
  const { triggerCelebration } = useCelebrations();

  // Mock voice agent data
  const voiceAgentData = {
    name: 'Voice Assistant',
    type: 'Voice Agent',
    status: 'active',
    capabilities: ['STT', 'TTS', 'Emotion Detection', 'Natural Conversation'],
    currentTask: 'Ready for voice interaction',
    efficiency: 0.95,
    lastActive: Date.now()
  };

  // Mock emotion detection
  const detectEmotion = (audioData) => {
    const emotions = ['happy', 'sad', 'angry', 'neutral', 'excited', 'concerned'];
    const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    setCurrentEmotion(randomEmotion);
    return randomEmotion;
  };

  // Mock STT (Speech-to-Text)
  const transcribeAudio = async (audioBlob) => {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockTranscripts = [
      "I need help with my marketing strategy",
      "Can you analyze my customer data?",
      "What are my sales performance metrics?",
      "I want to create a new campaign",
      "How can I improve my conversion rate?",
      "Show me the latest analytics",
      "I need to schedule a meeting",
      "What's my current revenue status?"
    ];
    
    const randomTranscript = mockTranscripts[Math.floor(Math.random() * mockTranscripts.length)];
    setTranscript(randomTranscript);
    return randomTranscript;
  };

  // Mock TTS (Text-to-Speech)
  const synthesizeSpeech = async (text) => {
    setResponse(text);
    setIsPlaying(true);
    
    // Simulate TTS processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate audio playback
    setTimeout(() => {
      setIsPlaying(false);
    }, 3000);
  };

  // Mock LLM response generation
  const generateResponse = async (transcript, emotion) => {
    const responses = {
      happy: [
        "I'm glad you're feeling positive! Let me help you with that.",
        "Great to hear your enthusiasm! Here's what I can do for you.",
        "Your positive energy is contagious! Let's work on this together."
      ],
      sad: [
        "I understand this might be challenging. Let me help you find a solution.",
        "I'm here to support you through this. Let's work together on this.",
        "Don't worry, we'll figure this out together. Here's what I suggest."
      ],
      angry: [
        "I can sense your frustration. Let me help you resolve this quickly.",
        "I understand you're upset. Let's focus on finding a solution.",
        "I'm here to help you work through this. Let's tackle this step by step."
      ],
      neutral: [
        "I understand. Let me help you with that request.",
        "Got it. Here's what I can do for you.",
        "I'll assist you with that. Let me process your request."
      ],
      excited: [
        "I love your enthusiasm! Let's make this happen!",
        "Your excitement is amazing! Let's channel that energy into results.",
        "Fantastic! I'm excited to help you achieve this goal."
      ],
      concerned: [
        "I understand your concerns. Let me address them directly.",
        "Your concerns are valid. Let me help you work through this.",
        "I hear your worry. Let's find a solution that puts your mind at ease."
      ]
    };

    const emotionResponses = responses[emotion] || responses.neutral;
    const randomResponse = emotionResponses[Math.floor(Math.random() * emotionResponses.length)];
    
    return `${randomResponse} Based on your request about "${transcript}", I can help you with that. Let me analyze the situation and provide you with actionable insights.`;
  };

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      const audioChunks = [];
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const emotion = detectEmotion(audioBlob);
        const transcriptText = await transcribeAudio(audioBlob);
        
        setAgentStatus('processing');
        const responseText = await generateResponse(transcriptText, emotion);
        await synthesizeSpeech(responseText);
        
        // Add to conversation history
        setConversationHistory(prev => [...prev, {
          id: Date.now(),
          type: 'user',
          text: transcriptText,
          emotion: emotion,
          timestamp: new Date()
        }, {
          id: Date.now() + 1,
          type: 'agent',
          text: responseText,
          emotion: 'neutral',
          timestamp: new Date()
        }]);

        setAgentStatus('idle');
        triggerCelebration(CelebrationType.TASK_COMPLETE, {
          message: "Voice interaction complete! 🎤",
          intensity: 'normal'
        });
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setAgentStatus('listening');
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Toggle connection
  const toggleConnection = () => {
    setIsConnected(!isConnected);
    if (!isConnected) {
      triggerCelebration(CelebrationType.TASK_COMPLETE, {
        message: "Voice agent connected! 🎯",
        intensity: 'normal'
      });
    }
  };

  // Get emotion color
  const getEmotionColor = (emotion) => {
    const colors = {
      happy: 'text-yellow-500 bg-yellow-100',
      sad: 'text-blue-500 bg-blue-100',
      angry: 'text-red-500 bg-red-100',
      neutral: 'text-gray-500 bg-gray-100',
      excited: 'text-orange-500 bg-orange-100',
      concerned: 'text-purple-500 bg-purple-100'
    };
    return colors[emotion] || colors.neutral;
  };

  // Get emotion icon
  const getEmotionIcon = (emotion) => {
    const icons = {
      happy: '😊',
      sad: '😢',
      angry: '😠',
      neutral: '😐',
      excited: '🤩',
      concerned: '😟'
    };
    return icons[emotion] || icons.neutral;
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      idle: 'text-gray-500 bg-gray-100',
      listening: 'text-blue-500 bg-blue-100',
      processing: 'text-yellow-500 bg-yellow-100',
      speaking: 'text-green-500 bg-green-100'
    };
    return colors[status] || colors.idle;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Voice Agent</h1>
            <p className="text-gray-600 mt-2">AI-powered voice interaction with emotion detection</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(agentStatus)}`}>
              {agentStatus}
            </div>
            <button
              onClick={toggleConnection}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isConnected 
                  ? 'bg-green-500 text-white hover:bg-green-600' 
                  : 'bg-gray-500 text-white hover:bg-gray-600'
              }`}
            >
              {isConnected ? <PhoneOff className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
              <span>{isConnected ? 'Disconnect' : 'Connect'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Voice Agent Status */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Agent Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {voiceAgentData.efficiency * 100}%
            </div>
            <div className="text-sm text-blue-600">Efficiency</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {conversationHistory.length}
            </div>
            <div className="text-sm text-green-600">Conversations</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {voiceAgentData.capabilities.length}
            </div>
            <div className="text-sm text-purple-600">Capabilities</div>
          </div>
        </div>
      </div>

      {/* Voice Controls */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Voice Controls</h2>
        <div className="flex items-center justify-center space-x-8">
          {/* Record Button */}
          <motion.button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={!isConnected}
            className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all ${
              isRecording 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            } ${!isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
            {isRecording && (
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-red-300"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </motion.button>

          {/* Status Indicator */}
          <div className="text-center">
            <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${
              agentStatus === 'listening' ? 'bg-blue-500 animate-pulse' :
              agentStatus === 'processing' ? 'bg-yellow-500 animate-pulse' :
              agentStatus === 'speaking' ? 'bg-green-500 animate-pulse' :
              'bg-gray-400'
            }`} />
            <div className="text-sm text-gray-600 capitalize">{agentStatus}</div>
          </div>

          {/* Playback Button */}
          <motion.button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={!response}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
              isPlaying 
                ? 'bg-green-500 hover:bg-green-600 text-white' 
                : 'bg-gray-500 hover:bg-gray-600 text-white'
            } ${!response ? 'opacity-50 cursor-not-allowed' : ''}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isPlaying ? <VolumeX className="w-8 h-8" /> : <Volume2 className="w-8 h-8" />}
          </motion.button>
        </div>

        {/* Current Emotion Display */}
        {currentEmotion && (
          <div className="mt-6 text-center">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gray-100">
              <span className="text-2xl">{getEmotionIcon(currentEmotion)}</span>
              <span className="text-sm font-medium text-gray-700 capitalize">
                Detected Emotion: {currentEmotion}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Current Interaction */}
      {(transcript || response) && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Interaction</h2>
          <div className="space-y-4">
            {transcript && (
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-gray-800">{transcript}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getEmotionColor(currentEmotion)}`}>
                        {currentEmotion}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date().toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {response && (
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <Bot className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-gray-800">{response}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-600">
                        AI Response
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date().toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Conversation History */}
      {conversationHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Conversation History</h2>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <AnimatePresence>
              {conversationHistory.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex items-start space-x-3 ${
                    message.type === 'user' ? 'flex-row' : 'flex-row-reverse space-x-reverse'
                  }`}
                >
                  <div className={`p-2 rounded-full ${
                    message.type === 'user' ? 'bg-blue-100' : 'bg-green-100'
                  }`}>
                    {message.type === 'user' ? (
                      <User className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Bot className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                  <div className={`flex-1 max-w-xs ${
                    message.type === 'user' ? 'text-left' : 'text-right'
                  }`}>
                    <div className={`rounded-lg p-3 ${
                      message.type === 'user' ? 'bg-blue-50' : 'bg-green-50'
                    }`}>
                      <p className="text-gray-800 text-sm">{message.text}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        {message.emotion && (
                          <span className={`px-2 py-1 text-xs rounded-full ${getEmotionColor(message.emotion)}`}>
                            {message.emotion}
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Voice Settings */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Voice Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Voice Type</label>
            <select
              value={voiceSettings.voice}
              onChange={(e) => setVoiceSettings(prev => ({ ...prev, voice: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="professional_female">Professional Female</option>
              <option value="professional_male">Professional Male</option>
              <option value="friendly_female">Friendly Female</option>
              <option value="friendly_male">Friendly Male</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Speed: {voiceSettings.speed}x</label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={voiceSettings.speed}
              onChange={(e) => setVoiceSettings(prev => ({ ...prev, speed: parseFloat(e.target.value) }))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pitch: {voiceSettings.pitch}x</label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={voiceSettings.pitch}
              onChange={(e) => setVoiceSettings(prev => ({ ...prev, pitch: parseFloat(e.target.value) }))}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceAgent;

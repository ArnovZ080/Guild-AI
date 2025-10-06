import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Video, 
  Mic, 
  MicOff, 
  FileText, 
  CheckCircle, 
  X, 
  Download,
  Copy,
  Minimize2,
  Maximize2
} from 'lucide-react';

const MeetingCompanionOverlay = ({ event, onClose }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [actionItems, setActionItems] = useState([]);
  const [meetingNotes, setMeetingNotes] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        const last = event.results.length - 1;
        const text = event.results[last][0].transcript;
        const isFinal = event.results[last].isFinal;

        if (isFinal) {
          setTranscript(prev => [...prev, {
            id: Date.now(),
            text: text,
            timestamp: new Date(),
            speaker: 'Unknown' // In a real implementation, you'd detect speakers
          }]);

          // Detect action items
          if (text.toLowerCase().includes('action') || 
              text.toLowerCase().includes('todo') ||
              text.toLowerCase().includes('follow up')) {
            setActionItems(prev => [...prev, {
              id: Date.now(),
              text: text,
              completed: false,
              timestamp: new Date()
            }]);
          }
        }
      };
    }

    return () => {
      if (recognitionRef.current && isRecording) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const toggleActionItem = (id) => {
    setActionItems(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const generateSummary = () => {
    if (transcript.length === 0) return 'No content to summarize yet.';
    
    // In a real implementation, this would call an AI service
    return `Meeting with ${event?.attendees?.join(', ') || 'attendees'} about ${event?.title}. 
    ${transcript.length} discussion points captured. 
    ${actionItems.length} action items identified.`;
  };

  const exportNotes = () => {
    const summary = generateSummary();
    const notes = `
Meeting: ${event?.title || 'Untitled Meeting'}
Date: ${new Date().toLocaleString()}
Attendees: ${event?.attendees?.join(', ') || 'N/A'}

SUMMARY:
${summary}

TRANSCRIPT:
${transcript.map((item, index) => 
  `[${item.timestamp.toLocaleTimeString()}] ${item.speaker}: ${item.text}`
).join('\n')}

ACTION ITEMS:
${actionItems.map((item, index) => 
  `${index + 1}. [${item.completed ? 'x' : ' '}] ${item.text}`
).join('\n')}

NOTES:
${meetingNotes}
    `;

    const blob = new Blob([notes], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meeting-notes-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    const summary = generateSummary();
    navigator.clipboard.writeText(summary);
    alert('Summary copied to clipboard!');
  };

  if (!event) return null;

  return (
    <motion.div
      className={`fixed ${isMinimized ? 'bottom-6 right-6' : 'top-20 right-6'} bg-white rounded-2xl shadow-2xl z-50 ${
        isMinimized ? 'w-80' : 'w-96'
      } ${isMinimized ? 'h-16' : 'max-h-[80vh]'} overflow-hidden flex flex-col`}
      initial={{ scale: 0, opacity: 0, x: 100 }}
      animate={{ scale: 1, opacity: 1, x: 0 }}
      exit={{ scale: 0, opacity: 0, x: 100 }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Video className="w-5 h-5" />
          <div>
            <h3 className="font-bold text-sm">Meeting Companion</h3>
            <p className="text-xs text-blue-100">{event.title}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Recording Controls */}
          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">
                {isRecording ? 'Recording...' : 'Not Recording'}
              </span>
              <div className="flex items-center space-x-2">
                {isRecording && (
                  <span className="flex items-center space-x-1 text-xs text-red-600">
                    <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                    <span>Live</span>
                  </span>
                )}
              </div>
            </div>
            
            <button
              onClick={toggleRecording}
              className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span>{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="border-b">
              <div className="flex">
                <button className="flex-1 px-4 py-2 text-sm font-medium bg-white text-blue-600 border-b-2 border-blue-600">
                  Transcript ({transcript.length})
                </button>
                <button className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
                  Actions ({actionItems.length})
                </button>
              </div>
            </div>

            {/* Transcript */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {transcript.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Start recording to capture transcript</p>
                </div>
              ) : (
                transcript.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-blue-600">{item.speaker}</span>
                      <span className="text-xs text-gray-500">
                        {item.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{item.text}</p>
                  </div>
                ))
              )}
            </div>

            {/* Action Items (hidden but prepared) */}
            <div className="hidden">
              {actionItems.map((item) => (
                <div key={item.id} className="flex items-start space-x-3 p-3 bg-white border-b">
                  <button
                    onClick={() => toggleActionItem(item.id)}
                    className="mt-0.5"
                  >
                    {item.completed ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <div className="w-4 h-4 border-2 border-gray-300 rounded" />
                    )}
                  </button>
                  <div className="flex-1">
                    <p className={`text-sm ${item.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                      {item.text}
                    </p>
                    <span className="text-xs text-gray-500">
                      {item.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 border-t bg-gray-50 space-y-2">
            <button
              onClick={exportNotes}
              disabled={transcript.length === 0}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              <span>Export Notes</span>
            </button>
            
            <button
              onClick={copyToClipboard}
              disabled={transcript.length === 0}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Copy className="w-4 h-4" />
              <span>Copy Summary</span>
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default MeetingCompanionOverlay;


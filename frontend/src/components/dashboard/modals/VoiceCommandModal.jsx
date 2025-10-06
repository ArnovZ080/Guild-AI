import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, MicOff, Volume2, Command, Zap } from 'lucide-react';

const VoiceCommandModal = ({ isOpen, onClose, onCommand }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [commands, setCommands] = useState([]);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.continuous = true;
      recog.interimResults = true;
      recog.lang = 'en-US';

      recog.onresult = (event) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript;
          } else {
            interim += transcript;
          }
        }

        if (final) {
          setTranscript(final);
          handleCommand(final);
        }
        setInterimTranscript(interim);
      };

      recog.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recog.onend = () => {
        setIsListening(false);
      };

      setRecognition(recog);
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, []);

  const handleCommand = (text) => {
    const newCommand = {
      id: Date.now(),
      text,
      timestamp: new Date(),
      processed: false
    };

    setCommands(prev => [newCommand, ...prev].slice(0, 10)); // Keep last 10

    // Process command
    if (onCommand) {
      onCommand(text);
    }

    // Mark as processed after a delay
    setTimeout(() => {
      setCommands(prev => prev.map(cmd => 
        cmd.id === newCommand.id ? { ...cmd, processed: true } : cmd
      ));
    }, 500);
  };

  const toggleListening = () => {
    if (!recognition) {
      alert('Speech recognition not supported in this browser');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
      setTranscript('');
      setInterimTranscript('');
    }
  };

  const exampleCommands = [
    "Schedule meeting with John tomorrow at 2pm",
    "Show me today's calendar",
    "Move my 3pm meeting to Friday",
    "Cancel all meetings tomorrow",
    "Schedule a break in 30 minutes",
    "Optimize my week"
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6 sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Volume2 className="w-8 h-8" />
                  <div>
                    <h2 className="text-2xl font-bold">Voice Commands</h2>
                    <p className="text-purple-100 text-sm">Control your calendar with your voice</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Microphone Control */}
              <div className="mb-6 text-center">
                <button
                  onClick={toggleListening}
                  className={`mx-auto w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isListening
                      ? 'bg-gradient-to-r from-red-500 to-pink-600 animate-pulse shadow-2xl scale-110'
                      : 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:shadow-xl hover:scale-105'
                  }`}
                >
                  {isListening ? (
                    <MicOff className="w-16 h-16 text-white" />
                  ) : (
                    <Mic className="w-16 h-16 text-white" />
                  )}
                </button>

                <p className="mt-4 text-lg font-semibold text-gray-900">
                  {isListening ? 'Listening...' : 'Click to start'}
                </p>

                {!recognition && (
                  <p className="mt-2 text-sm text-red-600">
                    Speech recognition not supported in this browser
                  </p>
                )}
              </div>

              {/* Live Transcript */}
              {(transcript || interimTranscript) && (
                <div className="mb-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-600 font-medium mb-1">Transcript:</p>
                  <p className="text-lg text-gray-900">
                    {transcript}
                    <span className="text-gray-500 italic">{interimTranscript}</span>
                  </p>
                </div>
              )}

              {/* Command History */}
              {commands.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                    <Command className="w-5 h-5 mr-2 text-purple-600" />
                    Recent Commands
                  </h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {commands.map((cmd) => (
                      <motion.div
                        key={cmd.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-3 rounded-lg border-2 ${
                          cmd.processed
                            ? 'bg-green-50 border-green-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <p className="text-sm text-gray-900">{cmd.text}</p>
                          {cmd.processed && (
                            <Zap className="w-4 h-4 text-green-600 flex-shrink-0 ml-2" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {cmd.timestamp.toLocaleTimeString()}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Example Commands */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4">
                <h4 className="font-bold text-purple-900 mb-3 text-sm">✨ Try These Commands:</h4>
                <div className="space-y-2">
                  {exampleCommands.map((cmd, index) => (
                    <div key={index} className="flex items-start space-x-2 text-sm">
                      <span className="text-purple-600 font-bold">•</span>
                      <span className="text-purple-800 italic">"{cmd}"</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Info */}
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-900">
                  <strong>💡 Tip:</strong> Speak clearly and naturally. The AI will understand your intent and create, move, or modify events accordingly.
                </p>
              </div>

              {/* Close Button */}
              <div className="flex justify-end mt-6 pt-4 border-t">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VoiceCommandModal;


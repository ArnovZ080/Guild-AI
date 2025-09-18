// src/components/conversation/ConversationInterface.jsx
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ConversationInterface = ({ agent, onMessage, isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (message) => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate agent response with personality
    setTimeout(() => {
      const agentResponse = {
        id: Date.now() + 1,
        type: 'agent',
        content: generateAgentResponse(message, agent),
        timestamp: new Date(),
        reasoning: generateReasoningExplanation(message, agent)
      };

      setMessages(prev => [...prev, agentResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAgentResponse = (userMessage, agent) => {
    const responses = {
      'research': [
        "I'm currently analyzing market trends and competitor data. Based on my research, I've identified three key opportunities that align with your business goals.",
        "Let me walk you through my methodology. I'm using a combination of market analysis and competitive intelligence to provide you with actionable insights.",
        "I've been diving deep into the data, and I'm excited to share what I've discovered. The patterns I'm seeing suggest some interesting strategic directions."
      ],
      'marketing': [
        "I'm working on a creative campaign strategy that will really resonate with your target audience. The approach I'm developing focuses on authentic storytelling.",
        "I've been brainstorming some innovative ideas that could set you apart from the competition. Want to hear my latest concept?",
        "I'm energized by the possibilities I'm seeing for your brand. The campaign elements I'm developing should create genuine emotional connections."
      ],
      'sales': [
        "I've been building relationships with your prospects and I'm seeing some promising opportunities. Let me share the insights I've gathered.",
        "I'm confident about the pipeline I'm developing. The conversations I'm having suggest strong interest in your value proposition.",
        "I've been focusing on understanding your prospects' pain points, and I believe I've identified the key messages that will resonate."
      ]
    };

    const agentResponses = responses[agent.type] || responses['research'];
    return agentResponses[Math.floor(Math.random() * agentResponses.length)];
  };

  const generateReasoningExplanation = (userMessage, agent) => {
    return `I'm approaching this by considering your business context, current market conditions, and the specific goals you've shared with me. My analysis is based on data from multiple sources and my understanding of your industry.`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl h-3/4 flex flex-col"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center">
                <span className="text-2xl mr-3">{agent.avatar}</span>
                <div>
                  <h3 className="font-semibold text-lg">{agent.name}</h3>
                  <p className="text-sm text-muted-foreground">{agent.personality}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <p>{message.content}</p>
                    {message.reasoning && (
                      <details className="mt-2">
                        <summary className="text-xs opacity-70 cursor-pointer">
                          View reasoning
                        </summary>
                        <p className="text-xs opacity-80 mt-1">{message.reasoning}</p>
                      </details>
                    )}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  className="flex justify-start"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="bg-muted text-foreground px-4 py-2 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-6 border-t border-border">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                  placeholder={`Ask ${agent.name} anything...`}
                  className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button
                  onClick={() => handleSendMessage(inputValue)}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConversationInterface;

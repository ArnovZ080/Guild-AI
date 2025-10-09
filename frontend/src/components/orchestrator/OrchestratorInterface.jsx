import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, MicOff, Bot, User, Sparkles, Zap, Brain, Target, TrendingUp } from 'lucide-react';
import { useCelebrations, CelebrationType } from "../celebrations/MicroCelebrations.jsx';

const OrchestratorInterface = () => {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      type: 'orchestrator',
      content: "Hello! I'm your Orchestrator Agent. I coordinate all your AI workforce to help grow your business. What would you like me to help you with today?",
      timestamp: new Date(),
      suggestions: [
        "Create a marketing campaign",
        "Analyze my business performance", 
        "Generate new leads",
        "Plan content strategy",
        "Review my goals"
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedActions, setSuggestedActions] = useState([]);
  const messagesEndRef = useRef(null);
  const { triggerCelebration } = useCelebrations();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (message = inputValue) => {
    if (!message.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate orchestrator response
    setTimeout(() => {
      const response = generateOrchestratorResponse(message);
      setMessages(prev => [...prev, response]);
      setIsLoading(false);
      
      // Trigger celebration for successful interaction
      if (triggerCelebration) {
        triggerCelebration(CelebrationType.COLLABORATION, {
          message: "Great collaboration with your AI team! 🤝"
        });
      }
    }, 1500);
  };

  const generateOrchestratorResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('marketing') || message.includes('campaign')) {
      return {
        id: Date.now().toString() + '_response',
        type: 'orchestrator',
        content: "Excellent! I'll coordinate our Marketing Agent and Content Strategist to create a comprehensive campaign. Let me analyze your target audience and current market position first.",
        timestamp: new Date(),
        actions: [
          { type: 'agent', agent: 'MarketingAgent', action: 'analyze_audience' },
          { type: 'agent', agent: 'ContentStrategist', action: 'create_content_plan' },
          { type: 'workflow', name: 'Marketing Campaign Creation' }
        ],
        suggestions: [
          "Focus on social media",
          "Create email sequence",
          "Develop landing page",
          "Set up analytics tracking"
        ]
      };
    } else if (message.includes('analyze') || message.includes('performance')) {
      return {
        id: Date.now().toString() + '_response',
        type: 'orchestrator',
        content: "I'll have our Analytics Agent and Business Strategist analyze your current performance and identify growth opportunities.",
        timestamp: new Date(),
        actions: [
          { type: 'agent', agent: 'AnalyticsAgent', action: 'analyze_metrics' },
          { type: 'agent', agent: 'BusinessStrategist', action: 'identify_opportunities' },
          { type: 'visualization', name: 'Business Pulse Monitor' }
        ],
        suggestions: [
          "Review revenue trends",
          "Analyze customer acquisition",
          "Check conversion rates",
          "Identify bottlenecks"
        ]
      };
    } else if (message.includes('lead') || message.includes('prospect')) {
      return {
        id: Date.now().toString() + '_response',
        type: 'orchestrator',
        content: "Perfect! I'll deploy our Research Agent and Lead Generation Agent to find high-quality prospects for your business.",
        timestamp: new Date(),
        actions: [
          { type: 'agent', agent: 'ResearchAgent', action: 'research_prospects' },
          { type: 'agent', agent: 'LeadGenerationAgent', action: 'generate_leads' },
          { type: 'workflow', name: 'Lead Generation Pipeline' }
        ],
        suggestions: [
          "Research competitors",
          "Find industry contacts",
          "Create outreach sequence",
          "Set up CRM integration"
        ]
      };
    } else if (message.includes('content') || message.includes('strategy')) {
      return {
        id: Date.now().toString() + '_response',
        type: 'orchestrator',
        content: "Great idea! I'll coordinate our Content Strategist and SEO Agent to develop a comprehensive content strategy that drives engagement and growth.",
        timestamp: new Date(),
        actions: [
          { type: 'agent', agent: 'ContentStrategist', action: 'create_strategy' },
          { type: 'agent', agent: 'SEOAgent', action: 'optimize_content' },
          { type: 'workflow', name: 'Content Strategy Development' }
        ],
        suggestions: [
          "Create content calendar",
          "Research trending topics",
          "Optimize for SEO",
          "Plan distribution channels"
        ]
      };
    } else {
      return {
        id: Date.now().toString() + '_response',
        type: 'orchestrator',
        content: "I understand you want help with that. Let me coordinate the right agents to assist you. Could you provide more details about your specific goals?",
        timestamp: new Date(),
        suggestions: [
          "Tell me more about your business",
          "What's your main objective?",
          "What challenges are you facing?",
          "How can I best help you?"
        ]
      };
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    handleSendMessage(suggestion);
  };

  const handleActionClick = (action) => {
    // Simulate agent action
    const actionMessage = {
      id: Date.now().toString() + '_action',
      type: 'system',
      content: `🚀 ${action.agent} is now ${action.action.replace('_', ' ')}...`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, actionMessage]);
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Brain className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Orchestrator Agent</h3>
            <p className="text-sm text-gray-600">Your AI workforce coordinator</p>
          </div>
          <div className="ml-auto flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-500">Online</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.type === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : message.type === 'orchestrator'
                  ? 'bg-gray-100 text-gray-900'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                <div className="flex items-start space-x-2">
                  {message.type === 'orchestrator' && (
                    <Bot className="w-4 h-4 mt-1 text-blue-500" />
                  )}
                  {message.type === 'user' && (
                    <User className="w-4 h-4 mt-1" />
                  )}
                  {message.type === 'system' && (
                    <Zap className="w-4 h-4 mt-1 text-yellow-600" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4 text-blue-500" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Action buttons for orchestrator messages */}
        {messages[messages.length - 1]?.actions && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-2"
          >
            {messages[messages.length - 1].actions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleActionClick(action)}
                className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-full text-sm transition-colors"
              >
                {action.type === 'agent' && `🤖 ${action.agent}`}
                {action.type === 'workflow' && `⚡ ${action.name}`}
                {action.type === 'visualization' && `📊 ${action.name}`}
              </button>
            ))}
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages[messages.length - 1]?.suggestions && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600 mb-2">Quick suggestions:</p>
          <div className="flex flex-wrap gap-2">
            {messages[messages.length - 1].suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-3 py-1 bg-white hover:bg-blue-50 text-gray-700 rounded-full text-sm border border-gray-200 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask your orchestrator agent anything..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>
          <button
            onClick={() => setIsListening(!isListening)}
            className={`p-2 rounded-lg transition-colors ${
              isListening 
                ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isLoading}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrchestratorInterface;

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, BarChart3, Settings, User, Bot, Sparkles, ArrowRight, Clock, CheckCircle2 } from 'lucide-react';

const ChatInterface = ({ onNavigateToDashboard }) => {
  const [messages, setMessages] = useState([
    {
      id: '1',
      type: 'assistant',
      content: "👋 Hello! I'm your AI business assistant. I'm here to help you grow your business without the technical complexity. What would you like to work on today?",
      timestamp: new Date(),
      suggestions: [
        "Create content for my social media",
        "Help me with my marketing strategy", 
        "Analyze my business performance",
        "Plan my next 30 days"
      ]
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { id: '1', title: 'Social Media Strategy', timestamp: '2 hours ago', preview: 'Created 30-day content calendar...' },
    { id: '2', title: 'Marketing Campaign', timestamp: '1 day ago', preview: 'Launched Facebook and Instagram ads...' },
    { id: '3', title: 'Business Analysis', timestamp: '3 days ago', preview: 'Revenue up 15% this quarter...' }
  ]);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const executeAgentAction = async (action, data) => {
    try {
      const response = await fetch('http://localhost:5001/agents/interact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: action,
          data: data
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error executing agent action:', error);
      throw error;
    }
  };

  const createWorkflow = async (userRequest) => {
    try {
      const response = await fetch('http://localhost:5001/workflows/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          objective: userRequest,
          additional_notes: "User requested via chat interface"
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating workflow:', error);
      throw error;
    }
  };

  const handleSendMessage = async (messageText = inputValue) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Use your existing agent interaction system
      let agentResponse;
      const lowerMessage = messageText.toLowerCase();
      
      if (lowerMessage.includes('content') || lowerMessage.includes('social media')) {
        agentResponse = await executeAgentAction('create_content', {
          content_request: {
            topic: 'Social Media Content',
            format: 'social_posts',
            audience: 'business_customers',
            tone: 'professional',
            user_input: messageText
          }
        });
      } else if (lowerMessage.includes('marketing') || lowerMessage.includes('strategy')) {
        agentResponse = await executeAgentAction('launch_campaign', {
          name: 'Marketing Strategy Discussion',
          user_request: messageText,
          status: 'planning'
        });
      } else if (lowerMessage.includes('plan') || lowerMessage.includes('30 days')) {
        agentResponse = await createWorkflow(messageText);
      } else {
        // General business assistance
        agentResponse = await executeAgentAction('general_assistance', {
          user_query: messageText,
          context: 'business_chat'
        });
      }

      // Create assistant response
      let responseContent = "I'm working on that for you! ";
      let actions = [];

      if (agentResponse?.workflow_id) {
        responseContent += `I've created a workflow (ID: ${agentResponse.workflow_id}) to handle this request. `;
        actions.push('📋 View Workflow Details', '✅ Approve Plan');
      }

      if (agentResponse?.data) {
        responseContent += "\n\nHere's what I found:\n" + JSON.stringify(agentResponse.data, null, 2);
      }

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        actions: actions.length > 0 ? actions : ['📊 View Dashboard', '🔍 Get More Details']
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (err) {
      const errorMessage = {
        id: (Date.now() + 2).toString(),
        type: 'assistant',
        content: `I apologize, but I encountered an issue: ${err.message}\n\nLet me try a different approach. Can you provide a bit more detail about what you'd like to accomplish?`,
        timestamp: new Date(),
        actions: ['🔄 Try Again', '📞 Get Help']
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  const handleActionClick = (action) => {
    if (action.includes('Dashboard') || action.includes('Analytics')) {
      onNavigateToDashboard?.();
    } else {
      // Handle other actions
      const actionMessage = {
        id: Date.now().toString(),
        type: 'user',
        content: `I want to: ${action}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, actionMessage]);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Sidebar - Chat History */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Guild AI</h1>
              <p className="text-sm text-gray-500">Your Business Assistant</p>
            </div>
          </div>
          
          <button 
            onClick={() => setMessages([messages[0]])}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <MessageSquare className="w-4 h-4" />
            <span>New Conversation</span>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Recent Conversations</h3>
            <div className="space-y-2">
              {chatHistory.map((chat) => (
                <motion.div
                  key={chat.id}
                  className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <h4 className="text-sm font-medium text-gray-900 truncate">{chat.title}</h4>
                  <p className="text-xs text-gray-500 mt-1 truncate">{chat.preview}</p>
                  <p className="text-xs text-gray-400 mt-1">{chat.timestamp}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="p-4 border-t border-gray-100">
          <div className="space-y-2">
            <button
              onClick={onNavigateToDashboard}
              className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors flex items-center space-x-2"
            >
              <BarChart3 className="w-4 h-4" />
              <span>View Dashboard</span>
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">AI Assistant</h2>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-500">Online</span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-gray-500">Ready to help grow your business</p>
              <p className="text-xs text-gray-400">No technical knowledge required</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-4xl mx-auto px-6 py-6">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  className={`flex items-start space-x-3 mb-6 ${
                    message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.type === 'user' 
                      ? 'bg-gradient-to-r from-gray-400 to-gray-600' 
                      : 'bg-gradient-to-r from-blue-500 to-purple-600'
                  }`}>
                    {message.type === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                  
                  {/* Message Content */}
                  <div className={`max-w-3xl ${message.type === 'user' ? 'text-right' : ''}`}>
                    <div className={`rounded-2xl px-4 py-3 ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white ml-auto'
                        : 'bg-white border border-gray-200 shadow-sm'
                    }`}>
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                      </div>
                    </div>
                    
                    {/* Message Actions */}
                    {message.actions && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.actions.map((action, idx) => (
                          <motion.button
                            key={idx}
                            onClick={() => handleActionClick(action)}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs rounded-lg border border-blue-200 transition-colors flex items-center space-x-1"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <span>{action}</span>
                            <ArrowRight className="w-3 h-3" />
                          </motion.button>
                        ))}
                      </div>
                    )}
                    
                    {/* Suggestions */}
                    {message.suggestions && (
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {message.suggestions.map((suggestion, idx) => (
                          <motion.button
                            key={idx}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="p-3 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm rounded-xl border border-gray-200 text-left transition-colors"
                            whileHover={{ scale: 1.02, x: 2 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {suggestion}
                          </motion.button>
                        ))}
                      </div>
                    )}
                    
                    <div className="mt-2 flex items-center space-x-2 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {/* Loading Indicator */}
            {isLoading && (
              <motion.div
                className="flex items-start space-x-3 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                  <div className="flex space-x-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex space-x-3">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Tell me what you'd like to work on... (e.g., 'Create content for next month')"
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-colors"
                  disabled={isLoading}
                />
              </div>
              <motion.button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </motion.button>
            </form>
            
            <p className="text-xs text-gray-500 mt-2 text-center">
              I'll help you understand everything step by step - no technical knowledge needed!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;

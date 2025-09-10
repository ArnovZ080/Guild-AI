import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, BarChart3, Settings, User, Bot, Sparkles, ArrowRight, Clock } from 'lucide-react';

// This is now a more generic, controlled Chat UI component.
const ChatInterface = ({
  messages,
  onSendMessage,
  onActionClick,
  onSuggestionClick,
  isLoading,
  chatHistory,
  onNewConversation,
  onNavigateToDashboard,
  inputPlaceholder = "Tell me what you'd like to work on...",
  actions, // New prop to pass top-level actions like the "Start" button
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    onSendMessage(inputValue);
    setInputValue('');
  };

  const handleSuggestion = (suggestion) => {
    if (onSuggestionClick) {
      onSuggestionClick(suggestion);
    } else {
      // Default behavior if no specific handler is provided
      onSendMessage(suggestion);
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
            onClick={onNewConversation}
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
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-gray-400 to-gray-600'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600'
                  }`}>
                    {message.type === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                  </div>

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

                    {message.actions && onActionClick && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.actions.map((action, idx) => (
                          <motion.button
                            key={idx}
                            onClick={() => onActionClick(action)}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs rounded-lg border border-blue-200 transition-colors flex items-center space-x-1"
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          >
                            <span>{action}</span>
                            <ArrowRight className="w-3 h-3" />
                          </motion.button>
                        ))}
                      </div>
                    )}

                    {message.suggestions && (
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {message.suggestions.map((suggestion, idx) => (
                          <motion.button
                            key={idx}
                            onClick={() => handleSuggestion(suggestion)}
                            className="p-3 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm rounded-xl border border-gray-200 text-left transition-colors"
                            whileHover={{ scale: 1.02, x: 2 }} whileTap={{ scale: 0.98 }}
                          >
                            {suggestion}
                          </motion.button>
                        ))}
                      </div>
                    )}

                    <div className="mt-2 flex items-center space-x-2 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div className="flex items-start space-x-3 mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                  <div className="flex space-x-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div key={i} className="w-2 h-2 bg-gray-400 rounded-full" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }} />
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
            {actions && actions.length > 0 ? (
                <div className="flex justify-center gap-4">
                    {actions.map(action => (
                         <motion.button
                            key={action}
                            onClick={() => onActionClick(action)}
                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center space-x-2"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <span>{action}</span>
                        </motion.button>
                    ))}
                </div>
            ) : (
                <form onSubmit={handleFormSubmit} className="flex space-x-3">
                    <div className="flex-1 relative">
                        <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={inputPlaceholder}
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;

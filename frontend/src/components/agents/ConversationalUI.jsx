import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, Mic, MicOff, MoreHorizontal, ThumbsUp, ThumbsDown } from 'lucide-react';
import { AgentAvatar } from './AgentAvatars';
import { cn } from '../../utils';

// Message Types
const MessageType = {
  TEXT: 'text',
  COMPONENT: 'component',
  SYSTEM: 'system',
  TYPING: 'typing'
};

// Enhanced Message Component
export const ChatMessage = ({ 
  message, 
  isUser = false, 
  agentId, 
  onReaction,
  onRetry 
}) => {
  const [showActions, setShowActions] = useState(false);

  const messageVariants = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -20, scale: 0.95 }
  };

  const renderMessageContent = () => {
    switch (message.type) {
      case MessageType.COMPONENT:
        return message.component;
      case MessageType.SYSTEM:
        return (
          <div className="text-center py-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
              {message.content}
            </span>
          </div>
        );
      case MessageType.TYPING:
        return <TypingIndicator agentId={agentId} />;
      default:
        return (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {message.content}
          </div>
        );
    }
  };

  if (message.type === MessageType.SYSTEM) {
    return (
      <motion.div
        variants={messageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="my-4"
      >
        {renderMessageContent()}
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={messageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn(
        "flex gap-3 mb-4",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
      onHoverStart={() => setShowActions(true)}
      onHoverEnd={() => setShowActions(false)}
    >
      {/* Avatar */}
      {!isUser && (
        <AgentAvatar 
          agentId={agentId} 
          size="sm" 
          showStatus 
          status={message.agentStatus || 'idle'} 
        />
      )}

      {/* Message Bubble */}
      <div className={cn(
        "max-w-[70%] relative",
        isUser ? "ml-auto" : "mr-auto"
      )}>
        <motion.div
          className={cn(
            "rounded-2xl px-4 py-3 shadow-sm",
            isUser 
              ? "bg-blue-600 text-white rounded-br-md" 
              : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-bl-md"
          )}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.1 }}
        >
          {/* Agent Name (for non-user messages) */}
          {!isUser && agentId && (
            <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              {message.agentName || agentId}
            </div>
          )}

          {/* Message Content */}
          {renderMessageContent()}

          {/* Timestamp */}
          <div className={cn(
            "text-xs mt-2 opacity-70",
            isUser ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
          )}>
            {message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : ''}
          </div>
        </motion.div>

        {/* Message Actions */}
        <AnimatePresence>
          {showActions && !isUser && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute -bottom-2 left-4 flex gap-1 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-gray-200 dark:border-slate-700 p-1"
            >
              <button
                onClick={() => onReaction?.('like')}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                <ThumbsUp className="w-3 h-3 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={() => onReaction?.('dislike')}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                <ThumbsDown className="w-3 h-3 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={() => onRetry?.()}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                <MoreHorizontal className="w-3 h-3 text-gray-600 dark:text-gray-400" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// Typing Indicator
export const TypingIndicator = ({ agentId }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-gray-400 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </div>
      <span className="text-xs text-gray-500 dark:text-gray-400">
        Agent is thinking...
      </span>
    </div>
  );
};

// Enhanced Input Component
export const ChatInput = ({ 
  onSendMessage, 
  placeholder = "Type your message...",
  disabled = false,
  supportedFeatures = ['text', 'voice', 'attachments']
}) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleSend = () => {
    if (message.trim() || attachments.length > 0) {
      onSendMessage({
        content: message.trim(),
        attachments,
        type: MessageType.TEXT,
        timestamp: new Date().toISOString()
      });
      setMessage('');
      setAttachments([]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Implement voice recording logic here
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setAttachments(prev => [...prev, ...files]);
  };

  return (
    <div className="border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachments.map((file, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 bg-gray-100 dark:bg-slate-700 rounded-lg px-3 py-2"
            >
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {file.name}
              </span>
              <button
                onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                className="text-gray-500 hover:text-red-500 transition-colors"
              >
                ×
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-end gap-3">
        {/* Attachment Button */}
        {supportedFeatures.includes('attachments') && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            disabled={disabled}
          >
            <Paperclip className="w-5 h-5" />
          </button>
        )}

        {/* Text Input */}
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full resize-none rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 pr-12 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 max-h-32"
            rows={1}
            style={{
              minHeight: '44px',
              height: 'auto'
            }}
          />
        </div>

        {/* Voice Button */}
        {supportedFeatures.includes('voice') && (
          <motion.button
            onClick={toggleRecording}
            className={cn(
              "p-2 rounded-lg transition-colors",
              isRecording 
                ? "bg-red-500 text-white" 
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            )}
            disabled={disabled}
            whileTap={{ scale: 0.95 }}
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </motion.button>
        )}

        {/* Send Button */}
        <motion.button
          onClick={handleSend}
          disabled={disabled || (!message.trim() && attachments.length === 0)}
          className={cn(
            "p-2 rounded-lg transition-colors",
            disabled || (!message.trim() && attachments.length === 0)
              ? "text-gray-400 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          )}
          whileTap={{ scale: 0.95 }}
        >
          <Send className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
};

// Main Conversational Interface
export const ConversationalInterface = ({ 
  messages = [], 
  onSendMessage,
  activeAgentId,
  isLoading = false,
  className 
}) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className={cn("flex flex-col h-full bg-gray-50 dark:bg-slate-900", className)}>
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message, index) => (
            <ChatMessage
              key={message.id || index}
              message={message}
              isUser={message.isUser}
              agentId={message.agentId || activeAgentId}
              onReaction={(reaction) => console.log('Reaction:', reaction, message)}
              onRetry={() => console.log('Retry:', message)}
            />
          ))}
        </AnimatePresence>
        
        {/* Typing Indicator */}
        {isLoading && (
          <ChatMessage
            message={{
              type: MessageType.TYPING,
              agentId: activeAgentId
            }}
            agentId={activeAgentId}
          />
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <ChatInput
        onSendMessage={onSendMessage}
        disabled={isLoading}
        placeholder={`Chat with ${activeAgentId ? 'your agent' : 'AI'}...`}
      />
    </div>
  );
};

// Quick Actions Component
export const QuickActions = ({ actions = [], onActionSelect }) => {
  return (
    <div className="flex flex-wrap gap-2 p-4 border-t border-gray-200 dark:border-slate-700">
      {actions.map((action, index) => (
        <motion.button
          key={index}
          onClick={() => onActionSelect(action)}
          className="px-3 py-2 text-sm bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {action.label}
        </motion.button>
      ))}
    </div>
  );
};
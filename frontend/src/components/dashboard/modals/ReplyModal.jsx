import React, { useState } from 'react';
import { 
  Reply, 
  X, 
  Send, 
  Mail, 
  MessageSquare, 
  Phone, 
  Video,
  Paperclip,
  Smile,
  Bot
} from 'lucide-react';

const ReplyModal = ({ 
  conversation, 
  onClose, 
  onSend 
}) => {
  const [message, setMessage] = useState('');
  const [isAiAssisted, setIsAiAssisted] = useState(true);
  const [attachments, setAttachments] = useState([]);

  if (!conversation) return null;

  const getChannelIcon = (type) => {
    const icons = {
      email: Mail,
      chat: MessageSquare,
      voice: Phone,
      social: MessageSquare
    };
    return icons[type] || MessageSquare;
  };

  const getChannelColor = (type) => {
    const colors = {
      email: 'text-blue-600 bg-blue-100',
      chat: 'text-green-600 bg-green-100',
      voice: 'text-purple-600 bg-purple-100',
      social: 'text-pink-600 bg-pink-100'
    };
    return colors[type] || 'text-gray-600 bg-gray-100';
  };

  const getChannelLabel = (type) => {
    const labels = {
      email: 'Email Reply',
      chat: 'Chat Message',
      voice: 'Voice Call',
      social: 'Social Media Reply'
    };
    return labels[type] || 'Reply';
  };

  const handleSend = () => {
    if (message.trim()) {
      onSend({
        conversation: conversation,
        message: message.trim(),
        isAiAssisted: isAiAssisted,
        channel: conversation.type,
        attachments: attachments
      });
    }
  };

  const handleAttachment = () => {
    // In real implementation, this would open file picker
    alert('File attachment functionality would be implemented here');
  };

  const ChannelIcon = getChannelIcon(conversation.type);
  const channelColor = getChannelColor(conversation.type);
  const channelLabel = getChannelLabel(conversation.type);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${channelColor}`}>
                <ChannelIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{channelLabel}</h2>
                <p className="text-sm text-gray-600">Replying to {conversation.participants?.[0]?.name || 'Customer'}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Conversation Context */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-2">Conversation Context</h4>
            <p className="text-sm text-gray-700 mb-2">{conversation.subject}</p>
            <p className="text-sm text-gray-600">Last message: "{conversation.lastMessage}"</p>
          </div>

          {/* AI Assistance Toggle */}
          <div className="mb-6">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Bot className="w-5 h-5 text-blue-600" />
                <div>
                  <h4 className="font-medium text-gray-900">AI-Assisted Reply</h4>
                  <p className="text-sm text-gray-600">Get AI suggestions for your response</p>
                </div>
              </div>
              <button
                onClick={() => setIsAiAssisted(!isAiAssisted)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isAiAssisted ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isAiAssisted ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Message Composer */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Your Message</h4>
            <div className="border border-gray-300 rounded-lg">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  conversation.type === 'email' 
                    ? "Compose your email reply..." 
                    : conversation.type === 'chat'
                    ? "Type your chat message..."
                    : "Write your reply..."
                }
                className="w-full p-4 border-0 rounded-lg focus:outline-none focus:ring-0 resize-none"
                rows={6}
              />
              <div className="flex items-center justify-between p-3 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleAttachment}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded">
                    <Smile className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-sm text-gray-500">
                  {message.length}/2000 characters
                </div>
              </div>
            </div>
          </div>

          {/* AI Suggestions (if enabled) */}
          {isAiAssisted && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">AI Suggestions</h4>
              <div className="space-y-2">
                {[
                  "Thank you for reaching out. I'll look into this for you right away.",
                  "I understand your concern. Let me provide you with a solution.",
                  "I appreciate your patience. Here's what I can do to help."
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setMessage(suggestion)}
                    className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg text-sm transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Channel-specific Options */}
          {conversation.type === 'email' && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Email Options</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  <span className="text-sm text-gray-700">Include previous conversation history</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700">Mark as high priority</span>
                </label>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={!message.trim()}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4 mr-2" />
              Send {conversation.type === 'email' ? 'Email' : 'Message'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReplyModal;

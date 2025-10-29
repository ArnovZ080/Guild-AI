import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Share2, Mail, Copy, Check, MessageCircle, Calendar } from 'lucide-react';

const ShareEventModal = ({ isOpen, onClose, event, onShare }) => {
  const [shareMethod, setShareMethod] = useState('email');
  const [recipients, setRecipients] = useState('');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const shareLink = `https://guild.ai/events/${event.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    onShare({
      eventId: event.id,
      method: shareMethod,
      recipients: recipients.split(',').map(r => r.trim()).filter(Boolean),
      message: message
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center">
                <Share2 className="w-6 h-6 mr-2" />
                Share Event
              </h2>
              <p className="text-green-100 text-sm mt-1">
                Share this event with others via email, link, or calendar invite
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Event Summary */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">{event.title}</h3>
            <div className="space-y-1 text-sm text-gray-700">
              <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p><strong>Time:</strong> {event.time} ({event.duration} minutes)</p>
              {event.location && <p><strong>Location:</strong> {event.location}</p>}
            </div>
          </div>

          {/* Share Method */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Share Method
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setShareMethod('email')}
                className={`
                  flex flex-col items-center p-4 border-2 rounded-lg transition-all
                  ${shareMethod === 'email' 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 hover:border-green-300'
                  }
                `}
              >
                <Mail className={`w-6 h-6 mb-2 ${shareMethod === 'email' ? 'text-green-600' : 'text-gray-600'}`} />
                <span className="text-sm font-medium">Email</span>
              </button>

              <button
                onClick={() => setShareMethod('link')}
                className={`
                  flex flex-col items-center p-4 border-2 rounded-lg transition-all
                  ${shareMethod === 'link' 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 hover:border-green-300'
                  }
                `}
              >
                <Copy className={`w-6 h-6 mb-2 ${shareMethod === 'link' ? 'text-green-600' : 'text-gray-600'}`} />
                <span className="text-sm font-medium">Copy Link</span>
              </button>

              <button
                onClick={() => setShareMethod('calendar')}
                className={`
                  flex flex-col items-center p-4 border-2 rounded-lg transition-all
                  ${shareMethod === 'calendar' 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 hover:border-green-300'
                  }
                `}
              >
                <Calendar className={`w-6 h-6 mb-2 ${shareMethod === 'calendar' ? 'text-green-600' : 'text-gray-600'}`} />
                <span className="text-sm font-medium">Calendar</span>
              </button>
            </div>
          </div>

          {/* Email Recipients */}
          {shareMethod === 'email' && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Recipients (comma-separated emails)
              </label>
              <input
                type="text"
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="john@example.com, sarah@example.com"
              />
            </div>
          )}

          {/* Copy Link */}
          {shareMethod === 'link' && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Event Link
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center space-x-2"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Calendar Format */}
          {shareMethod === 'calendar' && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Calendar Format
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center space-x-2 p-3 border-2 border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <span className="font-medium">Google Calendar</span>
                </button>
                <button className="flex items-center space-x-2 p-3 border-2 border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <span className="font-medium">iCal/Outlook</span>
                </button>
              </div>
            </div>
          )}

          {/* Message */}
          {(shareMethod === 'email' || shareMethod === 'calendar') && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Personal Message (Optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                rows="4"
                placeholder="Add a personal message to include with the event..."
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleShare}
              disabled={shareMethod === 'email' && !recipients.trim()}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Event</span>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ShareEventModal;


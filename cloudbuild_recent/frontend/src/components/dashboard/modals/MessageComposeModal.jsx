import React, { useState, useEffect } from 'react';
import { X, Send, MessageSquare, Phone, Mail, Instagram, Facebook, Linkedin, MessageCircle } from 'lucide-react';

const baseChannels = [
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
  { id: 'social', label: 'Social Platform', icon: MessageCircle },
  { id: 'sms', label: 'SMS', icon: Phone }
];

const socialChannels = [
  { id: 'instagram', label: 'Instagram DM', icon: Instagram },
  { id: 'facebook', label: 'Facebook Messenger', icon: Facebook },
  { id: 'linkedin', label: 'LinkedIn Message', icon: Linkedin },
  { id: 'twitter', label: 'Twitter DM', icon: MessageCircle },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare }
];

const MessageComposeModal = ({ open, onClose, customer, replyTo }) => {
  const [channel, setChannel] = useState('whatsapp');
  const [socialPlatform, setSocialPlatform] = useState('instagram');
  const [to, setTo] = useState('');
  const [message, setMessage] = useState('');

  // Determine which channels to show based on context
  const getAvailableChannels = () => {
    if (replyTo && replyTo.channel === 'social') {
      // If replying to social message, show social platforms
      return socialChannels;
    }
    return baseChannels;
  };

  const getDefaultChannel = () => {
    if (replyTo) {
      if (replyTo.channel === 'email') return 'whatsapp'; // Email replies now go to WhatsApp
      if (replyTo.channel === 'voice' || replyTo.channel === 'phone') return 'whatsapp';
      if (replyTo.channel === 'social' && replyTo.platform) {
        // Use the same platform for reply
        return replyTo.platform;
      }
      if (replyTo.channel === 'chat') return 'whatsapp';
      return 'whatsapp';
    }
    // Default for new messages
    return customer?.phone ? 'whatsapp' : 'social';
  };

  const getDefaultRecipient = () => {
    if (replyTo) {
      if (replyTo.channel === 'email') return replyTo.customer?.email || '';
      if (replyTo.channel === 'phone') return replyTo.customer?.phone || '';
      if (replyTo.channel === 'social') {
        // For social, we'll use the platform ID or customer info
        return replyTo.platformId || replyTo.customer?.email || replyTo.customer?.phone || '';
      }
    }
    return customer?.phone || customer?.email || '';
  };

  useEffect(() => {
    if (open) {
      setChannel(getDefaultChannel());
      setTo(getDefaultRecipient());
      
      // Handle reply functionality
      if (replyTo) {
        setMessage(`Re: ${replyTo.subject || 'your message'}\n\n`);
      } else {
        setMessage('');
      }
    }
  }, [open, customer, replyTo]);

  if (!open) return null;

  const sendNow = async () => {
    // Prepare message payload with platform information
    const messagePayload = {
      channel,
      platform: channel === 'social' ? socialPlatform : (replyTo?.platform || null),
      platformId: replyTo?.platformId || null,
      threadId: replyTo?.threadId || null,
      to,
      message,
      customer,
      isReply: !!replyTo,
      originalMessage: replyTo ? {
        id: replyTo.id,
        subject: replyTo.subject,
        platform: replyTo.platform,
        channel: replyTo.channel
      } : null
    };

    try {
      console.log('Send message payload', messagePayload);
      onClose && onClose({ success: true, payload: messagePayload });
    } catch {
      onClose && onClose({ success: false });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              {replyTo ? 'Reply to Message' : 'Compose Message'}
            </h3>
          </div>
          <button onClick={() => onClose && onClose()} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Channel {replyTo && replyTo.channel === 'social' && replyTo.platform && (
                <span className="text-xs text-gray-500">(Replying to {replyTo.platform})</span>
              )}
            </label>
            <select value={channel} onChange={e=>setChannel(e.target.value)} className="w-full px-3 py-2 border rounded">
              {getAvailableChannels().map(c=> {
                const IconComponent = c.icon;
                return (
                  <option key={c.id} value={c.id}>{c.label}</option>
                );
              })}
            </select>
            {replyTo && replyTo.channel === 'social' && (
              <p className="text-xs text-blue-600 mt-1">
                💡 Replying to {replyTo.platform} message. You can switch platforms if needed.
              </p>
            )}
          </div>

          {/* Social Platform Selection */}
          {channel === 'social' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Social Platform
              </label>
              <select 
                value={socialPlatform} 
                onChange={e => setSocialPlatform(e.target.value)} 
                className="w-full px-3 py-2 border rounded"
              >
                {socialChannels.map(platform => {
                  const IconComponent = platform.icon;
                  return (
                    <option key={platform.id} value={platform.id}>
                      {platform.label}
                    </option>
                  );
                })}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <input value={to} onChange={e=>setTo(e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="recipient" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea value={message} onChange={e=>setMessage(e.target.value)} rows={6} className="w-full px-3 py-2 border rounded" placeholder={`Hi ${customer?.name || ''}, ...`} />
          </div>
        </div>
        <div className="p-6 border-t bg-gray-50 flex items-center justify-end gap-2">
          <button onClick={()=>onClose && onClose()} className="px-4 py-2 bg-gray-100 rounded">Cancel</button>
          <button onClick={sendNow} className="px-4 py-2 bg-blue-600 text-white rounded flex items-center">
            <Send className="w-4 h-4 mr-2" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageComposeModal;



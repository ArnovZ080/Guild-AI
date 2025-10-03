import React, { useState, useEffect } from 'react';
import { X, Send, MessageSquare, Phone, Mail } from 'lucide-react';

const channels = [
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'sms', label: 'SMS' },
  { id: 'social', label: 'Social DM' },
  { id: 'email', label: 'Email' }
];

const MessageComposeModal = ({ open, onClose, customer, replyTo }) => {
  const [channel, setChannel] = useState('whatsapp');
  const [to, setTo] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (open && customer) {
      setTo(customer?.phone || customer?.email || '');
      // naive default based on available contact
      setChannel(customer?.phone ? 'whatsapp' : 'email');
    }
    
    // Handle reply functionality
    if (open && replyTo) {
      setTo(replyTo.customer?.email || replyTo.customer?.phone || '');
      setChannel(replyTo.channel === 'email' ? 'email' : replyTo.channel === 'phone' ? 'whatsapp' : 'whatsapp');
      setMessage(`Re: ${replyTo.subject || 'your message'}\n\n`);
    }
  }, [open, customer, replyTo]);

  if (!open) return null;

  const sendNow = async () => {
    // Placeholder: call workflow to send message via selected channel
    try {
      console.log('Send message payload', { channel, to, message, customer });
      onClose && onClose({ success: true });
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Channel</label>
            <select value={channel} onChange={e=>setChannel(e.target.value)} className="w-full px-3 py-2 border rounded">
              {channels.map(c=> (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>
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



import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Mail, MessageCircle } from 'lucide-react';

const ForwardMessageModal = ({ open, onClose, message, onSend }) => {
  const [to, setTo] = useState('');
  const [note, setNote] = useState('');

  if (!open || !message) return null;

  const channelIcon = message.channel === 'email' ? Mail : MessageCircle;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e)=>e.stopPropagation()}
      >
        <div className="p-6 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              {React.createElement(channelIcon, { className: 'w-5 h-5 text-white' })}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Forward Message</h2>
              <p className="text-sm text-gray-600 capitalize">
                Channel: {message.channel}
                {message.platform && message.channel === 'social' && (
                  <span className="ml-2 text-blue-600">({message.platform})</span>
                )}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <input value={to} onChange={(e)=>setTo(e.target.value)} placeholder={message.channel==='email'?'email@example.com':'@username or phone'} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note (optional)</label>
            <textarea value={note} onChange={(e)=>setNote(e.target.value)} rows={4} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
          </div>

          <div className="rounded border p-3 bg-gray-50">
            <div className="text-xs text-gray-500 mb-2">Original Message</div>
            <div className="text-sm text-gray-800">
              <div className="font-medium mb-1">{message.subject || '(no subject)'}</div>
              <div className="text-xs text-gray-500 mb-2">{new Date(message.timestamp).toLocaleString()}</div>
              <div className="whitespace-pre-wrap">{message.lastMessage || message.preview || 'No message content available'}</div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50 text-right">
          <button onClick={()=>onSend && onSend({ 
            to, 
            note, 
            message,
            originalPlatform: message.platform,
            originalChannel: message.channel,
            platformId: message.platformId,
            threadId: message.threadId
          })} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
            Forward
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ForwardMessageModal;

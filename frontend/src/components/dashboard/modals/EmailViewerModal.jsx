import React, { useState } from 'react';
import { X, Mail, CheckCheck, Trash2, AlertOctagon } from 'lucide-react';

const EmailViewerModal = ({ open, onClose, email, onMarkRead, onDelete, onSpam }) => {
  if (!open || !email) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{email.subject}</h2>
              <p className="text-sm text-gray-600">From {email.from} via {email.provider}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          <div className="mb-4 text-sm text-gray-600">
            <div>To: {email.to}</div>
            <div>Received: {new Date(email.received_at).toLocaleString()}</div>
            <div className="flex gap-2 mt-2">
              {(email.tags||[]).map(tag => (
                <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">{tag}</span>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap">
              {email.snippet || 'No preview available.'}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-between">
          <div className="flex gap-2">
            <button onClick={()=>{ onMarkRead && onMarkRead(email.id); onClose(); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
              <CheckCheck className="w-4 h-4 mr-2"/>Mark Read
            </button>
            <button onClick={()=>{ onSpam && onSpam(email.id); onClose(); }} className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors flex items-center">
              <AlertOctagon className="w-4 h-4 mr-2"/>Spam
            </button>
            <button onClick={()=>{ onDelete && onDelete(email.id); onClose(); }} className="px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors flex items-center">
              <Trash2 className="w-4 h-4 mr-2"/>Delete
            </button>
          </div>
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailViewerModal;


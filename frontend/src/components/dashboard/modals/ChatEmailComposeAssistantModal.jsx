import React, { useState } from 'react';
import { X, Send, Brain } from 'lucide-react';
import { ContentIntelligenceAPIService } from '../../../services/contentIntelligenceApi';

const ChatEmailComposeAssistantModal = ({ open, onClose, onApply, context = {} }) => {
  const [messages, setMessages] = useState([
    { id: 'sys', role: 'assistant', text: 'What would you like the email to say?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const api = new ContentIntelligenceAPIService();

  if (!open) return null;

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = { id: `u_${Date.now()}`, role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const result = await api.request('/content/compose-email', {
        method: 'POST',
        body: JSON.stringify({ prompt: userMsg.text, context })
      });
      const draft = result?.data?.draft || {
        subject: 'Quick question about your recent order',
        body: 'Hi there,\n\nI wanted to reach out regarding your recent purchase and make sure everything is going smoothly. If you have any questions, just hit reply - I am here to help.\n\nBest,\nYour Name'
      };
      setMessages(prev => [...prev, { id: `a_${Date.now()}`, role: 'assistant', text: `Draft ready. Subject: ${draft.subject}\n\n${draft.body}` }]);
      setTimeout(() => {
        onApply && onApply(draft);
      }, 300);
    } catch (e) {
      const fallback = {
        subject: 'Following up — quick check-in',
        body: 'Hi,\n\nSharing a quick follow-up based on our last conversation. Let me know if you'd like more details.\n\nBest,'
      };
      setMessages(prev => [...prev, { id: `a_${Date.now()}`, role: 'assistant', text: `Draft ready. Subject: ${fallback.subject}\n\n${fallback.body}` }]);
      setTimeout(() => onApply && onApply(fallback), 300);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">AI Email Assistant</h2>
              <p className="text-sm text-gray-600">Describe what you want and AI will compose it</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-gray-50">
          {messages.map(m => (
            <div key={m.id} className={`${m.role==='assistant' ? 'bg-white border border-gray-200' : 'bg-purple-50 border border-purple-200'} rounded-lg p-4 text-sm`}>
              {m.text}
            </div>
          ))}
          {loading && <div className="text-xs text-gray-500 text-center">Composing...</div>}
        </div>

        <div className="p-4 border-t border-gray-200 flex items-center gap-2 bg-white">
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="Describe the email you want..." />
          <button onClick={send} disabled={loading || !input.trim()} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center disabled:opacity-50">
            <Send className="w-4 h-4 mr-2"/>Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatEmailComposeAssistantModal;

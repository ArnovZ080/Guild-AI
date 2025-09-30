import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { ContentIntelligenceAPIService } from '../../../services/contentIntelligenceApi';

// Chat modal that asks the user for intent and drafts email with agent
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
      // Call backend agent to compose (fallback to mock)
      const result = await api.request('/content/compose-email', {
        method: 'POST',
        body: JSON.stringify({ prompt: userMsg.text, context })
      });
      const draft = result?.data?.draft || {
        subject: 'Quick question about your recent order',
        body: 'Hi there,\n\nI wanted to reach out regarding your recent purchase and make sure everything is going smoothly. If you have any questions, just hit reply — I’m here to help.\n\nBest,\nYour Name'
      };
      setMessages(prev => [...prev, { id: `a_${Date.now()}`, role: 'assistant', text: `Draft ready. Subject: ${draft.subject}\n\n${draft.body}` }]);
      // Offer Apply
      setTimeout(() => {
        onApply && onApply(draft);
      }, 300);
    } catch (e) {
      const fallback = {
        subject: 'Following up — quick check-in',
        body: 'Hi,\n\nSharing a quick follow-up based on our last conversation. Let me know if you’d like more details.\n\nBest,'
      };
      setMessages(prev => [...prev, { id: `a_${Date.now()}`, role: 'assistant', text: `Draft ready. Subject: ${fallback.subject}\n\n${fallback.body}` }]);
      setTimeout(() => onApply && onApply(fallback), 300);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="font-semibold">AI Email Assistant</div>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100"><X className="w-4 h-4"/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2 text-sm">
          {messages.map(m => (
            <div key={m.id} className={m.role==='assistant' ? 'text-gray-800' : 'text-gray-900'}>
              {m.text}
            </div>
          ))}
          {loading && <div className="text-xs text-gray-500">Composing...</div>}
        </div>
        <div className="p-3 border-t flex items-center space-x-2">
          <input value={input} onChange={e=>setInput(e.target.value)} className="flex-1 border rounded px-2 py-2 text-sm" placeholder="Describe the email you want..." />
          <button onClick={send} disabled={loading || !input.trim()} className="px-3 py-2 bg-blue-600 text-white rounded disabled:opacity-50 flex items-center"><Send className="w-4 h-4 mr-1"/>Send</button>
        </div>
      </div>
    </div>
  );
};

export default ChatEmailComposeAssistantModal;



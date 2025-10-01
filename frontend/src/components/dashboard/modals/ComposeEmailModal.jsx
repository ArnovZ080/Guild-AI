import React, { useState } from 'react';
import { X, Send, Shield, Brain } from 'lucide-react';
import { ContentIntelligenceAPIService } from '../../../services/contentIntelligenceApi';
import ChatEmailComposeAssistantModal from './ChatEmailComposeAssistantModal.jsx';

const ComposeEmailModal = ({ open, onClose, defaultSegmentId, onSent }) => {
  const [to, setTo] = useState('');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [segment, setSegment] = useState(defaultSegmentId || 'all');
  const [sending, setSending] = useState(false);
  const [showAssistant, setShowAssistant] = useState(false);
  const [compliance, setCompliance] = useState(null);
  const [checking, setChecking] = useState(false);
  const api = new ContentIntelligenceAPIService();

  if (!open) return null;

  const send = async () => {
    setSending(true);
    try {
      const res = await api.sendEmail({ to, cc, bcc, subject, body, segment });
      onSent && onSent(res);
      onClose();
    } finally {
      setSending(false);
    }
  };

  const checkCompliance = async () => {
    setChecking(true);
    try {
      const result = await api.getEmailCompliance({ to, cc, bcc, subject, body });
      setCompliance(result?.data || { pass: true, issues: [] });
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Send className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Compose Email</h2>
              <p className="text-sm text-gray-600">Send a personalized email</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Segment</label>
            <input value={segment} onChange={e=>setSegment(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="segment id or 'all'" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To *</label>
              <input value={to} onChange={e=>setTo(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="email@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CC</label>
              <input value={cc} onChange={e=>setCc(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="optional" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">BCC</label>
              <input value={bcc} onChange={e=>setBcc(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="optional" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
            <input value={subject} onChange={e=>setSubject(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Body *</label>
            <textarea value={body} onChange={e=>setBody(e.target.value)} rows={10} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm" />
            <div className="mt-1 text-xs text-gray-500">Tip: Keep paragraphs short. Use one clear CTA.</div>
          </div>

          {compliance && (
            <div className={`rounded-lg border p-4 ${compliance.pass?'border-green-200 bg-green-50':'border-yellow-200 bg-yellow-50'}`}>
              <div className="flex items-center">
                <Shield className="w-5 h-5 mr-2 text-gray-700"/>
                <div className="text-sm font-semibold">Send Readiness: {compliance.pass ? 'Pass ✓' : 'Needs Attention'}</div>
              </div>
              {(compliance.issues||[]).length>0 && (
                <ul className="mt-2 space-y-1 text-xs text-gray-700">
                  {compliance.issues.map(issue => (
                    <li key={issue.id} className="flex items-start">
                      <span className="font-medium capitalize mr-1">{issue.label}:</span>
                      <span>{issue.why}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-between">
          <button onClick={()=>setShowAssistant(true)} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors flex items-center">
            <Brain className="w-4 h-4 mr-2" />
            Let an Agent write your email
          </button>
          <div className="flex items-center gap-3">
            <button onClick={checkCompliance} disabled={checking} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium">
              {checking?'Checking...':'Check Compliance'}
            </button>
            <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium">
              Cancel
            </button>
            <button onClick={send} disabled={sending || !subject.trim() || !body.trim()} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50">
              {sending?'Sending...':'Send Email'}
            </button>
          </div>
        </div>
      </div>
      <ChatEmailComposeAssistantModal
        open={showAssistant}
        onClose={()=>setShowAssistant(false)}
        onApply={(draft)=>{ setSubject(draft.subject||''); setBody(draft.body||''); setShowAssistant(false); }}
        context={{ to, segment }}
      />
    </div>
  );
};

export default ComposeEmailModal;

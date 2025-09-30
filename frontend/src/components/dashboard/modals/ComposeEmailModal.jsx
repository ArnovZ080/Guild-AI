import React, { useState } from 'react';
import { X } from 'lucide-react';
import { ContentIntelligenceAPIService } from '../../../services/contentIntelligenceApi';

const ComposeEmailModal = ({ open, onClose, defaultSegmentId, onSent }) => {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [segment, setSegment] = useState(defaultSegmentId || 'all');
  const [sending, setSending] = useState(false);
  const api = new ContentIntelligenceAPIService();

  if (!open) return null;

  const send = async () => {
    setSending(true);
    try {
      const res = await api.sendEmail({ subject, body, segment });
      onSent && onSent(res);
      onClose();
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="font-semibold">Compose Email</div>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100"><X className="w-4 h-4"/></button>
        </div>
        <div className="p-4 space-y-3 text-sm">
          <div>
            <label className="block text-gray-700 mb-1">Segment</label>
            <input value={segment} onChange={e=>setSegment(e.target.value)} className="w-full border rounded px-2 py-1" placeholder="segment id or 'all'" />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Subject</label>
            <input value={subject} onChange={e=>setSubject(e.target.value)} className="w-full border rounded px-2 py-1" />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Body</label>
            <textarea value={body} onChange={e=>setBody(e.target.value)} rows={10} className="w-full border rounded px-2 py-1 font-mono" />
            <div className="mt-1 text-xs text-gray-500">Tip: Keep paragraphs short. Use one clear CTA.</div>
          </div>
        </div>
        <div className="p-4 border-t flex justify-end space-x-2">
          <button onClick={onClose} className="px-3 py-2 border rounded">Cancel</button>
          <button onClick={send} disabled={sending || !subject.trim() || !body.trim()} className="px-3 py-2 bg-blue-600 text-white rounded disabled:opacity-50">{sending?'Sending...':'Send'}</button>
        </div>
      </div>
    </div>
  );
};

export default ComposeEmailModal;



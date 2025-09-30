import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { ContentIntelligenceAPIService } from '../../../services/contentIntelligenceApi';

const EditEmailCampaignModal = ({ open, onClose, campaign }) => {
  const [name, setName] = useState(campaign?.name || '');
  const [objective, setObjective] = useState(campaign?.objective || 'Engagement');
  const [status, setStatus] = useState(campaign?.status || 'scheduled');
  const [saving, setSaving] = useState(false);
  const api = new ContentIntelligenceAPIService();

  useEffect(() => {
    setName(campaign?.name || '');
    setObjective(campaign?.objective || 'Engagement');
    setStatus(campaign?.status || 'scheduled');
  }, [campaign]);

  if (!open) return null;

  const save = async () => {
    setSaving(true);
    try {
      await api.updateEmailCampaign(campaign?.campaign_id || campaign?.id, { name, objective, status });
      onClose(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="font-semibold">Edit Email Campaign</div>
          <button onClick={()=>onClose(false)} className="p-1 rounded hover:bg-gray-100"><X className="w-4 h-4"/></button>
        </div>
        <div className="p-4 space-y-3 text-sm">
          <div>
            <label className="block text-gray-700 mb-1">Name</label>
            <input value={name} onChange={e=>setName(e.target.value)} className="w-full border rounded px-2 py-1" />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Objective</label>
            <input value={objective} onChange={e=>setObjective(e.target.value)} className="w-full border rounded px-2 py-1" />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Status</label>
            <select value={status} onChange={e=>setStatus(e.target.value)} className="w-full border rounded px-2 py-1">
              {['scheduled','running','paused','completed'].map(s => (<option key={s} value={s}>{s}</option>))}
            </select>
          </div>
        </div>
        <div className="p-4 border-t flex justify-end space-x-2">
          <button onClick={()=>onClose(false)} className="px-3 py-2 border rounded">Cancel</button>
          <button onClick={save} disabled={saving} className="px-3 py-2 bg-blue-600 text-white rounded disabled:opacity-50">{saving?'Saving...':'Save'}</button>
        </div>
      </div>
    </div>
  );
};

export default EditEmailCampaignModal;



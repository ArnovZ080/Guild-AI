import React, { useEffect, useState } from 'react';
import { X, Settings } from 'lucide-react';
import { ContentIntelligenceAPIService, publishCampaignsUpdate } from '../../../services/contentIntelligenceApi';

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
      publishCampaignsUpdate({ action: 'update', campaign: { ...(campaign||{}), name, objective, status } });
      onClose(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Settings className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Edit Email Campaign</h2>
              <p className="text-sm text-gray-600">Update campaign details</p>
            </div>
          </div>
          <button onClick={()=>onClose(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input value={name} onChange={e=>setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Objective</label>
            <input value={objective} onChange={e=>setObjective(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select value={status} onChange={e=>setStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              {['scheduled','running','paused','completed'].map(s => (<option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>))}
            </select>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button onClick={()=>onClose(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium">
            Cancel
          </button>
          <button onClick={save} disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50">
            {saving?'Saving...':'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditEmailCampaignModal;

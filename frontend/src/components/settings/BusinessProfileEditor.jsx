import React, { useEffect, useState } from 'react';

const STORAGE_KEY = 'guild_onboarding_data';
const COMPLETED_KEY = 'guild_onboarding_completed';
const FOLLOWUPS_KEY = 'guild_pending_followups';

function loadOnboardingData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveOnboardingData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data || {}));
  } catch {}
}

// Merge keys from Onboarding Summary + a few convenience fields used by chat
const defaultModel = {
  // Summary: Business Overview
  business_type: '',
  business_stage: '',
  business_description: '',
  // Summary: Audience & Clients
  audience_type: '',
  customer_avatar: '',
  audience_problem: '',
  // Summary: Goals & Priorities
  priority_3months: '',
  guild_support_focus: '',
  vision_12months: '',
  // Summary: Preferences
  data_storage: '',
  automation_level: '',
  selectedSoftware: [],
  // Convenience used in Chat welcome
  firstTask: '',
  // Optional brand/financial quick fields
  brandVoice: '',
  financialGoals: '',
};

const sections = [
  {
    title: 'Business Overview',
    fields: [
      { key: 'business_type', label: 'Business Type' },
      { key: 'business_stage', label: 'Business Stage' },
      { key: 'business_description', label: 'Description', type: 'textarea' },
    ],
  },
  {
    title: 'Audience & Clients',
    fields: [
      { key: 'audience_type', label: 'Target Audience' },
      { key: 'customer_avatar', label: 'Customer Avatar' },
      { key: 'audience_problem', label: 'Main Problem' },
    ],
  },
  {
    title: 'Goals & Priorities',
    fields: [
      { key: 'priority_3months', label: '3-Month Priority' },
      { key: 'guild_support_focus', label: 'Guild Focus' },
      { key: 'vision_12months', label: '12-Month Vision' },
      { key: 'financialGoals', label: 'Financial Goals (next 12 months)' },
    ],
  },
  {
    title: 'Preferences',
    fields: [
      { key: 'data_storage', label: 'Data Storage' },
      { key: 'automation_level', label: 'Automation Level' },
      { key: 'selectedSoftware', label: 'Connected Tools (comma separated)', type: 'csv' },
    ],
  },
  {
    title: 'Chat Personalization',
    fields: [
      { key: 'firstTask', label: 'First Task You Want Help With' },
      { key: 'brandVoice', label: 'Brand Voice / Personality' },
    ],
  },
];

const BusinessProfileEditor = () => {
  const [model, setModel] = useState(defaultModel);
  const [rawJson, setRawJson] = useState('');
  const [useAdvanced, setUseAdvanced] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const existing = loadOnboardingData();
    const merged = { ...defaultModel, ...(existing || {}) };
    setModel(merged);
    setRawJson(JSON.stringify(existing || {}, null, 2));
  }, []);

  const handleChange = (key, value) => {
    setSaved(false);
    setModel(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSimple = () => {
    const next = { ...model };
    // Normalize csv field
    if (typeof next.selectedSoftware === 'string') {
      next.selectedSoftware = next.selectedSoftware
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
    }
    saveOnboardingData(next);
    localStorage.setItem(COMPLETED_KEY, 'true');
    // Optional: clear pending follow-ups so they can regenerate later
    // localStorage.removeItem(FOLLOWUPS_KEY);
    setRawJson(JSON.stringify(next, null, 2));
    setSaved(true);
  };

  const handleSaveAdvanced = () => {
    try {
      const parsed = JSON.parse(rawJson || '{}');
      saveOnboardingData(parsed);
      localStorage.setItem(COMPLETED_KEY, 'true');
      setModel({ ...defaultModel, ...parsed });
      setSaved(true);
    } catch (e) {
      alert('Invalid JSON. Please fix and try again.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Business Profile</h1>
      <p className="text-gray-600 mb-6">Edit your onboarding answers. These power chat suggestions and dashboard context.</p>

      <div className="mb-4">
        <label className="inline-flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={useAdvanced}
            onChange={(e) => setUseAdvanced(e.target.checked)}
            className="rounded border-gray-300"
          />
          <span>Advanced: edit raw JSON</span>
        </label>
      </div>

      {!useAdvanced ? (
        <div className="space-y-6">
          {sections.map(section => (
            <div key={section.title} className="bg-white border border-gray-200 rounded-xl p-4">
              <h3 className="text-base font-semibold text-gray-900 mb-3">{section.title}</h3>
              <div className="space-y-4">
                {section.fields.map(f => (
                  <div key={f.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                    {f.type === 'textarea' ? (
                      <textarea
                        rows={4}
                        value={model[f.key] || ''}
                        onChange={(e) => handleChange(f.key, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        placeholder={f.label}
                      />
                    ) : f.type === 'csv' ? (
                      <input
                        type="text"
                        value={Array.isArray(model[f.key]) ? model[f.key].join(', ') : (model[f.key] || '')}
                        onChange={(e) => handleChange(f.key, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        placeholder="e.g., Notion, Slack, Google Drive"
                      />
                    ) : (
                      <input
                        type="text"
                        value={model[f.key] || ''}
                        onChange={(e) => handleChange(f.key, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        placeholder={f.label}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="pt-2">
            <button
              onClick={handleSaveSimple}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Profile
            </button>
            {saved && <span className="ml-3 text-sm text-green-600">Saved.</span>}
          </div>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Onboarding JSON</label>
          <textarea
            value={rawJson}
            onChange={(e) => { setSaved(false); setRawJson(e.target.value); }}
            rows={12}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
          />
          <div className="pt-2">
            <button
              onClick={handleSaveAdvanced}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save JSON
            </button>
            {saved && <span className="ml-3 text-sm text-green-600">Saved.</span>}
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessProfileEditor;



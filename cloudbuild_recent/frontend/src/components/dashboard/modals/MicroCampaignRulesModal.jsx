import React, { useState, useEffect } from 'react';
import { X, Shield, Info, Percent, Clock, DollarSign, Users } from 'lucide-react';

const MicroCampaignRulesModal = ({ isOpen, onClose, segment, onSave }) => {
  const [rules, setRules] = useState({
    maxDiscountPercent: 20,
    minPurchasesBeforeUpsell: 2,
    frequencyCapPerWeek: 3,
    dailyBudgetCap: 50,
    requireHumanApproval: false,
    allowedChannels: [],
    notes: ''
  });

  useEffect(() => {
    if (segment?.rules) {
      setRules(prev => ({ ...prev, ...segment.rules }));
    }
  }, [segment]);

  if (!isOpen) return null;

  const handleToggleChannel = (channel) => {
    setRules(prev => {
      const set = new Set(prev.allowedChannels || []);
      set.has(channel) ? set.delete(channel) : set.add(channel);
      return { ...prev, allowedChannels: Array.from(set) };
    });
  };

  const handleSave = () => {
    const payload = { ...rules, segmentId: segment?.id, segmentName: segment?.name };
    onSave?.(payload);
    onClose?.();
  };

  const channelOptions = Array.isArray(segment?.channels) && segment.channels.length > 0
    ? segment.channels
    : ['email', 'instagram', 'facebook', 'tiktok', 'linkedin', 'ads'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-100 rounded-lg"><Shield className="w-5 h-5 text-emerald-700" /></div>
            <div>
              <div className="text-lg font-semibold text-gray-900">Micro-campaign Guardrails</div>
              <div className="text-xs text-gray-600">Define constraints and approval rules for segment-level automations</div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto" style={{maxHeight: 'calc(95vh - 180px)'}}>
          <div className="space-y-5">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm">
            <div className="font-medium text-gray-900">Segment</div>
            <div className="text-gray-700">{segment?.name || 'Unnamed Segment'}</div>
            <div className="text-xs text-gray-600 mt-1">Channels: {(segment?.channels || []).join(', ') || '—'}</div>
            {segment?.value_prop && <div className="text-xs text-gray-600">Value Prop: {segment.value_prop}</div>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Percent className="w-4 h-4 text-gray-700" />
                <div className="font-medium text-gray-900">Discount Guardrails</div>
              </div>
              <label className="block text-sm text-gray-700 mb-1">Max Discount (%)</label>
              <input type="number" value={rules.maxDiscountPercent}
                onChange={(e)=>setRules(p=>({ ...p, maxDiscountPercent: parseFloat(e.target.value||'0')}))}
                className="w-full px-3 py-2 border border-gray-300 rounded" />
              <div className="mt-2 text-xs text-gray-600">Prevent overly aggressive offers. Default 20%.</div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-4 h-4 text-gray-700" />
                <div className="font-medium text-gray-900">Upsell Eligibility</div>
              </div>
              <label className="block text-sm text-gray-700 mb-1">Min Purchases Before Upsell</label>
              <input type="number" value={rules.minPurchasesBeforeUpsell}
                onChange={(e)=>setRules(p=>({ ...p, minPurchasesBeforeUpsell: parseInt(e.target.value||'0', 10)}))}
                className="w-full px-3 py-2 border border-gray-300 rounded" />
              <div className="mt-2 text-xs text-gray-600">Ensure user value before proposing higher tiers.</div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-4 h-4 text-gray-700" />
                <div className="font-medium text-gray-900">Frequency Caps</div>
              </div>
              <label className="block text-sm text-gray-700 mb-1">Max Touches Per Week</label>
              <input type="number" value={rules.frequencyCapPerWeek}
                onChange={(e)=>setRules(p=>({ ...p, frequencyCapPerWeek: parseInt(e.target.value||'0', 10)}))}
                className="w-full px-3 py-2 border border-gray-300 rounded" />
              <div className="mt-2 text-xs text-gray-600">Respect user attention, prevent overload.</div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="w-4 h-4 text-gray-700" />
                <div className="font-medium text-gray-900">Budget Control</div>
              </div>
              <label className="block text-sm text-gray-700 mb-1">Daily Budget Cap ($)</label>
              <input type="number" value={rules.dailyBudgetCap}
                onChange={(e)=>setRules(p=>({ ...p, dailyBudgetCap: parseFloat(e.target.value||'0')}))}
                className="w-full px-3 py-2 border border-gray-300 rounded" />
              <div className="mt-2 text-xs text-gray-600">Soft cap for ad-driven micro-campaigns.</div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="font-medium text-gray-900 mb-2">Allowed Channels</div>
            <div className="flex flex-wrap gap-2">
              {channelOptions.map(ch => (
                <label key={ch} className={`px-3 py-1.5 text-xs rounded-md border cursor-pointer ${rules.allowedChannels?.includes(ch) ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-700 border-gray-300'}`}>
                  <input type="checkbox" className="hidden" checked={rules.allowedChannels?.includes(ch)} onChange={()=>handleToggleChannel(ch)} />
                  {ch}
                </label>
              ))}
            </div>
            <div className="mt-3">
              <label className="inline-flex items-center space-x-2 text-sm text-gray-700">
                <input type="checkbox" className="rounded border-gray-300" checked={rules.requireHumanApproval} onChange={(e)=>setRules(p=>({ ...p, requireHumanApproval: e.target.checked }))} />
                <span>Require human approval before sending</span>
              </label>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="font-medium text-gray-900 mb-2">Notes</div>
            <textarea value={rules.notes} onChange={(e)=>setRules(p=>({ ...p, notes: e.target.value }))} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded" placeholder="Add any constraints, messaging tone preferences, or exclusions..." />
            <div className="mt-2 text-xs text-gray-600 flex items-start gap-2">
              <Info className="w-4 h-4 mt-0.5 text-gray-500" />
              <div>These guardrails are used by the Orchestrator and Automation agents when implementing micro-campaigns for this segment.</div>
            </div>
          </div>

          </div>
        </div>
        <div className="flex items-center justify-end p-6 border-t border-gray-200 bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800 mr-2">Cancel</button>
          <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Save Rules</button>
        </div>
      </div>
    </div>
  );
};

export default MicroCampaignRulesModal;



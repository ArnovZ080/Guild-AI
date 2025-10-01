import React, { useState, useEffect } from 'react';
import { X, Target, DollarSign, Calendar, Info, CheckCircle, Lightbulb } from 'lucide-react';

// Shows the AI-recommended setup and lets user tweak only targeting, budget, duration.
// Everything else is locked to the agents' recommended settings for transparency and reproducibility.
const CampaignImplementSummaryModal = ({ isOpen, onClose, recommendation, onConfirm }) => {
  const [targeting, setTargeting] = useState('');
  const [budget, setBudget] = useState('');
  const [duration, setDuration] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    // Prefill editable fields from recommendation if present
    const defaultTarget = recommendation?.targeting || recommendation?.audience || '';
    const defaultBudget = recommendation?.budget || recommendation?.effort_budget || '';
    const defaultDuration = recommendation?.duration || 7;
    setTargeting(defaultTarget);
    setBudget(defaultBudget);
    setDuration(defaultDuration);
  }, [isOpen, recommendation]);

  if (!isOpen) return null;

  const lockedPlatforms = recommendation?.platform || (Array.isArray(recommendation?.channels) ? recommendation.channels : (Array.isArray(recommendation?.suggested_channels) ? recommendation.suggested_channels : []));
  const lockedAngle = recommendation?.angle || recommendation?.title || '';
  const lockedWhy = recommendation?.why || '';
  const lockedEvidence = recommendation?.evidence || '';

  const handleConfirm = () => {
    onConfirm?.({ targeting, budget, duration });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Implement Recommendation</h2>
              <p className="text-sm text-gray-600">We’ll apply the agents’ setup and let you adjust key levers</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 p-6 overflow-y-auto" style={{maxHeight: 'calc(95vh - 180px)'}}>
          <div className="space-y-4">
            {/* Summary strip */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Lightbulb className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-gray-900">Recommendation Summary</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
                <div><span className="font-medium">Angle:</span> {lockedAngle || '—'}</div>
                <div><span className="font-medium">Platforms:</span> {Array.isArray(lockedPlatforms) ? lockedPlatforms.join(', ') : (lockedPlatforms || '—')}</div>
                <div className="md:col-span-2"><span className="font-medium">Why now:</span> {lockedWhy || '—'}</div>
                {lockedEvidence && <div className="md:col-span-2"><span className="font-medium">Evidence:</span> {lockedEvidence}</div>}
              </div>
            </div>

            {/* Locked settings */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm font-semibold text-gray-900 mb-2">Locked by Agents</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
                <div className="flex items-center space-x-2"><Target className="w-4 h-4 text-blue-600" /><span>Creative & placements per Brand/Enhanced Campaign Agents</span></div>
                <div className="flex items-center space-x-2"><Info className="w-4 h-4 text-purple-600" /><span>Optimization strategy per Strategy Agent</span></div>
              </div>
            </div>

            {/* Editable controls */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm font-semibold text-gray-900 mb-3">Adjustable</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Targeting</label>
                  <textarea value={targeting} onChange={(e)=>setTargeting(e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Describe audience, geo, interests..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Budget (daily $)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input type="number" value={budget} onChange={(e)=>setBudget(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="50" />
                  </div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 mt-3">Duration (days)</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input type="number" value={duration} onChange={(e)=>setDuration(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="7" />
                  </div>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-600">These inputs slightly adjust the recommendation. All other parameters remain governed by the agents to achieve the projected outcome.</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200 bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800 mr-2">Cancel</button>
          <button onClick={handleConfirm} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Confirm & Implement</button>
        </div>
      </div>
    </div>
  );
};

export default CampaignImplementSummaryModal;



import React from 'react';
import { X, BrainCircuit } from 'lucide-react';
import MarketingCampaignCreator from '../../MarketingCampaignCreator';

const AIWorkflowCreateCampaignModal = ({ isOpen, onClose, onCreateCampaign, apiBaseUrl }) => {
  // Pull onboarding defaults for objective/audience
  let initialObjective = '';
  let initialAudienceDesc = '';
  try {
    const onboardingStr = typeof window !== 'undefined' ? localStorage.getItem('guild_onboarding_data') : null;
    if (onboardingStr) {
      const data = JSON.parse(onboardingStr);
      initialObjective = data.businessType || data.answers?.[0] || '';
      initialAudienceDesc = data.idealClient || data.clientAvatar || data.answers?.[3] || '';
    }
  } catch {}
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BrainCircuit className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">AI Orchestrated Campaign</h2>
              <p className="text-sm text-gray-600">Plan approval and live agent workflow monitoring</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="p-6 overflow-auto">
            <MarketingCampaignCreator
              apiBaseUrl={apiBaseUrl}
              onCreated={(campaign) => {
                try { if (onCreateCampaign) onCreateCampaign(campaign); } catch (_) {}
              }}
              initialObjective={initialObjective}
              initialAudienceDesc={initialAudienceDesc}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIWorkflowCreateCampaignModal;



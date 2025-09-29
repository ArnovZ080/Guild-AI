import React from 'react';
import { X, BrainCircuit } from 'lucide-react';
import MarketingCampaignCreator from '../../MarketingCampaignCreator';

const AIWorkflowCreateCampaignModal = ({ isOpen, onClose, onCreateCampaign, apiBaseUrl }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BrainCircuit className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">AI Orchestrated Campaign</h2>
              <p className="text-xs text-gray-600">Plan approval and live agent workflow monitoring</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="h-[calc(95vh-64px-20px)] p-4 overflow-auto">
            <MarketingCampaignCreator apiBaseUrl={apiBaseUrl} onCreated={(campaign) => {
              try { if (onCreateCampaign) onCreateCampaign(campaign); } catch (_) {}
            }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIWorkflowCreateCampaignModal;



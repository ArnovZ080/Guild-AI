import React from 'react';
import { Target, Plus } from 'lucide-react';

const CampaignsTab = ({ campaigns, onCampaignAction }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Target className="w-5 h-5 text-blue-500 mr-2" />
            Active Campaigns
          </h3>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Create Campaign
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(campaigns || []).map((campaign) => (
            <div key={campaign.campaign_id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">{campaign.name}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                  campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {campaign.status}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Platform:</span>
                  <span className="font-medium text-gray-900 capitalize">{campaign.platform}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Budget:</span>
                  <span className="font-medium text-gray-900">${campaign.budget?.toLocaleString?.() || campaign.budget}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ROAS:</span>
                  <span className="font-medium text-gray-900">{campaign.roas}x</span>
                </div>
              </div>
              <div className="flex items-center justify-end space-x-2 mt-4">
                <button
                  onClick={() => onCampaignAction?.(campaign.campaign_id, campaign.status === 'active' ? 'pause' : 'resume')}
                  className={`px-3 py-1 text-xs rounded ${campaign.status === 'active' ? 'bg-yellow-600 text-white hover:bg-yellow-700' : 'bg-green-600 text-white hover:bg-green-700'}`}
                >
                  {campaign.status === 'active' ? 'Pause' : 'Resume'}
                </button>
                <button
                  onClick={() => onCampaignAction?.(campaign.campaign_id, 'details')}
                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CampaignsTab;

import React from 'react';
import { UserCheck } from 'lucide-react';

const CustomerSegmentsTab = ({ segments = [], onSegmentAction }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center"><UserCheck className="w-5 h-5 text-purple-500 mr-2" />Customer Segments</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {segments.map((segment) => (
            <div key={segment.segment_id} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">{segment.name}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${segment.engagement_level === 'high' ? 'bg-green-100 text-green-800' : segment.engagement_level === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{segment.engagement_level}</span>
              </div>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between"><span className="text-gray-600">Customers:</span><span className="font-medium">{segment.customer_count}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Avg LTV:</span><span className="font-medium">${segment.average_lifetime_value.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Churn Rate:</span><span className="font-medium">{segment.churn_rate}%</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Growth Potential:</span><span className="font-medium capitalize">{segment.growth_potential}</span></div>
              </div>
              <div className="mb-4">
                <h5 className="font-medium text-gray-900 mb-2">Recommended Actions</h5>
                <div className="space-y-1">
                  {segment.recommended_actions.slice(0, 2).map((action, index) => (
                    <div key={index} className="text-xs text-gray-600 bg-gray-50 p-2 rounded">{action}</div>
                  ))}
                </div>
              </div>
              <button onClick={() => onSegmentAction && onSegmentAction(segment.segment_id, segment.recommended_actions)} className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">Execute Actions</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerSegmentsTab;



import React from 'react';
import { Target } from 'lucide-react';

const CustomerFunnelTab = ({ customerAnalysis }) => {
  const funnelData = {
    Lead: { count: 1000, conversion: 100 },
    Prospect: { count: 600, conversion: 60 },
    Trial: { count: 300, conversion: 50 },
    Customer: { count: 180, conversion: 60 },
    Evangelist: { count: 54, conversion: 30 }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center"><Target className="w-5 h-5 text-blue-500 mr-2" />Customer Journey Funnel</h3>
        <div className="space-y-4">
          {Object.entries(funnelData).map(([stage, data], index) => {
            const width = (data.count / 1000) * 100;
            return (
              <div key={stage} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{stage}</h4>
                  <div className="text-right"><span className="font-semibold text-gray-900">{data.count}</span><span className="text-sm text-gray-600 ml-2">({data.conversion}% conversion)</span></div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-6">
                  <div className="bg-blue-600 h-6 rounded-full flex items-center justify-center" style={{ width: `${width}%` }}>
                    <span className="text-white text-sm font-medium">{data.count}</span>
                  </div>
                </div>
                {index < Object.keys(funnelData).length - 1 && (
                  <div className="flex justify-center mt-2"><div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-300"></div></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CustomerFunnelTab;



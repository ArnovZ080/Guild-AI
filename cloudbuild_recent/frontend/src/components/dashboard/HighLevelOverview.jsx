import React from 'react';

// Non-invasive snapshot panel matching existing dashboard aesthetics
const HighLevelOverview = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Next 4 Hours</p>
            <p className="text-2xl font-bold text-gray-900">6 items</p>
          </div>
          <div className="p-3 bg-blue-100 rounded-lg">
            <span className="text-blue-600 text-sm font-semibold">Now</span>
          </div>
        </div>
        <p className="mt-3 text-xs text-gray-500">Light workload window</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Cashflow Status</p>
            <p className="text-2xl font-bold text-gray-900">Healthy</p>
          </div>
          <div className="p-3 bg-green-100 rounded-lg">
            <span className="text-green-600 text-sm font-semibold">OK</span>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
          <div className="bg-green-500 h-2 rounded-full" style={{ width: '72%' }}></div>
        </div>
        <p className="mt-3 text-xs text-gray-500">Runway: 5.2 months</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Agent Activity</p>
            <p className="text-2xl font-bold text-gray-900">8 running</p>
          </div>
          <div className="p-3 bg-purple-100 rounded-lg">
            <span className="text-purple-600 text-sm font-semibold">Live</span>
          </div>
        </div>
        <p className="mt-3 text-xs text-gray-500">47 tasks done today</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Customer Alerts</p>
            <p className="text-2xl font-bold text-gray-900">3</p>
          </div>
          <div className="p-3 bg-orange-100 rounded-lg">
            <span className="text-orange-600 text-sm font-semibold">Action</span>
          </div>
        </div>
        <ul className="mt-3 space-y-1 text-sm text-gray-600">
          <li>2 messages awaiting reply</li>
          <li>1 renewal this week</li>
        </ul>
      </div>
    </div>
  );
};

export default HighLevelOverview;



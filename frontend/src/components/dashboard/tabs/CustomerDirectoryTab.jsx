import React, { useState } from 'react';
import { Users, Search } from 'lucide-react';

const CustomerDirectoryTab = ({ profiles = [], onCustomerAction }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('all');

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = profile.name.toLowerCase().includes(searchTerm.toLowerCase()) || profile.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSegment = selectedSegment === 'all' || profile.customer_segment === selectedSegment;
    return matchesSearch && matchesSegment;
  });

  const segments = ['all', 'high_value', 'at_risk', 'new_customers', 'inactive'];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center"><Users className="w-5 h-5 text-blue-500 mr-2" />Customer Directory</h3>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search customers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm" />
            </div>
            <select value={selectedSegment} onChange={(e) => setSelectedSegment(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md text-sm">
              {segments.map(segment => (<option key={segment} value={segment}>{segment === 'all' ? 'All Segments' : segment.replace('_', ' ')}</option>))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProfiles.slice(0, 12).map((profile) => (
            <div key={profile.customer_id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">{profile.name}</h4>
                  <p className="text-sm text-gray-600">{profile.email}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getChurnRiskColor(profile.churn_risk)}`}>{profile.churn_risk}</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Segment:</span><span className="font-medium capitalize">{profile.customer_segment.replace('_', ' ')}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">LTV:</span><span className="font-medium">${profile.lifetime_value.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Health Score:</span><span className="font-medium">{profile.health_score}/100</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Orders:</span><span className="font-medium">{profile.total_orders}</span></div>
              </div>
              <div className="mt-3 pt-3 border-t">
                <div className="flex justify-between text-xs text-gray-500"><span>Last Activity:</span><span>{new Date(profile.last_activity).toLocaleDateString()}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const getChurnRiskColor = (risk) => {
  switch (risk) {
    case 'low': return 'text-green-600 bg-green-100';
    case 'medium': return 'text-yellow-600 bg-yellow-100';
    case 'high': return 'text-orange-600 bg-orange-100';
    case 'critical': return 'text-red-600 bg-red-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

export default CustomerDirectoryTab;



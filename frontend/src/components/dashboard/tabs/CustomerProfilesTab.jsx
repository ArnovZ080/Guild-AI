import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Tag,
  Building,
  Globe,
  Smartphone,
  Monitor,
  Laptop,
  Eye,
  Edit,
  Trash2,
  Send,
  Heart,
  Star,
  AlertTriangle,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  Brain,
  Sparkles,
  Shield,
  Zap,
  CheckCircle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Bell,
  UserPlus,
  UserMinus,
  Target,
  BarChart3,
  X
} from 'lucide-react';

import CustomerProfileModal from '../modals/CustomerProfileModal.jsx';
import CustomerHealthCheckModal from '../modals/CustomerHealthCheckModal.jsx';
import CustomerJourneyModal from '../modals/CustomerJourneyModal.jsx';

const CustomerProfilesTab = ({ profiles }) => {
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [sortBy, setSortBy] = useState('health_score');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFullProfileModal, setShowFullProfileModal] = useState(false);
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [showJourneyModal, setShowJourneyModal] = useState(false);

  // Sort profiles
  const sortedProfiles = [...profiles].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const getChurnRiskColor = (risk) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSegmentColor = (segment) => {
    switch (segment) {
      case 'high_value': return 'text-purple-600 bg-purple-100';
      case 'at_risk': return 'text-red-600 bg-red-100';
      case 'new_customers': return 'text-blue-600 bg-blue-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getEngagementTrend = (trend) => {
    switch (trend) {
      case 'increasing': return { icon: TrendingUp, color: 'text-green-500' };
      case 'decreasing': return { icon: TrendingDown, color: 'text-red-500' };
      default: return { icon: Activity, color: 'text-gray-500' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <User className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Customer Profiles</h3>
              <p className="text-sm text-gray-600">Deep dive into individual customer profiles</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="health_score">Sort by Health Score</option>
              <option value="lifetime_value">Sort by LTV</option>
              <option value="engagement_score">Sort by Engagement</option>
              <option value="last_activity">Sort by Last Activity</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors flex items-center"
            >
              {sortOrder === 'asc' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {profiles.filter(p => p.health_score >= 80).length}
            </div>
            <div className="text-green-600">Excellent Health</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {profiles.filter(p => p.health_score >= 60 && p.health_score < 80).length}
            </div>
            <div className="text-blue-600">Good Health</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {profiles.filter(p => p.health_score >= 40 && p.health_score < 60).length}
            </div>
            <div className="text-yellow-600">Warning</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {profiles.filter(p => p.health_score < 40).length}
            </div>
            <div className="text-red-600">Critical</div>
          </div>
        </div>
      </div>

      {/* Customer Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedProfiles.map((profile, index) => (
          <motion.div
            key={profile.customer_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => setSelectedProfile(profile)}
          >
            {/* Profile Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{profile.name}</h4>
                  <p className="text-sm text-gray-600">{profile.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getChurnRiskColor(profile.churn_risk)}`}>
                  {profile.churn_risk}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSegmentColor(profile.customer_segment)}`}>
                  {profile.customer_segment.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Health Score */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Health Score</span>
                <span className={`text-lg font-bold ${getHealthScoreColor(profile.health_score)}`}>
                  {profile.health_score}/100
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    profile.health_score >= 80 ? 'bg-green-500' :
                    profile.health_score >= 60 ? 'bg-blue-500' :
                    profile.health_score >= 40 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${profile.health_score}%` }}
                ></div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-900">${profile.lifetime_value.toLocaleString()}</div>
                <div className="text-xs text-gray-600">Lifetime Value</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-900">{profile.total_orders}</div>
                <div className="text-xs text-gray-600">Total Orders</div>
              </div>
            </div>

            {/* Engagement Indicators */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Engagement Score</span>
                <span className="text-sm font-medium">{profile.engagement_score}/100</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Sentiment Score</span>
                <span className="text-sm font-medium">{(profile.sentiment_score * 100).toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Activity</span>
                <span className="text-sm font-medium">
                  {new Date(profile.last_activity).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Health Indicators */}
            {profile.health_indicators && (
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Health Indicators</h5>
                <div className="space-y-1">
                  {Object.entries(profile.health_indicators).map(([key, trend]) => {
                    const { icon: Icon, color } = getEngagementTrend(trend);
                    return (
                      <div key={key} className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 capitalize">{key.replace('_', ' ')}</span>
                        <div className={`flex items-center ${color}`}>
                          <Icon className="w-3 h-3 mr-1" />
                          <span className="capitalize">{trend}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Footer info only; redundant icon actions removed */}
            <div className="mt-3 pt-3 border-t">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Last Activity:</span>
                <span>{new Date(profile.last_activity).toLocaleDateString()}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Selected Profile Details Modal */}
      {selectedProfile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedProfile(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{selectedProfile.name}</h3>
                    <p className="text-gray-600">{selectedProfile.email}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getChurnRiskColor(selectedProfile.churn_risk)}`}>
                        {selectedProfile.churn_risk} risk
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSegmentColor(selectedProfile.customer_segment)}`}>
                        {selectedProfile.customer_segment.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProfile(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Tab Navigation */}
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
                {[
                  { id: 'overview', label: 'Overview', icon: BarChart3 },
                  { id: 'contact', label: 'Contact', icon: Mail },
                  { id: 'engagement', label: 'Engagement', icon: Activity },
                  { id: 'journey', label: 'Journey', icon: Target }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab Content */}
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900">Key Metrics</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Health Score</span>
                        <span className={`font-semibold ${getHealthScoreColor(selectedProfile.health_score)}`}>
                          {selectedProfile.health_score}/100
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Lifetime Value</span>
                        <span className="font-semibold">${selectedProfile.lifetime_value.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Orders</span>
                        <span className="font-semibold">{selectedProfile.total_orders}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Engagement Score</span>
                        <span className="font-semibold">{selectedProfile.engagement_score}/100</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900">Health Indicators</h4>
                    {selectedProfile.health_indicators && (
                      <div className="space-y-2">
                        {Object.entries(selectedProfile.health_indicators).map(([key, trend]) => {
                          const { icon: Icon, color } = getEngagementTrend(trend);
                          return (
                            <div key={key} className="flex items-center justify-between">
                              <span className="text-gray-600 capitalize">{key.replace('_', ' ')}</span>
                              <div className={`flex items-center ${color}`}>
                                <Icon className="w-4 h-4 mr-1" />
                                <span className="capitalize">{trend}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'contact' && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Contact Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{selectedProfile.email}</span>
                      </div>
                      {selectedProfile.phone && (
                        <div className="flex items-center space-x-3">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{selectedProfile.phone}</span>
                        </div>
                      )}
                      {selectedProfile.company && (
                        <div className="flex items-center space-x-3">
                          <Building className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{selectedProfile.company}</span>
                        </div>
                      )}
                      {selectedProfile.location && (
                        <div className="flex items-center space-x-3">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{selectedProfile.location}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      {selectedProfile.industry && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">Industry</span>
                          <p className="text-gray-600">{selectedProfile.industry}</p>
                        </div>
                      )}
                      {selectedProfile.source && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">Source</span>
                          <p className="text-gray-600">{selectedProfile.source}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-sm font-medium text-gray-700">Created</span>
                        <p className="text-gray-600">
                          {new Date(selectedProfile.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'engagement' && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Engagement Metrics</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Engagement Score</span>
                        <span className="font-semibold">{selectedProfile.engagement_score}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sentiment Score</span>
                        <span className="font-semibold">{(selectedProfile.sentiment_score * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Support Tickets</span>
                        <span className="font-semibold">{selectedProfile.support_tickets}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Activity</span>
                        <span className="font-semibold">
                          {new Date(selectedProfile.last_activity).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Lifecycle Stage</span>
                        <span className="font-semibold capitalize">{selectedProfile.lifecycle_stage}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Preferred Communication</span>
                        <span className="font-semibold">{selectedProfile.preferred_communication}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'journey' && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Customer Journey</h4>
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Current Stage</span>
                      <p className="text-gray-600 capitalize">{selectedProfile.journey_stage}</p>
                    </div>
                    {selectedProfile.touchpoints && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Recent Touchpoints</span>
                        <div className="space-y-2 mt-2">
                          {selectedProfile.touchpoints.map((touchpoint, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-sm capitalize">{touchpoint.type}</span>
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(touchpoint.date).toLocaleDateString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => { setShowFullProfileModal(true); }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Full Profile
                </button>
                <button
                  onClick={() => { setShowHealthModal(true); }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Health Check
                </button>
                <button
                  onClick={() => { setShowJourneyModal(true); }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                >
                  <Target className="w-4 h-4 mr-2" />
                  View Journey
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Real Modals */}
      {showFullProfileModal && selectedProfile && (
        <CustomerProfileModal
          customer={selectedProfile}
          isOpen={showFullProfileModal}
          onClose={() => setShowFullProfileModal(false)}
          onSave={() => setShowFullProfileModal(false)}
          onAction={() => {}}
        />
      )}

      {showHealthModal && selectedProfile && (
        <CustomerHealthCheckModal
          open={showHealthModal}
          onClose={() => setShowHealthModal(false)}
          customer={selectedProfile}
        />
      )}

      {showJourneyModal && selectedProfile && (
        <CustomerJourneyModal
          open={showJourneyModal}
          onClose={() => setShowJourneyModal(false)}
          customer={selectedProfile}
        />
      )}
    </div>
  );
};

export default CustomerProfilesTab;

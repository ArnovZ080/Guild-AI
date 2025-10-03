import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Send,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Tag,
  Shield,
  Brain,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Bell,
  TrendingUp,
  TrendingDown,
  Activity,
  UserPlus,
  UserMinus,
  Heart,
  Star,
  AlertTriangle,
  Clock,
  DollarSign,
  Zap,
  CheckCircle,
  Globe,
  Smartphone,
  Monitor,
  Laptop,
  Building
} from 'lucide-react';

const CustomerListTab = ({ 
  profiles, 
  segments, 
  searchTerm, 
  setSearchTerm, 
  selectedSegment, 
  setSelectedSegment, 
  onCustomerAction, 
  onProfileView,
  onSegmentAction 
}) => {
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [expandedCustomer, setExpandedCustomer] = useState(null);
  const [selectedCustomers, setSelectedCustomers] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    healthScore: { min: 0, max: 100 },
    lifetimeValue: { min: 0, max: 10000 },
    churnRisk: 'all',
    engagementScore: { min: 0, max: 100 }
  });

  // Filter and search profiles
  const filteredProfiles = profiles?.filter(profile => {
    const matchesSearch = profile.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (profile.company && profile.company.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSegment = selectedSegment === 'all' || profile.customer_segment === selectedSegment;
    const matchesHealthScore = profile.health_score >= filters.healthScore.min && 
                              profile.health_score <= filters.healthScore.max;
    const matchesLTV = profile.lifetime_value >= filters.lifetimeValue.min && 
                      profile.lifetime_value <= filters.lifetimeValue.max;
    const matchesChurnRisk = filters.churnRisk === 'all' || profile.churn_risk === filters.churnRisk;
    const matchesEngagement = profile.engagement_score >= filters.engagementScore.min && 
                             profile.engagement_score <= filters.engagementScore.max;
    
    return matchesSearch && matchesSegment && matchesHealthScore && 
           matchesLTV && matchesChurnRisk && matchesEngagement;
  }) || [];

  // Sort profiles
  const sortedProfiles = [...(filteredProfiles || [])].sort((a, b) => {
    let aValue = a?.[sortBy];
    let bValue = b?.[sortBy];

    // Normalize values for comparison
    const aIsString = typeof aValue === 'string';
    const bIsString = typeof bValue === 'string';
    if (aIsString || bIsString) {
      aValue = (aValue ?? '').toString().toLowerCase();
      bValue = (bValue ?? '').toString().toLowerCase();
    } else {
      aValue = Number(aValue ?? 0);
      bValue = Number(bValue ?? 0);
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

  const handleCustomerSelect = (customerId, isSelected) => {
    const newSelected = new Set(selectedCustomers);
    if (isSelected) {
      newSelected.add(customerId);
    } else {
      newSelected.delete(customerId);
    }
    setSelectedCustomers(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedCustomers.size === sortedProfiles.length) {
      setSelectedCustomers(new Set());
    } else {
      setSelectedCustomers(new Set(sortedProfiles.map(p => p.customer_id)));
    }
  };

  const handleBulkAction = (action) => {
    if (selectedCustomers.size === 0) {
      alert('Please select customers first');
      return;
    }
    onCustomerAction(action, Array.from(selectedCustomers));
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 space-y-4 lg:space-y-0">
          <div className="flex items-center">
            <Users className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Customer Directory</h3>
              <p className="text-sm text-gray-600">Search and manage your customer base</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Search and Segment Filter */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers by name, email, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <select
            value={selectedSegment}
            onChange={(e) => setSelectedSegment(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Segments</option>
            {segments?.map(segment => {
              const value = segment?.name ? segment.name.toLowerCase().replace(/\s+/g, '_') : 'unknown';
              return (
                <option key={segment.segment_id || value} value={value}>
                  {segment?.name || 'Unknown'}
                </option>
              );
            })}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="name">Sort by Name</option>
            <option value="lifetime_value">Sort by LTV</option>
            <option value="health_score">Sort by Health Score</option>
            <option value="last_activity">Sort by Last Activity</option>
            <option value="total_orders">Sort by Orders</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors flex items-center"
          >
            {sortOrder === 'asc' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-50 rounded-lg p-4 mb-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Health Score</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={filters.healthScore.min}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      healthScore: { ...prev.healthScore, min: parseInt(e.target.value) }
                    }))}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="Min"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    value={filters.healthScore.max}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      healthScore: { ...prev.healthScore, max: parseInt(e.target.value) }
                    }))}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="Max"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lifetime Value</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={filters.lifetimeValue.min}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      lifetimeValue: { ...prev.lifetimeValue, min: parseInt(e.target.value) }
                    }))}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="Min"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    value={filters.lifetimeValue.max}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      lifetimeValue: { ...prev.lifetimeValue, max: parseInt(e.target.value) }
                    }))}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="Max"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Churn Risk</label>
                <select
                  value={filters.churnRisk}
                  onChange={(e) => setFilters(prev => ({ ...prev, churnRisk: e.target.value }))}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="all">All Risk Levels</option>
                  <option value="low">Low Risk</option>
                  <option value="medium">Medium Risk</option>
                  <option value="high">High Risk</option>
                  <option value="critical">Critical Risk</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Engagement Score</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={filters.engagementScore.min}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      engagementScore: { ...prev.engagementScore, min: parseInt(e.target.value) }
                    }))}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="Min"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    value={filters.engagementScore.max}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      engagementScore: { ...prev.engagementScore, max: parseInt(e.target.value) }
                    }))}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Bulk Actions */}
        {selectedCustomers.size > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">
                    {selectedCustomers.size} customer{selectedCustomers.size !== 1 ? 's' : ''} selected
                  </span>
                </div>
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  {selectedCustomers.size === sortedProfiles.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleBulkAction('email')}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Mail className="w-3 h-3 mr-1" />
                  Email
                </button>
                <button
                  onClick={() => handleBulkAction('segment')}
                  className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 transition-colors flex items-center"
                >
                  <Tag className="w-3 h-3 mr-1" />
                  Segment
                </button>
                <button
                  onClick={() => handleBulkAction('export')}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors flex items-center"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Export
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <span>Showing {sortedProfiles.length} of {profiles?.length || 0} customers</span>
          <div className="flex items-center space-x-4">
            <span>Sort by: {sortBy.replace('_', ' ')} ({sortOrder})</span>
            {selectedSegment !== 'all' && (
              <span>Segment: {selectedSegment.replace('_', ' ')}</span>
            )}
          </div>
        </div>
      </div>

      {/* Customer List */}
      <div className="space-y-4">
        {sortedProfiles.map((profile, index) => (
          <motion.div
            key={profile.customer_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <input
                  type="checkbox"
                  checked={selectedCustomers.has(profile.customer_id)}
                  onChange={(e) => handleCustomerSelect(profile.customer_id, e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">{profile.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getChurnRiskColor(profile.churn_risk)}`}>
                      {profile.churn_risk} risk
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSegmentColor(profile.customer_segment)}`}>
                      {profile.customer_segment.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-1" />
                      {profile.email}
                    </div>
                    {profile.company && (
                      <div className="flex items-center">
                        <Building className="w-4 h-4 mr-1" />
                        {profile.company}
                      </div>
                    )}
                    {profile.phone && (
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-1" />
                        {profile.phone}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Health Score:</span>
                      <span className={`ml-1 font-medium ${getHealthScoreColor(profile.health_score)}`}>
                        {profile.health_score}/100
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">LTV:</span>
                      <span className="ml-1 font-medium">${profile.lifetime_value.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Orders:</span>
                      <span className="ml-1 font-medium">{profile.total_orders}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Last Activity:</span>
                      <span className="ml-1 font-medium">
                        {new Date(profile.last_activity).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setExpandedCustomer(expandedCustomer === profile.customer_id ? null : profile.customer_id)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="View Details"
                >
                  {expandedCustomer === profile.customer_id ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                
                <button
                  onClick={() => onProfileView(profile)}
                  className="p-2 text-blue-400 hover:text-blue-600 transition-colors"
                  title="View Profile"
                >
                  <Eye className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => onCustomerAction('edit', profile)}
                  className="p-2 text-yellow-400 hover:text-yellow-600 transition-colors"
                  title="Edit Customer"
                >
                  <Edit className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => onCustomerAction('message', profile)}
                  className="p-2 text-green-400 hover:text-green-600 transition-colors"
                  title="Send Message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedCustomer === profile.customer_id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-gray-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Contact Information</h5>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>Email: {profile.email}</div>
                      {profile.phone && <div>Phone: {profile.phone}</div>}
                      {profile.company && <div>Company: {profile.company}</div>}
                      {profile.industry && <div>Industry: {profile.industry}</div>}
                      {profile.location && <div>Location: {profile.location}</div>}
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Engagement Metrics</h5>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>Engagement Score: {profile.engagement_score}/100</div>
                      <div>Sentiment Score: {(profile.sentiment_score * 100).toFixed(1)}%</div>
                      <div>Support Tickets: {profile.support_tickets}</div>
                      <div>Lifecycle Stage: {profile.lifecycle_stage}</div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Quick Actions</h5>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => onCustomerAction('message', profile)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-colors flex items-center"
                      >
                        <Mail className="w-3 h-3 mr-1" />
                        Message
                      </button>
                      <button
                        onClick={() => onCustomerAction('call', profile)}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200 transition-colors flex items-center"
                      >
                        <Phone className="w-3 h-3 mr-1" />
                        Call
                      </button>
                      <button
                        onClick={() => onCustomerAction('segment', profile)}
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-xs hover:bg-purple-200 transition-colors flex items-center"
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        Segment
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}

        {sortedProfiles.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedSegment('all');
                setFilters({
                  healthScore: { min: 0, max: 100 },
                  lifetimeValue: { min: 0, max: 10000 },
                  churnRisk: 'all',
                  engagementScore: { min: 0, max: 100 }
                });
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerListTab;

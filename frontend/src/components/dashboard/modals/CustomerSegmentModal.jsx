import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X,
  Users,
  Filter,
  Target,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  Heart,
  Star,
  Tag,
  Edit,
  Save,
  Trash2,
  Plus,
  Minus,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Calendar,
  Building,
  Globe,
  Smartphone,
  Monitor,
  Laptop,
  Bell,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  UserPlus,
  UserMinus,
  Play,
  Pause,
  Settings,
  ShoppingBag,
  CreditCard,
  Gift,
  Award,
  AlertCircle,
  Brain,
  Zap,
  Sparkles,
  Shield,
  MessageCircle,
  Phone,
  Mail,
  Send,
  Download,
  RefreshCw,
  Eye,
  Search
} from 'lucide-react';

const CustomerSegmentModal = ({ segment, isOpen, onClose, onSave, onAction }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedSegment, setEditedSegment] = useState(segment);
  const [activeTab, setActiveTab] = useState('overview');

  if (!isOpen || !segment) return null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'criteria', label: 'Criteria', icon: Filter },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'insights', label: 'Insights', icon: Brain }
  ];

  // Mock segment data
  const segmentData = {
    ...segment,
    totalCustomers: 156,
    avgLifetimeValue: 12500,
    avgEngagementScore: 78,
    churnRate: 12.5,
    growthRate: 23.8,
    lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    criteria: [
      { field: 'lifetime_value', operator: '>=', value: 10000, label: 'Lifetime Value >= $10,000' },
      { field: 'engagement_score', operator: '>=', value: 70, label: 'Engagement Score >= 70%' },
      { field: 'customer_segment', operator: '=', value: 'enterprise', label: 'Segment = Enterprise' },
      { field: 'last_activity', operator: '>=', value: '30', label: 'Last Activity within 30 days' }
    ],
    customers: [
      { id: 'cust_001', name: 'John Smith', email: 'john@company.com', ltv: 15000, health: 85, lastActivity: '2 days ago' },
      { id: 'cust_002', name: 'Sarah Johnson', email: 'sarah@company.com', ltv: 12000, health: 78, lastActivity: '1 week ago' },
      { id: 'cust_003', name: 'Mike Davis', email: 'mike@company.com', ltv: 18000, health: 92, lastActivity: '3 days ago' },
      { id: 'cust_004', name: 'Lisa Wilson', email: 'lisa@company.com', ltv: 13500, health: 81, lastActivity: '5 days ago' },
      { id: 'cust_005', name: 'David Brown', email: 'david@company.com', ltv: 16000, health: 88, lastActivity: '1 day ago' }
    ],
    insights: {
      topPerformingCustomers: 3,
      atRiskCustomers: 2,
      averageDealSize: 2500,
      preferredChannels: ['Email', 'Phone', 'In-person'],
      bestTimesToContact: ['Tuesday 10-11 AM', 'Thursday 2-3 PM'],
      commonPainPoints: ['Integration complexity', 'Scalability concerns', 'Cost optimization'],
      recommendedActions: [
        'Schedule quarterly business reviews',
        'Share success case studies',
        'Offer exclusive beta access',
        'Provide dedicated support'
      ]
    }
  };

  const handleSave = () => {
    onSave(editedSegment);
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setEditedSegment(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCriteriaChange = (index, field, value) => {
    const newCriteria = [...editedSegment.criteria];
    newCriteria[index] = { ...newCriteria[index], [field]: value };
    setEditedSegment(prev => ({
      ...prev,
      criteria: newCriteria
    }));
  };

  const addCriteria = () => {
    const newCriteria = {
      field: 'lifetime_value',
      operator: '>=',
      value: 0,
      label: 'New Criteria'
    };
    setEditedSegment(prev => ({
      ...prev,
      criteria: [...prev.criteria, newCriteria]
    }));
  };

  const removeCriteria = (index) => {
    const newCriteria = editedSegment.criteria.filter((_, i) => i !== index);
    setEditedSegment(prev => ({
      ...prev,
      criteria: newCriteria
    }));
  };

  const getHealthColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedSegment.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="border border-gray-300 rounded-md px-2 py-1"
                    />
                  ) : (
                    segment.name
                  )}
                </h2>
                <p className="text-gray-600">
                  {isEditing ? (
                    <textarea
                      value={editedSegment.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="border border-gray-300 rounded-md px-2 py-1 w-full"
                      rows={2}
                    />
                  ) : (
                    segment.description
                  )}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="px-2 py-1 rounded-full text-xs font-medium text-purple-600 bg-purple-100">
                    {segmentData.totalCustomers} customers
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium text-green-600 bg-green-100">
                    ${segmentData.avgLifetimeValue.toLocaleString()} avg LTV
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium text-blue-600 bg-blue-100">
                    {segmentData.avgEngagementScore}% engagement
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditedSegment(segment);
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={() => onAction('execute_campaign', segment)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Execute Campaign
                  </button>
                  <button
                    onClick={() => onAction('export', segment)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{segmentData.totalCustomers}</div>
                  <div className="text-green-600 font-medium">Total Customers</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">${segmentData.avgLifetimeValue.toLocaleString()}</div>
                  <div className="text-blue-600 font-medium">Avg Lifetime Value</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{segmentData.avgEngagementScore}%</div>
                  <div className="text-purple-600 font-medium">Avg Engagement</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{segmentData.churnRate}%</div>
                  <div className="text-orange-600 font-medium">Churn Rate</div>
                </div>
              </div>

              {/* Growth Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Growth Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Growth Rate:</span>
                      <span className="font-medium text-green-600">+{segmentData.growthRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">New Customers (30d):</span>
                      <span className="font-medium text-blue-600">+12</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Revenue Growth:</span>
                      <span className="font-medium text-purple-600">+18.5%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Performance Indicators</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg Deal Size:</span>
                      <span className="font-medium text-green-600">${segmentData.insights.averageDealSize.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Top Performers:</span>
                      <span className="font-medium text-blue-600">{segmentData.insights.topPerformingCustomers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">At Risk:</span>
                      <span className="font-medium text-red-600">{segmentData.insights.atRiskCustomers}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'criteria' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Segment Criteria</h3>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Criteria
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {editedSegment.criteria.map((criterion, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">Criterion {index + 1}</h4>
                      {isEditing && (
                        <button
                          onClick={() => removeCriteria(index)}
                          className="p-1 text-red-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Field</label>
                        {isEditing ? (
                          <select
                            value={criterion.field}
                            onChange={(e) => handleCriteriaChange(index, 'field', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="lifetime_value">Lifetime Value</option>
                            <option value="engagement_score">Engagement Score</option>
                            <option value="customer_segment">Customer Segment</option>
                            <option value="last_activity">Last Activity</option>
                            <option value="total_orders">Total Orders</option>
                            <option value="support_tickets">Support Tickets</option>
                          </select>
                        ) : (
                          <span className="text-gray-900">{criterion.label.split(' ')[0]}</span>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Operator</label>
                        {isEditing ? (
                          <select
                            value={criterion.operator}
                            onChange={(e) => handleCriteriaChange(index, 'operator', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value=">=">Greater than or equal</option>
                            <option value="<=">Less than or equal</option>
                            <option value="=">Equals</option>
                            <option value="!=">Not equals</option>
                            <option value=">">Greater than</option>
                            <option value="<">Less than</option>
                          </select>
                        ) : (
                          <span className="text-gray-900">{criterion.operator}</span>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={criterion.value}
                            onChange={(e) => handleCriteriaChange(index, 'value', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <span className="text-gray-900">{criterion.value}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {isEditing && (
                  <button
                    onClick={addCriteria}
                    className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Criterion
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === 'customers' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Customers in Segment</h3>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center">
                    <Send className="w-4 h-4 mr-2" />
                    Bulk Actions
                  </button>
                  <button className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {segmentData.customers.map((customer, index) => (
                  <div key={customer.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{customer.name}</h4>
                          <p className="text-gray-600">{customer.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-sm text-gray-600">LTV</div>
                          <div className="font-medium text-green-600">${customer.ltv.toLocaleString()}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">Health</div>
                          <div className={`font-medium ${getHealthColor(customer.health).split(' ')[0]}`}>
                            {customer.health}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">Last Activity</div>
                          <div className="font-medium text-gray-900">{customer.lastActivity}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onAction('view_profile', customer)}
                          className="p-2 text-blue-400 hover:text-blue-600 transition-colors"
                          title="View Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onAction('message', customer)}
                          className="p-2 text-green-400 hover:text-green-600 transition-colors"
                          title="Send Message"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onAction('call', customer)}
                          className="p-2 text-purple-400 hover:text-purple-600 transition-colors"
                          title="Schedule Call"
                        >
                          <Phone className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">AI Insights & Recommendations</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Preferred Channels */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-blue-900">Preferred Channels</h4>
                  </div>
                  <ul className="space-y-2">
                    {segmentData.insights.preferredChannels.map((channel, index) => (
                      <li key={index} className="text-sm text-blue-700 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {channel}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Best Times to Contact */}
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Clock className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-green-900">Best Times to Contact</h4>
                  </div>
                  <ul className="space-y-2">
                    {segmentData.insights.bestTimesToContact.map((time, index) => (
                      <li key={index} className="text-sm text-green-700 flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {time}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Common Pain Points */}
              <div className="bg-red-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <h4 className="font-semibold text-red-900">Common Pain Points</h4>
                </div>
                <ul className="space-y-2">
                  {segmentData.insights.commonPainPoints.map((painPoint, index) => (
                    <li key={index} className="text-sm text-red-700 flex items-center">
                      <XCircle className="w-4 h-4 mr-2" />
                      {painPoint}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommended Actions */}
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <h4 className="font-semibold text-purple-900">Recommended Actions</h4>
                </div>
                <ul className="space-y-2">
                  {segmentData.insights.recommendedActions.map((action, index) => (
                    <li key={index} className="text-sm text-purple-700 flex items-center">
                      <Zap className="w-4 h-4 mr-2" />
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onAction('execute_campaign', segment)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <Play className="w-4 h-4 mr-2" />
                Execute Campaign
              </button>
              <button
                onClick={() => onAction('export', segment)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Segment
              </button>
              <button
                onClick={() => onAction('analyze', segment)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
              >
                <Brain className="w-4 h-4 mr-2" />
                AI Analysis
              </button>
            </div>
            
            <div className="text-sm text-gray-500">
              Last updated: {new Date(segmentData.lastUpdated).toLocaleDateString()}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CustomerSegmentModal;

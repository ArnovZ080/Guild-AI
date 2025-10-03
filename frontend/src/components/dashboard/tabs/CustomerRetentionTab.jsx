import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  BarChart3,
  Activity,
  Clock,
  DollarSign,
  Star,
  Shield,
  Brain,
  Zap,
  Sparkles,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Search,
  RefreshCw,
  Download,
  Eye,
  Edit,
  Trash2,
  Send,
  Phone,
  Mail,
  MessageCircle,
  Calendar,
  Tag,
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
  Plus,
  Minus,
  Play,
  Pause,
  Settings,
  X
} from 'lucide-react';

const CustomerRetentionTab = ({ profiles, onCustomerAction }) => {
  const [selectedRisk, setSelectedRisk] = useState('all');
  const [selectedHealth, setSelectedHealth] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlaybook, setSelectedPlaybook] = useState(null);
  const [showPlaybookModal, setShowPlaybookModal] = useState(false);
  const [showRetentionModal, setShowRetentionModal] = useState(false);

  // Mock retention data
  const retentionData = {
    overallRetention: 85.2,
    churnRate: 14.8,
    healthScoreDistribution: {
      excellent: 45,
      good: 35,
      warning: 15,
      critical: 5
    },
    churnRiskCustomers: profiles.filter((_, index) => index < 8).map((profile, index) => ({
      ...profile,
      churnRisk: ['low', 'medium', 'high', 'critical'][index % 4],
      healthScore: 85 - (index * 10),
      lastActivity: new Date(Date.now() - (index + 1) * 24 * 60 * 60 * 1000).toISOString(),
      riskFactors: [
        'No activity in 30 days',
        'Support ticket unresolved',
        'Price sensitivity detected',
        'Competitor mention'
      ][index % 4],
      recommendedActions: [
        'Send re-engagement email',
        'Schedule check-in call',
        'Offer discount',
        'Escalate to retention team'
      ][index % 4]
    }))
  };

  const retentionPlaybooks = [
    {
      id: 'playbook_001',
      name: 'Win-Back Campaign',
      description: 'Re-engage inactive customers with personalized offers',
      trigger: 'No activity for 30+ days',
      successRate: 78,
      avgResponseTime: '2.3 days',
      actions: [
        'Send personalized email sequence',
        'Offer exclusive discount',
        'Schedule follow-up call',
        'Provide value-added content'
      ],
      status: 'active'
    },
    {
      id: 'playbook_002',
      name: 'Churn Prevention',
      description: 'Proactive outreach to at-risk customers',
      trigger: 'Health score below 60',
      successRate: 85,
      avgResponseTime: '1.5 days',
      actions: [
        'Identify risk factors',
        'Personalized retention offer',
        'Assign dedicated CSM',
        'Monitor engagement closely'
      ],
      status: 'active'
    },
    {
      id: 'playbook_003',
      name: 'VIP Retention',
      description: 'Special treatment for high-value customers',
      trigger: 'LTV above $10,000',
      successRate: 92,
      avgResponseTime: '0.8 days',
      actions: [
        'Priority support access',
        'Exclusive feature previews',
        'Personal account manager',
        'Custom success metrics'
      ],
      status: 'active'
    }
  ];

  const riskLevels = [
    { id: 'all', label: 'All Risk Levels', count: retentionData.churnRiskCustomers.length },
    { id: 'low', label: 'Low Risk', count: retentionData.churnRiskCustomers.filter(c => c.churnRisk === 'low').length },
    { id: 'medium', label: 'Medium Risk', count: retentionData.churnRiskCustomers.filter(c => c.churnRisk === 'medium').length },
    { id: 'high', label: 'High Risk', count: retentionData.churnRiskCustomers.filter(c => c.churnRisk === 'high').length },
    { id: 'critical', label: 'Critical Risk', count: retentionData.churnRiskCustomers.filter(c => c.churnRisk === 'critical').length }
  ];

  const healthLevels = [
    { id: 'all', label: 'All Health Scores', count: retentionData.churnRiskCustomers.length },
    { id: 'excellent', label: 'Excellent (80+)', count: retentionData.churnRiskCustomers.filter(c => c.healthScore >= 80).length },
    { id: 'good', label: 'Good (60-79)', count: retentionData.churnRiskCustomers.filter(c => c.healthScore >= 60 && c.healthScore < 80).length },
    { id: 'warning', label: 'Warning (40-59)', count: retentionData.churnRiskCustomers.filter(c => c.healthScore >= 40 && c.healthScore < 60).length },
    { id: 'critical', label: 'Critical (<40)', count: retentionData.churnRiskCustomers.filter(c => c.healthScore < 40).length }
  ];

  // Filter customers
  const filteredCustomers = retentionData.churnRiskCustomers.filter(customer => {
    const matchesRisk = selectedRisk === 'all' || customer.churnRisk === selectedRisk;
    const matchesHealth = selectedHealth === 'all' || 
      (selectedHealth === 'excellent' && customer.healthScore >= 80) ||
      (selectedHealth === 'good' && customer.healthScore >= 60 && customer.healthScore < 80) ||
      (selectedHealth === 'warning' && customer.healthScore >= 40 && customer.healthScore < 60) ||
      (selectedHealth === 'critical' && customer.healthScore < 40);
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesRisk && matchesHealth && matchesSearch;
  });

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Heart className="w-6 h-6 text-red-600 mr-3" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Customer Retention</h3>
              <p className="text-sm text-gray-600">Monitor churn risk and execute retention strategies</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowRetentionModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
            >
              <Heart className="w-4 h-4 mr-2" />
              Launch Retention Campaign
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">{retentionData.overallRetention}%</div>
            <div className="text-green-600 font-medium">Retention Rate</div>
            <div className="text-sm text-gray-600">Last 30 days</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-3xl font-bold text-red-600">{retentionData.churnRate}%</div>
            <div className="text-red-600 font-medium">Churn Rate</div>
            <div className="text-sm text-gray-600">Last 30 days</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">{retentionData.churnRiskCustomers.length}</div>
            <div className="text-blue-600 font-medium">At Risk</div>
            <div className="text-sm text-gray-600">Customers</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600">{retentionPlaybooks.length}</div>
            <div className="text-purple-600 font-medium">Active Playbooks</div>
            <div className="text-sm text-gray-600">Automation</div>
          </div>
        </div>

        {/* Health Score Distribution */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Health Score Distribution</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(retentionData.healthScoreDistribution).map(([level, count]) => (
              <div key={level} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{count}%</div>
                <div className="text-gray-600 capitalize">{level}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {riskLevels.map(risk => (
                <option key={risk.id} value={risk.id}>
                  {risk.label} ({risk.count})
                </option>
              ))}
            </select>

            <select
              value={selectedHealth}
              onChange={(e) => setSelectedHealth(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {healthLevels.map(health => (
                <option key={health.id} value={health.id}>
                  {health.label} ({health.count})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Retention Playbooks */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900">Retention Playbooks</h4>
          <button
            onClick={() => setShowPlaybookModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Playbook
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {retentionPlaybooks.map((playbook, index) => (
            <motion.div
              key={playbook.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-semibold text-gray-900">{playbook.name}</h5>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  playbook.status === 'active' ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100'
                }`}>
                  {playbook.status}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mb-3">{playbook.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Success Rate:</span>
                  <span className="font-medium text-green-600">{playbook.successRate}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Avg Response:</span>
                  <span className="font-medium text-blue-600">{playbook.avgResponseTime}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Trigger:</span>
                  <span className="font-medium text-purple-600">{playbook.trigger}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onCustomerAction('execute_playbook', playbook)}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm flex items-center justify-center"
                >
                  <Play className="w-4 h-4 mr-1" />
                  Execute
                </button>
                <button
                  onClick={() => onCustomerAction('edit_playbook', playbook)}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onCustomerAction('pause_playbook', playbook)}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  <Pause className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* At-Risk Customers */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900">At-Risk Customers</h4>
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
          {filteredCustomers.map((customer, index) => (
            <motion.div
              key={customer.customer_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <h5 className="text-lg font-semibold text-gray-900">{customer.name}</h5>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(customer.churnRisk)}`}>
                        {customer.churnRisk} risk
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthColor(customer.healthScore)}`}>
                        Health: {customer.healthScore}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Last activity: {formatTimestamp(customer.lastActivity)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div>
                      <div className="text-sm text-gray-600">Risk Factors</div>
                      <div className="text-sm font-medium text-gray-900">{customer.riskFactors}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Recommended Action</div>
                      <div className="text-sm font-medium text-blue-600">{customer.recommendedActions}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Lifetime Value</div>
                      <div className="text-sm font-medium text-green-600">${customer.lifetime_value.toLocaleString()}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onCustomerAction('retention_outreach', customer)}
                      className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm flex items-center"
                    >
                      <Heart className="w-4 h-4 mr-1" />
                      Retention Outreach
                    </button>
                    <button
                      onClick={() => onCustomerAction('schedule_call', customer)}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm flex items-center"
                    >
                      <Phone className="w-4 h-4 mr-1" />
                      Schedule Call
                    </button>
                    <button
                      onClick={() => onCustomerAction('send_email', customer)}
                      className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm flex items-center"
                    >
                      <Mail className="w-4 h-4 mr-1" />
                      Send Email
                    </button>
                    <button
                      onClick={() => onCustomerAction('view_profile', customer)}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm flex items-center"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {filteredCustomers.length === 0 && (
            <div className="text-center py-12">
              <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No at-risk customers found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedRisk('all');
                  setSelectedHealth('all');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Playbook Modal */}
      {showPlaybookModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowPlaybookModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Create Retention Playbook</h3>
                <button
                  onClick={() => setShowPlaybookModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Playbook Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Win-Back Campaign"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe the playbook's purpose and goals"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trigger Condition</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>No activity for 30+ days</option>
                    <option>Health score below 60</option>
                    <option>Support ticket unresolved</option>
                    <option>Price sensitivity detected</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Actions</label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span className="text-sm">Send personalized email sequence</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span className="text-sm">Offer exclusive discount</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Schedule follow-up call</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Provide value-added content</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowPlaybookModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    console.log('Creating playbook...');
                    setShowPlaybookModal(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Playbook
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Retention Campaign Modal */}
      {showRetentionModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowRetentionModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Launch Retention Campaign</h3>
                <button
                  onClick={() => setShowRetentionModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Q4 Retention Drive"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Segment</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>All at-risk customers</option>
                    <option>High-value customers only</option>
                    <option>Inactive customers (30+ days)</option>
                    <option>Support ticket escalations</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="border border-gray-200 rounded-lg p-3 cursor-pointer hover:border-blue-500">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">Email Sequence</span>
                      </div>
                      <p className="text-sm text-gray-600">Automated email campaigns</p>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-3 cursor-pointer hover:border-blue-500">
                      <div className="flex items-center space-x-2">
                        <Phone className="w-5 h-5 text-green-600" />
                        <span className="font-medium">Phone Outreach</span>
                      </div>
                      <p className="text-sm text-gray-600">Personal calls and follow-ups</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Impact</label>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">15-25%</div>
                      <div className="text-blue-600 text-sm">Retention Improvement</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">$50K+</div>
                      <div className="text-green-600 text-sm">Revenue Impact</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">3-5 days</div>
                      <div className="text-purple-600 text-sm">Campaign Duration</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowRetentionModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    console.log('Launching retention campaign...');
                    setShowRetentionModal(false);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Launch Campaign
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default CustomerRetentionTab;

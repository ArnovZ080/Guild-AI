import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Calendar, 
  Star, 
  Award, 
  CheckCircle, 
  Clock, 
  Zap, 
  Heart,
  Lightbulb,
  BarChart,
  Globe,
  Mail,
  Camera,
  Brain,
  Filter,
  Search,
  X
} from 'lucide-react';

// Mock achievements data
const mockAchievements = [
  {
    id: '1',
    type: 'goal',
    title: 'Q1 Revenue Target Achieved',
    description: 'Successfully reached $50K revenue target for Q1 2024',
    date: new Date(2024, 2, 31), // March 31, 2024
    category: 'financial',
    value: 50000,
    icon: DollarSign,
    status: 'completed',
    impact: 'high',
    celebration: '🎉 Revenue milestone reached!',
    details: {
      target: 50000,
      achieved: 52000,
      growth: '+4%',
      period: 'Q1 2024'
    },
    agentFlow: [
      {
        agent: 'Strategy Agent',
        action: 'Market Analysis',
        description: 'Analyzed market trends and identified growth opportunities in Q1'
      },
      {
        agent: 'Marketing Agent',
        action: 'Campaign Launch',
        description: 'Launched targeted marketing campaigns to drive revenue growth'
      },
      {
        agent: 'Sales Agent',
        action: 'Lead Conversion',
        description: 'Optimized sales funnel and improved conversion rates by 15%'
      },
      {
        agent: 'Analytics Agent',
        action: 'Performance Tracking',
        description: 'Monitored KPIs and provided real-time insights for optimization'
      }
    ]
  },
  {
    id: '2',
    type: 'milestone',
    title: '100th Customer Onboarded',
    description: 'Reached the milestone of 100 active customers',
    date: new Date(2024, 1, 15), // February 15, 2024
    category: 'growth',
    value: 100,
    icon: Users,
    status: 'completed',
    impact: 'high',
    celebration: '🚀 Customer milestone achieved!',
    details: {
      milestone: 100,
      current: 100,
      growth: '+25%',
      period: 'February 2024'
    }
  },
  {
    id: '3',
    type: 'campaign',
    title: 'Viral Social Media Campaign',
    description: 'Facebook campaign reached 1M impressions with 15% engagement rate',
    date: new Date(2024, 0, 20), // January 20, 2024
    category: 'marketing',
    value: 1000000,
    icon: Globe,
    status: 'completed',
    impact: 'high',
    celebration: '📱 Campaign went viral!',
    details: {
      impressions: 1000000,
      engagement: '15%',
      reach: '500K',
      period: 'January 2024'
    }
  },
  {
    id: '4',
    type: 'goal',
    title: 'Team Expansion Complete',
    description: 'Successfully hired 3 new team members for Q1 growth',
    date: new Date(2024, 0, 10), // January 10, 2024
    category: 'team',
    value: 3,
    icon: Users,
    status: 'completed',
    impact: 'medium',
    celebration: '👥 Team expanded successfully!',
    details: {
      hired: 3,
      positions: ['Developer', 'Marketer', 'Sales Rep'],
      period: 'January 2024'
    }
  },
  {
    id: '5',
    type: 'milestone',
    title: 'Product Launch Success',
    description: 'New product feature launched with 95% user satisfaction',
    date: new Date(2023, 11, 15), // December 15, 2023
    category: 'product',
    value: 95,
    icon: Zap,
    status: 'completed',
    impact: 'high',
    celebration: '✨ Product launch successful!',
    details: {
      satisfaction: '95%',
      adoption: '80%',
      feedback: 'Excellent',
      period: 'December 2023'
    }
  },
  {
    id: '6',
    type: 'campaign',
    title: 'Email Campaign Record',
    description: 'Achieved 25% open rate and 8% click-through rate',
    date: new Date(2023, 10, 30), // November 30, 2023
    category: 'marketing',
    value: 25,
    icon: Mail,
    status: 'completed',
    impact: 'medium',
    celebration: '📧 Email campaign record!',
    details: {
      openRate: '25%',
      clickRate: '8%',
      subscribers: '10K',
      period: 'November 2023'
    }
  },
  {
    id: '7',
    type: 'goal',
    title: 'Cost Reduction Achievement',
    description: 'Reduced operational costs by 20% through automation',
    date: new Date(2023, 9, 25), // October 25, 2023
    category: 'efficiency',
    value: 20,
    icon: TrendingUp,
    status: 'completed',
    impact: 'high',
    celebration: '💰 Cost reduction achieved!',
    details: {
      reduction: '20%',
      savings: '$5K/month',
      automation: '15 processes',
      period: 'October 2023'
    }
  },
  {
    id: '8',
    type: 'milestone',
    title: 'First Year Anniversary',
    description: 'Celebrated one year in business with 200% growth',
    date: new Date(2023, 8, 15), // September 15, 2023
    category: 'anniversary',
    value: 200,
    icon: Star,
    status: 'completed',
    impact: 'high',
    celebration: '🎂 Happy 1st Anniversary!',
    details: {
      growth: '200%',
      revenue: '$25K',
      customers: '50',
      period: 'Year 1'
    }
  }
];

const AchievementsView = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [showRepeatStrategyModal, setShowRepeatStrategyModal] = useState(false);
  const [repeatStrategyData, setRepeatStrategyData] = useState({
    targetMetric: '',
    targetValue: '',
    timeframe: '',
    priority: 'medium',
    customInstructions: ''
  });

  // Handler functions
  const handleRepeatStrategy = (achievement) => {
    setSelectedAchievement(achievement);
    setRepeatStrategyData({
      targetMetric: achievement.metric || '',
      targetValue: achievement.value || '',
      timeframe: achievement.timeframe || '',
      priority: 'medium',
      customInstructions: ''
    });
    setShowRepeatStrategyModal(true);
  };

  const handleSaveRepeatStrategy = () => {
    console.log('Repeating strategy for:', selectedAchievement.title, 'with data:', repeatStrategyData);
    // In real implementation, this would trigger agents to implement the strategy with new metrics
    alert(`Strategy "${selectedAchievement.title}" is being re-initialized with new metrics! 🚀`);
    setShowRepeatStrategyModal(false);
    setSelectedAchievement(null);
  };

  // Filter achievements
  const filteredAchievements = mockAchievements.filter(achievement => {
    const matchesCategory = selectedCategory === 'all' || achievement.category === selectedCategory;
    const matchesType = selectedType === 'all' || achievement.type === selectedType;
    const matchesSearch = achievement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         achievement.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesType && matchesSearch;
  });

  // Sort by date (newest first)
  const sortedAchievements = filteredAchievements.sort((a, b) => b.date - a.date);

  // Get category styling
  const getCategoryStyle = (category) => {
    const styles = {
      financial: 'bg-green-100 text-green-800 border-green-200',
      growth: 'bg-blue-100 text-blue-800 border-blue-200',
      marketing: 'bg-purple-100 text-purple-800 border-purple-200',
      team: 'bg-orange-100 text-orange-800 border-orange-200',
      product: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      efficiency: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      anniversary: 'bg-pink-100 text-pink-800 border-pink-200'
    };
    return styles[category] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Get impact styling
  const getImpactStyle = (impact) => {
    const styles = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return styles[impact] || 'bg-gray-100 text-gray-800';
  };

  // Get type icon
  const getTypeIcon = (type) => {
    const icons = {
      goal: Target,
      milestone: Trophy,
      campaign: Zap
    };
    return icons[type] || Award;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Achievements Timeline</h1>
            <p className="text-gray-600 mt-2">Track your business milestones, goals, and notable achievements</p>
          </div>
          <div className="flex items-center space-x-2">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <span className="text-2xl font-bold text-gray-900">{mockAchievements.length}</span>
            <span className="text-gray-600">Achievements</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search achievements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="financial">Financial</option>
            <option value="growth">Growth</option>
            <option value="marketing">Marketing</option>
            <option value="team">Team</option>
            <option value="product">Product</option>
            <option value="efficiency">Efficiency</option>
            <option value="anniversary">Anniversary</option>
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="goal">Goals</option>
            <option value="milestone">Milestones</option>
            <option value="campaign">Campaigns</option>
          </select>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Achievement Timeline</h2>
        
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-purple-500"></div>
          
          <div className="space-y-8">
            {sortedAchievements.map((achievement, index) => {
              const Icon = achievement.icon;
              const TypeIcon = getTypeIcon(achievement.type);
              
              return (
                <motion.div
                  key={achievement.id}
                  className="relative flex items-start space-x-6"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {/* Timeline dot */}
                  <div className="relative z-10 flex items-center justify-center w-16 h-16 bg-white border-4 border-blue-500 rounded-full shadow-lg">
                    <Icon className="w-6 h-6 text-blue-500" />
                  </div>

                  {/* Achievement card */}
                  <div 
                    className="flex-1 bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedAchievement(achievement)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <TypeIcon className="w-5 h-5 text-gray-600" />
                          <h3 className="text-lg font-semibold text-gray-900">{achievement.title}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryStyle(achievement.category)}`}>
                            {achievement.category}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getImpactStyle(achievement.impact)}`}>
                            {achievement.impact} impact
                          </span>
                        </div>
                        <p className="text-gray-700 mb-3">{achievement.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{achievement.date.toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-green-600 font-medium">Completed</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {achievement.category === 'financial' ? `$${achievement.value.toLocaleString()}` :
                           achievement.category === 'marketing' && achievement.type === 'campaign' ? `${achievement.value.toLocaleString()}` :
                           achievement.value}%
                        </div>
                        <div className="text-sm text-gray-500">Value</div>
                      </div>
                    </div>
                    
                    {/* Celebration message */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">🎉</span>
                        <span className="text-sm font-medium text-yellow-800">{achievement.celebration}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Achievement Detail Modal */}
      <AnimatePresence>
        {selectedAchievement && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-500 rounded-lg">
                      {React.createElement(selectedAchievement.icon, { className: "w-6 h-6 text-white" })}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedAchievement.title}</h2>
                      <p className="text-gray-600">{selectedAchievement.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedAchievement(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Achievement details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-gray-700">Date Achieved:</span>
                      <p className="text-gray-900">{selectedAchievement.date.toLocaleDateString('en-US', { 
                        weekday: 'long',
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Category:</span>
                      <p className="text-gray-900 capitalize">{selectedAchievement.category}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Type:</span>
                      <p className="text-gray-900 capitalize">{selectedAchievement.type}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Impact:</span>
                      <p className="text-gray-900 capitalize">{selectedAchievement.impact}</p>
                    </div>
                  </div>

                  {/* Detailed metrics */}
                  {selectedAchievement.details && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Detailed Metrics</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-4">
                          {Object.entries(selectedAchievement.details).map(([key, value]) => (
                            <div key={key}>
                              <span className="font-medium text-gray-700 capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}:
                              </span>
                              <p className="text-gray-900">{value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Agent Flow Visualization */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Agent Flow & Strategy</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="space-y-3">
                        {selectedAchievement.agentFlow ? selectedAchievement.agentFlow.map((step, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full text-sm font-medium">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-900">{step.agent}</span>
                                <span className="text-sm text-gray-500">•</span>
                                <span className="text-sm text-gray-600">{step.action}</span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                            </div>
                            <div className="flex items-center space-x-1">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-sm text-green-600">Completed</span>
                            </div>
                          </div>
                        )) : (
                          <div className="text-center py-4">
                            <Brain className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-500">Agent flow data not available for this achievement</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Repeat Achievement */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-blue-800">Repeat This Achievement</h4>
                        <p className="text-blue-700 text-sm mt-1">
                          Deploy the same agent strategy with new targets
                        </p>
                      </div>
                      <button
                        onClick={() => handleRepeatStrategy(selectedAchievement)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                      >
                        <Zap className="w-4 h-4" />
                        <span>Repeat Strategy</span>
                      </button>
                    </div>
                  </div>

                  {/* Celebration */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">🎉</span>
                      <div>
                        <h4 className="font-semibold text-yellow-800">Celebration</h4>
                        <p className="text-yellow-700">{selectedAchievement.celebration}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Repeat Strategy Modal */}
      {showRepeatStrategyModal && selectedAchievement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Repeat Strategy: {selectedAchievement.title}</h2>
            <p className="text-gray-600 mb-6">
              Adjust the metrics and parameters to repeat this successful strategy with new targets.
            </p>
            
            <div className="space-y-6">
              {/* Original Achievement Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Original Achievement</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Metric:</span>
                    <span className="ml-2 font-medium">{selectedAchievement.metric || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Value:</span>
                    <span className="ml-2 font-medium">{selectedAchievement.value || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Timeframe:</span>
                    <span className="ml-2 font-medium">{selectedAchievement.timeframe || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Date Achieved:</span>
                    <span className="ml-2 font-medium">{selectedAchievement.dateAchieved.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* New Strategy Parameters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Metric</label>
                  <input
                    type="text"
                    value={repeatStrategyData.targetMetric}
                    onChange={(e) => setRepeatStrategyData(prev => ({ ...prev, targetMetric: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Monthly Recurring Revenue, Customer Acquisition, etc."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Value</label>
                  <input
                    type="text"
                    value={repeatStrategyData.targetValue}
                    onChange={(e) => setRepeatStrategyData(prev => ({ ...prev, targetValue: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., $200K, 500 customers, 25% growth"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Timeframe</label>
                  <select
                    value={repeatStrategyData.timeframe}
                    onChange={(e) => setRepeatStrategyData(prev => ({ ...prev, timeframe: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select timeframe</option>
                    <option value="1 month">1 Month</option>
                    <option value="3 months">3 Months</option>
                    <option value="6 months">6 Months</option>
                    <option value="1 year">1 Year</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={repeatStrategyData.priority}
                    onChange={(e) => setRepeatStrategyData(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Custom Instructions</label>
                <textarea
                  value={repeatStrategyData.customInstructions}
                  onChange={(e) => setRepeatStrategyData(prev => ({ ...prev, customInstructions: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Add any specific instructions or modifications for this strategy repeat..."
                />
              </div>

              {/* Agent Flow Preview */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Agent Flow Preview</h3>
                <p className="text-blue-800 text-sm mb-3">
                  The following agents will be deployed to achieve your new target:
                </p>
                <div className="space-y-2">
                  {selectedAchievement.agentFlow?.map((step, index) => (
                    <div key={index} className="flex items-center space-x-3 text-sm">
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <span className="font-medium text-blue-900">{step.agent}</span>
                        <span className="text-blue-700 ml-2">- {step.action}</span>
                      </div>
                    </div>
                  )) || (
                    <div className="text-blue-700 text-sm">
                      Strategy agents will be automatically selected based on your target metric.
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowRepeatStrategyModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRepeatStrategy}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
              >
                <Zap className="w-4 h-4" />
                <span>Deploy Strategy</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AchievementsView;

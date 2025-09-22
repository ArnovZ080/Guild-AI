import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, Target, DollarSign, Users, Calendar, 
  CheckCircle, XCircle, Clock, Star, Lightbulb, Brain, Zap,
  ArrowUpRight, ArrowDownRight, AlertCircle, Info, ThumbsUp, ThumbsDown,
  Filter, Search, RefreshCw, Download, Eye, Settings
} from 'lucide-react';
import { useCelebrations, CelebrationType } from '../components/psychological/MicroCelebrations.jsx';

// Mock growth recommendations data
const mockRecommendations = [
  {
    id: '1',
    title: 'Expand to Instagram Reels Marketing',
    category: 'marketing',
    priority: 'high',
    impact: 'high',
    effort: 'medium',
    timeframe: '2-4 weeks',
    description: 'Your TikTok content is performing well. Instagram Reels could capture a similar audience with 40% less competition.',
    expectedROI: '+25% engagement',
    expectedRevenue: '$2,500/month',
    requirements: ['Content creation', 'Hashtag research', 'Cross-platform posting'],
    risks: ['Platform algorithm changes', 'Content adaptation needed'],
    status: 'pending', // pending, accepted, rejected, in_progress, completed
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    strategyAgent: 'Marketing Strategy Agent',
    dataPoints: [
      { metric: 'TikTok engagement rate', value: '8.5%', trend: 'up' },
      { metric: 'Instagram reach', value: '12K', trend: 'stable' },
      { metric: 'Content production cost', value: '$200/video', trend: 'down' }
    ]
  },
  {
    id: '2',
    title: 'Implement Customer Referral Program',
    category: 'sales',
    priority: 'high',
    impact: 'high',
    effort: 'low',
    timeframe: '1-2 weeks',
    description: 'Your customer satisfaction score is 4.8/5. A referral program could generate 30% more qualified leads.',
    expectedROI: '+30% qualified leads',
    expectedRevenue: '$5,000/month',
    requirements: ['Referral tracking system', 'Reward structure', 'Email automation'],
    risks: ['Initial setup complexity', 'Reward cost management'],
    status: 'pending',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    strategyAgent: 'Sales Strategy Agent',
    dataPoints: [
      { metric: 'Customer satisfaction', value: '4.8/5', trend: 'up' },
      { metric: 'Repeat purchase rate', value: '65%', trend: 'up' },
      { metric: 'Average order value', value: '$150', trend: 'stable' }
    ]
  },
  {
    id: '3',
    title: 'Launch Premium Service Tier',
    category: 'product',
    priority: 'medium',
    impact: 'high',
    effort: 'high',
    timeframe: '6-8 weeks',
    description: 'Your current customers show high engagement with advanced features. A premium tier could increase ARPU by 40%.',
    expectedROI: '+40% ARPU',
    expectedRevenue: '$8,000/month',
    requirements: ['Feature development', 'Pricing strategy', 'Customer segmentation'],
    risks: ['Development timeline', 'Market acceptance'],
    status: 'pending',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    strategyAgent: 'Product Strategy Agent',
    dataPoints: [
      { metric: 'Feature usage rate', value: '78%', trend: 'up' },
      { metric: 'Customer LTV', value: '$2,400', trend: 'up' },
      { metric: 'Churn rate', value: '5%', trend: 'down' }
    ]
  },
  {
    id: '4',
    title: 'Automate Lead Qualification Process',
    category: 'operations',
    priority: 'medium',
    impact: 'medium',
    effort: 'medium',
    timeframe: '3-4 weeks',
    description: 'Your sales team spends 60% of time on unqualified leads. Automation could improve efficiency by 35%.',
    expectedROI: '+35% sales efficiency',
    expectedRevenue: '$3,000/month',
    requirements: ['Lead scoring system', 'CRM integration', 'Workflow automation'],
    risks: ['System integration complexity', 'Lead quality concerns'],
    status: 'accepted',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    strategyAgent: 'Operations Strategy Agent',
    dataPoints: [
      { metric: 'Lead qualification time', value: '2.5 hours', trend: 'stable' },
      { metric: 'Conversion rate', value: '12%', trend: 'up' },
      { metric: 'Sales cycle length', value: '21 days', trend: 'down' }
    ]
  },
  {
    id: '5',
    title: 'Partner with Industry Influencers',
    category: 'marketing',
    priority: 'low',
    impact: 'medium',
    effort: 'low',
    timeframe: '2-3 weeks',
    description: 'Your niche has 3 key influencers with 100K+ followers. Partnership could increase brand awareness by 50%.',
    expectedROI: '+50% brand awareness',
    expectedRevenue: '$1,500/month',
    requirements: ['Influencer research', 'Partnership agreements', 'Content collaboration'],
    risks: ['Influencer availability', 'Partnership costs'],
    status: 'rejected',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    strategyAgent: 'Marketing Strategy Agent',
    dataPoints: [
      { metric: 'Brand awareness', value: '35%', trend: 'up' },
      { metric: 'Social media reach', value: '45K', trend: 'up' },
      { metric: 'Influencer engagement', value: '3.2%', trend: 'stable' }
    ]
  }
];

const GrowthView = () => {
  const [recommendations, setRecommendations] = useState(mockRecommendations);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const { triggerCelebration } = useCelebrations();

  // Filter recommendations
  const filteredRecommendations = recommendations.filter(rec => {
    const matchesStatus = filterStatus === 'all' || rec.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || rec.category === filterCategory;
    const matchesPriority = filterPriority === 'all' || rec.priority === filterPriority;
    const matchesSearch = searchTerm === '' || 
      rec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesCategory && matchesPriority && matchesSearch;
  });

  // Handle recommendation actions
  const handleRecommendationAction = (id, action) => {
    setRecommendations(prev => prev.map(rec => {
      if (rec.id === id) {
        const updatedRec = { ...rec, status: action };
        
        // Trigger celebration based on action
        if (action === 'accepted') {
          triggerCelebration(CelebrationType.TASK_COMPLETE, {
            message: "Growth opportunity accepted! 🚀",
            intensity: 'high'
          });
        } else if (action === 'rejected') {
          triggerCelebration(CelebrationType.TASK_COMPLETE, {
            message: "Recommendation reviewed ✅",
            intensity: 'normal'
          });
        }
        
        return updatedRec;
      }
      return rec;
    }));
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    const icons = {
      marketing: TrendingUp,
      sales: Target,
      product: Lightbulb,
      operations: Settings
    };
    return icons[category] || Brain;
  };

  // Get impact color
  const getImpactColor = (impact) => {
    const colors = {
      high: 'text-green-600',
      medium: 'text-yellow-600',
      low: 'text-red-600'
    };
    return colors[impact] || 'text-gray-600';
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Growth Opportunities</h1>
            <p className="text-gray-600">
              AI-powered growth recommendations based on your business data and market trends
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
              <RefreshCw className="w-4 h-4" />
              <span>Refresh Analysis</span>
            </button>
            <button className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search recommendations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="marketing">Marketing</option>
            <option value="sales">Sales</option>
            <option value="product">Product</option>
            <option value="operations">Operations</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredRecommendations.map((recommendation, index) => {
            const CategoryIcon = getCategoryIcon(recommendation.category);
            
            return (
              <motion.div
                key={recommendation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => setSelectedRecommendation(recommendation)}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <CategoryIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                          {recommendation.title}
                        </h3>
                        <p className="text-xs text-gray-500 capitalize">
                          {recommendation.category} • {recommendation.timeframe}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(recommendation.status)}`}>
                        {recommendation.status}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(recommendation.priority)}`}>
                        {recommendation.priority} priority
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {recommendation.description}
                  </p>

                  {/* Metrics */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Expected ROI:</span>
                      <span className="font-medium text-green-600">{recommendation.expectedROI}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Expected Revenue:</span>
                      <span className="font-medium text-green-600">{recommendation.expectedRevenue}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Impact:</span>
                      <span className={`font-medium ${getImpactColor(recommendation.impact)}`}>
                        {recommendation.impact} impact
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  {recommendation.status === 'pending' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRecommendationAction(recommendation.id, 'accepted');
                        }}
                        className="flex-1 flex items-center justify-center space-x-1 bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span>Accept</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRecommendationAction(recommendation.id, 'rejected');
                        }}
                        className="flex-1 flex items-center justify-center space-x-1 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm"
                      >
                        <ThumbsDown className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}

                  {recommendation.status === 'accepted' && (
                    <div className="flex items-center justify-center space-x-2 text-green-600 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      <span>Accepted - Strategy agent will implement</span>
                    </div>
                  )}

                  {recommendation.status === 'rejected' && (
                    <div className="flex items-center justify-center space-x-2 text-red-600 text-sm">
                      <XCircle className="w-4 h-4" />
                      <span>Rejected</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Recommendation Detail Modal */}
      {selectedRecommendation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    {React.createElement(getCategoryIcon(selectedRecommendation.category), { className: "w-6 h-6 text-blue-600" })}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedRecommendation.title}</h2>
                    <p className="text-gray-600">By {selectedRecommendation.strategyAgent}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRecommendation(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-600">{selectedRecommendation.description}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Expected Outcomes</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">ROI:</span>
                        <span className="font-medium text-green-600">{selectedRecommendation.expectedROI}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Revenue:</span>
                        <span className="font-medium text-green-600">{selectedRecommendation.expectedRevenue}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Timeframe:</span>
                        <span className="font-medium">{selectedRecommendation.timeframe}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Requirements</h3>
                    <ul className="space-y-1">
                      {selectedRecommendation.requirements.map((req, index) => (
                        <li key={index} className="flex items-center space-x-2 text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Supporting Data</h3>
                    <div className="space-y-3">
                      {selectedRecommendation.dataPoints.map((point, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900">{point.metric}</div>
                            <div className="text-sm text-gray-600">Current: {point.value}</div>
                          </div>
                          <div className="flex items-center space-x-1">
                            {point.trend === 'up' ? (
                              <ArrowUpRight className="w-4 h-4 text-green-500" />
                            ) : point.trend === 'down' ? (
                              <ArrowDownRight className="w-4 h-4 text-red-500" />
                            ) : (
                              <div className="w-4 h-4 bg-gray-400 rounded-full" />
                            )}
                            <span className="text-sm text-gray-600 capitalize">{point.trend}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Potential Risks</h3>
                    <ul className="space-y-1">
                      {selectedRecommendation.risks.map((risk, index) => (
                        <li key={index} className="flex items-center space-x-2 text-gray-600">
                          <AlertCircle className="w-4 h-4 text-yellow-500" />
                          <span>{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Actions */}
                  {selectedRecommendation.status === 'pending' && (
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          handleRecommendationAction(selectedRecommendation.id, 'accepted');
                          setSelectedRecommendation(null);
                        }}
                        className="flex-1 flex items-center justify-center space-x-2 bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <ThumbsUp className="w-5 h-5" />
                        <span>Accept & Implement</span>
                      </button>
                      <button
                        onClick={() => {
                          handleRecommendationAction(selectedRecommendation.id, 'rejected');
                          setSelectedRecommendation(null);
                        }}
                        className="flex-1 flex items-center justify-center space-x-2 bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <ThumbsDown className="w-5 h-5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GrowthView;

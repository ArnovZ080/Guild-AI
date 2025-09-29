import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Plus, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Eye, 
  MousePointer, 
  Heart, 
  MessageCircle, 
  Share2, 
  Mail, 
  Calendar,
  BarChart3,
  Settings,
  Play,
  Pause,
  MoreHorizontal,
  Filter,
  Search,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Brain,
  Lightbulb,
  X,
  LineChart,
  Percent,
  Layers,
  Sliders,
  Globe,
  Hash
} from 'lucide-react';
import CreateCampaignModal from '../modals/CreateCampaignModal';
import AICreateCampaignModal from '../modals/AICreateCampaignModal';
import AIOptimizeCampaignModal from '../modals/AIOptimizeCampaignModal';

const CampaignsTab = ({ campaigns = [], onCampaignAction, onCreateCampaign }) => {
  const [selectedView, setSelectedView] = useState('overview');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAIOptimizeModal, setShowAIOptimizeModal] = useState(false);
  const [showAICreateModal, setShowAICreateModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [openMenuForId, setOpenMenuForId] = useState(null);

  // Campaign action handlers
  const handleCampaignAction = (action, campaign) => {
    console.log('Campaign action:', action, campaign);
    if (onCampaignAction) {
      onCampaignAction(campaign.campaign_id || campaign.id, action);
    }

    // Local modals to ensure UX works regardless of parent tab
    if (action === 'analytics') {
      setSelectedCampaign(campaign);
      setShowAnalyticsModal(true);
    } else if (action === 'settings') {
      setSelectedCampaign(campaign);
      setShowSettingsModal(true);
    }
  };

  const handleCreateCampaign = (campaignData) => {
    console.log('Creating campaign:', campaignData);
    if (onCreateCampaign) {
      onCreateCampaign(campaignData);
    }
  };

  // Calculate aggregate metrics with null checks
  const totalSpend = (campaigns || []).reduce((sum, campaign) => sum + (campaign?.spend || 0), 0);
  const totalBudget = (campaigns || []).reduce((sum, campaign) => sum + (campaign?.budget || 0), 0);
  const totalReach = (campaigns || []).reduce((sum, campaign) => sum + (campaign?.reach || 0), 0);
  const totalImpressions = (campaigns || []).reduce((sum, campaign) => sum + (campaign?.impressions || 0), 0);
  const totalClicks = (campaigns || []).reduce((sum, campaign) => sum + (campaign?.clicks || 0), 0);
  const totalConversions = (campaigns || []).reduce((sum, campaign) => sum + (campaign?.conversions || 0), 0);
  const totalEngagement = (campaigns || []).reduce((sum, campaign) => sum + (campaign?.engagement || 0), 0);

  // Calculate derived metrics
  const overallCTR = totalImpressions > 0 ? (totalClicks / totalImpressions * 100).toFixed(2) : 0;
  const overallConversionRate = totalClicks > 0 ? (totalConversions / totalClicks * 100).toFixed(2) : 0;
  const averageROAS = (campaigns || []).length > 0 ? (campaigns || []).reduce((sum, campaign) => sum + (campaign?.roas || 0), 0) / (campaigns || []).length : 0;

  // Filter campaigns with null checks
  const filteredCampaigns = (campaigns || []).filter(campaign => {
    if (!campaign) return false;
    const matchesStatus = filterStatus === 'all' || campaign.status === filterStatus;
    const matchesSearch = (campaign.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (campaign.platform || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'scheduled': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPlatformIcon = (platform) => {
    switch ((platform || '').toLowerCase()) {
      case 'facebook': case 'meta': return '📘';
      case 'instagram': return '📷';
      case 'google': case 'google ads': return '🔍';
      case 'tiktok': return '🎵';
      case 'twitter': case 'x': return '🐦';
      case 'linkedin': return '💼';
      case 'email': return '📧';
      default: return '📊';
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header with AI Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Marketing War Room</h2>
              <p className="text-gray-600">Unified campaign management with AI-powered insights</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* AI Insights Bar */}
        <div className="bg-white rounded-lg p-4 border border-blue-200">
          <div className="flex items-center space-x-2 mb-3">
            <Brain className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-gray-900">AI Campaign Insights</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-gray-700">
                <strong>Optimization:</strong> Your Google Ads campaigns are 23% more efficient than last month
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-gray-700">
                <strong>Alert:</strong> Facebook campaign "Summer Sale" needs budget adjustment
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-700">
                <strong>Opportunity:</strong> TikTok campaigns showing 45% higher engagement
              </span>
            </div>
          </div>
          
          {/* AI Campaign Actions */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={() => setShowAIOptimizeModal(true)}
              className="bg-white bg-opacity-80 hover:bg-opacity-100 rounded-lg p-4 text-left transition-all duration-200 border border-blue-200 hover:border-blue-300"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Zap className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">AI Optimize Campaign</h3>
                  <p className="text-sm text-gray-600">Let AI analyze and optimize your existing campaigns</p>
                </div>
              </div>
            </button>
            
            <button 
              onClick={() => setShowAICreateModal(true)}
              className="bg-white bg-opacity-80 hover:bg-opacity-100 rounded-lg p-4 text-left transition-all duration-200 border border-blue-200 hover:border-blue-300"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Brain className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">AI Create Campaign</h3>
                  <p className="text-sm text-gray-600">AI creates optimized campaigns based on your business data</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">vs Budget</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalSpend)}</div>
          <div className="text-sm text-gray-600">
            of {formatCurrency(totalBudget)} budget
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${totalBudget > 0 ? (totalSpend / totalBudget * 100) : 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">Total Reach</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatNumber(totalReach)}</div>
          <div className="text-sm text-gray-600">
            {formatNumber(totalImpressions)} impressions
          </div>
          <div className="mt-2 text-sm text-gray-500">
            CTR: {overallCTR}%
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MousePointer className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-gray-500">Conversions</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatNumber(totalConversions)}</div>
          <div className="text-sm text-gray-600">
            {overallConversionRate}% conversion rate
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {formatNumber(totalClicks)} total clicks
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-sm text-gray-500">Avg ROAS</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{averageROAS.toFixed(1)}x</div>
          <div className="text-sm text-gray-600">
            Return on Ad Spend
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {formatNumber(totalEngagement)} total engagement
          </div>
        </div>
      </div>

      {/* Campaign Controls */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Download className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Filter className="w-4 h-4" />
          </button>
          </div>
        </div>

        {/* Campaign List */}
        <div className="space-y-4">
          {filteredCampaigns.map((campaign) => {
            if (!campaign) return null;
            return (
            <div key={campaign.campaign_id || Math.random()} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">{getPlatformIcon(campaign.platform)}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{campaign.name || 'Unnamed Campaign'}</h3>
                    <p className="text-sm text-gray-600 capitalize">{campaign.platform || 'Unknown'} • {campaign.type || 'Campaign'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(campaign.status || 'unknown')}`}>
                    {campaign.status || 'Unknown'}
                </span>
                  <div className="relative">
                    <button 
                      onClick={() => setOpenMenuForId(openMenuForId === (campaign.campaign_id || campaign.id) ? null : (campaign.campaign_id || campaign.id))}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {openMenuForId === (campaign.campaign_id || campaign.id) && (
                      <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                        <button onClick={() => { setOpenMenuForId(null); handleCampaignAction('settings', campaign); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Settings</button>
                        <button onClick={() => { setOpenMenuForId(null); handleCampaignAction('analytics', campaign); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Analytics</button>
                        <div className="border-t border-gray-200"></div>
                        <button onClick={() => { setOpenMenuForId(null); handleCampaignAction('menu', campaign); }} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50">Delete</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Campaign Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{formatNumber(campaign.reach || 0)}</div>
                  <div className="text-xs text-gray-500">Reach</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{formatNumber(campaign.impressions || 0)}</div>
                  <div className="text-xs text-gray-500">Impressions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{formatNumber(campaign.clicks || 0)}</div>
                  <div className="text-xs text-gray-500">Clicks</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{campaign.ctr ? `${campaign.ctr}%` : '0%'}</div>
                  <div className="text-xs text-gray-500">Click Through Rate (CTR)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{formatNumber(campaign.conversions || 0)}</div>
                  <div className="text-xs text-gray-500">Conversions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{campaign.roas ? `${campaign.roas}x` : '0x'}</div>
                  <div className="text-xs text-gray-500">ROAS</div>
                </div>
              </div>

              {/* Budget and Spend */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-6">
                  <div>
                    <span className="text-sm text-gray-500">Budget:</span>
                    <span className="ml-2 font-semibold text-gray-900">{formatCurrency(campaign.budget || 0)}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Spent:</span>
                    <span className="ml-2 font-semibold text-gray-900">{formatCurrency(campaign.spend || 0)}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Remaining:</span>
                    <span className="ml-2 font-semibold text-gray-900">
                      {formatCurrency((campaign.budget || 0) - (campaign.spend || 0))}
                    </span>
                  </div>
                </div>
                <div className="w-32">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${campaign.budget > 0 ? (campaign.spend / campaign.budget * 100) : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Engagement Metrics */}
              {(campaign.likes || campaign.comments || campaign.shares || campaign.opens || campaign.clicks) && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                  {campaign.likes && (
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span className="text-lg font-semibold text-gray-900">{formatNumber(campaign.likes)}</span>
                      </div>
                      <div className="text-xs text-gray-500">Likes</div>
                    </div>
                  )}
                  {campaign.comments && (
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <MessageCircle className="w-4 h-4 text-blue-500" />
                        <span className="text-lg font-semibold text-gray-900">{formatNumber(campaign.comments)}</span>
                      </div>
                      <div className="text-xs text-gray-500">Comments</div>
                    </div>
                  )}
                  {campaign.shares && (
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Share2 className="w-4 h-4 text-green-500" />
                        <span className="text-lg font-semibold text-gray-900">{formatNumber(campaign.shares)}</span>
                      </div>
                      <div className="text-xs text-gray-500">Shares</div>
                    </div>
                  )}
                  {campaign.opens && (
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Mail className="w-4 h-4 text-purple-500" />
                        <span className="text-lg font-semibold text-gray-900">{formatNumber(campaign.opens)}</span>
                      </div>
                      <div className="text-xs text-gray-500">Opens</div>
                    </div>
                  )}
                  {campaign.emailClicks && (
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <MousePointer className="w-4 h-4 text-orange-500" />
                        <span className="text-lg font-semibold text-gray-900">{formatNumber(campaign.emailClicks)}</span>
                      </div>
                      <div className="text-xs text-gray-500">Email Clicks</div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleCampaignAction(campaign.status === 'active' ? 'pause' : 'resume', campaign)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                      campaign.status === 'active' 
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                  >
                    {campaign.status === 'active' ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Resume
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleCampaignAction('analytics', campaign)}
                    className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium flex items-center"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analytics
                  </button>
                <button
                    onClick={() => handleCampaignAction('settings', campaign)}
                    className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center"
                >
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                </button>
                <button
                    onClick={() => handleCampaignAction('show-in-calendar', campaign)}
                    className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium flex items-center"
                >
                    <Calendar className="w-4 h-4 mr-2" />
                    Show in Calendar
                </button>
                </div>
                <div className="text-sm text-gray-500">
                  {campaign.startDate && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Started {new Date(campaign.startDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            );
          })}
        </div>

        {filteredCampaigns.length === 0 && (
          <div className="text-center py-12">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No campaigns found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by creating your first campaign'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <button 
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Your First Campaign
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create Campaign Modal */}
      <CreateCampaignModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateCampaign={handleCreateCampaign}
      />

      {/* AI Create Campaign Modal */}
      <AICreateCampaignModal
        isOpen={showAICreateModal}
        onClose={() => setShowAICreateModal(false)}
        onCreateCampaign={handleCreateCampaign}
      />

      {/* AI Optimize Campaign Modal */}
      <AIOptimizeCampaignModal
        isOpen={showAIOptimizeModal}
        onClose={() => setShowAIOptimizeModal(false)}
        campaigns={campaigns}
      />

      {/* Fallback Analytics Modal (local) */}
      {showAnalyticsModal && selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Campaign Analytics</h2>
                  <p className="text-sm text-gray-600">{selectedCampaign.name}</p>
                </div>
              </div>
              <button onClick={() => setShowAnalyticsModal(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-8">
              {/* KPI Grid */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {[
                  { label: 'Reach', value: selectedCampaign.reach || 0, icon: Eye, color: 'blue' },
                  { label: 'Impressions', value: selectedCampaign.impressions || 0, icon: LineChart, color: 'indigo' },
                  { label: 'Clicks', value: selectedCampaign.clicks || 0, icon: MousePointer, color: 'green' },
                  { label: 'CTR', value: `${selectedCampaign.ctr ?? 0}%`, icon: Percent, color: 'purple' },
                  { label: 'Conversions', value: selectedCampaign.conversions || 0, icon: CheckCircle, color: 'emerald' },
                ].map((kpi, idx) => (
                  <div key={idx} className={`rounded-lg p-4 bg-${kpi.color}-50`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm text-${kpi.color}-800`}>{kpi.label}</span>
                      <kpi.icon className={`w-4 h-4 text-${kpi.color}-600`} />
                    </div>
                    <div className={`text-2xl font-bold text-${kpi.color}-900`}>{typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}</div>
                  </div>
                ))}
              </div>

              {/* Executive Snapshot */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Spend vs Budget</div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-2xl font-semibold text-gray-900">${selectedCampaign.spend || 0}</div>
                    <div className="text-sm text-gray-600">of ${selectedCampaign.budget || 0}</div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(selectedCampaign.budget > 0 ? (selectedCampaign.spend / selectedCampaign.budget) * 100 : 0)}%` }}></div>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Efficiency</div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-lg font-semibold text-gray-900">${(selectedCampaign.cpc || 0)}</div>
                      <div className="text-xs text-gray-500">CPC</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-gray-900">${(selectedCampaign.cpl || 0)}</div>
                      <div className="text-xs text-gray-500">CPL</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-gray-900">${(selectedCampaign.cpa || 0)}</div>
                      <div className="text-xs text-gray-500">CPA</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Revenue & ROAS</div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-500">Revenue</div>
                      <div className="text-lg font-semibold text-gray-900">${selectedCampaign.revenue || 0}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">ROAS</div>
                      <div className="text-lg font-semibold text-gray-900">{selectedCampaign.roas ? `${selectedCampaign.roas}x` : '0x'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Spend vs Budget */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-gray-900">Spend vs Budget</div>
                  <div className="text-sm text-gray-600">{`$${selectedCampaign.spend || 0} / $${selectedCampaign.budget || 0}`}</div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(selectedCampaign.budget > 0 ? (selectedCampaign.spend / selectedCampaign.budget) * 100 : 0)}%` }}></div>
                </div>
              </div>

              {/* Channel Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="font-medium text-gray-900 mb-2">Performance Over Time</div>
                  <div className="text-sm text-gray-500">(Sparkline placeholder)</div>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="font-medium text-gray-900 mb-2">Attribution Snapshot</div>
                  <div className="text-sm text-gray-500">(Attribution breakdown placeholder)</div>
                </div>
              </div>

              {/* Platform-Specific Breakdown */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Layers className="w-4 h-4 text-gray-600" />
                  <div className="font-medium text-gray-900">Platform Breakdown</div>
                  <span className="text-xs text-gray-500">({(selectedCampaign.platform || 'all').toString()})</span>
                </div>
                {(() => {
                  const p = (selectedCampaign.platform || '').toLowerCase();
                  if (p === 'facebook' || p === 'instagram' || p === 'meta') {
                    return (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                        <div>CPM: ${selectedCampaign.cpm || 0}</div>
                        <div>Engagement Rate: {selectedCampaign.engagement_rate ?? 0}%</div>
                        <div>Conversions: {selectedCampaign.conversions || 0}</div>
                      </div>
                    );
                  } else if (p === 'google') {
                    return (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                        <div>Quality Score: {selectedCampaign.quality_score ?? '-'}</div>
                        <div>CPC: ${selectedCampaign.cpc || 0}</div>
                        <div>Conv Rate: {selectedCampaign.conversion_rate ?? 0}%</div>
                      </div>
                    );
                  } else if (p === 'tiktok') {
                    return (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                        <div>Avg Watch Time: {selectedCampaign.avg_watch_time || '-'}s</div>
                        <div>Video Completion: {selectedCampaign.completion_rate ?? 0}%</div>
                        <div>CPC: ${selectedCampaign.cpc || 0}</div>
                      </div>
                    );
                  } else if (p === 'linkedin') {
                    return (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                        <div>Leads: {selectedCampaign.leads || 0}</div>
                        <div>CPL: ${selectedCampaign.cpl || 0}</div>
                        <div>Top Demographic: {selectedCampaign.top_demo || '—'}</div>
                      </div>
                    );
                  } else if (p === 'email') {
                    return (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                        <div>Delivery: {selectedCampaign.delivery_rate ?? 0}%</div>
                        <div>Open Rate: {selectedCampaign.open_rate ?? 0}%</div>
                        <div>Unsubscribe: {selectedCampaign.unsubscribe_rate ?? 0}%</div>
                      </div>
                    );
                  }
                  return <div className="text-sm text-gray-500">No platform-specific metrics available.</div>;
                })()}
              </div>

              {/* Audience Insights */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Globe className="w-4 h-4 text-gray-600" />
                  <div className="font-medium text-gray-900">Audience Insights</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div>Age/Gender: {selectedCampaign.audience_demo || '—'}</div>
                  <div>Top Locations: {selectedCampaign.top_locations || '—'}</div>
                  <div>Device Mix: {selectedCampaign.device_mix || '—'}</div>
                </div>
              </div>

              {/* Creative Performance */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Hash className="w-4 h-4 text-gray-600" />
                  <div className="font-medium text-gray-900">Creative Performance</div>
                </div>
                <div className="text-sm text-gray-500">(Per-asset table placeholder: CTR, engagement, conversions, fatigue)</div>
              </div>

              {/* Attribution & Funnel */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="font-medium text-gray-900 mb-2">Attribution & Funnel Impact</div>
                <div className="text-sm text-gray-500">(First/last touch, multi-touch contribution, drop-off points placeholder)</div>
              </div>

              {/* AI Insights & Optimization */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-gray-900">AI Insights</span>
                  </div>
                  <button onClick={() => onCampaignAction && onCampaignAction(selectedCampaign.campaign_id || selectedCampaign.id, 'optimize')} className="text-sm px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700">Enable Continuous Optimization</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ul className="list-disc pl-6 text-sm text-gray-700 space-y-1">
                    <li>Your CTR is above benchmark; focus on landing page to improve conversion rate.</li>
                    <li>Reallocate 15% budget to high-ROAS placements; pause underperforming ad set C.</li>
                    <li>Introduce 2 new creatives; variant B historically +12% CTR on similar audience.</li>
                  </ul>
                  <div className="bg-white border border-purple-200 rounded-lg p-3 text-sm">
                    <div className="font-medium text-gray-900 mb-1">Predictive Outlook</div>
                    <div className="text-gray-700">Projected conversions to completion: {selectedCampaign.projected_conversions || '—'}</div>
                    <div className="text-gray-700">Projected revenue: ${selectedCampaign.projected_revenue || '—'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fallback Settings Modal (local) */}
      {showSettingsModal && selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Settings className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Campaign Settings</h2>
                  <p className="text-sm text-gray-600">{selectedCampaign.name}</p>
                </div>
              </div>
              <button onClick={() => setShowSettingsModal(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
                    <input type="text" defaultValue={selectedCampaign.name} className="w-full px-3 py-2 border border-gray-300 rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Daily Budget</label>
                    <input type="number" defaultValue={selectedCampaign.budget} className="w-full px-3 py-2 border border-gray-300 rounded" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                      <input type="date" defaultValue={selectedCampaign.startDate ? selectedCampaign.startDate.split('T')[0] : ''} className="w-full px-3 py-2 border border-gray-300 rounded" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duration (days)</label>
                      <input type="number" defaultValue={selectedCampaign.duration || 30} className="w-full px-3 py-2 border border-gray-300 rounded" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Objective</label>
                    <input type="text" defaultValue={selectedCampaign.objective || ''} className="w-full px-3 py-2 border border-gray-300 rounded" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Audience</label>
                    <textarea defaultValue={selectedCampaign.targetAudience || ''} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Geography</label>
                      <input type="text" defaultValue={selectedCampaign.geo || ''} className="w-full px-3 py-2 border border-gray-300 rounded" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Placements</label>
                      <input type="text" defaultValue={selectedCampaign.placements || ''} className="w-full px-3 py-2 border border-gray-300 rounded" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Optimization Goal</label>
                      <input type="text" defaultValue={selectedCampaign.optimization_goal || ''} className="w-full px-3 py-2 border border-gray-300 rounded" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bid Strategy</label>
                      <input type="text" defaultValue={selectedCampaign.bid_strategy || ''} className="w-full px-3 py-2 border border-gray-300 rounded" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end">
                <button onClick={() => {
                  // Gather a minimal payload from visible fields (for now, demo-only)
                  const payload = {
                    // In a full implementation, collect controlled inputs here
                    objective: selectedCampaign.objective,
                  };
                  onCampaignAction && onCampaignAction(selectedCampaign.campaign_id || selectedCampaign.id, 'update', payload);
                  setShowSettingsModal(false);
                }} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignsTab;

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
  Lightbulb
} from 'lucide-react';
import CreateCampaignModal from '../modals/CreateCampaignModal';

const CampaignsTab = ({ campaigns = [], onCampaignAction, onCreateCampaign }) => {
  const [selectedView, setSelectedView] = useState('overview');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Calculate aggregate metrics
  const totalSpend = campaigns.reduce((sum, campaign) => sum + (campaign.spend || 0), 0);
  const totalBudget = campaigns.reduce((sum, campaign) => sum + (campaign.budget || 0), 0);
  const totalReach = campaigns.reduce((sum, campaign) => sum + (campaign.reach || 0), 0);
  const totalImpressions = campaigns.reduce((sum, campaign) => sum + (campaign.impressions || 0), 0);
  const totalClicks = campaigns.reduce((sum, campaign) => sum + (campaign.clicks || 0), 0);
  const totalConversions = campaigns.reduce((sum, campaign) => sum + (campaign.conversions || 0), 0);
  const totalEngagement = campaigns.reduce((sum, campaign) => sum + (campaign.engagement || 0), 0);

  // Calculate derived metrics
  const overallCTR = totalImpressions > 0 ? (totalClicks / totalImpressions * 100).toFixed(2) : 0;
  const overallConversionRate = totalClicks > 0 ? (totalConversions / totalClicks * 100).toFixed(2) : 0;
  const averageROAS = campaigns.length > 0 ? campaigns.reduce((sum, campaign) => sum + (campaign.roas || 0), 0) / campaigns.length : 0;

  // Filter campaigns
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesStatus = filterStatus === 'all' || campaign.status === filterStatus;
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.platform.toLowerCase().includes(searchTerm.toLowerCase());
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
    switch (platform.toLowerCase()) {
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
          {filteredCampaigns.map((campaign) => (
            <div key={campaign.campaign_id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">{getPlatformIcon(campaign.platform)}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                    <p className="text-sm text-gray-600 capitalize">{campaign.platform} • {campaign.type || 'Campaign'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(campaign.status)}`}>
                    {campaign.status}
                  </span>
                  <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
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
                  <div className="text-xs text-gray-500">CTR</div>
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
                    onClick={() => onCampaignAction?.(campaign.campaign_id, campaign.status === 'active' ? 'pause' : 'resume')}
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
                    onClick={() => onCampaignAction?.(campaign.campaign_id, 'details')}
                    className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium flex items-center"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analytics
                  </button>
                  <button
                    onClick={() => onCampaignAction?.(campaign.campaign_id, 'edit')}
                    className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
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
          ))}
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
        onCreateCampaign={onCreateCampaign}
      />
    </div>
  );
};

export default CampaignsTab;

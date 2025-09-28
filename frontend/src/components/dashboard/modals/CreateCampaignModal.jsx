import React, { useState, useEffect } from 'react';
import { 
  X, 
  Target, 
  DollarSign, 
  Users, 
  Calendar, 
  Image, 
  FileText, 
  Video, 
  Mail, 
  BarChart3,
  Brain,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Settings,
  Eye,
  MousePointer,
  Heart,
  MessageCircle,
  Share2,
  TrendingUp,
  ArrowRight,
  Info,
  HelpCircle
} from 'lucide-react';

const CreateCampaignModal = ({ isOpen, onClose, onCreateCampaign }) => {
  const [step, setStep] = useState(1);
  const [campaignData, setCampaignData] = useState({
    name: '',
    platform: '',
    type: '',
    objective: '',
    budget: '',
    duration: '',
    targetAudience: '',
    creativeAssets: [],
    aiRecommendations: null,
    agentWorkflow: []
  });

  const [aiInsights, setAiInsights] = useState({
    strategy: null,
    budgetOptimization: null,
    audienceRecommendations: null,
    creativeSuggestions: null,
    performancePredictions: null
  });

  const [showAgentWorkflow, setShowAgentWorkflow] = useState(false);

  // Simulate AI agent workflow
  useEffect(() => {
    if (campaignData.platform && campaignData.objective) {
      // Simulate AI agents working together
      const workflow = [
        {
          agent: 'Strategy Agent',
          action: 'Analyzing market trends and competitor strategies',
          status: 'completed',
          insights: 'Based on current market data, your campaign should focus on mobile-first creative formats',
          timestamp: new Date().toISOString()
        },
        {
          agent: 'Audience Intelligence Agent',
          action: 'Building detailed audience personas',
          status: 'completed',
          insights: 'Your target audience shows 67% higher engagement with video content on mobile',
          timestamp: new Date().toISOString()
        },
        {
          agent: 'Creative Optimization Agent',
          action: 'Generating creative recommendations',
          status: 'in_progress',
          insights: 'Testing 3 creative variations with different emotional triggers',
          timestamp: new Date().toISOString()
        },
        {
          agent: 'Budget Optimization Agent',
          action: 'Calculating optimal budget allocation',
          status: 'pending',
          insights: 'Recommended daily budget: $50-75 for optimal reach and frequency',
          timestamp: new Date().toISOString()
        }
      ];
      
      setCampaignData(prev => ({ ...prev, agentWorkflow: workflow }));
    }
  }, [campaignData.platform, campaignData.objective]);

  const platforms = [
    { id: 'facebook', name: 'Facebook & Instagram', icon: '📘', description: 'Reach 2.9B+ users with visual content' },
    { id: 'google', name: 'Google Ads', icon: '🔍', description: 'Capture high-intent search traffic' },
    { id: 'tiktok', name: 'TikTok', icon: '🎵', description: 'Engage Gen Z with short-form video' },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼', description: 'Target B2B professionals' },
    { id: 'twitter', name: 'Twitter/X', icon: '🐦', description: 'Real-time engagement and news' },
    { id: 'email', name: 'Email Marketing', icon: '📧', description: 'Direct communication with subscribers' }
  ];

  const campaignTypes = {
    facebook: [
      { id: 'awareness', name: 'Brand Awareness', description: 'Increase brand recognition' },
      { id: 'traffic', name: 'Traffic', description: 'Drive website visits' },
      { id: 'engagement', name: 'Engagement', description: 'Boost post interactions' },
      { id: 'conversions', name: 'Conversions', description: 'Generate leads and sales' }
    ],
    google: [
      { id: 'search', name: 'Search Campaign', description: 'Target search queries' },
      { id: 'display', name: 'Display Campaign', description: 'Visual ads across websites' },
      { id: 'video', name: 'Video Campaign', description: 'YouTube and video placements' },
      { id: 'shopping', name: 'Shopping Campaign', description: 'Product showcase ads' }
    ],
    tiktok: [
      { id: 'reach', name: 'Reach', description: 'Maximize audience reach' },
      { id: 'video_views', name: 'Video Views', description: 'Optimize for video completions' },
      { id: 'conversions', name: 'Conversions', description: 'Drive app installs and sales' }
    ],
    linkedin: [
      { id: 'awareness', name: 'Brand Awareness', description: 'Increase brand visibility' },
      { id: 'website_visits', name: 'Website Visits', description: 'Drive traffic to your site' },
      { id: 'lead_generation', name: 'Lead Generation', description: 'Capture qualified leads' }
    ],
    twitter: [
      { id: 'awareness', name: 'Awareness', description: 'Increase brand awareness' },
      { id: 'video_views', name: 'Video Views', description: 'Promote video content' },
      { id: 'website_clicks', name: 'Website Clicks', description: 'Drive traffic to website' }
    ],
    email: [
      { id: 'newsletter', name: 'Newsletter', description: 'Regular content updates' },
      { id: 'promotional', name: 'Promotional', description: 'Sales and offers' },
      { id: 'nurture', name: 'Nurture Sequence', description: 'Lead nurturing automation' }
    ]
  };

  const handleInputChange = (field, value) => {
    setCampaignData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    onCreateCampaign(campaignData);
    onClose();
  };

  const getAIRecommendations = () => {
    if (!campaignData.platform || !campaignData.objective) return null;

    return {
      budget: {
        recommended: '$50-75/day',
        reasoning: 'Based on your audience size and platform competition, this budget range will provide optimal reach without overspending',
        confidence: 87
      },
      audience: {
        recommended: '25-45 years old, interested in technology and lifestyle',
        reasoning: 'Your historical data shows 3.2x higher conversion rates with this demographic',
        confidence: 92
      },
      creative: {
        recommended: 'Video-first approach with mobile optimization',
        reasoning: 'Mobile video content shows 45% higher engagement rates on your chosen platform',
        confidence: 78
      },
      timing: {
        recommended: 'Launch during peak hours: 7-9 AM and 7-9 PM',
        reasoning: 'Your target audience is most active during these time periods',
        confidence: 85
      }
    };
  };

  const aiRecommendations = getAIRecommendations();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Create New Campaign</h2>
              <p className="text-sm text-gray-600">Step {step} of 4: Campaign Setup</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNum 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNum}
                </div>
                {stepNum < 4 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step > stepNum ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex">
          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Basics</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Campaign Name *
                      </label>
                      <input
                        type="text"
                        value={campaignData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="e.g., Summer Sale 2024"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Platform *
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {platforms.map((platform) => (
                          <button
                            key={platform.id}
                            onClick={() => handleInputChange('platform', platform.id)}
                            className={`p-4 border-2 rounded-lg text-left transition-colors ${
                              campaignData.platform === platform.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">{platform.icon}</span>
                              <div>
                                <div className="font-medium text-gray-900">{platform.name}</div>
                                <div className="text-sm text-gray-600">{platform.description}</div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Type & Objective</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Campaign Type *
                      </label>
                      <div className="space-y-2">
                        {campaignTypes[campaignData.platform]?.map((type) => (
                          <button
                            key={type.id}
                            onClick={() => handleInputChange('type', type.id)}
                            className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${
                              campaignData.type === type.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="font-medium text-gray-900">{type.name}</div>
                            <div className="text-sm text-gray-600">{type.description}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Campaign Objective *
                      </label>
                      <textarea
                        value={campaignData.objective}
                        onChange={(e) => handleInputChange('objective', e.target.value)}
                        placeholder="Describe what you want to achieve with this campaign..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget & Targeting</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Daily Budget *
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="number"
                            value={campaignData.budget}
                            onChange={(e) => handleInputChange('budget', e.target.value)}
                            placeholder="50"
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Campaign Duration (days)
                        </label>
                        <input
                          type="number"
                          value={campaignData.duration}
                          onChange={(e) => handleInputChange('duration', e.target.value)}
                          placeholder="30"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Audience
                      </label>
                      <textarea
                        value={campaignData.targetAudience}
                        onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                        placeholder="Describe your target audience..."
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Recommendations & Review</h3>
                  
                  {aiRecommendations && (
                    <div className="bg-blue-50 rounded-lg p-4 mb-6">
                      <div className="flex items-center space-x-2 mb-3">
                        <Brain className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold text-gray-900">AI Agent Recommendations</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-3">
                          <div className="flex items-center space-x-2 mb-2">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="font-medium text-gray-900">Budget</span>
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              {aiRecommendations.budget.confidence}% confidence
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{aiRecommendations.budget.recommended}</p>
                          <p className="text-xs text-gray-600 mt-1">{aiRecommendations.budget.reasoning}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                          <div className="flex items-center space-x-2 mb-2">
                            <Users className="w-4 h-4 text-blue-600" />
                            <span className="font-medium text-gray-900">Audience</span>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {aiRecommendations.audience.confidence}% confidence
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{aiRecommendations.audience.recommended}</p>
                          <p className="text-xs text-gray-600 mt-1">{aiRecommendations.audience.reasoning}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                          <div className="flex items-center space-x-2 mb-2">
                            <Image className="w-4 h-4 text-purple-600" />
                            <span className="font-medium text-gray-900">Creative</span>
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                              {aiRecommendations.creative.confidence}% confidence
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{aiRecommendations.creative.recommended}</p>
                          <p className="text-xs text-gray-600 mt-1">{aiRecommendations.creative.reasoning}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                          <div className="flex items-center space-x-2 mb-2">
                            <Clock className="w-4 h-4 text-orange-600" />
                            <span className="font-medium text-gray-900">Timing</span>
                            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                              {aiRecommendations.timing.confidence}% confidence
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{aiRecommendations.timing.recommended}</p>
                          <p className="text-xs text-gray-600 mt-1">{aiRecommendations.timing.reasoning}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Campaign Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium text-gray-900">{campaignData.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Platform:</span>
                        <span className="font-medium text-gray-900 capitalize">{campaignData.platform}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium text-gray-900 capitalize">{campaignData.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Daily Budget:</span>
                        <span className="font-medium text-gray-900">${campaignData.budget}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium text-gray-900">{campaignData.duration} days</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* AI Agent Workflow Sidebar */}
          <div className="w-80 border-l border-gray-200 bg-gray-50 p-4 overflow-y-auto">
            <div className="flex items-center space-x-2 mb-4">
              <Brain className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-gray-900">AI Agent Workflow</span>
            </div>
            
            <div className="space-y-3">
              {campaignData.agentWorkflow.map((workflow, index) => (
                <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className={`w-2 h-2 rounded-full ${
                      workflow.status === 'completed' ? 'bg-green-500' :
                      workflow.status === 'in_progress' ? 'bg-yellow-500' :
                      'bg-gray-300'
                    }`} />
                    <span className="text-sm font-medium text-gray-900">{workflow.agent}</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{workflow.action}</p>
                  <p className="text-xs text-gray-700 bg-gray-50 p-2 rounded">{workflow.insights}</p>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(workflow.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Lightbulb className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-900">Learning Tip</span>
              </div>
              <p className="text-xs text-gray-700">
                Notice how our AI agents work together? The Strategy Agent analyzes market data first, 
                then the Audience Agent builds personas, followed by Creative and Budget agents. 
                This collaborative approach ensures your campaigns are optimized from every angle.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handlePrevious}
            disabled={step === 1}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            {step === 4 ? (
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Create Campaign
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCampaignModal;

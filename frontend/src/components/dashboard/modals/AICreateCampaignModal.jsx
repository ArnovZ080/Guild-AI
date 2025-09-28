import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Target, 
  DollarSign, 
  Users, 
  Calendar, 
  CheckCircle, 
  X, 
  Loader2,
  Lightbulb,
  Zap,
  BarChart3,
  MessageCircle,
  ArrowRight
} from 'lucide-react';

const AICreateCampaignModal = ({ isOpen, onClose, onCreateCampaign }) => {
  const [step, setStep] = useState(1);
  const [campaignInput, setCampaignInput] = useState({
    businessGoal: '',
    targetAudience: '',
    budget: '',
    timeline: '',
    platforms: [],
    specificRequirements: ''
  });

  // Load onboarding data on component mount
  useEffect(() => {
    try {
      const onboardingData = localStorage.getItem('guild_onboarding_data');
      if (onboardingData) {
        const data = JSON.parse(onboardingData);
        setCampaignInput(prev => ({
          ...prev,
          targetAudience: data.idealClient || data.clientAvatar || data.answers?.[3] || '',
          businessGoal: data.businessType || data.answers?.[0] || '',
          brandVoice: data.brandVoice || data.answers?.[11] || ''
        }));
      }
    } catch (e) {
      console.log('No onboarding data found');
    }
  }, []);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCampaign, setGeneratedCampaign] = useState(null);
  const [isRefiningAudience, setIsRefiningAudience] = useState(false);

  const handleInputChange = (field, value) => {
    setCampaignInput(prev => ({ ...prev, [field]: value }));
  };

  const handlePlatformToggle = (platform) => {
    setCampaignInput(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }));
  };

  const generateAICampaign = async () => {
    setIsGenerating(true);
    setStep(2); // Move to step 2 first
    
    // Simulate AI analysis and campaign generation
    setTimeout(() => {
      const analysis = {
        businessInsights: [
          'Based on your business data, your target audience shows high engagement with video content',
          'Your onboarding data indicates strong interest in educational content',
          'Competitor analysis suggests TikTok and Instagram are your best performing platforms'
        ],
        recommendedStrategy: {
          platforms: campaignInput.platforms.length > 0 ? campaignInput.platforms : ['instagram', 'tiktok'],
          budget: campaignInput.budget || '50',
          duration: campaignInput.timeline || '30',
          approach: 'Educational content with behind-the-scenes elements'
        },
        confidence: 92
      };
      
      setAiAnalysis(analysis);
      
      // Generate campaign details
      const campaign = {
        name: `${campaignInput.businessGoal} Campaign`,
        platform: analysis.recommendedStrategy.platforms[0],
        type: 'ai_generated',
        objective: campaignInput.businessGoal,
        budget: parseInt(analysis.recommendedStrategy.budget),
        duration: parseInt(analysis.recommendedStrategy.duration),
        targetAudience: campaignInput.targetAudience,
        status: 'draft',
        aiGenerated: true,
        aiInsights: analysis,
        created_at: new Date().toISOString(),
        campaign_id: `ai_campaign_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
      };
      
      setGeneratedCampaign(campaign);
      setIsGenerating(false);
      setStep(3); // Move to step 3 after generation is complete
    }, 3000);
  };

  const handleCreateCampaign = () => {
    console.log('Create campaign clicked, generatedCampaign:', generatedCampaign);
    if (generatedCampaign) {
      onCreateCampaign(generatedCampaign);
      onClose();
    } else {
      console.log('No generated campaign found');
    }
  };

  const resetModal = () => {
    setStep(1);
    setCampaignInput({
      businessGoal: '',
      targetAudience: '',
      budget: '',
      timeline: '',
      platforms: [],
      specificRequirements: ''
    });
    setAiAnalysis(null);
    setGeneratedCampaign(null);
    setIsGenerating(false);
  };

  useEffect(() => {
    if (!isOpen) {
      resetModal();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const platforms = [
    { id: 'facebook', name: 'Facebook', icon: '📘' },
    { id: 'instagram', name: 'Instagram', icon: '📷' },
    { id: 'tiktok', name: 'TikTok', icon: '🎵' },
    { id: 'google', name: 'Google Ads', icon: '🔍' },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼' },
    { id: 'twitter', name: 'Twitter/X', icon: '🐦' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">AI Create Campaign</h2>
              <p className="text-sm text-gray-600">Let AI create an optimized campaign for you</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tell us about your campaign goals</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What do you want to achieve? *
                    </label>
                    <textarea
                      value={campaignInput.businessGoal}
                      onChange={(e) => handleInputChange('businessGoal', e.target.value)}
                      placeholder="e.g., Increase brand awareness, drive sales, generate leads..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">Who is your target audience?</label>
                      <button 
                        type="button" 
                        onClick={() => setIsRefiningAudience(!isRefiningAudience)} 
                        className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                      >
                        {isRefiningAudience ? 'Use Default' : 'Refine Audience'}
                      </button>
                    </div>
                    {!isRefiningAudience ? (
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-700 font-medium">Using Onboarding Data</p>
                            <p className="text-xs text-gray-500 mt-1">{campaignInput.targetAudience || 'No audience data found'}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <textarea
                        value={campaignInput.targetAudience}
                        onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                        placeholder="e.g., Young professionals aged 25-35, interested in fitness and wellness..."
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Budget (daily)
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="number"
                          value={campaignInput.budget}
                          onChange={(e) => handleInputChange('budget', e.target.value)}
                          placeholder="50"
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Campaign Duration (days)
                      </label>
                      <input
                        type="number"
                        value={campaignInput.timeline}
                        onChange={(e) => handleInputChange('timeline', e.target.value)}
                        placeholder="30"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Platforms
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {platforms.map((platform) => (
                        <button
                          key={platform.id}
                          onClick={() => handlePlatformToggle(platform.id)}
                          className={`p-3 border-2 rounded-lg text-left transition-colors ${
                            campaignInput.platforms.includes(platform.id)
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{platform.icon}</span>
                            <span className="font-medium">{platform.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Any specific requirements?
                    </label>
                    <textarea
                      value={campaignInput.specificRequirements}
                      onChange={(e) => handleInputChange('specificRequirements', e.target.value)}
                      placeholder="e.g., Must include video content, focus on mobile users, specific messaging..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                  <Brain className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">AI is analyzing your requirements</h3>
                <p className="text-gray-600">Our AI agents are working together to create your optimized campaign...</p>
              </div>

              <div className="space-y-4">
                {[
                  { id: 'strategy', name: 'Strategy Agent', description: 'Analyzing your business data and market trends...', icon: '🎯', status: 'completed', progress: 100 },
                  { id: 'campaign', name: 'Enhanced Campaign Agent', description: 'Configuring platform settings and integrations...', icon: '🚀', status: 'completed', progress: 100 },
                  { id: 'personalization', name: 'Lead Personalization Agent', description: 'Optimizing audience targeting and messaging...', icon: '🎯', status: 'in_progress', progress: 65 },
                  { id: 'brand', name: 'Brand Strategist Agent', description: 'Ensuring brand consistency and creative alignment...', icon: '🎨', status: 'pending', progress: 0 },
                  { id: 'judge', name: 'Judge Agent', description: 'Evaluating campaign quality and compliance...', icon: '⚖️', status: 'pending', progress: 0 }
                ].map((agent, index) => (
                  <div key={agent.id} className="flex items-center space-x-4 p-4 bg-white border border-gray-200 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                        agent.status === 'completed' ? 'bg-green-100' :
                        agent.status === 'in_progress' ? 'bg-blue-100' :
                        'bg-gray-100'
                      }`}>
                        {agent.status === 'completed' ? '✅' : 
                         agent.status === 'in_progress' ? '🔄' : agent.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-gray-900">{agent.name}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          agent.status === 'completed' ? 'bg-green-100 text-green-800' :
                          agent.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {agent.status === 'completed' ? 'Completed' :
                           agent.status === 'in_progress' ? 'In Progress' : 'Pending'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{agent.description}</p>
                      {agent.status === 'in_progress' && (
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${agent.progress}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {isGenerating && (
                <div className="text-center">
                  <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Generating your campaign...</p>
                </div>
              )}
            </div>
          )}

          {step === 3 && generatedCampaign && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your AI-Generated Campaign</h3>
                
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 mb-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-gray-900">Campaign Ready!</span>
                    <span className="text-sm text-gray-600">Confidence: {aiAnalysis?.confidence}%</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Campaign Details</h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Name:</strong> {generatedCampaign.name}</div>
                        <div><strong>Platform:</strong> {generatedCampaign.platform}</div>
                        <div><strong>Budget:</strong> ${generatedCampaign.budget}/day</div>
                        <div><strong>Duration:</strong> {generatedCampaign.duration} days</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">AI Insights</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        {aiAnalysis?.businessInsights.map((insight, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <Lightbulb className="w-3 h-3 text-yellow-500 mt-1 flex-shrink-0" />
                            <span>{insight}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Recommended Strategy</h4>
                  <p className="text-sm text-gray-600 mb-3">{aiAnalysis?.recommendedStrategy.approach}</p>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <Target className="w-4 h-4 text-blue-600" />
                      <span>Platforms: {aiAnalysis?.recommendedStrategy.platforms.join(', ')}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span>Budget: ${aiAnalysis?.recommendedStrategy.budget}/day</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4 text-purple-600" />
                      <span>Duration: {aiAnalysis?.recommendedStrategy.duration} days</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {step === 1 && 'Step 1 of 3: Campaign Requirements'}
            {step === 2 && 'Step 2 of 3: AI Analysis'}
            {step === 3 && 'Step 3 of 3: Review & Create'}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            {step === 1 && (
              <button
                onClick={generateAICampaign}
                disabled={!campaignInput.businessGoal}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Brain className="w-4 h-4 mr-2" />
                Generate Campaign
              </button>
            )}
            {step === 3 && (
              <button
                onClick={handleCreateCampaign}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Create Campaign
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AICreateCampaignModal;

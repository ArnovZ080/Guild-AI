import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Target, 
  DollarSign, 
  TrendingUp, 
  CheckCircle, 
  X, 
  Loader2,
  Lightbulb,
  BarChart3,
  AlertTriangle,
  ArrowRight,
  Brain,
  Settings
} from 'lucide-react';

const AIOptimizeCampaignModal = ({ isOpen, onClose, campaigns = [] }) => {
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [optimizationResults, setOptimizationResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [step, setStep] = useState(1);

  const handleOptimizeCampaign = async (campaign) => {
    setSelectedCampaign(campaign);
    setIsAnalyzing(true);
    setStep(2);

    // Simulate AI optimization analysis
    setTimeout(() => {
      const results = {
        currentPerformance: {
          ctr: campaign.ctr || 2.1,
          cpc: campaign.cpc || 1.85,
          roas: campaign.roas || 3.2,
          reach: campaign.reach || 15000,
          impressions: campaign.impressions || 75000
        },
        optimizations: [
          {
            type: 'budget',
            title: 'Budget Reallocation',
            description: 'Shift 30% of budget from underperforming ad sets to top performers',
            impact: '+25% ROAS',
            confidence: 92,
            agent: 'Ad Performance Optimizer Agent'
          },
          {
            type: 'audience',
            title: 'Audience Refinement',
            description: 'Expand lookalike audiences based on high-value customers',
            impact: '+18% CTR',
            confidence: 88,
            agent: 'Lead Personalization Agent'
          },
          {
            type: 'creative',
            title: 'Creative Optimization',
            description: 'A/B test video-first creative formats for better engagement',
            impact: '+35% Engagement',
            confidence: 85,
            agent: 'Brand Strategist Agent'
          },
          {
            type: 'timing',
            title: 'Schedule Optimization',
            description: 'Adjust ad scheduling to peak engagement hours',
            impact: '+22% Reach',
            confidence: 90,
            agent: 'Strategy Agent'
          }
        ],
        predictedImprovements: {
          roas: '+28%',
          ctr: '+15%',
          reach: '+20%',
          costReduction: '-12%'
        },
        confidence: 89
      };

      setOptimizationResults(results);
      setIsAnalyzing(false);
      setStep(3);
    }, 4000);
  };

  const handleApplyOptimizations = async () => {
    if (!selectedCampaign || !optimizationResults) return;
    try {
      let profile = null;
      try {
        const res = await fetch('/api/profile');
        const json = await res.json();
        profile = json?.data || null;
      } catch {}

      const judgePayload = {
        brief: {
          objective: `Optimize campaign ${selectedCampaign.name}`,
          goals: { roas: 'increase', ctr: 'increase', reach: 'increase' },
          audience: selectedCampaign.audience ? { description: selectedCampaign.audience } : undefined,
          topic: selectedCampaign.name,
        },
        platforms: selectedCampaign.platform ? [selectedCampaign.platform] : [],
        brand: profile ? { voice: profile.brand_voice, colors: profile.brand_colors, guidelines: profile.guidelines } : undefined
      };
      const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const resp = await fetch(`${apiBase}/content/create`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(judgePayload) });
      const judge = await resp.json();
      const approved = judge?.data?.approved !== false;
      if (!approved) {
        const score = judge?.data?.overall_score;
        alert(`Optimizations failed quality gate${typeof score === 'number' ? ` (score: ${Math.round(score*100)/100})` : ''}. Please refine and try again.`);
        return;
      }

      alert('Optimizations applied successfully! Your campaign will be updated with the recommended changes.');
      onClose();
    } catch (e) {
      alert('Could not validate optimization quality. Please try again.');
    }
  };

  const resetModal = () => {
    setSelectedCampaign(null);
    setOptimizationResults(null);
    setIsAnalyzing(false);
    setStep(1);
  };

  useEffect(() => {
    if (!isOpen) {
      resetModal();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Zap className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">AI Optimize Campaign</h2>
              <p className="text-sm text-gray-600">Let AI analyze and optimize your campaigns</p>
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
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Campaign to Optimize</h3>
                <p className="text-gray-600 mb-6">Choose a campaign for AI analysis and optimization</p>
                
                {campaigns.length === 0 ? (
                  <div className="text-center py-12">
                    <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
                    <p className="text-gray-600">Create a campaign first to use AI optimization</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {campaigns.map((campaign) => (
                      <div
                        key={campaign.campaign_id}
                        onClick={() => handleOptimizeCampaign(campaign)}
                        className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 cursor-pointer transition-all"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="text-2xl">
                              {campaign.platform === 'facebook' ? '📘' : 
                               campaign.platform === 'instagram' ? '📷' :
                               campaign.platform === 'google' ? '🔍' :
                               campaign.platform === 'tiktok' ? '🎵' : '📱'}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{campaign.name}</h4>
                              <p className="text-sm text-gray-600 capitalize">{campaign.platform}</p>
                            </div>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                            campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {campaign.status}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Budget:</span>
                            <span className="font-medium ml-1">${campaign.budget}/day</span>
                          </div>
                          <div>
                            <span className="text-gray-600">ROAS:</span>
                            <span className="font-medium ml-1">{campaign.roas || '0'}x</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Reach:</span>
                            <span className="font-medium ml-1">{campaign.reach || '0'}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">CTR:</span>
                            <span className="font-medium ml-1">{campaign.ctr || '0'}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                  <Zap className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">AI is analyzing your campaign</h3>
                <p className="text-gray-600">Our AI agents are working together to optimize your campaign performance...</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-700">Ad Performance Optimizer Agent analyzing campaign metrics...</span>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-700">Lead Personalization Agent reviewing audience targeting...</span>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-700">Brand Strategist Agent evaluating creative performance...</span>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-700">Strategy Agent optimizing budget allocation...</span>
                </div>
              </div>

              {isAnalyzing && (
                <div className="text-center">
                  <Loader2 className="w-8 h-8 text-orange-600 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Generating optimization recommendations...</p>
                </div>
              )}
            </div>
          )}

          {step === 3 && optimizationResults && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Optimization Recommendations</h3>
                
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-6 mb-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-gray-900">Analysis Complete!</span>
                    <span className="text-sm text-gray-600">Confidence: {optimizationResults.confidence}%</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Current Performance</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>CTR:</span>
                          <span className="font-medium">{optimizationResults.currentPerformance.ctr}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>CPC:</span>
                          <span className="font-medium">${optimizationResults.currentPerformance.cpc}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>ROAS:</span>
                          <span className="font-medium">{optimizationResults.currentPerformance.roas}x</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Reach:</span>
                          <span className="font-medium">{optimizationResults.currentPerformance.reach.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Predicted Improvements</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>ROAS:</span>
                          <span className="font-medium text-green-600">{optimizationResults.predictedImprovements.roas}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>CTR:</span>
                          <span className="font-medium text-green-600">{optimizationResults.predictedImprovements.ctr}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Reach:</span>
                          <span className="font-medium text-green-600">{optimizationResults.predictedImprovements.reach}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Cost Reduction:</span>
                          <span className="font-medium text-green-600">{optimizationResults.predictedImprovements.costReduction}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Recommended Optimizations</h4>
                  {optimizationResults.optimizations.map((optimization, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="p-1 bg-blue-100 rounded">
                            <Brain className="w-4 h-4 text-blue-600" />
                          </div>
                          <h5 className="font-medium text-gray-900">{optimization.title}</h5>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">{optimization.confidence}% confidence</span>
                          <span className="text-sm font-medium text-green-600">{optimization.impact}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{optimization.description}</p>
                      <div className="text-xs text-blue-600">
                        <strong>Agent:</strong> {optimization.agent}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {step === 1 && 'Step 1 of 3: Select Campaign'}
            {step === 2 && 'Step 2 of 3: AI Analysis'}
            {step === 3 && 'Step 3 of 3: Apply Optimizations'}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            {step === 3 && (
              <button
                onClick={handleApplyOptimizations}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center"
              >
                <Zap className="w-4 h-4 mr-2" />
                Apply Optimizations
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIOptimizeCampaignModal;

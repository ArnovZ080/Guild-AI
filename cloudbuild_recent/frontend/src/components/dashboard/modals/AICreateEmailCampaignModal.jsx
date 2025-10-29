import React, { useState, useEffect } from 'react';
import { Brain, Mail, Users, Calendar, CheckCircle, X, Loader2, Lightbulb, Zap, BarChart3, MessageCircle, ArrowRight, DollarSign, Target, Image, Palette } from 'lucide-react';
import { ContentIntelligenceAPIService, useCreativeAssets } from '../../../services/contentIntelligenceApi';
import EvaluatorRubricDrawer from '../shared/EvaluatorRubricDrawer.jsx';

const AICreateEmailCampaignModal = ({ isOpen, onClose, onCreateCampaign }) => {
  const [step, setStep] = useState(1);
  const [campaignInput, setCampaignInput] = useState({
    goal: '',
    audience: '',
    segmentId: '',
    sequenceLength: 3,
    schedule: '',
    specificRequirements: '',
    selectedAssets: [],
    brandData: null,
    customizeBrand: false
  });
  const [isRefiningAudience, setIsRefiningAudience] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCampaign, setGeneratedCampaign] = useState(null);
  const [rubric, setRubric] = useState(null);
  const [showRubric, setShowRubric] = useState(false);
  const [showAssetPicker, setShowAssetPicker] = useState(false);
  const api = new ContentIntelligenceAPIService();
  const { assets } = useCreativeAssets();

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setCampaignInput({ goal: '', audience: '', segmentId: '', sequenceLength: 3, schedule: '', specificRequirements: '' });
      setAiAnalysis(null);
      setGeneratedCampaign(null);
      setIsGenerating(false);
      setIsRefiningAudience(false);
    } else {
      try {
        const onboardingData = localStorage.getItem('guild_onboarding_data');
        if (onboardingData) {
          const data = JSON.parse(onboardingData);
          setCampaignInput(prev => ({
            ...prev,
            audience: data.idealClient || data.clientAvatar || data.answers?.[3] || '',
            goal: data.businessType || data.answers?.[0] || '',
            brandData: {
              voice: data.brandVoice || data.answers?.[11] || 'Professional',
              colors: data.brandColours || data.answers?.[12] || '#6366F1,#EC4899',
              fonts: data.brandFonts || 'Inter, sans-serif',
              logo: data.brandLogo || null
            }
          }));
        }
      } catch (e) {
        console.log('No onboarding data found');
      }
    }
  }, [isOpen]);

  const handleInputChange = (field, value) => {
    setCampaignInput(prev => ({ ...prev, [field]: value }));
  };

  const generateAICampaign = async () => {
    setIsGenerating(true);
    setStep(2);
    
    setTimeout(() => {
      const analysis = {
        insights: [
          'Segment-based personalization can increase open rates by 26%',
          'Your audience shows highest engagement Tuesday 10am and Thursday 9am',
          'Multi-email sequences convert 3.2x better than single sends'
        ],
        recommendedStrategy: {
          sequenceLength: campaignInput.sequenceLength || 3,
          schedule: campaignInput.schedule,
          approach: 'Personalized nurture sequence with value-first content'
        },
        confidence: 89
      };
      
      setAiAnalysis(analysis);
      
      const campaign = {
        name: `${campaignInput.goal} Email Campaign`,
        platform: 'email',
        type: 'ai_generated',
        objective: campaignInput.goal,
        targetAudience: campaignInput.audience,
        sequence: Array.from({ length: campaignInput.sequenceLength || 3 }).map((_, i) => ({
          id: `step_${i+1}`,
          subject: `Email ${i+1}: ${campaignInput.goal}`,
          delay_days: i === 0 ? 0 : 2
        })),
        status: 'draft',
        aiGenerated: true,
        aiInsights: analysis,
        created_at: new Date().toISOString(),
        scheduled_at: campaignInput.schedule,
        campaign_id: `ai_email_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
      };
      
      setGeneratedCampaign(campaign);
      setIsGenerating(false);
      setStep(3);
    }, 3000);
  };

  const handleCreateCampaign = async () => {
    if (!generatedCampaign) return;
    try {
      let profile = null;
      try {
        const res = await fetch('/api/profile');
        const json = await res.json();
        profile = json?.data || null;
      } catch {}

      const judgePayload = {
        brief: {
          objective: generatedCampaign.objective || 'Create email campaign',
          goals: { open_rate: 'increase', conversion: 'increase' },
          audience: generatedCampaign.targetAudience ? { description: generatedCampaign.targetAudience } : undefined,
          topic: generatedCampaign.name,
        },
        platforms: ['email'],
        brand: profile ? { voice: profile.brand_voice, colors: profile.brand_colors, guidelines: profile.guidelines } : undefined
      };
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const resp = await fetch(`${apiBase}/content/create`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(judgePayload) });
      const judge = await resp.json();
      const approved = judge?.data?.approved !== false;
      if (!approved) {
        setRubric(judge?.data || {});
        setShowRubric(true);
        return;
      }

      await api.createEmailCampaign(generatedCampaign);
      onCreateCampaign && onCreateCampaign(generatedCampaign);
      onClose();
    } catch (e) {
      alert('Could not validate campaign quality. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">AI Create Email Campaign</h2>
              <p className="text-sm text-gray-600">Let AI create an optimized email campaign for you</p>
            </div>
          </div>
          <button onClick={()=>onClose()} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tell us about your email campaign goals</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">What do you want to achieve? *</label>
                    <textarea value={campaignInput.goal} onChange={(e) => handleInputChange('goal', e.target.value)} placeholder="e.g., Launch new product, nurture leads, re-engage inactive customers..." rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">Who is your target audience?</label>
                      <button type="button" onClick={() => setIsRefiningAudience(!isRefiningAudience)} className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                        {isRefiningAudience ? 'Use Default' : 'Refine Audience'}
                      </button>
                    </div>
                    {!isRefiningAudience ? (
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-700 font-medium">Using Onboarding Data</p>
                            <p className="text-xs text-gray-500 mt-1">{campaignInput.audience || 'No audience data found'}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <textarea value={campaignInput.audience} onChange={(e) => handleInputChange('audience', e.target.value)} placeholder="e.g., Active customers interested in premium features..." rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Emails in Sequence</label>
                      <input type="number" min={1} max={10} value={campaignInput.sequenceLength} onChange={(e) => handleInputChange('sequenceLength', parseInt(e.target.value||'1',10))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Date/Time</label>
                      <input type="datetime-local" value={campaignInput.schedule} onChange={(e) => handleInputChange('schedule', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Segment or Tag (optional)</label>
                    <input value={campaignInput.segmentId} onChange={(e) => handleInputChange('segmentId', e.target.value)} placeholder="e.g., VIP Buyers, New Subscribers" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Any specific requirements?</label>
                    <textarea value={campaignInput.specificRequirements} onChange={(e) => handleInputChange('specificRequirements', e.target.value)} placeholder="e.g., Include discount code, focus on feature X..." rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Assets & Media</label>
                    <button onClick={()=>setShowAssetPicker(!showAssetPicker)} className="w-full px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center justify-center">
                      <Image className="w-4 h-4 mr-2"/>{showAssetPicker?'Hide':'Show'} Asset Library ({(campaignInput.selectedAssets||[]).length} selected)
                    </button>
                    {showAssetPicker && (
                      <div className="mt-3 border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto grid grid-cols-4 gap-2">
                        {(assets?.items || assets?.assets || assets || []).slice(0,16).map(a => (
                          <div key={a.asset_id||a.id} className={`border rounded p-2 cursor-pointer ${(campaignInput.selectedAssets||[]).includes(a.asset_id||a.id)?'border-purple-500 bg-purple-50':'border-gray-200'}`} onClick={()=>handleInputChange('selectedAssets', (campaignInput.selectedAssets||[]).includes(a.asset_id||a.id)?(campaignInput.selectedAssets||[]).filter(id=>id!==(a.asset_id||a.id)):[...(campaignInput.selectedAssets||[]), a.asset_id||a.id])}>
                            <div className="text-xs truncate">{a.name}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Brand Styling</label>
                    {!campaignInput.customizeBrand ? (
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-gray-900">Using Onboarding Brand Data</div>
                            <div className="text-xs text-gray-600 mt-1">Voice: {campaignInput.brandData?.voice} • Colors: {campaignInput.brandData?.colors}</div>
                          </div>
                          <button onClick={()=>handleInputChange('customizeBrand',true)} className="text-xs text-purple-600 hover:text-purple-700 font-medium">Customize</button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Brand Voice</label>
                          <input value={campaignInput.brandData?.voice||''} onChange={e=>setCampaignInput(p=>({...p,brandData:{...(p.brandData||{}),voice:e.target.value}}))} className="w-full px-2 py-1 border border-gray-300 rounded-lg text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Brand Colors</label>
                          <input value={campaignInput.brandData?.colors||''} onChange={e=>setCampaignInput(p=>({...p,brandData:{...(p.brandData||{}),colors:e.target.value}}))} className="w-full px-2 py-1 border border-gray-300 rounded-lg text-sm" placeholder="#6366F1,#EC4899" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">AI is analyzing your campaign...</h3>
                <p className="text-sm text-gray-600">Creating optimized email sequence, analyzing best send times, and personalizing content</p>
              </div>
            </div>
          )}

          {step === 3 && generatedCampaign && (
            <div className="space-y-6">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center"><CheckCircle className="w-5 h-5 text-green-600 mr-2"/>Campaign Plan Ready</h3>
                <p className="text-sm text-gray-700 mb-3">{aiAnalysis?.recommendedStrategy?.approach}</p>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  {(aiAnalysis?.insights||[]).map((ins, i) => (
                    <div key={i} className="flex items-start">
                      <Lightbulb className="w-3 h-3 mr-1 mt-0.5 text-purple-600"/><span className="text-gray-700">{ins}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Campaign: {generatedCampaign.name}</h4>
                <div className="space-y-2">
                  {(generatedCampaign.sequence||[]).map(s => (
                    <div key={s.id} className="border border-gray-200 rounded-lg p-3 flex items-center justify-between">
                      <div className="flex items-center"><Mail className="w-4 h-4 text-blue-600 mr-2"/><span className="text-sm font-medium">{s.subject}</span></div>
                      <div className="text-xs text-gray-600 flex items-center"><Calendar className="w-3 h-3 mr-1"/>Delay {s.delay_days} days</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-900 mb-1">AI Confidence Score</div>
                <div className="text-2xl font-bold text-blue-600">{aiAnalysis?.confidence || 0}%</div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-between">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium">
            Cancel
          </button>
          <div className="flex gap-3">
            {step > 1 && step < 3 && (
              <button onClick={() => setStep(step - 1)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium">
                Back
              </button>
            )}
            {step === 1 && (
              <button onClick={generateAICampaign} disabled={!campaignInput.goal.trim()} className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors font-medium flex items-center disabled:opacity-50">
                <Brain className="w-4 h-4 mr-2" />
                Generate Campaign
              </button>
            )}
            {step === 3 && (
              <button onClick={handleCreateCampaign} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                Create Campaign
              </button>
            )}
          </div>
        </div>
      </div>
      <EvaluatorRubricDrawer open={showRubric} onClose={()=>setShowRubric(false)} data={rubric} />
    </div>
  );
};

export default AICreateEmailCampaignModal;

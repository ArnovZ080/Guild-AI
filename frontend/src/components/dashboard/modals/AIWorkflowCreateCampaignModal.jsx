import React, { useEffect, useMemo, useState } from 'react';
import { X, BrainCircuit, Target, DollarSign, Calendar, Zap, CheckCircle, Lightbulb, BarChart3, ShieldCheck, Edit3 } from 'lucide-react';

const AIWorkflowCreateCampaignModal = ({ isOpen, onClose, onCreateCampaign }) => {
  // Onboarding defaults
  const [initialObjective, setInitialObjective] = useState('');
  const [initialAudienceDesc, setInitialAudienceDesc] = useState('');
  useEffect(() => {
    try {
      const onboardingStr = typeof window !== 'undefined' ? localStorage.getItem('guild_onboarding_data') : null;
      if (onboardingStr) {
        const data = JSON.parse(onboardingStr);
        setInitialObjective(data.businessType || data.answers?.[0] || '');
        setInitialAudienceDesc(data.idealClient || data.clientAvatar || data.answers?.[3] || '');
      }
    } catch {}
  }, []);

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [agentWorkflow, setAgentWorkflow] = useState([]);

  // Scroll to top when step changes
  const scrollToTop = () => {
    const modal = document.querySelector('.ai-workflow-modal');
    if (modal) {
      modal.scrollTop = 0;
    }
  };

  const handleStepChange = (newStep) => {
    setStep(newStep);
    setTimeout(scrollToTop, 100); // Small delay to ensure DOM is updated
  };

  // Page 1: inputs
  const goals = ['Sell more courses','Grow my following','Increase leads','Boost repeat purchases','Brand awareness','Other'];
  const [goal, setGoal] = useState('');
  const [goalOther, setGoalOther] = useState('');
  const [budgetRange, setBudgetRange] = useState({ min: 50, max: 200 });
  const [timeframe, setTimeframe] = useState({ start: '', end: '' });
  const [pacing, setPacing] = useState('even'); // even | frontloaded
  // Audience and Location (refine like CreateCampaignModal style)
  const [isRefiningAudience, setIsRefiningAudience] = useState(false);
  const [audienceText, setAudienceText] = useState('');
  const [locations, setLocations] = useState({ country: '', regions: '' });
  const [demographics, setDemographics] = useState({ ageMin: '', ageMax: '', genders: { male: false, female: false, other: false } });

  useEffect(() => {
    setAudienceText(initialAudienceDesc || '');
  try {
    const onboardingStr = typeof window !== 'undefined' ? localStorage.getItem('guild_onboarding_data') : null;
    if (onboardingStr) {
      const data = JSON.parse(onboardingStr);
        const defaultCountry = data?.country || '';
        setLocations(prev => ({ ...prev, country: defaultCountry }));
    }
  } catch {}
  }, [initialAudienceDesc]);

  // Simple recommendations (stubs) driven by onboarding context
  const recommendedBudget = useMemo(() => {
    // Fake heuristic based on presence of audience description length
    const audienceSizeHint = (initialAudienceDesc || '').length;
    if (audienceSizeHint > 200) return { min: 200, max: 600, reason: 'Larger inferred audience size and broader market' };
    if (audienceSizeHint > 80) return { min: 100, max: 300, reason: 'Moderate audience and growth potential' };
    return { min: 50, max: 150, reason: 'Conservative start based on limited signals' };
  }, [initialAudienceDesc]);

  useEffect(() => {
    // Initialize defaults from recommendation once
    setBudgetRange(recommendedBudget);
  }, [recommendedBudget]);

  // API call functions with graceful fallbacks
  const callAgent = async (agentName, action, data, fallbackData) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/agents/${agentName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...data })
      });
      
      if (response.ok) {
        const result = await response.json();
        setAgentWorkflow(prev => [...prev, {
          agent: agentName,
          action,
          status: 'completed',
          timestamp: new Date().toISOString(),
          result
        }]);
        return result;
      } else {
        throw new Error(`API call failed: ${response.status}`);
      }
    } catch (error) {
      console.warn(`Agent ${agentName} API call failed, using fallback:`, error);
      setAgentWorkflow(prev => [...prev, {
        agent: agentName,
        action,
        status: 'fallback',
        timestamp: new Date().toISOString(),
        error: error.message
      }]);
      return fallbackData;
    } finally {
      setIsLoading(false);
    }
  };

  // Page 2: Blueprint (audience/channels/budget allocation) - now with real agent calls
  const [blueprint, setBlueprint] = useState(null);
  const [blueprintLoading, setBlueprintLoading] = useState(false);

  const generateBlueprint = async () => {
    if (blueprint) return blueprint;
    
    setBlueprintLoading(true);
    try {
      // Call Strategy Agent for blueprint generation
      const strategyResult = await callAgent('strategy', 'generate_campaign_blueprint', {
        goal: resolvedGoal,
        budget_range: budgetRange,
        audience: audienceText,
        targeting: { country: locations.country, regions: locations.regions, demographics }
      }, {
        channels: goal === 'Sell more courses' ? ['email','facebook','retargeting'] : 
                 goal === 'Increase leads' ? ['google','linkedin','email'] : 
                 ['facebook','tiktok','email'],
        allocation: {},
        expectedRoi: 3.4,
        summary: `We'll target best-fit audiences on multiple channels, send an email sequence, and retarget visitors. Expected ROI: 3.4x.`
      });

      // Call Business Intelligence Agent for budget allocation
      const budgetResult = await callAgent('business-strategist', 'optimize_budget_allocation', {
        channels: strategyResult.channels || [],
        budget_range: budgetRange,
        goal: resolvedGoal
      }, {
        allocation: (strategyResult.channels || []).reduce((acc, ch, idx) => {
          const weights = [0.6, 0.3, 0.1];
          acc[ch] = Math.round(((budgetRange.max || 0) * (weights[idx] || 0.1)));
          return acc;
        }, {}),
        expectedRoi: 3.4
      });

      const finalBlueprint = {
        channels: strategyResult.channels || [],
        allocation: budgetResult.allocation || {},
        expectedRoi: budgetResult.expectedRoi || 3.4,
        summary: strategyResult.summary || `We'll target best-fit audiences on ${(strategyResult.channels || []).join(', ')}, send an email sequence, and retarget visitors. Budget split is ${Object.entries(budgetResult.allocation || {}).map(([k,v])=>`${k} ${v}` ).join(' / ')}. Expected ROI: ${budgetResult.expectedRoi || 3.4}x.`
      };
      
      setBlueprint(finalBlueprint);
      return finalBlueprint;
    } catch (error) {
      console.error('Blueprint generation failed:', error);
      // Fallback to mock data
      const fallbackBlueprint = {
        channels: goal === 'Sell more courses' ? ['email','facebook','retargeting'] : 
                 goal === 'Increase leads' ? ['google','linkedin','email'] : 
                 ['facebook','tiktok','email'],
        allocation: (goal === 'Sell more courses' ? ['email','facebook','retargeting'] : 
                   goal === 'Increase leads' ? ['google','linkedin','email'] : 
                   ['facebook','tiktok','email']).reduce((acc, ch, idx) => {
          const weights = [0.6, 0.3, 0.1];
          acc[ch] = Math.round(((budgetRange.max || 0) * (weights[idx] || 0.1)));
          return acc;
        }, {}),
        expectedRoi: 3.4,
        summary: `We'll target best-fit audiences on multiple channels, send an email sequence, and retarget visitors. Expected ROI: 3.4x.`
      };
      setBlueprint(fallbackBlueprint);
      return fallbackBlueprint;
    } finally {
      setBlueprintLoading(false);
    }
  };

  // Page 3: Creative variants
  const [creatives, setCreatives] = useState([]);
  const [editingCreative, setEditingCreative] = useState(null);
  const [abFactor, setAbFactor] = useState('headline'); // headline|creative|copy|cta|subject
  // Resolve goal early to avoid temporal dead zone issues
  const resolvedGoal = goal === 'Other' ? (goalOther || '').trim() : goal;
  const canProceedPage1 = resolvedGoal && budgetRange.min >= 0 && budgetRange.max >= budgetRange.min && timeframe.start;
  const recommendedAb = useMemo(() => {
    if ((resolvedGoal||'').toLowerCase().includes('awareness')) return { factor: 'creative', why: 'Visuals drive reach/recall in awareness campaigns.' };
    if ((resolvedGoal||'').toLowerCase().includes('lead')) return { factor: 'headline', why: 'Headline clarity impacts conversion intent for lead gen.' };
    if ((resolvedGoal||'').toLowerCase().includes('sales')) return { factor: 'cta', why: 'Stronger CTAs typically lift purchases in sales campaigns.' };
    return { factor: 'headline', why: 'Defaulting to headline which usually has broad impact.' };
  }, [resolvedGoal]);

  const generateCreatives = async () => {
    if (creatives.length > 0) return;
    
    setIsLoading(true);
    try {
      // Call Brand Strategist Agent for creative generation
      const brandResult = await callAgent('brand-strategist', 'generate_creative_variants', {
        channels: blueprint?.channels || [],
        goal: resolvedGoal,
        audience: audienceText,
        brand_voice: 'professional' // Could be from onboarding data
      }, {
        variants: (blueprint?.channels || []).flatMap((ch) => ([
          { id: `${ch}_A`, channel: ch, type: ch==='email'?'email':'ad',
            headline: 'Unlock your potential today',
            primaryText: 'Join thousands improving with our program.',
            cta: 'Get Started',
            subject: 'Your next win starts here',
            asset: '/api/placeholder/360/200' },
          { id: `${ch}_B`, channel: ch, type: ch==='email'?'email':'ad',
            headline: 'Level up in weeks, not months',
            primaryText: 'Proven paths, real outcomes. See how.',
            cta: 'See Plans',
            subject: 'A faster path to results',
            asset: '/api/placeholder/360/200' }
        ]))
      });

      // Call Image Generation Agent for visual assets
      const imageResult = await callAgent('image-generation', 'generate_campaign_assets', {
        channels: blueprint?.channels || [],
        goal: resolvedGoal,
        style: 'professional'
      }, {
        assets: (blueprint?.channels || []).map(ch => ({
          channel: ch,
          asset: '/api/placeholder/360/200'
        }))
      });

      const finalCreatives = brandResult.variants || (blueprint?.channels || []).flatMap((ch) => ([
        { id: `${ch}_A`, channel: ch, type: ch==='email'?'email':'ad',
          headline: 'Unlock your potential today',
          primaryText: 'Join thousands improving with our program.',
          cta: 'Get Started',
          subject: 'Your next win starts here',
          asset: '/api/placeholder/360/200' },
        { id: `${ch}_B`, channel: ch, type: ch==='email'?'email':'ad',
          headline: 'Level up in weeks, not months',
          primaryText: 'Proven paths, real outcomes. See how.',
          cta: 'See Plans',
          subject: 'A faster path to results',
          asset: '/api/placeholder/360/200' }
      ]));
      
      setCreatives(finalCreatives);
    } catch (error) {
      console.error('Creative generation failed:', error);
      // Fallback to mock data
      const fallbackCreatives = (blueprint?.channels || []).flatMap((ch) => ([
        { id: `${ch}_A`, channel: ch, type: ch==='email'?'email':'ad',
          headline: 'Unlock your potential today',
          primaryText: 'Join thousands improving with our program.',
          cta: 'Get Started',
          subject: 'Your next win starts here',
          asset: '/api/placeholder/360/200' },
        { id: `${ch}_B`, channel: ch, type: ch==='email'?'email':'ad',
          headline: 'Level up in weeks, not months',
          primaryText: 'Proven paths, real outcomes. See how.',
          cta: 'See Plans',
          subject: 'A faster path to results',
          asset: '/api/placeholder/360/200' }
      ]));
      setCreatives(fallbackCreatives);
    } finally {
      setIsLoading(false);
    }
  };

  const openEditCreative = (creative) => setEditingCreative({ ...creative });
  const applyEditCreative = () => {
    setCreatives(prev => prev.map(c => c.id === editingCreative.id ? editingCreative : c));
    setEditingCreative(null);
  };
  const regenerateAlternative = (field, constraintNote) => {
    if (!editingCreative) return;
    const next = { ...editingCreative };
    if (field === 'headline') next.headline = 'New concise headline (AI)';
    if (field === 'primaryText') next.primaryText = 'Refined body copy focusing on benefits.';
    if (field === 'cta') next.cta = 'Try Free';
    if (field === 'subject') next.subject = 'Quick win inside';
    setEditingCreative(next);
  };

  // Page 4: Optimization checks - now with real agent calls
  const [optimization, setOptimization] = useState(null);
  const [optimizationLoading, setOptimizationLoading] = useState(false);

  const generateOptimization = async () => {
    if (optimization) return optimization;
    
    setOptimizationLoading(true);
    try {
      // Call Content Strategy Agent for predictions
      const contentResult = await callAgent('content-strategy', 'predict_campaign_performance', {
        goal: resolvedGoal,
        channels: blueprint?.channels || [],
        budget_range: budgetRange,
        audience: audienceText,
        creatives: creatives
      }, {
        predicted: { ctr: '+18%', roas: '+27%', conversions: '+22%' },
        scenarios: [
          { label: '+20% budget', effect: '+35% conversions' },
          { label: 'Front-load spend', effect: '+12% CTR in first week' }
        ],
        suggestions: [
          'Tighten audience for higher CTR',
          'Keep 2 creative variants live to prevent fatigue'
        ]
      });

      setOptimization(contentResult);
      return contentResult;
    } catch (error) {
      console.error('Optimization generation failed:', error);
      // Fallback to mock data
      const fallbackOptimization = {
        predicted: { ctr: '+18%', roas: '+27%', conversions: '+22%' },
        scenarios: [
          { label: '+20% budget', effect: '+35% conversions' },
          { label: 'Front-load spend', effect: '+12% CTR in first week' }
        ],
        suggestions: [
          'Tighten audience for higher CTR',
          'Keep 2 creative variants live to prevent fatigue'
        ]
      };
      setOptimization(fallbackOptimization);
      return fallbackOptimization;
    } finally {
      setOptimizationLoading(false);
    }
  };

  // Page 5: Judge output - now with real agent calls
  const [judge, setJudge] = useState(null);
  const [judgeLoading, setJudgeLoading] = useState(false);

  const generateJudgeEvaluation = async () => {
    if (judge) return judge;
    
    setJudgeLoading(true);
    try {
      // Call Judge Agent for evaluation
      const judgeResult = await callAgent('judge', 'evaluate_campaign', {
        goal: resolvedGoal,
        channels: blueprint?.channels || [],
        creatives: creatives,
        budget_range: budgetRange,
        audience: audienceText,
        rubric: ['creative_quality', 'audience_fit', 'objective_alignment', 'financial_efficiency', 'targeting_breadth']
      }, {
        score: 83,
        rubric: [
          { label: 'Creative Quality', delta: +10 },
          { label: 'Audience Fit', delta: +8 },
          { label: 'Objective Alignment', delta: +7 },
          { label: 'Financial Efficiency', delta: +5 },
          { label: 'Targeting Breadth', delta: -5 },
        ],
        reasons: [
          'Strong multi-channel alignment',
          'Clear objective mapping',
          'Slight risk of creative fatigue in week 3'
        ]
      });

      setJudge(judgeResult);
      return judgeResult;
    } catch (error) {
      console.error('Judge evaluation failed:', error);
      // Fallback to mock data
      const fallbackJudge = {
        score: 83,
        rubric: [
          { label: 'Creative Quality', delta: +10 },
          { label: 'Audience Fit', delta: +8 },
          { label: 'Objective Alignment', delta: +7 },
          { label: 'Financial Efficiency', delta: +5 },
          { label: 'Targeting Breadth', delta: -5 },
        ],
        reasons: [
          'Strong multi-channel alignment',
          'Clear objective mapping',
          'Slight risk of creative fatigue in week 3'
        ]
      };
      setJudge(fallbackJudge);
      return fallbackJudge;
    } finally {
      setJudgeLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleLaunch = () => {
    // Produce a draft campaign payload for caller
    const payload = {
      name: `${resolvedGoal} Campaign` || 'AI Orchestrated Campaign',
      type: 'ai_orchestrated',
      objective: resolvedGoal,
      status: 'draft',
      startDate: timeframe.start || new Date().toISOString(),
      endDate: timeframe.end || null,
      pacing,
      budget_min: budgetRange.min,
      budget_max: budgetRange.max,
      audience: audienceText,
      targeting: {
        country: locations.country || null,
        regions: locations.regions || null,
        demographics,
      },
      blueprint,
      creatives,
      ab_test: {
        enabled: true,
        factor: abFactor,
        recommended: recommendedAb,
        note: 'Limit to single-factor for clean results',
      },
      optimization,
      judge,
      created_at: new Date().toISOString(),
      campaign_id: `ai_orchestrated_${Date.now()}_${Math.random().toString(36).slice(2,9)}`,
    };
    try { onCreateCampaign && onCreateCampaign(payload); } catch {}
    onClose && onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col ai-workflow-modal">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BrainCircuit className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">AI Orchestrated Campaign</h2>
              <p className="text-sm text-gray-600">Unified creation flow with agent transparency</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {step === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">🎯</span>
                    <div className="font-medium text-gray-900">Campaign Goal</div>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {goals.map(g => (
                      <label key={g} className={`p-3 border rounded-lg cursor-pointer text-sm ${goal===g?'border-blue-500 bg-blue-50':'border-gray-200 hover:bg-gray-50'}`}>
                        <input type="radio" className="mr-2" checked={goal===g} onChange={()=>setGoal(g)} /> {g}
                      </label>
                    ))}
                    {goal === 'Other' && (
                      <textarea
                        value={goalOther}
                        onChange={(e)=>setGoalOther(e.target.value)}
                        rows={2}
                        placeholder="Describe your goal in your own words..."
                        className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-3 p-4 border rounded-lg bg-white">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">💰</span>
                      <div className="font-medium text-gray-900">Budget Range</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="number" value={budgetRange.min} onChange={(e)=>setBudgetRange(r=>({...r,min:parseInt(e.target.value||0)}))} className="px-3 py-2 border border-gray-300 rounded-lg" placeholder="Min" />
                      <input type="number" value={budgetRange.max} onChange={(e)=>setBudgetRange(r=>({...r,max:parseInt(e.target.value||0)}))} className="px-3 py-2 border border-gray-300 rounded-lg" placeholder="Max" />
                    </div>
                    <div className="text-xs text-gray-600">AI suggestion: ${recommendedBudget.min}–${recommendedBudget.max} • {recommendedBudget.reason}</div>
                  </div>

                  {/* Timeframe stacked below Budget */}
                  <div className="space-y-3 p-4 border rounded-lg bg-white">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">📅</span>
                      <div className="font-medium text-gray-900">Timeframe</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="date" value={timeframe.start} onChange={(e)=>setTimeframe(t=>({...t,start:e.target.value}))} className="px-3 py-2 border border-gray-300 rounded-lg" />
                      <input type="date" value={timeframe.end} onChange={(e)=>setTimeframe(t=>({...t,end:e.target.value}))} className="px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                  </div>

                  {/* Pacing stacked below Timeframe */}
                  <div className="space-y-2 p-4 border rounded-lg bg-white">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">⏱️</span>
                      <div className="font-medium text-gray-900">Pacing</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className={`px-3 py-2 border rounded-lg cursor-pointer text-sm ${pacing==='even'?'border-blue-500 bg-blue-50':'border-gray-200'}`}>
                        <input type="radio" className="mr-2" checked={pacing==='even'} onChange={()=>setPacing('even')} /> Even pacing
                      </label>
                      <label className={`px-3 py-2 border rounded-lg cursor-pointer text-sm ${pacing==='front'?'border-blue-500 bg-blue-50':'border-gray-200'}`}>
                        <input type="radio" className="mr-2" checked={pacing==='front'} onChange={()=>setPacing('front')} /> Spend heavier early
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Audience and Location - styled like CreateCampaignModal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">Target Audience</label>
                    <button 
                      type="button" 
                      onClick={()=>setIsRefiningAudience(v=>!v)} 
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                    >
                      {isRefiningAudience ? 'Use Default' : 'Refine Audience'}
                    </button>
                  </div>
                  {!isRefiningAudience ? (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="text-xs text-gray-600">Using onboarding data</div>
                      <div className="text-sm text-gray-800 mt-1 min-h-[44px] whitespace-pre-line">{audienceText || 'No audience data found'}</div>
                    </div>
                  ) : (
                    <textarea 
                      value={audienceText}
                      onChange={(e)=>setAudienceText(e.target.value)}
                      rows={3}
                      placeholder="e.g., Young professionals 25-35 interested in fitness..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  )}
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Primary Country</label>
                    <input 
                      type="text" 
                      value={locations.country}
                      onChange={(e)=>setLocations(p=>({...p,country:e.target.value}))}
                      placeholder="e.g., United States"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Regions / Cities (optional)</label>
                    <input 
                      type="text" 
                      value={locations.regions}
                      onChange={(e)=>setLocations(p=>({...p,regions:e.target.value}))}
                      placeholder="e.g., California; New York City"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Age Min</label>
                      <input type="number" value={demographics.ageMin} onChange={(e)=>setDemographics(p=>({...p,ageMin:e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Age Max</label>
                      <input type="number" value={demographics.ageMax} onChange={(e)=>setDemographics(p=>({...p,ageMax:e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Genders</label>
                      <div className="flex items-center space-x-3 text-sm text-gray-700">
                        <label className="inline-flex items-center space-x-1"><input type="checkbox" checked={demographics.genders.male} onChange={(e)=>setDemographics(p=>({...p,genders:{...p.genders,male:e.target.checked}}))} /><span>Male</span></label>
                        <label className="inline-flex items-center space-x-1"><input type="checkbox" checked={demographics.genders.female} onChange={(e)=>setDemographics(p=>({...p,genders:{...p.genders,female:e.target.checked}}))} /><span>Female</span></label>
                        <label className="inline-flex items-center space-x-1"><input type="checkbox" checked={demographics.genders.other} onChange={(e)=>setDemographics(p=>({...p,genders:{...p.genders,other:e.target.checked}}))} /><span>Other</span></label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                <div className="font-medium text-gray-900">AI-Generated Campaign Blueprint</div>
              </div>
              <div className="text-sm text-gray-700">Audience: derived from onboarding • Segments prioritized by Customer Intelligence Agent. Channels selected by Business Intelligence Agent based on goal.</div>
              {blueprintLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Generating blueprint...</span>
                </div>
              ) : blueprint ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded">
                      <div className="text-xs text-gray-500 mb-1">Channels</div>
                      <div className="font-medium">{(blueprint.channels||[]).join(', ')}</div>
                    </div>
                    <div className="p-4 border rounded">
                      <div className="text-xs text-gray-500 mb-1">Budget Allocation</div>
                      <div className="space-y-1 text-sm">
                        {Object.entries(blueprint.allocation||{}).map(([k,v])=> (
                          <div key={k} className="flex items-center justify-between"><span className="capitalize">{k}</span><span>${v}/day</span></div>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 border rounded">
                      <div className="text-xs text-gray-500 mb-1">Expected ROI</div>
                      <div className="font-semibold text-green-700">{blueprint.expectedRoi}x ROAS</div>
                    </div>
                  </div>
                  <div className="p-4 border rounded bg-gray-50 text-sm">{blueprint.summary}</div>
                </>
              ) : (
                <div className="text-center p-8 text-gray-500">Blueprint will be generated when you proceed to this step.</div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <span className="text-lg">💡</span>
                <div className="font-medium text-gray-900">AI-Created Content & Variants</div>
              </div>
              <div className="text-sm text-gray-700">Creative variants prepared per channel with brand voice alignment. Click a card to edit.</div>
              <div className="flex items-center space-x-3">
                <button onClick={generateCreatives} className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm">Generate Variants</button>
                <div className="text-sm text-gray-700 flex items-center space-x-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">A/B</span>
                  <span>Test factor:</span>
                  <select value={abFactor} onChange={(e)=>setAbFactor(e.target.value)} className="px-2 py-1 border rounded text-sm">
                    <option value="headline">Headline</option>
                    <option value="creative">Creative (image/video)</option>
                    <option value="copy">Primary copy</option>
                    <option value="cta">CTA</option>
                    <option value="subject">Subject (email)</option>
                  </select>
                  <span className="text-xs text-gray-500">Recommended: {recommendedAb.factor} — {recommendedAb.why}</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {creatives.map(c => (
                  <button key={c.id} onClick={()=>openEditCreative(c)} className="p-3 border rounded-lg text-left text-sm hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium capitalize">{c.channel} {c.type}</div>
                      <span className="px-2 py-0.5 rounded-full text-xs bg-purple-50 text-purple-700 border border-purple-200">A/B</span>
                    </div>
                    <div className="mb-2">
                      <img src={c.asset} alt="creative" className="w-full h-28 object-cover rounded" />
                    </div>
                    <div className="text-gray-900 font-medium">{c.headline}</div>
                    <div className="text-xs text-gray-600 line-clamp-2">{c.primaryText}</div>
                    <div className="mt-1 text-xs text-gray-500">CTA: {c.cta}{c.type==='email' ? ` • Subject: ${c.subject}` : ''}</div>
                  </button>
                ))}
              </div>

              {/* Edit Creative Modal */}
              {editingCreative && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                      <div className="flex items-center space-x-2"><Edit3 className="w-4 h-4 text-blue-600" /><div className="font-semibold text-gray-900">Edit Creative</div></div>
                      <button onClick={()=>setEditingCreative(null)} className="p-2 text-gray-400 hover:text-gray-600 rounded"><X className="w-5 h-5" /></button>
                    </div>
                    <div className="p-4 space-y-3 text-sm">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Headline</label>
                        <input type="text" value={editingCreative.headline} onChange={(e)=>setEditingCreative(p=>({...p,headline:e.target.value}))} className="w-full px-3 py-2 border rounded" />
                        <button onClick={()=>regenerateAlternative('headline','shorten by 15%')} className="mt-1 text-xs text-blue-600">Regenerate alternative (keep tone)</button>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Primary Copy</label>
                        <textarea value={editingCreative.primaryText} onChange={(e)=>setEditingCreative(p=>({...p,primaryText:e.target.value}))} rows={3} className="w-full px-3 py-2 border rounded" />
                        <button onClick={()=>regenerateAlternative('primaryText','more benefits focus')} className="mt-1 text-xs text-blue-600">Regenerate alternative (benefit-led)</button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">CTA</label>
                          <input type="text" value={editingCreative.cta} onChange={(e)=>setEditingCreative(p=>({...p,cta:e.target.value}))} className="w-full px-3 py-2 border rounded" />
                        </div>
                        {editingCreative.type==='email' && (
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Subject</label>
                            <input type="text" value={editingCreative.subject} onChange={(e)=>setEditingCreative(p=>({...p,subject:e.target.value}))} className="w-full px-3 py-2 border rounded" />
                          </div>
                        )}
                      </div>
                      <div className="pt-2 border-t text-xs text-gray-600">Suggestions: Based on brand and objective, tighten headline and keep one benefit per sentence.</div>
                    </div>
                    <div className="flex items-center justify-end p-4 border-t border-gray-200 bg-gray-50 space-x-2">
                      <button onClick={()=>setEditingCreative(null)} className="px-4 py-2 text-gray-600">Cancel</button>
                      <button onClick={applyEditCreative} className="px-5 py-2 bg-blue-600 text-white rounded">Apply</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-orange-600" />
                <div className="font-medium text-gray-900">AI Validation & Optimization</div>
              </div>
              {optimizationLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Running optimization analysis...</span>
                </div>
              ) : optimization ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="p-4 border rounded">
                    <div className="text-xs text-gray-500 mb-1">Predicted Uplift</div>
                    <div>CTR: <span className="text-green-700 font-medium">{optimization.predicted.ctr}</span></div>
                    <div>ROAS: <span className="text-green-700 font-medium">{optimization.predicted.roas}</span></div>
                    <div>Conversions: <span className="text-green-700 font-medium">{optimization.predicted.conversions}</span></div>
                  </div>
                  <div className="p-4 border rounded">
                    <div className="text-xs text-gray-500 mb-1">Scenario Testing</div>
                    {optimization.scenarios.map((s,i)=> (
                      <div key={i} className="flex items-center justify-between"><span>{s.label}</span><span className="text-blue-700">{s.effect}</span></div>
                    ))}
                  </div>
                  <div className="p-4 border rounded">
                    <div className="text-xs text-gray-500 mb-1">Improvement Suggestions</div>
                    <ul className="list-disc pl-5 space-y-1">
                      {optimization.suggestions.map((t,i)=> (<li key={i}>{t}</li>))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 text-gray-500">Optimization analysis will be generated when you proceed to this step.</div>
              )}
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-green-600" />
                <div className="font-medium text-gray-900">Judge Agent & Confidence</div>
              </div>
              {judgeLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Running judge evaluation...</span>
                </div>
              ) : judge ? (
                <>
                  <div className="p-4 border rounded bg-green-50">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-700" />
                      <div className="text-gray-900 font-medium">AI Confidence Score: {judge.score}/100</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded">
                      <div className="text-xs text-gray-500 mb-1">Rubric Evaluation</div>
                      <ul className="space-y-1 text-sm">
                        {judge.rubric.map((r,i)=> (<li key={i} className="flex items-center justify-between"><span>{r.label}</span><span className={`${r.delta>=0?'text-green-700':'text-red-700'}`}>{r.delta>=0?'+':''}{r.delta}</span></li>))}
                      </ul>
                    </div>
                    <div className="p-4 border rounded">
                      <div className="text-xs text-gray-500 mb-1">Transparency Panel</div>
                      <ul className="list-disc pl-5 text-sm space-y-1">
                        {judge.reasons.map((rsn,i)=> (<li key={i}>{rsn}</li>))}
                      </ul>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center p-8 text-gray-500">Judge evaluation will be generated when you proceed to this step.</div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {step===1 && 'Step 1 of 5: Goal, Budget & Timeframe'}
            {step===2 && 'Step 2 of 5: Blueprint'}
            {step===3 && 'Step 3 of 5: Creatives'}
            {step===4 && 'Step 4 of 5: Validation'}
            {step===5 && 'Step 5 of 5: Judge & Confidence'}
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
            {step>1 && <button onClick={()=>handleStepChange(step-1)} className="px-4 py-2 border rounded">Back</button>}
            {step<5 && (
              <button onClick={async ()=>{
                if (step === 1 && canProceedPage1) {
                  handleStepChange(2);
                  await generateBlueprint();
                } else if (step === 2) {
                  handleStepChange(3);
                  await generateCreatives();
                } else if (step === 3) {
                  handleStepChange(4);
                  await generateOptimization();
                } else if (step === 4) {
                  handleStepChange(5);
                  await generateJudgeEvaluation();
                }
              }} disabled={step===1 && !canProceedPage1 || isLoading} className="px-5 py-2 bg-blue-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? 'Loading...' : 'Next'}
              </button>
            )}
            {step===5 && (
              <button onClick={handleLaunch} className="px-6 py-2 bg-green-600 text-white rounded flex items-center">
                <Zap className="w-4 h-4 mr-2" /> Launch
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIWorkflowCreateCampaignModal;

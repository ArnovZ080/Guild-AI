import React, { useEffect, useMemo, useState } from 'react';
import { X, BrainCircuit, Target, DollarSign, Calendar, Zap, CheckCircle, Lightbulb, BarChart3, ShieldCheck } from 'lucide-react';

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

  // Page 2: Blueprint (audience/channels/budget allocation)
  const blueprint = useMemo(() => {
    // Mock agent collaboration output
    const channels = goal === 'Sell more courses' ? ['email','facebook','retargeting'] : goal === 'Increase leads' ? ['google','linkedin','email'] : ['facebook','tiktok','email'];
    const allocation = channels.reduce((acc, ch, idx) => {
      const weights = [0.6, 0.3, 0.1];
      acc[ch] = Math.round(((budgetRange.max || 0) * (weights[idx] || 0.1)));
      return acc;
    }, {});
    const expectedRoi = 3.4; // stubbed expected ROAS
    const summary = `We’ll target best-fit audiences on ${channels.join(', ')}, send an email sequence, and retarget visitors. Budget split is ${Object.entries(allocation).map(([k,v])=>`${k} ${v}` ).join(' / ')}. Expected ROI: ${expectedRoi}x.`;
    return { channels, allocation, expectedRoi, summary };
  }, [goal, budgetRange]);

  // Page 3: Creative variants
  const [creatives, setCreatives] = useState([]);
  const generateCreatives = () => {
    // Mock creation of variants per channel
    const list = (blueprint.channels || []).flatMap((ch) => ([
      { id: `${ch}_A`, channel: ch, type: ch==='email'?'email':'ad', headline: 'Variant A headline', asset: 'image_A.png' },
      { id: `${ch}_B`, channel: ch, type: ch==='email'?'email':'ad', headline: 'Variant B headline', asset: 'image_B.png' }
    ]));
    setCreatives(list);
  };

  // Page 4: Optimization checks
  const optimization = useMemo(() => {
    return {
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
  }, []);

  // Page 5: Judge output
  const judge = useMemo(() => {
    return {
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
  }, []);

  if (!isOpen) return null;

  const resolvedGoal = goal === 'Other' ? (goalOther || '').trim() : goal;
  const canProceedPage1 = resolvedGoal && budgetRange.min >= 0 && budgetRange.max >= budgetRange.min && timeframe.start;

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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
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
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <Lightbulb className="w-5 h-5 text-yellow-600" />
                <div className="font-medium text-gray-900">AI-Created Content & Variants</div>
              </div>
              <div className="text-sm text-gray-700">Creative variants prepared per channel with brand voice alignment.</div>
              <div>
                <button onClick={generateCreatives} className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm">Generate Variants</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {creatives.map(c => (
                  <div key={c.id} className="p-3 border rounded text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-medium capitalize">{c.channel} {c.type}</div>
                      <span className="px-2 py-0.5 rounded-full text-xs bg-purple-50 text-purple-700 border border-purple-200">A/B</span>
                    </div>
                    <div className="text-gray-700">{c.headline}</div>
                    <div className="text-xs text-gray-500">Asset: {c.asset}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-orange-600" />
                <div className="font-medium text-gray-900">AI Validation & Optimization</div>
              </div>
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
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-green-600" />
                <div className="font-medium text-gray-900">Judge Agent & Confidence</div>
              </div>
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
            {step>1 && <button onClick={()=>setStep(s=>s-1)} className="px-4 py-2 border rounded">Back</button>}
            {step<5 && (
              <button onClick={()=> step===1 ? (canProceedPage1 && setStep(2)) : setStep(s=>s+1)} disabled={step===1 && !canProceedPage1} className="px-5 py-2 bg-blue-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed">
                Next
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

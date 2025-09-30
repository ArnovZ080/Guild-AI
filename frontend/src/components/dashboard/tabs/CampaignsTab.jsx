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
  Hash,
  Info
} from 'lucide-react';
import CreateCampaignModal from '../modals/CreateCampaignModal';
import AIWorkflowCreateCampaignModal from '../modals/AIWorkflowCreateCampaignModal';
import CampaignAssetsModal from '../modals/CampaignAssetsModal';
// removed AIOptimizeCampaignModal (redundant)
import EmailTab from './EmailTab';

// Inline sentiment block component
const SentimentBlock = ({ comments = [] }) => {
  const [result, setResult] = React.useState(null);
  React.useEffect(()=>{
    let mounted = true;
    (async()=>{
      try {
        const r = await analyzeSentiment(comments.map(c=> (typeof c==='string'? c : (c?.text||''))));
        if (mounted) setResult(r);
      } catch {}
    })();
    return ()=>{ mounted=false; };
  }, [comments]);
  if (!result) return <div className="text-xs text-gray-500">Analyzing sentiment...</div>;
  const { average, distribution } = result;
  const pct = (x)=> Math.round((x/(comments.length||1))*100);
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2 text-sm">
        <span className="text-gray-600">Average score:</span>
        <span className={`font-semibold ${average>0.66?'text-green-600':average<0.33?'text-red-600':'text-gray-800'}`}>{average.toFixed(2)}</span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="p-2 bg-green-50 rounded border">
          <div className="font-semibold text-green-700">Positive</div>
          <div className="text-gray-700">{distribution.positive} ({pct(distribution.positive)}%)</div>
        </div>
        <div className="p-2 bg-gray-50 rounded border">
          <div className="font-semibold text-gray-700">Neutral</div>
          <div className="text-gray-700">{distribution.neutral} ({pct(distribution.neutral)}%)</div>
        </div>
        <div className="p-2 bg-red-50 rounded border">
          <div className="font-semibold text-red-700">Negative</div>
          <div className="text-gray-700">{distribution.negative} ({pct(distribution.negative)}%)</div>
        </div>
      </div>
    </div>
  );
};
import { getBenchmarks, getEmailBenchmarks, getCompetitiveBenchmarks, loadCampaignAssets, loadAnomalyThresholds, saveAnomalyThresholds, loadABResults, saveABResults, computeABWinner, analyzeSentiment, loadCampaignActivity, logCampaignActivity, loadAttribution, fetchLearningRecommendations } from '../../../services/campaignInsightsApi';

const CampaignsTab = ({ campaigns = [], onCampaignAction, onCreateCampaign, onRefreshCampaigns }) => {
  const [selectedView, setSelectedView] = useState('overview');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  // removed showAIOptimizeModal and showAICreateModal (redundant)
  const [showAIWorkflowModal, setShowAIWorkflowModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [openMenuForId, setOpenMenuForId] = useState(null);
  const [settingsFields, setSettingsFields] = useState(null);
  const [showAssetsModal, setShowAssetsModal] = useState(false);
  const [assetsPayload, setAssetsPayload] = useState(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filterPlatform2, setFilterPlatform2] = useState('all');
  const [filterBudgetRange, setFilterBudgetRange] = useState([0, 100000]);
  const [filterDurationRange, setFilterDurationRange] = useState([0, 365]);
  const [sortByPerformance, setSortByPerformance] = useState('none'); // none|best|worst
  const [attribOpenForId, setAttribOpenForId] = useState(null);
  const [showCampaignDetails, setShowCampaignDetails] = useState(false);
  const [showGeneralInsights, setShowGeneralInsights] = useState(true);
  const [showAnomalies, setShowAnomalies] = useState(() => {
    try {
      const raw = localStorage.getItem('guild_campaign_anomalies_toggle');
      return raw ? JSON.parse(raw) : true;
    } catch { return true; }
  });
  const [benchmarks, setBenchmarks] = useState(null);
  const [emailBenchmarks, setEmailBenchmarks] = useState(null);
  const [competitive, setCompetitive] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRefreshingCampaigns, setIsRefreshingCampaigns] = useState(false);
  const [showThresholdsModal, setShowThresholdsModal] = useState(false);
  const [thresholdSavedAt, setThresholdSavedAt] = useState(null);
  const [dismissedAnomalies, setDismissedAnomalies] = useState(() => {
    try {
      const raw = localStorage.getItem('guild_campaign_anomaly_dismissals');
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  });
  const [learningRecs, setLearningRecs] = useState([]);
  const [activityOpenForId, setActivityOpenForId] = useState(null);
  const [activityByCampaign, setActivityByCampaign] = useState({});
  const [nextBestByCampaign, setNextBestByCampaign] = useState({});
  const [microByCampaign, setMicroByCampaign] = useState({});
  const [expandedNextBestForId, setExpandedNextBestForId] = useState(null);
  const [expandedMicroForId, setExpandedMicroForId] = useState(null);
  const [activityFilter, setActivityFilter] = useState('all'); // all|errors|budget
  const [expandedActivityIndexByCampaign, setExpandedActivityIndexByCampaign] = useState({});

  // Attribution summary as a component to avoid using hooks in plain helpers
  const AttributionSummaryPanel = ({ campaign }) => {
    const cid = campaign?.campaign_id || campaign?.id;
    const [serverTouches, setServerTouches] = React.useState([]);
    React.useEffect(()=>{
      let mounted = true;
      (async()=>{
        try {
          if (!cid) return;
          const res = await loadAttribution(cid);
          if (mounted && res && Array.isArray(res.touches)) setServerTouches(res.touches);
        } catch {}
      })();
      return ()=>{ mounted=false; };
    }, [cid]);

    const touches = (serverTouches && serverTouches.length ? serverTouches : (campaign?.mta_touches || []));
    const linear = calcLinearAttribution(touches);
    const timeDecay = calcTimeDecayAttribution(touches);
    const position = calcPositionBasedAttribution(touches);
    const sumCredits = (map) => Object.values(map).reduce((s,v)=>s+v,0);
    const summary = {
      linear: { credits: linear, total: sumCredits(linear) },
      timeDecay: { credits: timeDecay, total: sumCredits(timeDecay) },
      position: { credits: position, total: sumCredits(position) }
    };

    const channels = [campaign.platform]?.filter(Boolean)[0] ? [campaign.platform] : ['facebook','instagram','google','tiktok','linkedin','twitter'];
    return (
      <div className="space-y-3 text-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {channels.map(ch => (
            <div key={ch} className="bg-white border border-purple-100 rounded p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="capitalize text-gray-800">{ch}</span>
                <span className="text-xs text-gray-500">by channel</span>
              </div>
              <div className="text-xs text-gray-600">First-touch: {campaign?.attribution?.[ch]?.first || 0}</div>
              <div className="text-xs text-gray-600">Last-touch: {campaign?.attribution?.[ch]?.last || 0}</div>
              <div className="mt-1 text-xs text-gray-700">
                <div className="flex items-center justify-between"><span>Linear</span><span>{(summary.linear.credits[ch]||0).toFixed(2)}</span></div>
                <div className="flex items-center justify-between"><span>Time-decay</span><span>{(summary.timeDecay.credits[ch]||0).toFixed(2)}</span></div>
                <div className="flex items-center justify-between"><span>Position</span><span>{(summary.position.credits[ch]||0).toFixed(2)}</span></div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white border border-purple-100 rounded p-3">
          <div className="font-medium text-gray-900 mb-1">Totals</div>
          <div className="grid grid-cols-3 gap-2 text-xs text-gray-700">
            <div className="p-2 bg-purple-50 rounded border">
              <div className="font-semibold">{summary.linear.total.toFixed(2)}</div>
              <div>Linear total</div>
            </div>
            <div className="p-2 bg-purple-50 rounded border">
              <div className="font-semibold">{summary.timeDecay.total.toFixed(2)}</div>
              <div>Time-decay total</div>
            </div>
            <div className="p-2 bg-purple-50 rounded border">
              <div className="font-semibold">{summary.position.total.toFixed(2)}</div>
              <div>Position-based total</div>
            </div>
          </div>
        </div>
        <div className="text-xs text-gray-500">Note: Totals represent relative credit across touches for a typical converting journey. Connect telemetry to replace sample touches.</div>
      </div>
    );
  };
  const [abResults, setAbResults] = useState({}); // cache server-fetched A/B results by campaignId

  // Persist anomaly toggle for reliability across renders/navigation
  useEffect(() => {
    try { localStorage.setItem('guild_campaign_anomalies_toggle', JSON.stringify(!!showAnomalies)); } catch {}
  }, [showAnomalies]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [b, eb] = await Promise.all([
          getBenchmarks().catch(() => null),
          getEmailBenchmarks().catch(() => null)
        ]);
        if (!mounted) return;
        const persisted = loadAnomalyThresholds();
        setBenchmarks(persisted?.ads || b || { ctr_min: 1.0, roas_min: 2.0, cpa_max: 50 });
        setEmailBenchmarks(persisted?.email || eb || { delivery_min: 95, open_rate_min: 20, click_rate_min: 2, unsubscribe_max: 0.5, bounce_max: 1.0 });
      } catch {}
    })();
    return () => { mounted = false; };
  }, []);
  const toggleActivity = async (cid) => {
    if (!cid) return;
    const open = activityOpenForId === cid ? null : cid;
    setActivityOpenForId(open);
    if (open && !activityByCampaign[cid]) {
      try {
        const items = await loadCampaignActivity(cid);
        setActivityByCampaign(prev => ({ ...prev, [cid]: items || [] }));
      } catch {}
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const cb = await getCompetitiveBenchmarks().catch(()=>null);
        if (!mounted) return;
        setCompetitive(cb);
      } catch {}
    })();
    return () => { mounted = false; };
  }, []);

  // Fetch learning recommendations for transparency (campaign-agnostic summary)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetchLearningRecommendations().catch(()=>null);
        if (!mounted) return;
        setLearningRecs(res?.recommendations || []);
      } catch {}
    })();
    return () => { mounted = false; };
  }, []);

  // Prefetch A/B results for campaigns that have A/B enabled
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = (campaigns || []).filter(c => c?.ab_test?.enabled);
        for (const c of list) {
          const cid = c.campaign_id || c.id;
          if (!cid) continue;
          if (abResults[cid]) continue;
          try {
            const res = await loadABResults(cid);
            if (!mounted) return;
            if (res && Object.keys(res).length) {
              setAbResults(prev => ({ ...prev, [cid]: res }));
            }
          } catch {}
        }
      } catch {}
    })();
    return () => { mounted = false; };
  }, [campaigns]);

  const handleRefreshInsights = async () => {
    try {
      setIsRefreshing(true);
      const [b, eb, cb] = await Promise.all([
        getBenchmarks().catch(()=>null),
        getEmailBenchmarks().catch(()=>null),
        getCompetitiveBenchmarks().catch(()=>null)
      ]);
      const persisted = loadAnomalyThresholds();
      setBenchmarks(persisted?.ads || b || benchmarks);
      setEmailBenchmarks(persisted?.email || eb || emailBenchmarks);
      if (cb) setCompetitive(cb);
    } finally {
      setTimeout(()=>setIsRefreshing(false), 300);
    }
  };

  const detectAnomalies = (campaign) => {
    const reasons = [];
    if (!campaign) return reasons;
    const b = benchmarks || { ctr_min: 1.0, roas_min: 2.0, cpa_max: 50 };
    const eb = emailBenchmarks || { delivery_min: 95, open_rate_min: 20, click_rate_min: 2, unsubscribe_max: 0.5, bounce_max: 1.0 };

    const isEmail = (campaign.platform || '').toLowerCase() === 'email';
    const ctr = (campaign?.impressions || 0) > 0 ? (campaign?.clicks || 0) / (campaign?.impressions || 0) * 100 : (campaign?.ctr ?? null);
    if (ctr != null && ctr < b.ctr_min) reasons.push(`CTR ${ctr.toFixed ? ctr.toFixed(2) : ctr}% is below benchmark ${b.ctr_min}%`);
    if (campaign?.roas != null && campaign.roas < b.roas_min) reasons.push(`ROAS ${campaign.roas}x is below benchmark ${b.roas_min}x`);
    if (campaign?.cpa != null && campaign.cpa > b.cpa_max) reasons.push(`CPA $${campaign.cpa} exceeds threshold $${b.cpa_max}`);

    if (isEmail) {
      if (campaign?.delivery_rate != null && campaign.delivery_rate < eb.delivery_min) reasons.push(`Delivery ${campaign.delivery_rate}% below ${eb.delivery_min}%`);
      if (campaign?.open_rate != null && campaign.open_rate < eb.open_rate_min) reasons.push(`Open rate ${campaign.open_rate}% below ${eb.open_rate_min}%`);
      if (campaign?.email_click_rate != null && campaign.email_click_rate < eb.click_rate_min) reasons.push(`Click rate ${campaign.email_click_rate}% below ${eb.click_rate_min}%`);
      if (campaign?.unsubscribe_rate != null && campaign.unsubscribe_rate > eb.unsubscribe_max) reasons.push(`Unsubscribe ${campaign.unsubscribe_rate}% above ${eb.unsubscribe_max}%`);
      if (campaign?.bounce_rate != null && campaign.bounce_rate > eb.bounce_max) reasons.push(`Bounce ${campaign.bounce_rate}% above ${eb.bounce_max}%`);
    }
    return reasons;
  };

  // --- Multi-touch attribution calculators (client-side) ---
  const calcLinearAttribution = (touches = []) => {
    if (!Array.isArray(touches) || touches.length === 0) return {};
    const credit = 1 / touches.length;
    return touches.reduce((acc, ch) => { acc[ch] = (acc[ch]||0) + credit; return acc; }, {});
  };

  const calcTimeDecayAttribution = (touches = []) => {
    if (!Array.isArray(touches) || touches.length === 0) return {};
    // More recent touches get higher weight. Use geometric decay.
    const decay = 0.5; // 50% decay per step back
    const weights = touches.map((_, i) => Math.pow(decay, touches.length - 1 - i));
    const sum = weights.reduce((s,v)=>s+v,0) || 1;
    return touches.reduce((acc, ch, i) => { acc[ch] = (acc[ch]||0) + (weights[i]/sum); return acc; }, {});
  };

  const calcPositionBasedAttribution = (touches = []) => {
    if (!Array.isArray(touches) || touches.length === 0) return {};
    const firstLast = Math.min(0.8, 0.4 * Math.min(2, touches.length)); // up to 40% to first and last
    const middleCredit = 1 - (touches.length >= 2 ? firstLast*2 : firstLast);
    const result = {};
    if (touches.length === 1) {
      result[touches[0]] = 1;
      return result;
    }
    const first = touches[0];
    const last = touches[touches.length-1];
    result[first] = (result[first]||0) + firstLast;
    result[last] = (result[last]||0) + firstLast;
    const middles = touches.slice(1, -1);
    if (middles.length > 0) {
      const each = middleCredit / middles.length;
      middles.forEach(ch => { result[ch] = (result[ch]||0) + each; });
    }
    return result;
  };

  const buildAttributionSummary = (campaign) => {
    // Fetch server-provided touches if available (fallback to campaign embedded)
    const cid = campaign?.campaign_id || campaign?.id;
    const [serverTouches, setServerTouches] = React.useState(null);
    React.useEffect(()=>{
      let mounted = true;
      (async()=>{
        if (!cid) return;
        try {
          const res = await loadAttribution(cid);
          if (mounted && res && Array.isArray(res.touches)) setServerTouches(res.touches);
        } catch {}
      })();
      return ()=>{ mounted=false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cid]);

    const touches = (serverTouches && serverTouches.length ? serverTouches : (campaign?.mta_touches || []));
    const linear = calcLinearAttribution(touches);
    const timeDecay = calcTimeDecayAttribution(touches);
    const position = calcPositionBasedAttribution(touches);
    const sumCredits = (map) => Object.values(map).reduce((s,v)=>s+v,0);
    return {
      linear: { credits: linear, total: sumCredits(linear) },
      timeDecay: { credits: timeDecay, total: sumCredits(timeDecay) },
      position: { credits: position, total: sumCredits(position) }
    };
  };

  // Log example activity when optimizing (transparency)
  const logOptimize = (campaign) => {
    const cid = campaign?.campaign_id || campaign?.id;
    if (!cid) return;
    logCampaignActivity(cid, {
      actor: 'Enhanced Campaign Agent',
      action: 'optimize_campaign',
      reason: 'Reallocated budget to high-ROAS sets; paused underperformers'
    });
  };

  const isAnomalyDismissed = (campaignId) => {
    if (!campaignId) return false;
    const entry = dismissedAnomalies[campaignId];
    if (!entry) return false;
    const now = Date.now();
    return now < entry.expiresAt;
  };

  const dismissAnomaliesFor = (campaignId) => {
    if (!campaignId) return;
    const next = { ...dismissedAnomalies, [campaignId]: { expiresAt: Date.now() + 7*24*60*60*1000 } };
    setDismissedAnomalies(next);
    try { localStorage.setItem('guild_campaign_anomaly_dismissals', JSON.stringify(next)); } catch {}
  };

  // Lightweight Tooltip component
  const Tooltip = ({ label, children }) => (
    <span className="relative group inline-flex items-center">
      {children}
      <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs bg-gray-900 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-md">
        {label}
      </span>
    </span>
  );

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
      // Initialize settings fields for controlled inputs
      setSettingsFields({
        name: campaign.name || '',
        budget: campaign.budget || '',
        startDate: campaign.startDate ? campaign.startDate.split('T')[0] : '',
        duration: campaign.duration || 30,
        objective: campaign.objective || '',
        targetAudience: campaign.targetAudience || '',
        geo: campaign.geo || 'All Locations',
        placements: campaign.placements || 'Automatic',
        optimization_goal: campaign.optimization_goal || 'Conversions',
        bid_strategy: campaign.bid_strategy || 'Lowest Cost'
      });
      setShowSettingsModal(true);
    } else if (action === 'optimize') {
      // Unify optimization action with autonomous_optimization payload
      (async () => {
        try {
          await fetch('/api/agents/enhanced-campaign', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'autonomous_optimization',
              campaign_id: campaign.campaign_id || campaign.id,
              campaign_data: campaign,
              request: {
                optimization_type: 'autonomous',
                current_performance: {
                  reach: campaign.reach,
                  clicks: campaign.clicks,
                  ctr: campaign.ctr,
                  roas: campaign.roas,
                  cpa: campaign.cpa,
                  cpl: campaign.cpl
                }
              }
            })
          });
          alert('AI optimization initiated. Track progress in Activity timeline.');
          logCampaignActivity(campaign.campaign_id || campaign.id, { actor: 'User', action: 'enable_ai_optimization', reason: 'Started autonomous optimization from card menu' });
        } catch {}
      })();
    }
  };

  const handleCreateCampaign = (campaignData) => {
    console.log('Creating campaign:', campaignData);
    if (onCreateCampaign) {
      onCreateCampaign(campaignData);
    }
  };

  const handleLocalDelete = (campaignId) => {
    // Inform parent
    onCampaignAction && onCampaignAction(campaignId, 'delete');
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

  // Cross-channel comparisons (lightweight aggregation)
  const channelAgg = (campaigns || []).reduce((acc, c) => {
    if (!c || !c.platform) return acc;
    const key = (c.platform || 'unknown').toLowerCase();
    if (!acc[key]) acc[key] = { spend: 0, conversions: 0, clicks: 0, impressions: 0 };
    acc[key].spend += c.spend || 0;
    acc[key].conversions += c.conversions || 0;
    acc[key].clicks += c.clicks || 0;
    acc[key].impressions += c.impressions || 0;
    return acc;
  }, {});
  const channelRows = Object.entries(channelAgg).map(([platform, v]) => {
    const cpa = v.conversions > 0 ? (v.spend / v.conversions) : null;
    const ctr = v.impressions > 0 ? (v.clicks / v.impressions) * 100 : null;
    return { platform, spend: v.spend, conversions: v.conversions, cpa, ctr };
  }).sort((a,b) => (a.cpa ?? Infinity) - (b.cpa ?? Infinity));

  // Normalize display status using dates if missing/misaligned
  const normalizeStatus = (c) => {
    const status = (c?.status || '').toLowerCase();
    const s = c?.startDate ? new Date(c.startDate) : (c?.start_date ? new Date(c.start_date) : null);
    const e = c?.endDate ? new Date(c.endDate) : (c?.end_date ? new Date(c.end_date) : null);
    const now = new Date();
    if (status === 'paused' || status === 'active' || status === 'scheduled' || status === 'completed') return status;
    if (s && now < s) return 'scheduled';
    if (e && now > e) return 'completed';
    return 'active';
  };

  // Filter campaigns with null checks
  const filteredCampaigns = (campaigns || []).filter(campaign => {
    if (!campaign) return false;
    const displayStatus = normalizeStatus(campaign);
    const matchesStatus = filterStatus === 'all' || displayStatus === filterStatus;
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

  const goalOptions = [
    { id: 'awareness', label: 'Brand awareness' },
    { id: 'traffic', label: 'Website traffic' },
    { id: 'leads', label: 'Leads' },
    { id: 'sales', label: 'Sales' },
    { id: 'retention', label: 'Retention' }
  ];

  const computeGoalProgress = (campaign) => {
    const goal = (campaign.goal || '').toLowerCase();
    const target = parseFloat(campaign.goal_target || 0);
    if (!goal || !target || target <= 0) return null;
    let current = 0;
    if (goal === 'awareness') current = campaign.impressions || 0;
    if (goal === 'traffic') current = campaign.clicks || 0;
    if (goal === 'leads') current = campaign.leads || 0;
    if (goal === 'sales') current = campaign.conversions || 0;
    if (goal === 'retention') current = campaign.returning_customers || 0;
    const pct = Math.max(0, Math.min(100, Math.round((current / target) * 100)));
    return { current, target, pct };
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

  const getMiniTimeline = (campaign) => {
    const start = campaign.startDate ? new Date(campaign.startDate) : null;
    const end = campaign.endDate ? new Date(campaign.endDate) : null;
    if (!start) return null;
    const today = new Date();
    const daysElapsed = Math.max(0, Math.floor((today - start) / (1000*60*60*24)));
    const totalDays = end ? Math.max(1, Math.floor((end - start) / (1000*60*60*24)) + 1) : null;
    const pct = totalDays ? Math.min(100, Math.max(0, Math.round((daysElapsed / totalDays) * 100))) : null;
    return { daysElapsed, totalDays, pct };
  };

  const fetchNextBest = async (cid, context) => {
    try {
      const resp = await fetch('/api/agents/next-best', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business_context: context || {}, campaign_performance: {} })
      });
      const data = resp.ok ? await resp.json() : { ideas: [], confidence: 0 };
      setNextBestByCampaign(prev => ({ ...prev, [cid]: data }));
    } catch {
      setNextBestByCampaign(prev => ({ ...prev, [cid]: { ideas: [], confidence: 0 } }));
    }
  };

  const fetchMicroCampaigns = async (cid, context) => {
    try {
      const resp = await fetch('/api/agents/micro-campaigns', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business_context: context || {}, campaign_performance: {} })
      });
      const data = resp.ok ? await resp.json() : { segments: [], plan: {} };
      setMicroByCampaign(prev => ({ ...prev, [cid]: data }));
    } catch {
      setMicroByCampaign(prev => ({ ...prev, [cid]: { segments: [], plan: {} } }));
    }
  };

  const filteredActivity = (cid) => {
    const items = activityByCampaign[cid] || [];
    if (activityFilter === 'errors') return items.filter(e => (e.status||'').toLowerCase()==='error');
    if (activityFilter === 'budget') return items.filter(e => (e.action||'').includes('budget'));
    return items;
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
            <button 
              onClick={() => setShowAIWorkflowModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
            >
              <Zap className="w-4 h-4 mr-2" />
              AI Orchestrated Campaign
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
                <strong>Optimization:</strong> {learningRecs[0]?.reason || 'Insights updating…'}
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
                <strong>Opportunity:</strong> {learningRecs[1]?.reason || 'New opportunities incoming'}
              </span>
            </div>
          </div>
          
          {/* Actions moved to header to avoid duplication */}
          {/* General Insights (collapsible) moved under AI Campaign Insights */}
          <div className="mt-4 pt-4 border-t border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-gray-700" />
                <span className="font-semibold text-gray-900">General Insights</span>
              </div>
              <button onClick={()=>setShowGeneralInsights(!showGeneralInsights)} className="px-3 py-1.5 text-sm rounded border border-gray-300 text-gray-700 hover:bg-gray-100">
                {showGeneralInsights ? 'Hide' : 'Show'}
              </button>
            </div>
            {showGeneralInsights && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Audience Breakdown (condensed) */}
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-gray-900">Audience Breakdown</div>
                  <Tooltip label="Breakdown of demographics and locations derived from campaign and onboarding data."><span className="text-xs text-gray-600">Why this</span></Tooltip>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="p-2 bg-white border rounded">
                    <div className="text-[11px] text-gray-500">Age</div>
                    <div className="mt-1 text-gray-900">{(() => {
                      const ages = filteredCampaigns.map(c=>c?.demographics?.age || null).filter(Boolean);
                      if (ages.length===0) return '—';
                      const min = Math.min(...ages.map(a=>a.min||0));
                      const max = Math.max(...ages.map(a=>a.max||0));
                      return `${min}-${max}`;
                    })()}</div>
                  </div>
                  <div className="p-2 bg-white border rounded">
                    <div className="text-[11px] text-gray-500">Gender</div>
                    <div className="mt-1 text-gray-900">{(() => {
                      const g = { male:0, female:0, other:0 };
                      filteredCampaigns.forEach(c=>{ const gg=c?.demographics?.genders; if (gg) { Object.keys(g).forEach(k=>{ if (gg[k]) g[k]++; }); }});
                      const active = Object.entries(g).filter(([,v])=>v>0).map(([k])=>k);
                      return active.length? active.join(', ') : '—';
                    })()}</div>
                  </div>
                  <div className="p-2 bg-white border rounded">
                    <div className="text-[11px] text-gray-500">Top Locations</div>
                    <div className="mt-1 text-gray-900">{(() => {
                      const locs = {};
                      filteredCampaigns.forEach(c=>{ const country=c?.geo?.country || c?.targeting?.country; if (country) locs[country]=(locs[country]||0)+1; });
                      const top = Object.entries(locs).sort((a,b)=>b[1]-a[1]).slice(0,2).map(([k])=>k);
                      return top.length? top.join(', ') : '—';
                    })()}</div>
                  </div>
                </div>
              </div>

              {/* Competitive Benchmarks (condensed) */}
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-gray-900">Competitive Benchmarks</div>
                  <Tooltip label="Compare your key metrics against category benchmarks."><span className="text-xs text-gray-600">Why this</span></Tooltip>
                </div>
                {(() => {
                  const data = competitive || { ctr_avg: 1.5, roas_avg: 2.8, cpa_avg: 42 };
                  const avg = (arr)=>{ const vals = arr.filter(v=>v!=null && !isNaN(Number(v))).map(Number); if (!vals.length) return null; return vals.reduce((a,b)=>a+b,0)/vals.length; };
                  const myCtr = avg(filteredCampaigns.map(c => c.ctr));
                  const myRoas = avg(filteredCampaigns.map(c => c.roas));
                  const myCpa = avg(filteredCampaigns.map(c => c.cpa));
                  return (
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="p-2 bg-white border rounded">
                        <div className="text-[11px] text-gray-500">CTR</div>
                        <div className="mt-1 text-gray-900">{myCtr!=null? `${myCtr.toFixed(1)}%` : '—'} <span className="text-[11px] text-gray-500">vs {data.ctr_avg}%</span></div>
                      </div>
                      <div className="p-2 bg-white border rounded">
                        <div className="text-[11px] text-gray-500">ROAS</div>
                        <div className="mt-1 text-gray-900">{myRoas!=null? `${myRoas.toFixed(1)}x` : '—'} <span className="text-[11px] text-gray-500">vs {data.roas_avg}x</span></div>
                      </div>
                      <div className="p-2 bg-white border rounded">
                        <div className="text-[11px] text-gray-500">CPA</div>
                        <div className="mt-1 text-gray-900">{myCpa!=null? `$${myCpa.toFixed(0)}` : '—'} <span className="text-[11px] text-gray-500">vs ${data.cpa_avg}</span></div>
                      </div>
                    </div>
                  );
                })()}
              </div>
              {/* Creative Performance Insights (condensed) */}
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-gray-900">Creative Performance</div>
                  <Tooltip label="Which assets and copy performed best across campaigns."><span className="text-xs text-gray-600">Why this</span></Tooltip>
                </div>
                {(() => {
                  const rows = [];
                  filteredCampaigns.forEach(c=>{
                    if (Array.isArray(c?.creative_performance)) {
                      c.creative_performance.forEach(r=>{
                        rows.push({
                          name: r.name || r.asset || 'Asset',
                          ctr: r.ctr!=null? Number(r.ctr): null,
                          roas: r.roas!=null? Number(r.roas): null
                        });
                      });
                    }
                  });
                  if (rows.length===0) return <div className="text-sm text-gray-500">No data yet.</div>;
                  const top = rows.sort((a,b)=>{
                    const as = (a.ctr||0)*0.6 + (a.roas||0)*0.4;
                    const bs = (b.ctr||0)*0.6 + (b.roas||0)*0.4;
                    return bs-as;
                  }).slice(0,3);
                  return (
                    <ul className="text-sm text-gray-800 space-y-1">
                      {top.map((r,i)=>(
                        <li key={i} className="flex items-center justify-between">
                          <span className="truncate mr-2" title={r.name}>{r.name}</span>
                          <span className="text-gray-600 text-xs">CTR {r.ctr!=null? `${r.ctr}%`:'—'} • ROAS {r.roas!=null? `${r.roas}x`:'—'}</span>
                        </li>
                      ))}
                    </ul>
                  );
                })()}
              </div>
              {/* Sentiment Analysis (condensed) */}
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-gray-900">Sentiment Analysis</div>
                  <Tooltip label="We analyze recent comments/replies to gauge audience sentiment."><span className="text-xs text-gray-600">Why this</span></Tooltip>
                </div>
                {(() => {
                  const comments = filteredCampaigns.flatMap(c => c?.recent_comments || []);
                  return comments.length === 0 ? (
                    <div className="text-sm text-gray-500">No recent responses available.</div>
                  ) : (
                    <div className="text-sm text-gray-700">
                      <SentimentBlock comments={comments} />
                    </div>
                  );
                })()}
              </div>
            </div>
            )}
          </div>
        </div>

        {/* Cross-Channel Comparison */}
        {channelRows.length > 0 && (
          <div className="mt-4 border-t border-blue-100 pt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-gray-900">Cross-channel comparison</span>
              </div>
              <span className="text-xs text-gray-500">Lower CPA is better</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {channelRows.slice(0,6).map((row, i) => (
                <div key={i} className="p-3 rounded-lg border border-gray-200 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium capitalize">{row.platform}</div>
                    <div className="text-xs text-gray-500">CPA</div>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-sm">
                    <div className="text-gray-900">{row.cpa != null ? `$${Math.round(row.cpa)}` : '—'}</div>
                    <div className="text-gray-600">CTR: {row.ctr != null ? `${row.ctr.toFixed(1)}%` : '—'}</div>
                  </div>
                    {competitive?.[row.platform] && (
                      <div className="mt-1 text-xs text-gray-600">
                        <div className="flex items-center justify-between">
                          <Tooltip label="Your CPA vs industry average">
                            <span>vs avg</span>
                          </Tooltip>
                          <span>{`$${competitive[row.platform].cpa_avg} • ${competitive[row.platform].ctr_avg}% CTR • ${competitive[row.platform].roas_avg}x ROAS`}</span>
                        </div>
                      </div>
                    )}
                </div>
              ))}
            </div>
          </div>
        )}
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
      <div className="bg-white rounded-lg shadow-sm border p-6 pb-8">
        {/* Campaign Details Heading and toggle inside card */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-gray-700" />
            <span className="font-semibold text-gray-900">Campaign Details</span>
          </div>
          <button
            onClick={()=>setShowCampaignDetails(!showCampaignDetails)}
            className="px-3 py-1.5 text-sm rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            {showCampaignDetails ? 'Hide details' : 'Show details'}
          </button>
        </div>
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
            <div className="hidden md:flex items-center space-x-2">
              <button onClick={()=>setFilterPlatform2('all')} className={`px-2 py-1 rounded text-sm ${filterPlatform2==='all'?'bg-gray-800 text-white':'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>All</button>
              <button onClick={()=>setFilterPlatform2('email')} className={`px-2 py-1 rounded text-sm ${filterPlatform2==='email'?'bg-purple-700 text-white':'bg-purple-100 text-purple-800 hover:bg-purple-200'}`}>Email</button>
              <button onClick={async ()=>{ try { setIsRefreshingCampaigns(true); await onRefreshCampaigns?.(); } finally { setTimeout(()=>setIsRefreshingCampaigns(false), 300);} }} className="ml-2 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors" title="Refresh campaigns data">
                <RefreshCw className={`w-4 h-4 ${isRefreshingCampaigns ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={() => setShowAdvancedFilters(!showAdvancedFilters)} className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors" title="Filter campaigns">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        


        {showAdvancedFilters && (
          <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Platform</label>
                <select value={filterPlatform2} onChange={(e)=>setFilterPlatform2(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded">
                  {['all','facebook','instagram','google','tiktok','linkedin','twitter','email','multi','unknown'].map(p => (
                    <option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Budget range ($/day)</label>
                <div className="flex items-center space-x-2">
                  <input type="number" value={filterBudgetRange[0]} onChange={(e)=>setFilterBudgetRange([parseInt(e.target.value||0), filterBudgetRange[1]])} className="w-1/2 px-2 py-1 border rounded" />
                  <span className="text-gray-500">to</span>
                  <input type="number" value={filterBudgetRange[1]} onChange={(e)=>setFilterBudgetRange([filterBudgetRange[0], parseInt(e.target.value||0)])} className="w-1/2 px-2 py-1 border rounded" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Duration (days)</label>
                <div className="flex items-center space-x-2">
                  <input type="number" value={filterDurationRange[0]} onChange={(e)=>setFilterDurationRange([parseInt(e.target.value||0), filterDurationRange[1]])} className="w-1/2 px-2 py-1 border rounded" />
                  <span className="text-gray-500">to</span>
                  <input type="number" value={filterDurationRange[1]} onChange={(e)=>setFilterDurationRange([filterDurationRange[0], parseInt(e.target.value||0)])} className="w-1/2 px-2 py-1 border rounded" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Sort by performance</label>
                <select value={sortByPerformance} onChange={(e)=>setSortByPerformance(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded">
                  <option value="none">None</option>
                  <option value="best">Best Performing</option>
                  <option value="worst">Worst Performing</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Campaign List (collapsible, scrollable) */}
        {showCampaignDetails && (
        <div className="space-y-4 max-h-[1100px] overflow-y-auto pr-1">
          {filteredCampaigns
            .filter(c => filterPlatform2==='all' || (c?.platform||'').toLowerCase()===filterPlatform2)
            .filter(c => {
              const b = parseFloat(c?.budget||0);
              return b>=filterBudgetRange[0] && b<=filterBudgetRange[1];
            })
            .filter(c => {
              const d = parseInt(c?.duration||0);
              return d>=filterDurationRange[0] && d<=filterDurationRange[1];
            })
            .sort((a,b)=>{
              if (sortByPerformance==='none') return 0;
              const score = (x)=>{
                const ctr = (x?.impressions||0)>0 ? (x.clicks||0)/(x.impressions||0) : 0;
                const convRate = (x?.clicks||0)>0 ? (x.conversions||0)/(x.clicks||0) : 0;
                const roas = x?.roas||0;
                return (ctr*0.3)+(convRate*0.3)+(roas*0.4);
              };
              const sa = score(a), sb = score(b);
              return sortByPerformance==='best' ? sb-sa : sa-sb;
            })
            .map((campaign) => {
            if (!campaign) return null;
            const isEmail = ((campaign.platform||'').toLowerCase()==='email' || (campaign.type||'').toLowerCase()==='email');
            if (isEmail) {
            const seqCount = campaign.sequence_count || campaign.emails_in_sequence || (campaign.sequence?.length) || (campaign.emails?.length) || campaign.email_sequence_length || 0;
            const delivered = campaign.delivered != null ? campaign.delivered : (campaign.sent && campaign.delivery_rate!=null ? Math.round((campaign.sent||0) * ((campaign.delivery_rate||0)/100)) : (campaign.emails_delivered||0));
            const openRate = campaign.open_rate != null ? campaign.open_rate : (campaign.opens_rate || null);
            const bounceRate = campaign.bounce_rate != null ? campaign.bounce_rate : null;
            const linkClicks = campaign.emailClicks != null ? campaign.emailClicks : (campaign.link_clicks != null ? campaign.link_clicks : (campaign.clicks ?? null));
            const emailType = (campaign.type || 'newsletter').toString().replace('_',' ');
            return (
            <div key={campaign.campaign_id || Math.random()} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">{getPlatformIcon('email')}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                      <span>{campaign.name || 'Unnamed Campaign'}</span>
                    </h3>
                    <p className="text-sm text-gray-600 capitalize">email • {emailType}</p>
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
                        <button onClick={() => { setOpenMenuForId(null); if (window.confirm('Delete this campaign? This removes it from your dashboard and calendar views.')) { handleLocalDelete(campaign.id || campaign.campaign_id); } }} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50">Delete</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Minimal Email Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{seqCount}</div>
                  <div className="text-xs text-gray-500">Emails in sequence</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{openRate!=null ? `${Number(openRate).toFixed(1)}%` : '—'}</div>
                  <div className="text-xs text-gray-500">Open rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{delivered != null ? delivered.toLocaleString() : '—'}</div>
                  <div className="text-xs text-gray-500">Emails delivered</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{bounceRate!=null ? `${Number(bounceRate).toFixed(1)}%` : '—'}</div>
                  <div className="text-xs text-gray-500">Bounce rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{linkClicks != null ? formatNumber(linkClicks) : '—'}</div>
                  <div className="text-xs text-gray-500">Link clicks</div>
                </div>
              </div>

              {/* Action Buttons (limited) */}
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
                    onClick={() => handleCampaignAction('show-in-calendar', campaign)}
                    className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium flex items-center"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Show in Calendar
                  </button>
                </div>
                <div className="text-sm text-gray-500" />
              </div>
            </div>
            );
            }
            return (
            <div key={campaign.campaign_id || Math.random()} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">{getPlatformIcon(campaign.platform)}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                      <span>{campaign.name || 'Unnamed Campaign'}</span>
                      {campaign?.ab_test?.enabled && (
                        <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-pink-100 text-pink-700 border border-pink-200">A/B</span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-600 capitalize">{campaign.platform || 'Unknown'} • {campaign.type || 'Campaign'}</p>
                  </div>
                </div>
              <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(campaign.status || 'unknown')}`}>
                    {campaign.status || 'Unknown'}
                </span>
                {showAnomalies && ((campaign.platform||'').toLowerCase()!=='email') && (()=>{ const reasons = detectAnomalies(campaign); const cid=(campaign.campaign_id||campaign.id); if (reasons.length>0 && !isAnomalyDismissed(cid)) return (
                  <div className="inline-flex items-center space-x-1">
                    <Tooltip label={`Why flagged: ${reasons.join(' • ')}`}>
                      <span className="inline-flex items-center px-2 py-1 rounded-full border text-xs text-orange-800 border-orange-200 bg-orange-50">
                        <AlertTriangle className="w-3 h-3 mr-1" /> Potential issue
                      </span>
                    </Tooltip>
                    <Tooltip label="Dismiss for 7 days (stores locally). Rationale: reduce alert fatigue while you address it.">
                      <button onClick={()=>dismissAnomaliesFor(cid)} className="text-xs text-gray-600 hover:text-gray-900 px-1 py-0.5 border border-gray-200 rounded">
                        Dismiss 7d
                      </button>
                    </Tooltip>
                  </div>
                ); return null; })()}
                {(() => { const gp = computeGoalProgress(campaign); return gp ? (
                  <span className="hidden sm:inline-flex items-center px-2 py-1 rounded-full border text-xs text-emerald-800 border-emerald-200 bg-emerald-50" title={`Goal progress: ${gp.current}/${gp.target}`}>
                    Goal: {(campaign.goal||'').toString()}
                    <span className="ml-2 w-16 bg-emerald-100 rounded-full h-1.5 inline-block">
                      <span className="bg-emerald-600 h-1.5 rounded-full inline-block" style={{ width: `${gp.pct}%` }}></span>
                    </span>
                    <span className="ml-1">{gp.pct}%</span>
                  </span>
                ) : null; })()}
                {((campaign.platform||'').toLowerCase()!=='email') && (
                  <div className="flex items-center space-x-2 text-xs">
                    <div className="flex items-center space-x-1">
                      <Tooltip label="First-touch: first interaction; Last-touch: final interaction before conversion.">
                        <span className="text-gray-600">Attrib</span>
                      </Tooltip>
                      <div className="w-20 bg-gray-200 rounded h-1.5 overflow-hidden">
                        {(() => { const ft = campaign.attributed_first||0; const lt = campaign.attributed_last||0; const total = Math.max(1, ft+lt); return (
                          <div className="flex w-full h-full">
                            <span className="bg-purple-400" style={{ width: `${Math.round((ft/total)*100)}%` }} />
                            <span className="bg-indigo-400" style={{ width: `${Math.round((lt/total)*100)}%` }} />
                          </div>
                        ); })()}
                      </div>
                      <span className="text-purple-700">F:{campaign.attributed_first||0}</span>
                      <span className="text-indigo-700">L:{campaign.attributed_last||0}</span>
                    </div>
                    <button
                      onClick={() => setAttribOpenForId(attribOpenForId === (campaign.campaign_id || campaign.id) ? null : (campaign.campaign_id || campaign.id))}
                      className="p-1 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md ml-2 flex items-center"
                      title="View full attribution breakdown: linear, time-decay, position-based"
                    >
                      <Info className="w-4 h-4 mr-1" />
                      <span className="text-[11px]">Info</span>
                    </button>
                  </div>
                )}
                  <div className="relative">
                    <button 
                      onClick={() => setOpenMenuForId(openMenuForId === (campaign.campaign_id || campaign.id) ? null : (campaign.campaign_id || campaign.id))}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {openMenuForId === (campaign.campaign_id || campaign.id) && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                        <button onClick={() => { setOpenMenuForId(null); setAssetsPayload(campaign.assets || loadCampaignAssets(campaign.campaign_id || campaign.id)); setShowAssetsModal(true); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Assets</button>
                        <button onClick={() => { setOpenMenuForId(null); handleCampaignAction('analytics', campaign); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Analytics</button>
                        <button onClick={() => { setOpenMenuForId(null); handleCampaignAction('settings', campaign); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Settings</button>
                        <div className="border-t border-gray-200"></div>
                        <button onClick={() => { setOpenMenuForId(null); if (window.confirm('Delete this campaign? This removes it from your dashboard and calendar views.')) { handleLocalDelete(campaign.id || campaign.campaign_id); } }} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50">Delete</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            {/* A/B mini-summary (if present) */}
            {campaign?.ab_test?.enabled && (()=>{
              const cid = campaign.campaign_id||campaign.id;
              const ab = campaign.ab_results || abResults[cid] || {};
              const hasData = !!(ab?.A || ab?.B);
              if (!hasData) return null;
              const winner = campaign.ab_winner || computeABWinner(ab);
              return (
              <div className="mb-3 text-xs text-gray-700 inline-flex items-center space-x-2">
                <span className="uppercase tracking-wider px-1.5 py-0.5 rounded bg-pink-50 text-pink-700 border border-pink-200">A/B</span>
                <span>CTR A: {(ab?.A?.ctr ?? '—')}%</span>
                <span>CTR B: {(ab?.B?.ctr ?? '—')}%</span>
                {winner && <span className="text-green-700">Winner: {winner}</span>}
                {!winner && <Tooltip label="Winner is computed using conversions then CTR."><span className="text-gray-500">Winner: —</span></Tooltip>}
              </div>
              );
            })()}

            {/* Activity Timeline */}
            <div className="mb-3 flex items-center justify-between">
              <button onClick={()=>toggleActivity(campaign.campaign_id||campaign.id)} className="text-xs text-blue-600 hover:text-blue-800 font-medium">{activityOpenForId === (campaign.campaign_id||campaign.id) ? 'Hide' : 'Show'} Activity</button>
              {activityOpenForId === (campaign.campaign_id||campaign.id) && (
                <div className="text-xs flex items-center space-x-2">
                  <span className="text-gray-500">Filter:</span>
                  <select value={activityFilter} onChange={(e)=>setActivityFilter(e.target.value)} className="border rounded px-1 py-0.5">
                    <option value="all">All</option>
                    <option value="errors">Errors</option>
                    <option value="budget">Budget ops</option>
                  </select>
                </div>
              )}
            </div>
            {activityOpenForId === (campaign.campaign_id||campaign.id) && (
              <div className="mb-4 border rounded p-3 bg-white">
                <div className="text-xs text-gray-500 mb-2">Full transparency: actions taken by agents and users</div>
                <ul className="space-y-2">
                  {filteredActivity(campaign.campaign_id||campaign.id).map((e,i)=> {
                    const isExpanded = (expandedActivityIndexByCampaign[campaign.campaign_id||campaign.id] === i);
                    return (
                      <li key={i} className="text-xs">
                        <div className="flex items-start">
                          <span className="w-28 text-gray-500">{new Date(e.ts||Date.now()).toLocaleString()}</span>
                          <span className="mx-2 text-gray-400">•</span>
                          <span className="text-gray-800">{e.actor}: {e.action}</span>
                          {e.reason && <span className="ml-2 text-gray-600">— {e.reason}</span>}
                          <button onClick={()=>setExpandedActivityIndexByCampaign(prev=>({ ...prev, [campaign.campaign_id||campaign.id]: isExpanded?null:i }))} className="ml-2 text-blue-600">{isExpanded?'Hide':'Details'}</button>
                        </div>
                        {isExpanded && (
                          <div className="ml-32 mt-1 p-2 bg-gray-50 border rounded text-[11px] text-gray-700">
                            {e.agent && <div><span className="text-gray-500">Agent:</span> {e.agent}</div>}
                            {e.inputs && <div><span className="text-gray-500">Inputs:</span> <code>{JSON.stringify(e.inputs)}</code></div>}
                            {e.outputs && <div><span className="text-gray-500">Outputs:</span> <code>{JSON.stringify(e.outputs)}</code></div>}
                            {e.status && <div><span className="text-gray-500">Status:</span> {e.status}</div>}
                          </div>
                        )}
                      </li>
                    );
                  })}
                  {filteredActivity(campaign.campaign_id||campaign.id).length===0 && (
                    <li className="text-xs text-gray-500">No activity yet.</li>
                  )}
                </ul>
              </div>
            )}

            {/* Next Best Campaigns (separate collapsible card) */}
            <div className="mb-4 border border-gray-200 rounded-lg bg-white">
              <div className="flex items-center justify-between px-3 py-2 border-b">
                <div className="flex items-center space-x-2">
                  <Lightbulb className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-900">Next Best Campaigns</span>
                </div>
                <button
                  onClick={async ()=>{
                    const id = campaign.campaign_id||campaign.id;
                    const open = expandedNextBestForId === id ? null : id;
                    setExpandedNextBestForId(open);
                    if (open && !nextBestByCampaign[id]) {
                      await fetchNextBest(id, { industry: campaign.industry||'general', objective: campaign.objective });
                    }
                  }}
                  className="px-2 py-1 text-xs rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
                >{expandedNextBestForId === (campaign.campaign_id||campaign.id) ? 'Hide' : 'Show'}</button>
              </div>
              {expandedNextBestForId === (campaign.campaign_id||campaign.id) && (
                <div className="p-3">
                  {(() => {
                    const data = nextBestByCampaign[campaign.campaign_id||campaign.id];
                    if (!data) return <div className="text-xs text-gray-500">Loading…</div>;
                    const ideas = data.ideas||[];
                    if (ideas.length===0) return <div className="text-xs text-gray-500">No suggestions yet.</div>;
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {ideas.map((idea, idx)=> (
                          <div key={idx} className="p-3 border rounded">
                            <div className="font-medium text-gray-900">{idea.title}</div>
                            <div className="text-xs text-gray-700">Angle: {idea.angle}</div>
                            <div className="text-xs text-gray-700">Audience: {idea.audience}</div>
                            {Array.isArray(idea.sources) && idea.sources.length>0 && (
                              <div className="mt-1 text-[11px] text-gray-600">Sources: {idea.sources.map((s,i)=> (<a key={i} href={s} target="_blank" rel="noreferrer" className="text-blue-600 underline">{s}</a>))}</div>
                            )}
                            {idea.why && <div className="mt-1 text-[11px] text-gray-600">Why: {idea.why}</div>}
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Personalized Micro-campaigns (separate collapsible card) */}
            <div className="mb-4 border border-gray-200 rounded-lg bg-white">
              <div className="flex items-center justify-between px-3 py-2 border-b">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-medium text-gray-900">Personalized Micro-campaigns</span>
                </div>
                <button
                  onClick={async ()=>{
                    const id = campaign.campaign_id||campaign.id;
                    const open = expandedMicroForId === id ? null : id;
                    setExpandedMicroForId(open);
                    if (open && !microByCampaign[id]) {
                      await fetchMicroCampaigns(id, { industry: campaign.industry||'general', audience: campaign.targetAudience });
                    }
                  }}
                  className="px-2 py-1 text-xs rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
                >{expandedMicroForId === (campaign.campaign_id||campaign.id) ? 'Hide' : 'Show'}</button>
              </div>
              {expandedMicroForId === (campaign.campaign_id||campaign.id) && (
                <div className="p-3">
                  {(() => {
                    const data = microByCampaign[campaign.campaign_id||campaign.id];
                    if (!data) return <div className="text-xs text-gray-500">Loading…</div>;
                    const segments = data.segments||[];
                    if (segments.length===0) return <div className="text-xs text-gray-500">No segments yet.</div>;
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {segments.map((seg, idx)=> (
                          <div key={idx} className="p-3 border rounded">
                            <div className="font-medium text-gray-900">{seg.name}</div>
                            <div className="text-xs text-gray-700">Size: {seg.size ?? '—'}</div>
                            <div className="text-xs text-gray-700">Channels: {(seg.channels||[]).join(', ')}</div>
                            <div className="text-xs text-gray-700">Value Prop: {seg.value_prop}</div>
                            {Array.isArray(seg.suggested_assets) && seg.suggested_assets.length>0 && (
                              <div className="text-[11px] text-gray-600">Assets: {seg.suggested_assets.join(', ')}</div>
                            )}
                            <div className="text-xs text-gray-700">CTA: {seg.CTA}</div>
                            <div className="mt-2">
                              <button
                                onClick={() => {
                                  const draft = {
                                    name: `${campaign.name || 'Campaign'} — ${seg.name}`,
                                    platform: campaign.platform,
                                    objective: campaign.objective,
                                    targetAudience: `${seg.name}: ${seg.value_prop}`,
                                    budget: campaign.budget,
                                    duration: campaign.duration,
                                    ab_test: { enabled: true },
                                    ai_suggestions: ['Drafted from micro-campaign segment']
                                  };
                                  onCreateCampaign?.({ ...draft, campaign_id: `draft_${Date.now()}` });
                                  try { logCampaignActivity(campaign.campaign_id||campaign.id, { actor: 'Lead Personalization Agent', action: 'draft_micro_campaign', reason: `Drafted micro-campaign for segment ${seg.name}` }); } catch {}
                                }}
                                className="px-3 py-1.5 text-xs rounded bg-emerald-600 text-white hover:bg-emerald-700"
                              >Draft micro-campaign</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}
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
              </div>

            {/* CTR/ROAS mini-sparkline (ads only, if data exists) */}
            {((campaign.platform||'').toLowerCase()!=='email') && (campaign?.trend?.ctr || campaign?.trend?.roas) && (
              <div className="mb-4 flex items-center space-x-6 text-xs">
                {campaign?.trend?.ctr && Array.isArray(campaign.trend.ctr) && campaign.trend.ctr.length>1 && (
                  <Tooltip label="CTR trend over recent periods; higher bars indicate better click-through performance.">
                    <div className="flex items-end space-x-0.5" title="CTR trend">
                      {(() => {
                        const values = campaign.trend.ctr.map(n=>Number(n)||0);
                        const max = Math.max(...values, 1);
                        return values.map((v,i)=> (
                          <div key={i} className="w-1.5 bg-purple-400" style={{ height: `${Math.max(2, Math.round((v/max)*24))}px` }} />
                        ));
                      })()}
                      <span className="ml-2 text-gray-600">CTR</span>
                    </div>
                  </Tooltip>
                )}
                {campaign?.trend?.roas && Array.isArray(campaign.trend.roas) && campaign.trend.roas.length>1 && (
                  <Tooltip label="ROAS trend over recent periods; bars scale to the best observed value.">
                    <div className="flex items-end space-x-0.5" title="ROAS trend">
                      {(() => {
                        const values = campaign.trend.roas.map(n=>Number(n)||0);
                        const max = Math.max(...values, 1);
                        return values.map((v,i)=> (
                          <div key={i} className="w-1.5 bg-emerald-400" style={{ height: `${Math.max(2, Math.round((v/max)*24))}px` }} />
                        ));
                      })()}
                      <span className="ml-2 text-gray-600">ROAS</span>
                    </div>
                  </Tooltip>
                )}
              </div>
            )}

              {/* Creative performance (if provided) */}
              {((campaign.platform||'').toLowerCase()!=='email') && (campaign?.creative_performance && campaign.creative_performance.length>0) && (
                <div className="mb-4 p-3 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-gray-900">Top creatives</div>
                    <Tooltip label="Shows basic asset performance to help you learn which creatives pull results."><span className="text-xs text-gray-500">Why this</span></Tooltip>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-left text-gray-600">
                          <th className="py-1 pr-3">Asset</th>
                          <th className="py-1 pr-3">Impr.</th>
                          <th className="py-1 pr-3">CTR</th>
                          <th className="py-1 pr-3">Conv.</th>
                          <th className="py-1 pr-3">ROAS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {campaign.creative_performance.slice(0,5).map((row,i)=> (
                          <tr key={i} className="border-t">
                            <td className="py-1 pr-3 text-gray-900">{row.name || row.asset || `Asset ${i+1}`}</td>
                            <td className="py-1 pr-3">{(row.impressions||0).toLocaleString()}</td>
                            <td className="py-1 pr-3">{row.ctr != null ? `${row.ctr}%` : '—'}</td>
                            <td className="py-1 pr-3">{row.conversions != null ? row.conversions : '—'}</td>
                            <td className="py-1 pr-3">{row.roas != null ? `${row.roas}x` : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

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
                <div className="w-40">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${campaign.budget > 0 ? (campaign.spend / campaign.budget * 100) : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* ROI snapshot inline with bottom-left buttons (ads only) */}
              {((campaign.platform||'').toLowerCase()!=='email') && (
                <div className="mb-2">
                  <div className="flex items-center space-x-4 text-xs text-gray-700">
                    <Tooltip label="Average cost to acquire a customer from this campaign.">
                      <div><span className="text-gray-500">Cost per Action (CPA):</span> <span className="font-semibold text-gray-900">{campaign.cpa != null ? `$${campaign.cpa}` : '—'}</span></div>
                    </Tooltip>
                    <Tooltip label="Average cost to generate a lead.">
                      <div><span className="text-gray-500">Cost per Lead (CPL):</span> <span className="font-semibold text-gray-900">{campaign.cpl != null ? `$${campaign.cpl}` : '—'}</span></div>
                    </Tooltip>
                    <Tooltip label="Return on Ad Spend. 3.0x means $3 revenue per $1 spent.">
                      <div><span className="text-gray-500">Return on Ad Spend (ROAS):</span> <span className="font-semibold text-gray-900">{campaign.roas != null ? `${campaign.roas}x` : '—'}</span></div>
                    </Tooltip>
                  </div>
                </div>
              )}

              {/* Optimization suggestions (ads only, if provided) */}
              {((campaign.platform||'').toLowerCase()!=='email') && (campaign?.ai_suggestions && campaign.ai_suggestions.length>0) && (
                <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2 text-sm font-medium text-gray-900">
                      <Zap className="w-4 h-4 text-purple-600" />
                      <span>Optimization suggestions</span>
                    </div>
                    <Tooltip label="Provided by Guild AI agents; shows actionable steps and why they help."><span className="text-xs text-gray-600">Why</span></Tooltip>
                  </div>
                  <ul className="list-disc pl-5 text-xs text-gray-700 space-y-0.5">
                    {campaign.ai_suggestions.slice(0,3).map((s, i)=>(
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Attribution Details Drawer */}
              {attribOpenForId === (campaign.campaign_id || campaign.id) && (
                <div className="mb-4 p-4 border border-purple-200 rounded-lg bg-purple-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-purple-900">Attribution details</div>
                    <button onClick={()=>setAttribOpenForId(null)} className="text-xs text-purple-700 hover:text-purple-900">Close</button>
                  </div>
                  <AttributionSummaryPanel campaign={campaign} />
                </div>
              )}

              {/* Engagement Metrics */}
              {(campaign.likes || campaign.comments || campaign.shares || campaign.opens || campaign.clicks || campaign.unsubscribe_rate || campaign.bounce_rate) && (
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
                      <div className="flex items-center justify-center space-x-1" title="Open Rate: percentage of recipients who opened the email">
                        <Mail className="w-4 h-4 text-purple-500" />
                        <span className="text-lg font-semibold text-gray-900">{formatNumber(campaign.opens)}</span>
                      </div>
                      <div className="text-xs text-gray-500">Opens</div>
                    </div>
                  )}
                  {campaign.emailClicks && (
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1" title="Click Rate: percentage of recipients who clicked a link in the email">
                        <MousePointer className="w-4 h-4 text-orange-500" />
                        <span className="text-lg font-semibold text-gray-900">{formatNumber(campaign.emailClicks)}</span>
                      </div>
                      <div className="text-xs text-gray-500">Email Clicks</div>
                    </div>
                  )}
                  {campaign.unsubscribe_rate != null && (
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900" title="Unsubscribe Rate: percentage of recipients who unsubscribed">{campaign.unsubscribe_rate}%</div>
                      <div className="text-xs text-gray-500">Unsubscribe Rate</div>
                    </div>
                  )}
                  {campaign.bounce_rate != null && (
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900" title="Bounce Rate: percentage of emails that couldn't be delivered">{campaign.bounce_rate}%</div>
                      <div className="text-xs text-gray-500">Bounce Rate</div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
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
                  {/* keep ROI inline to the left with buttons on narrow widths as well */}
                </div>
                <div className="text-sm text-gray-500 flex items-center space-x-2" title="Timeline: progress from campaign start to end date">
                  {(() => {
                    const start = campaign.startDate ? new Date(campaign.startDate) : null;
                    if (!start) return null;
                    const end = campaign.endDate ? new Date(campaign.endDate) : null;
                    const today = new Date();
                    const daysElapsed = Math.max(0, Math.floor((today - start) / (1000*60*60*24)));
                    const totalDays = end ? Math.max(1, Math.floor((end - start) / (1000*60*60*24)) + 1) : null;
                    const pct = totalDays ? Math.min(100, Math.max(0, Math.round((daysElapsed / totalDays) * 100))) : null;
                    return (
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-1.5">
                          {pct !== null && (
                            <div className="bg-gray-600 h-1.5 rounded-full" style={{ width: `${pct}%` }}></div>
                          )}
                        </div>
                        <span className="text-xs text-gray-600">
                          {totalDays ? `${daysElapsed}/${totalDays} days` : `${daysElapsed} days`}
                        </span>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
            );
          })}
        </div>
        )}

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

      {/* Email rollup intentionally removed per spec: detailed email analytics live in Email tab */}

      {/* Create Campaign Modal */}
      <CreateCampaignModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateCampaign={handleCreateCampaign}
      />

      <AIWorkflowCreateCampaignModal
        isOpen={showAIWorkflowModal}
        onClose={() => setShowAIWorkflowModal(false)}
        onCreateCampaign={handleCreateCampaign}
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
                  <div className="text-sm text-gray-600 mb-1">Efficiency & Goal</div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-lg font-semibold text-gray-900">${(selectedCampaign.cpc || 0)}</div>
                      <div className="text-xs text-gray-500">Cost per Click (CPC)</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-gray-900">${(selectedCampaign.cpl || 0)}</div>
                      <div className="text-xs text-gray-500">Cost per Lead (CPL)</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-gray-900">${(selectedCampaign.cpa || 0)}</div>
                      <div className="text-xs text-gray-500">Cost per Acquisition (CPA)</div>
                    </div>
                  </div>
                  {(() => { const gp = computeGoalProgress(selectedCampaign); return gp ? (
                    <div className="mt-3">
                      <div className="text-xs text-gray-600 mb-1">Goal: {(selectedCampaign.goal||'')}</div>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${gp.pct}%` }}></div>
                        </div>
                        <div className="text-xs text-gray-700 whitespace-nowrap">{gp.current}/{gp.target} ({gp.pct}%)</div>
                      </div>
                    </div>
                  ) : null; })()}
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Revenue & Return on Ad Spend (ROAS)</div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-500">Revenue</div>
                      <div className="text-lg font-semibold text-gray-900">${selectedCampaign.revenue || 0}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Return on Ad Spend (ROAS)</div>
                      <div className="text-lg font-semibold text-gray-900">{selectedCampaign.roas ? `${selectedCampaign.roas}x` : '0x'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Removed duplicate Spend vs Budget section */}

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

              {/* Sentiment Analysis (social/email responses) */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-gray-900">Sentiment Analysis</div>
                  <Tooltip label="We analyze recent comments/replies to gauge audience sentiment."><span className="text-xs text-gray-600">Why this</span></Tooltip>
                </div>
                {(() => {
                  const comments = selectedCampaign.recent_comments || [];
                  return comments.length === 0 ? (
                    <div className="text-sm text-gray-500">No recent responses available.</div>
                  ) : (
                    <div className="text-sm text-gray-700">
                      {/* Lightweight client call */}
                      {/* eslint-disable-next-line jsx-a11y/aria-props */}
                      <SentimentBlock comments={comments} />
                    </div>
                  );
                })()}
              </div>

              {/* AI Insights & Optimization */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-gray-900">AI Insights</span>
                  </div>
                  <button onClick={() => onCampaignAction && onCampaignAction(selectedCampaign.campaign_id || selectedCampaign.id, 'optimize')} className="text-sm px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700">Enable AI Optimization</button>
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

      {/* Thresholds Settings Modal (global) */}
      {showThresholdsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-xl w-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="font-semibold text-gray-900">Anomaly Thresholds</div>
              <button onClick={()=>setShowThresholdsModal(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-4 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-700 mb-1">CTR min (%)</label>
                  <input type="number" defaultValue={benchmarks?.ctr_min ?? 1.0} onBlur={(e)=>{
                    const next = { ads: { ...(benchmarks||{}), ctr_min: parseFloat(e.target.value||'0') }, email: emailBenchmarks };
                    saveAnomalyThresholds(next);
                    setBenchmarks(next.ads);
                  }} className="w-full px-3 py-2 border border-gray-300 rounded" />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">ROAS min (x)</label>
                  <input type="number" defaultValue={benchmarks?.roas_min ?? 2.0} onBlur={(e)=>{
                    const next = { ads: { ...(benchmarks||{}), roas_min: parseFloat(e.target.value||'0') }, email: emailBenchmarks };
                    saveAnomalyThresholds(next);
                    setBenchmarks(next.ads);
                  }} className="w-full px-3 py-2 border border-gray-300 rounded" />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">CPA max ($)</label>
                  <input type="number" defaultValue={benchmarks?.cpa_max ?? 50} onBlur={(e)=>{
                    const next = { ads: { ...(benchmarks||{}), cpa_max: parseFloat(e.target.value||'0') }, email: emailBenchmarks };
                    saveAnomalyThresholds(next);
                    setBenchmarks(next.ads);
                  }} className="w-full px-3 py-2 border border-gray-300 rounded" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-1">Email: Delivery min (%)</label>
                  <input type="number" defaultValue={emailBenchmarks?.delivery_min ?? 95} onBlur={(e)=>{
                    const next = { ads: benchmarks, email: { ...(emailBenchmarks||{}), delivery_min: parseFloat(e.target.value||'0') } };
                    saveAnomalyThresholds(next);
                    setEmailBenchmarks(next.email);
                  }} className="w-full px-3 py-2 border border-gray-300 rounded" />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Email: Open rate min (%)</label>
                  <input type="number" defaultValue={emailBenchmarks?.open_rate_min ?? 20} onBlur={(e)=>{
                    const next = { ads: benchmarks, email: { ...(emailBenchmarks||{}), open_rate_min: parseFloat(e.target.value||'0') } };
                    saveAnomalyThresholds(next);
                    setEmailBenchmarks(next.email);
                  }} className="w-full px-3 py-2 border border-gray-300 rounded" />
                </div>
              </div>
              <div className="text-xs text-gray-500">These thresholds control anomaly flags across campaigns. Values are saved locally and will be moved to backend when available.</div>
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button onClick={()=>setShowThresholdsModal(false)} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Done</button>
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Goal</label>
                    <select defaultValue={selectedCampaign.goal || ''} className="w-full px-3 py-2 border border-gray-300 rounded">
                      <option value="">Select goal</option>
                      {goalOptions.map(g => (<option key={g.id} value={g.id}>{g.label}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Goal Target (number)</label>
                    <input type="number" defaultValue={selectedCampaign.goal_target || ''} className="w-full px-3 py-2 border border-gray-300 rounded" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Audience</label>
                    <textarea value={settingsFields?.targetAudience || ''} onChange={(e) => setSettingsFields(prev => ({ ...prev, targetAudience: e.target.value }))} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Geography</label>
                      <select value={settingsFields?.geo || 'All Locations'} onChange={(e) => setSettingsFields(prev => ({ ...prev, geo: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded">
                        <option>All Locations</option>
                        <option>United States</option>
                        <option>United Kingdom</option>
                        <option>European Union</option>
                        <option>South Africa</option>
                        <option>Custom (AI Recommended)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Placements</label>
                      <select value={settingsFields?.placements || 'Automatic'} onChange={(e) => setSettingsFields(prev => ({ ...prev, placements: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded">
                        <option>Automatic</option>
                        <option>Feeds only</option>
                        <option>Stories/Reels</option>
                        <option>Search</option>
                        <option>Display</option>
                        <option>YouTube</option>
                        <option>Custom (AI Recommended)</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Optimization Goal</label>
                      <select value={settingsFields?.optimization_goal || 'Conversions'} onChange={(e) => setSettingsFields(prev => ({ ...prev, optimization_goal: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded">
                        <option>Conversions</option>
                        <option>Leads</option>
                        <option>Traffic</option>
                        <option>Engagement</option>
                        <option>Video Views</option>
                        <option>Reach</option>
                        <option>AI Recommended</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bid Strategy</label>
                      <select value={settingsFields?.bid_strategy || 'Lowest Cost'} onChange={(e) => setSettingsFields(prev => ({ ...prev, bid_strategy: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded">
                        <option>Lowest Cost</option>
                        <option>Cost Cap</option>
                        <option>Bid Cap</option>
                        <option>Target ROAS</option>
                        <option>AI Recommended</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              {/* Thresholds (global) */}
              <div className="border-t pt-6">
                <div className="text-sm font-medium text-gray-900 mb-3">Anomaly Thresholds (Global)</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <label className="block text-gray-700 mb-1">CTR min (%)</label>
                    <input type="number" defaultValue={benchmarks?.ctr_min ?? 1.0} onBlur={(e)=>{
                      const next = { ads: { ...(benchmarks||{}), ctr_min: parseFloat(e.target.value||'0') }, email: emailBenchmarks };
                      saveAnomalyThresholds(next);
                      setBenchmarks(next.ads);
                    }} className="w-full px-3 py-2 border border-gray-300 rounded" />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">ROAS min (x)</label>
                    <input type="number" defaultValue={benchmarks?.roas_min ?? 2.0} onBlur={(e)=>{
                      const next = { ads: { ...(benchmarks||{}), roas_min: parseFloat(e.target.value||'0') }, email: emailBenchmarks };
                      saveAnomalyThresholds(next);
                      setBenchmarks(next.ads);
                    }} className="w-full px-3 py-2 border border-gray-300 rounded" />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">CPA max ($)</label>
                    <input type="number" defaultValue={benchmarks?.cpa_max ?? 50} onBlur={(e)=>{
                      const next = { ads: { ...(benchmarks||{}), cpa_max: parseFloat(e.target.value||'0') }, email: emailBenchmarks };
                      saveAnomalyThresholds(next);
                      setBenchmarks(next.ads);
                    }} className="w-full px-3 py-2 border border-gray-300 rounded" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end">
                <button onClick={() => {
                  const payload = {
                    name: settingsFields?.name,
                    budget: settingsFields?.budget,
                    startDate: settingsFields?.startDate ? new Date(settingsFields.startDate).toISOString() : selectedCampaign.startDate,
                    duration: settingsFields?.duration,
                    objective: settingsFields?.objective,
                    targetAudience: settingsFields?.targetAudience,
                    geo: settingsFields?.geo,
                    placements: settingsFields?.placements,
                    optimization_goal: settingsFields?.optimization_goal,
                    bid_strategy: settingsFields?.bid_strategy,
                    goal: document.querySelector('select[value="'+(selectedCampaign.goal||'')+'"]')?.value || selectedCampaign.goal,
                    goal_target: parseFloat(document.querySelector('input[type="number"][value="'+(selectedCampaign.goal_target||'')+'"]')?.value) || selectedCampaign.goal_target,
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

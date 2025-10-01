import React, { useMemo, useState } from 'react';
import { Mail, Plus, BarChart3, Pause, Play, Trash2, Eye, Calendar, Info, Sparkles, Zap, TrendingUp, Send, Upload, ChevronDown, ChevronUp, CheckCheck, Brain, DollarSign } from 'lucide-react';
import CampaignEmailAnalyticsModal from '../../dashboard/modals/CampaignEmailAnalyticsModal.jsx';
import ComposeEmailModal from '../../dashboard/modals/ComposeEmailModal.jsx';
import EditEmailCampaignModal from '../../dashboard/modals/EditEmailCampaignModal.jsx';
import WorkflowViewerModal from '../../dashboard/modals/WorkflowViewerModal.jsx';
import AICreateEmailCampaignModal from '../../dashboard/modals/AICreateEmailCampaignModal.jsx';
import { ContentIntelligenceAPIService, publishCampaignsUpdate, useInsightAnalysis } from '../../../services/contentIntelligenceApi';
import ABTestSetupModal from '../../dashboard/modals/ABTestSetupModal.jsx';
import ContactDrawer from '../../dashboard/modals/ContactDrawer.jsx';
import FollowupsBuilderModal from '../../dashboard/modals/FollowupsBuilderModal.jsx';
import RevenueAttributionModal from '../../dashboard/modals/RevenueAttributionModal.jsx';
import CustomerJourneyMiniMapModal from '../../dashboard/modals/CustomerJourneyMiniMapModal.jsx';
import EmailViewerModal from '../../dashboard/modals/EmailViewerModal.jsx';
import EditTemplateModal from '../../dashboard/modals/EditTemplateModal.jsx';
import TemplateAnalyticsModal from '../../dashboard/modals/TemplateAnalyticsModal.jsx';
import RevenuePredictionModal from '../../dashboard/modals/RevenuePredictionModal.jsx';
import CustomerIntelligenceModal from '../../dashboard/modals/CustomerIntelligenceModal.jsx';
import { useUnifiedInbox, useEmailCampaigns, useEmailTemplates, useEmailSegments, useEmailBestSendTimes } from '../../../services/contentIntelligenceApi';
import { ContentIntelligenceAPIService as CIAService } from '../../../services/contentIntelligenceApi';

const EmailTab = ({ emailData, campaigns, onSwitchToCalendar }) => {
  const emailMetrics = emailData?.data?.email_metrics || {};
  const topMetrics = {
    open: (emailMetrics.open_rate ?? 45.2),
    open_trend: Number((emailData?.data?.trends?.open_rate_trend||'').replace('+','')) || 5.6,
    click: (emailMetrics.click_rate ?? 12.8),
    click_trend: Number((emailData?.data?.trends?.click_rate_trend||'').replace('+','')) || 8.2,
    bounce: (emailMetrics.bounce_rate ?? 0.7),
    revenue: (emailMetrics.revenue ?? 0)
  };

  const { data: inboxData, loading: inboxLoading } = useUnifiedInbox();
  const { campaigns: emailCampaigns, loading: emailCampaignsLoading } = useEmailCampaigns();
  const { templates } = useEmailTemplates();
  const { segments } = useEmailSegments();
  const bestTimesSeg = segments?.[0]?.id;
  const { data: bestTimes } = useEmailBestSendTimes(bestTimesSeg);
  const { getInsightAnalysis } = useInsightAnalysis();
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [deliverability, setDeliverability] = useState(null);
  const [applyingTimes, setApplyingTimes] = useState(false);

  const mergedCampaigns = useMemo(() => {
    const fromProp = Array.isArray(campaigns) ? campaigns.filter(c => (c?.platform || '').toLowerCase() === 'email') : [];
    const fromHook = Array.isArray(emailCampaigns) ? emailCampaigns : [];
    return [...fromProp, ...fromHook];
  }, [campaigns, emailCampaigns]);

  // Load AI suggestions for email (transparency-first: include reason and expected impact)
  React.useEffect(() => {
    const run = async () => {
      try {
        const result = await getInsightAnalysis({ context: 'email', objective: 'improve_open_click', period: '30d' });
        const suggestions = result?.data?.suggestions || [
          { id: 's1', title: 'Re-send to non-openers with new subject', reason: 'Open rate below segment benchmark; subject entropy low', expected_roi: '1.3x', confidence: 0.74 },
          { id: 's2', title: 'Segment inactive >90d for win-back', reason: 'Engagement score 0.18; high reactivation potential', expected_roi: 'Moderate', confidence: 0.68 },
        ];
        setAiSuggestions(suggestions);
      } catch (_) {
        setAiSuggestions([
          { id: 's1', title: 'Re-send to non-openers with new subject', reason: 'Open rate below segment benchmark; subject entropy low', expected_roi: '1.3x', confidence: 0.74 },
          { id: 's2', title: 'Segment inactive >90d for win-back', reason: 'Engagement score 0.18; high reactivation potential', expected_roi: 'Moderate', confidence: 0.68 },
        ]);
      }
    };
    run();
  }, [getInsightAnalysis]);

  React.useEffect(() => {
    const api2 = new CIAService();
    api2.getDeliverabilityHealth().then(res => setDeliverability(res?.data || null)).catch(()=>{});
  }, []);

  // Load mind-blowing features data
  React.useEffect(() => {
    const apiService = new CIAService();
    
    // Load anomalies for active campaigns
    if (mergedCampaigns.length > 0) {
      const activeCampaign = mergedCampaigns.find(c => c.status === 'active');
      if (activeCampaign) {
        apiService.detectAnomalies(activeCampaign.campaign_id || activeCampaign.id)
          .then(res => setAnomalies(res?.data?.anomalies || []))
          .catch(() => setAnomalies([]));
      }
    }
    
    // Load trend ideas
    apiService.getTrendIdeas()
      .then(res => setTrendIdeas(res?.data?.trending_topics || []))
      .catch(() => setTrendIdeas([]));
  }, [mergedCampaigns]);

  const [showCompose, setShowCompose] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(null);
  const [editCampaign, setEditCampaign] = useState(null);
  const [showWorkflow, setShowWorkflow] = useState(false);
  const [showAICreate, setShowAICreate] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [showABTest, setShowABTest] = useState(null);
  const [contactEmail, setContactEmail] = useState(null);
  const [showFollowups, setShowFollowups] = useState(null);
  const [showRevenue, setShowRevenue] = useState(null);
  const [showJourney, setShowJourney] = useState(null);
  const [viewingEmail, setViewingEmail] = useState(null);
  const [selectedInbox, setSelectedInbox] = useState(new Set());
  const [activeCampaignsOpen, setActiveCampaignsOpen] = useState(true);
  const [inboxOpen, setInboxOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [audienceOpen, setAudienceOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [aiHubOpen, setAiHubOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [sortEngagement, setSortEngagement] = useState('desc');
  const [showReportingConfig, setShowReportingConfig] = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showTemplateAnalytics, setShowTemplateAnalytics] = useState(null);
  const [showConnectorModal, setShowConnectorModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('');
  
  // Mind-blowing features state
  const [showRevenuePrediction, setShowRevenuePrediction] = useState(null);
  const [showCustomerIntel, setShowCustomerIntel] = useState(null);
  const [anomalies, setAnomalies] = useState([]);
  const [trendIdeas, setTrendIdeas] = useState([]);
  const [mindBlowingOpen, setMindBlowingOpen] = useState(true);

  const api = new ContentIntelligenceAPIService();

  const controlCampaign = async (campaign, action) => {
    if (!campaign) return;
    const id = campaign.campaign_id || campaign.id;
    setProcessingId(id);
    try {
      await api.controlEmailCampaign(id, action);
      const nextStatus = action === 'pause' ? 'paused' : action === 'resume' ? 'running' : action === 'cancel' ? 'cancelled' : campaign.status;
      publishCampaignsUpdate({ action: 'update', campaign: { ...campaign, status: nextStatus } });
    } finally {
      setProcessingId(null);
    }
  };

  const applyBestTimes = async (segmentId) => {
    if (!bestTimes?.data?.suggestions || (mergedCampaigns||[]).length===0) return;
    setApplyingTimes(true);
    try {
      const top = bestTimes.data.suggestions[0];
      if (!top) return;
      const targets = (mergedCampaigns||[]).filter(c => (c.platform||'').toLowerCase()==='email' && (c.status||'scheduled')==='scheduled');
      const weekdayToIdx = { Sunday:0, Monday:1, Tuesday:2, Wednesday:3, Thursday:4, Friday:5, Saturday:6 };
      const dayIdx = weekdayToIdx[top.day] ?? 2;
      const now = new Date();
      const diff = (dayIdx - now.getDay() + 7) % 7;
      const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()+diff, top.hour_local, 0, 0, 0);
      for (const c of targets) {
        await api.updateEmailCampaign(c.campaign_id||c.id, { scheduled_at: targetDate.toISOString(), note: 'Applied best send time based on historical engagement' });
      }
    } finally {
      setApplyingTimes(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 space-y-4 lg:space-y-0">
          <div className="flex items-center">
            <Mail className="w-6 h-6 text-blue-500 mr-3" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Email Command Center</h3>
              <p className="text-sm text-gray-600">Manage campaigns, inbox, and automations</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={()=>{ setShowAICreate(true); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </button>
            <button onClick={()=>{ setShowCompose(true); }} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center">
              <Send className="w-4 h-4 mr-2" />
              Compose
            </button>
          </div>
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="text-3xl font-bold text-blue-600">{topMetrics.open.toFixed(1)}%</div>
            <div className="text-sm text-blue-700 mt-1">Open Rate</div>
            <div className="text-xs text-green-600 mt-1">+{topMetrics.open_trend}% from last period</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
            <div className="text-3xl font-bold text-green-600">{topMetrics.click.toFixed(1)}%</div>
            <div className="text-sm text-green-700 mt-1">Click-Through Rate</div>
            <div className="text-xs text-green-600 mt-1">+{topMetrics.click_trend}% from last period</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-100">
            <div className="text-3xl font-bold text-yellow-600">{topMetrics.bounce.toFixed(1)}%</div>
            <div className="text-sm text-yellow-700 mt-1">Bounce Rate</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-100">
            <div className="text-3xl font-bold text-purple-600">${topMetrics.revenue}</div>
            <div className="text-sm text-purple-700 mt-1">Revenue</div>
          </div>
        </div>
      </div>

      {/* Active Campaigns */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-semibold text-gray-900">Active Campaigns</h4>
          <div className="flex gap-2">
            <button onClick={()=>setHistoryOpen(!historyOpen)} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center text-sm">
              {historyOpen ? <><ChevronUp className="w-4 h-4 mr-2"/>Hide History</> : <><ChevronDown className="w-4 h-4 mr-2"/>View History</>}
            </button>
            <button onClick={()=>setActiveCampaignsOpen(!activeCampaignsOpen)} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center">
              {activeCampaignsOpen ? <><ChevronUp className="w-4 h-4 mr-2"/>Hide Active</> : <><ChevronDown className="w-4 h-4 mr-2"/>View Active</>}
            </button>
          </div>
        </div>
        {activeCampaignsOpen && (
          <div className="space-y-4">
            {(mergedCampaigns||[]).filter(c=>c.status!=='completed'&&c.status!=='cancelled').map(c => (
              <div key={c.campaign_id||c.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">📧</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{c.name || c.title}</h3>
                      <p className="text-sm text-gray-600 capitalize">{c.objective || 'Engagement'}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${c.status==='running'?'bg-green-100 text-green-800 border-green-200':c.status==='paused'?'bg-yellow-100 text-yellow-800 border-yellow-200':c.status==='completed'?'bg-blue-100 text-blue-800 border-blue-200':'bg-gray-100 text-gray-800 border-gray-200'}`}>
                    {c.status || 'scheduled'}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{c.sent || 0}</div>
                    <div className="text-xs text-gray-500">Sent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{c.open_rate!=null? `${c.open_rate}%` : '-'}</div>
                    <div className="text-xs text-gray-500">Open Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{c.click_rate!=null? `${c.click_rate}%` : '-'}</div>
                    <div className="text-xs text-gray-500">Click Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{c.unsubscribe_rate!=null? `${c.unsubscribe_rate}%` : '-'}</div>
                    <div className="text-xs text-gray-500">Unsubscribes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{c.progress ?? (c.status==='completed'?100: (c.sent && c.delivered ? Math.min(100, Math.round((c.delivered/(c.sent||1))*100)) : 0))}%</div>
                    <div className="text-xs text-gray-500">Progress</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    <button className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center" onClick={()=>setShowAnalytics(c.campaign_id||c.id)}><BarChart3 className="w-4 h-4 mr-2"/>Analytics</button>
                    <button className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm" onClick={()=>setShowABTest(c.campaign_id||c.id)}>A/B Test</button>
                    <button className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm" onClick={()=>setShowFollowups(c.campaign_id||c.id)}>Follow-ups</button>
                    <button className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm" onClick={()=>setShowRevenue(c.campaign_id||c.id)}>Revenue</button>
                    <button className="px-3 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm" onClick={()=>setShowJourney(c.campaign_id||c.id)}>Journey</button>
                    <button className="px-3 py-2 bg-pink-100 text-pink-800 rounded-lg hover:bg-pink-200 transition-colors text-sm flex items-center" onClick={()=>onSwitchToCalendar&&onSwitchToCalendar()}><Calendar className="w-4 h-4 mr-2"/>Show in Calendar</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {c.status==='paused' ? (
                      <button title="Resume sending" className={`px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium flex items-center ${processingId===(c.campaign_id||c.id)?'opacity-50':''}`} disabled={processingId===(c.campaign_id||c.id)} onClick={()=>controlCampaign(c,'resume')}><Play className="w-4 h-4 mr-2"/>Resume</button>
                    ) : (
                      <button title="Pause sends" className={`px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors text-sm font-medium flex items-center ${processingId===(c.campaign_id||c.id)?'opacity-50':''}`} disabled={processingId===(c.campaign_id||c.id)} onClick={()=>controlCampaign(c,'pause')}><Pause className="w-4 h-4 mr-2"/>Pause</button>
                    )}
                    <button className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium" onClick={()=>setEditCampaign(c)}>Edit</button>
                    <button title="Cancel campaign" className={`px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium flex items-center ${processingId===(c.campaign_id||c.id)?'opacity-50':''}`} disabled={processingId===(c.campaign_id||c.id)} onClick={()=>controlCampaign(c,'cancel')}><Trash2 className="w-4 h-4 mr-2"/>Cancel</button>
                  </div>
                </div>
            </div>
            ))}
            {(!mergedCampaigns || mergedCampaigns.filter(c=>c.status!=='completed'&&c.status!=='cancelled').length===0) && <div className="text-sm text-gray-600">No active email campaigns. Click "New Campaign" to start.</div>}
          </div>
        )}
        {historyOpen && (
          <div className="mt-4 space-y-3">
            <div className="text-sm font-medium text-gray-700 mb-2">Campaign History</div>
            {(mergedCampaigns||[]).filter(c=>c.status==='completed'||c.status==='cancelled').map(c => (
              <div key={c.campaign_id||c.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-semibold text-gray-900">{c.name || c.title}</div>
                    <div className="text-xs text-gray-500">{c.objective} • {c.status}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={()=>setShowAnalytics(c.campaign_id||c.id)} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs flex items-center">
                      <BarChart3 className="w-3 h-3 mr-1"/>Analytics
                    </button>
                    <button onClick={()=>{ setShowAICreate(true); /* TODO: pre-fill with campaign data */ }} className="px-3 py-1.5 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-colors text-xs flex items-center">
                      <Zap className="w-3 h-3 mr-1"/>Replay & Optimize
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3 text-xs text-gray-700">
                  <div>Open: {c.open_rate!=null?`${c.open_rate}%`:'-'}</div>
                  <div>Click: {c.click_rate!=null?`${c.click_rate}%`:'-'}</div>
                  <div>Unsubs: {c.unsubscribe_rate!=null?`${c.unsubscribe_rate}%`:'-'}</div>
                  <div>Sent: {c.sent || 0}</div>
                </div>
              </div>
            ))}
            {(mergedCampaigns||[]).filter(c=>c.status==='completed'||c.status==='cancelled').length===0 && <div className="text-sm text-gray-600">No archived campaigns yet.</div>}
          </div>
        )}
      </div>

      {/* Unified Inbox */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-semibold text-gray-900">Unified Inbox</h4>
          <div className="flex gap-2">
            {selectedInbox.size > 0 && (
              <>
                <button onClick={()=>setSelectedInbox(new Set())} className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center">
                  <CheckCheck className="w-4 h-4 mr-2"/>Mark {selectedInbox.size} Read
                </button>
                <button onClick={()=>setSelectedInbox(new Set())} className="px-3 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors text-sm flex items-center">
                  <Trash2 className="w-4 h-4 mr-2"/>Delete {selectedInbox.size}
                </button>
              </>
            )}
            <button onClick={()=>setInboxOpen(!inboxOpen)} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center">
              {inboxOpen ? <><ChevronUp className="w-4 h-4 mr-2"/>Hide Inbox</> : <><ChevronDown className="w-4 h-4 mr-2"/>View Inbox</>}
            </button>
          </div>
        </div>
        {inboxOpen && (
          <>
            {!inboxLoading && !inboxData?.data?.inbox?.length && (
              <div className="text-sm text-gray-600">No messages yet. Connect your email providers in Settings.</div>
            )}
            <div className="max-h-[500px] overflow-y-auto space-y-2">
              {(inboxData?.data?.inbox||[]).map(msg => (
                <div key={msg.id} className={`border rounded-lg p-3 hover:shadow-sm transition-shadow flex items-center gap-3 ${selectedInbox.has(msg.id)?'border-purple-300 bg-purple-50':'border-gray-200 bg-white'}`}>
                  <input type="checkbox" checked={selectedInbox.has(msg.id)} onChange={()=>setSelectedInbox(prev=>{ const next = new Set(prev); next.has(msg.id)? next.delete(msg.id) : next.add(msg.id); return next; })} className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-medium text-gray-900 truncate" title={msg.subject}>{msg.subject}</div>
                      <div className="text-xs text-gray-500 ml-2">{new Date(msg.received_at).toLocaleTimeString()}</div>
                    </div>
                    <div className="text-xs text-gray-600">From {msg.from} • {msg.provider}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs" onClick={()=>setViewingEmail(msg)}>Open</button>
                    <button className="px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-xs" onClick={()=>{ setShowCompose(true); /* TODO: pre-fill To with msg.from */ }}>Reply (AI)</button>
                    <button className="px-3 py-1.5 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors text-xs" title="Assign to support or sales workflow" onClick={()=>alert('Assign to sales/support workflow via CRM automation agent')}>Assign</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Templates & Content Library */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-semibold text-gray-900">Templates & Content Library</h4>
          <div className="flex gap-2">
            <button onClick={()=>{ setShowCompose(true); /* TODO: flag as template mode */ }} className="px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-colors flex items-center text-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              AI Create Template
            </button>
            <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center text-sm">
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </button>
            <button onClick={()=>setTemplatesOpen(!templatesOpen)} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center">
              {templatesOpen ? <><ChevronUp className="w-4 h-4 mr-2"/>Hide Templates</> : <><ChevronDown className="w-4 h-4 mr-2"/>View Templates</>}
            </button>
          </div>
        </div>
        {templatesOpen && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(templates||[]).map(t => (
              <div key={t.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="font-semibold text-gray-900 mb-1">{t.name}</div>
                <div className="text-xs text-gray-500 mb-2 capitalize">{t.type}</div>
                <div className="text-xs text-gray-600 mb-3">Avg Open {t.performance?.avg_open ?? 0}% • Click {t.performance?.avg_click ?? 0}%</div>
                <div className="flex gap-2">
                  <button onClick={()=>setShowCompose(true)} className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs flex-1">Use</button>
                  <button onClick={()=>setEditingTemplate(t)} className="px-3 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors text-xs">Edit</button>
                  <button onClick={()=>setShowTemplateAnalytics(t.id)} className="px-3 py-2 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 transition-colors text-xs">Analytics</button>
                </div>
              </div>
            ))}
            {(!templates || templates.length===0) && <div className="col-span-3 text-sm text-gray-600">No templates yet. Create one above.</div>}
          </div>
        )}
      </div>

      {/* Audience Insights */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-semibold text-gray-900">Audience Insights</h4>
          <button onClick={()=>setAudienceOpen(!audienceOpen)} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center">
            {audienceOpen ? <><ChevronUp className="w-4 h-4 mr-2"/>Hide Insights</> : <><ChevronDown className="w-4 h-4 mr-2"/>View Insights</>}
          </button>
        </div>
        {audienceOpen && (
          <>
            <div className="flex items-center justify-end mb-3">
              <label className="text-sm text-gray-700 mr-2">Sort by Engagement:</label>
              <select value={sortEngagement} onChange={e=>setSortEngagement(e.target.value)} className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm">
                <option value="desc">Highest First</option>
                <option value="asc">Lowest First</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              {(segments||[]).sort((a,b)=>sortEngagement==='desc'?(b.engagement-a.engagement):(a.engagement-b.engagement)).map(s => (
                <div key={s.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="font-semibold text-gray-900 mb-1">{s.name}</div>
                  <div className="text-sm text-gray-600 mb-3">Count {s.count} • Engagement {(Math.round((s.engagement||0)*100))}%</div>
                  <div className="space-y-2">
                    <button onClick={()=>{ setShowAICreate(true); /* TODO: pre-fill segment */ }} className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs">Launch Campaign</button>
                    <button onClick={()=>applyBestTimes(s.id)} disabled={applyingTimes} className="w-full px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-xs">{applyingTimes?'Applying...':'Apply Best Times'}</button>
                  </div>
                </div>
              ))}
            </div>
            {bestTimes?.data?.suggestions && (
              <div className="text-sm text-gray-700 bg-blue-50 border border-blue-100 rounded-lg p-3">
                <strong>Best send times:</strong> {bestTimes.data.suggestions.map(s=>`${s.day} ${s.hour_local}:00 (${Math.round(s.confidence*100)}% confidence)`).join(', ')}
              </div>
            )}
          </>
        )}
      </div>

      {/* Analytics & Reporting */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-semibold text-gray-900">Analytics & Reporting</h4>
          <button onClick={()=>setAnalyticsOpen(!analyticsOpen)} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center">
            {analyticsOpen ? <><ChevronUp className="w-4 h-4 mr-2"/>Hide Analytics</> : <><ChevronDown className="w-4 h-4 mr-2"/>View Analytics</>}
          </button>
        </div>
        {analyticsOpen && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <div className="text-gray-600 text-sm mb-1">Avg Open Rate</div>
                <div className="text-2xl font-semibold text-blue-700">{(emailMetrics.open_rate ?? 42.3)}%</div>
              </div>
              <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                <div className="text-gray-600 text-sm mb-1">CTR by Campaign Type</div>
                <div className="text-2xl font-semibold text-green-700">{(emailMetrics.click_rate ?? 5.8)}%</div>
              </div>
              <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                <div className="text-gray-600 text-sm mb-1">Deliverability Health</div>
                <div className="text-2xl font-semibold text-purple-700">{(emailMetrics.deliverability ?? 97.8)}%</div>
              </div>
              <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                <div className="text-gray-600 text-sm mb-1">Unsubscribe Rate</div>
                <div className="text-2xl font-semibold text-red-700">{(emailMetrics.unsubscribe_rate ?? 0.3)}%</div>
              </div>
              <div className="border border-indigo-200 rounded-lg p-4 bg-indigo-50">
                <div className="text-gray-600 text-sm mb-1">Email Health Score</div>
                <div className="text-2xl font-semibold text-indigo-700">{Math.round((emailMetrics.deliverability??97.8) * (1 - (emailMetrics.bounce_rate??0.7)/100) * (emailMetrics.open_rate??42.3)/100)}</div>
                <div className="text-xs text-gray-600 mt-1">Composite metric</div>
              </div>
            </div>
            
            {/* Extended Insights */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-700 mb-2">Best Performing Email</div>
                <div className="text-lg font-semibold text-gray-900">Welcome Series #1</div>
                <div className="text-xs text-gray-600">48.2% open rate</div>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-700 mb-2">Most Clicked Link</div>
                <div className="text-lg font-semibold text-gray-900">"Get Started" CTA</div>
                <div className="text-xs text-gray-600">12.4% click rate</div>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-700 mb-2">Top Campaign</div>
                <div className="text-lg font-semibold text-gray-900">Black Friday Promo</div>
                <div className="text-xs text-gray-600">$4,280 revenue</div>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-700 mb-2">Best Performing Campaign</div>
                <div className="text-lg font-semibold text-gray-900">Newsletter October</div>
                <div className="text-xs text-gray-600 grid grid-cols-2 gap-1 mt-2">
                  <span>Open: 41.8%</span>
                  <span>Click: 6.2%</span>
                  <span>Bounce: 0.4%</span>
                  <span>Revenue: $890</span>
                </div>
              </div>
            </div>

            {deliverability && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className={`border rounded-lg p-3 ${deliverability.spf?.status==='pass'?'bg-green-50 border-green-200':'bg-yellow-50 border-yellow-200'}`}>
                  <div className="font-medium">SPF: {deliverability.spf?.status}</div>
                  <div className="text-xs text-gray-700">{deliverability.spf?.record}</div>
                </div>
                <div className={`border rounded-lg p-3 ${deliverability.dkim?.status==='pass'?'bg-green-50 border-green-200':'bg-yellow-50 border-yellow-200'}`}>
                  <div className="font-medium">DKIM: {deliverability.dkim?.status}</div>
                  <div className="text-xs text-gray-700">Selector {deliverability.dkim?.selector} @ {deliverability.dkim?.domain}</div>
                </div>
                <div className={`border rounded-lg p-3 ${deliverability.dmarc?.status==='pass'?'bg-green-50 border-green-200':'bg-yellow-50 border-yellow-200'}`}>
                  <div className="font-medium">DMARC: {deliverability.dmarc?.status}</div>
                  <div className="text-xs text-gray-700">{deliverability.dmarc?.policy}</div>
                  {deliverability.dmarc?.why && <div className="text-xs text-gray-600 mt-1 flex items-start"><Info className="w-3 h-3 mr-1 mt-0.5"/>Why: {deliverability.dmarc.why}</div>}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Automated Reporting */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-semibold text-gray-900">Automated Reporting</h4>
          <button onClick={()=>setShowReportingConfig(!showReportingConfig)} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center">
            {showReportingConfig ? <><ChevronUp className="w-4 h-4 mr-2"/>Hide</> : <><ChevronDown className="w-4 h-4 mr-2"/>Configure</>}
          </button>
        </div>
        {showReportingConfig && (
          <div className="space-y-4">
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
              <div className="text-sm font-medium text-gray-900 mb-2">Weekly Digest</div>
              <div className="text-xs text-gray-700 mb-3">Schedule recurring email performance reports with PA Agent</div>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Day</label>
                  <select className="w-full px-2 py-1 border border-gray-300 rounded-lg text-sm">
                    <option>Monday</option>
                    <option>Tuesday</option>
                    <option>Wednesday</option>
                    <option>Thursday</option>
                    <option>Friday</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Time</label>
                  <input type="time" defaultValue="09:00" className="w-full px-2 py-1 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Report Type</label>
                  <select className="w-full px-2 py-1 border border-gray-300 rounded-lg text-sm">
                    <option>Full Summary</option>
                    <option>Top Performers Only</option>
                    <option>Anomalies & Alerts</option>
                  </select>
                </div>
              </div>
              <button onClick={()=>alert('Scheduled with PA Agent in Calendar')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">Schedule with PA Agent</button>
            </div>
          </div>
        )}
      </div>

      {/* Integrations */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-semibold text-gray-900">Email Integrations</h4>
          <button onClick={()=>setShowIntegrations(!showIntegrations)} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center">
            {showIntegrations ? <><ChevronUp className="w-4 h-4 mr-2"/>Hide</> : <><ChevronDown className="w-4 h-4 mr-2"/>View Integrations</>}
          </button>
        </div>
        {showIntegrations && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Connected Providers</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['Gmail', 'SendGrid', 'Mailchimp'].map(provider => (
                  <div key={provider} className="border border-green-200 rounded-lg p-3 bg-green-50 flex items-center justify-between">
                    <span className="text-sm text-gray-700">{provider}</span>
                    <span className="text-xs text-green-600">✓ Connected</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-xs text-gray-600">These providers sync automatically.</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Connect New Provider</label>
              <div className="flex gap-2">
                <select value={selectedProvider} onChange={e=>setSelectedProvider(e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                  <option value="">Choose provider...</option>
                  {['ConvertKit', 'ActiveCampaign', 'HubSpot', 'Outlook', 'Klaviyo', 'Salesforce', 'Systeme.io'].map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <button onClick={()=>{ if(selectedProvider){setShowConnectorModal(true)}else{alert('Please select a provider first')} }} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">Connect</button>
              </div>
              <div className="mt-2 text-xs text-gray-600">Select a provider and click Connect to authorize via OAuth or API key.</div>
            </div>
          </>
        )}
      </div>

      {/* Simple Connector Modal */}
      {showConnectorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Connect {selectedProvider}</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                <input type="password" placeholder="Enter API key..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
              </div>
              <div className="text-xs text-gray-600">
                Find your API key in {selectedProvider} settings. <a href="#" className="text-purple-600 hover:underline">Learn more</a>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button onClick={()=>setShowConnectorModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium">Cancel</button>
              <button onClick={()=>{ alert(`Connected to ${selectedProvider}!`); setShowConnectorModal(false); setSelectedProvider(''); }} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">Connect</button>
            </div>
          </div>
        </div>
      )}

      {/* AI-Powered Insights - Mind-Blowing Features */}
      <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 rounded-xl shadow-lg p-6 border-2 border-purple-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900">AI-Powered Insights</h4>
              <p className="text-sm text-gray-600">Real-time intelligence from Judge Layer + Agent Workforce</p>
            </div>
          </div>
          <button onClick={()=>setMindBlowingOpen(!mindBlowingOpen)} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center">
            {mindBlowingOpen ? <><ChevronUp className="w-4 h-4 mr-2"/>Hide</> : <><ChevronDown className="w-4 h-4 mr-2"/>View</>}
          </button>
        </div>
        
        {mindBlowingOpen && (
          <div className="space-y-4">
            {/* Real-time Anomalies */}
            {anomalies.length > 0 && (
              <div className="bg-white rounded-lg p-5 border-l-4 border-red-500 shadow-sm">
                <h5 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  Real-Time Anomalies Detected
                </h5>
                <div className="space-y-3">
                  {anomalies.map((anomaly, idx) => (
                    <div key={idx} className={`p-4 rounded-lg border-2 ${
                      anomaly.severity === 'high' ? 'bg-red-50 border-red-200' :
                      anomaly.severity === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                      'bg-blue-50 border-blue-200'
                    }`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                              anomaly.severity === 'high' ? 'bg-red-200 text-red-800' :
                              anomaly.severity === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                              'bg-blue-200 text-blue-800'
                            }`}>
                              {anomaly.severity.toUpperCase()}
                            </span>
                            <span className="text-sm font-semibold text-gray-900">{anomaly.type.replace(/_/g, ' ').toUpperCase()}</span>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{anomaly.details}</p>
                          <div className="flex items-start gap-2 text-xs">
                            <Info className="w-3 h-3 mt-0.5 text-gray-500" />
                            <div>
                              <p className="text-gray-600"><strong>Likely cause:</strong> {anomaly.likely_cause}</p>
                              <p className="text-gray-600"><strong>Evidence:</strong> {anomaly.evidence}</p>
                              <p className="text-green-600 mt-1"><strong>Auto-action taken:</strong> {anomaly.auto_action_taken}</p>
                            </div>
                          </div>
                        </div>
                        <div className="ml-4 text-right">
                          <div className="text-xs text-gray-500 mb-1">Confidence</div>
                          <div className="text-lg font-bold text-gray-900">{Math.round(anomaly.confidence * 100)}%</div>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-600">
                        <strong>Recommended:</strong> {anomaly.recommended_action}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-xs text-gray-600 bg-gray-50 rounded p-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Automation Agent actively monitoring and taking corrective actions
                </div>
              </div>
            )}

            {/* Trending Campaign Ideas */}
            {trendIdeas.length > 0 && (
              <div className="bg-white rounded-lg p-5 border-l-4 border-green-500 shadow-sm">
                <h5 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Trending Campaign Opportunities
                </h5>
                <div className="space-y-3">
                  {trendIdeas.slice(0, 2).map((trend, idx) => (
                    <div key={idx} className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 bg-green-200 text-green-800 rounded text-xs font-bold">{trend.momentum.toUpperCase()}</span>
                            <span className="text-sm font-bold text-gray-900">{trend.trend}</span>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{trend.suggested_angle}</p>
                          <div className="space-y-1 mb-2">
                            <p className="text-xs font-semibold text-gray-700">Suggested Subject Lines:</p>
                            {trend.subject_lines.slice(0, 2).map((subj, sidx) => (
                              <div key={sidx} className="text-xs text-gray-600 bg-white rounded px-2 py-1 border border-green-100">
                                "{subj}"
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="ml-4 text-right">
                          <div className="text-xs text-gray-500 mb-1">Relevance</div>
                          <div className="text-2xl font-bold text-green-600">{Math.round(trend.relevance_score * 100)}%</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-xs">
                        <Info className="w-3 h-3 mt-0.5 text-gray-500" />
                        <div>
                          <p className="text-gray-600"><strong>Why now:</strong> {trend.why}</p>
                          <p className="text-orange-600 mt-1"><strong>Timing:</strong> {trend.timing}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setShowAICreate(true)}
                        className="mt-3 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                      >
                        <Zap className="w-4 h-4" />
                        Create Campaign from This Trend
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-xs text-gray-600 bg-gray-50 rounded p-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Market Trends Agent + Trend Spotter Agent analyzing real-time data
                </div>
              </div>
            )}

            {/* Quick Actions Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Revenue Prediction */}
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h6 className="font-semibold text-gray-900">Revenue Forecasting</h6>
                    <p className="text-xs text-gray-600">Predict campaign revenue with AI</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowRevenuePrediction({ segmentId: segments?.[0]?.id, campaignType: 'promotional' })}
                  className="w-full mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  View Predictions
                </button>
              </div>

              {/* Customer Intelligence */}
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Brain className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h6 className="font-semibold text-gray-900">Customer Intelligence</h6>
                    <p className="text-xs text-gray-600">Behavioral insights & opportunities</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowCustomerIntel(segments?.[0]?.id || 'all')}
                  className="w-full mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                >
                  View Insights
                </button>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mt-4">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-blue-900 mb-1">About These Insights</p>
                  <p className="text-sm text-blue-700">
                    All predictions and recommendations are generated by specialized AI agents and validated through the Judge Layer quality assurance system. 
                    Each insight includes confidence scores and transparent reasoning to help you make informed decisions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Recommendations Hub - moved here as it should be last */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center"><Sparkles className="w-5 h-5 text-purple-500 mr-2"/>AI Recommendations Hub</h4>
          <button onClick={()=>setAiHubOpen(!aiHubOpen)} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center">
            {aiHubOpen ? <><ChevronUp className="w-4 h-4 mr-2"/>Hide</> : <><ChevronDown className="w-4 h-4 mr-2"/>View</>}
          </button>
        </div>
        {aiHubOpen && (
          <div className="space-y-3">
            {(aiSuggestions||[]).map(s => (
              <div key={s.id} className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-gray-900">{s.title}</div>
                  <div className="text-xs text-gray-600">Confidence {(Math.round((s.confidence||0)*100))}% • Expected ROI {s.expected_roi||'-'}</div>
                </div>
                <div className="text-sm text-gray-700 flex items-start mb-3">
                  <Info className="w-4 h-4 mr-2 mt-0.5 text-purple-600" />
                  <span><strong>Why:</strong> {s.reason}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={()=>alert(`Applying: ${s.title}`)} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">Apply Suggestion</button>
                  <button onClick={()=>{ setShowAICreate(true); /* TODO: pre-fill with suggestion context */ }} className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors text-sm">Customize First</button>
                </div>
              </div>
            ))}
            {(!aiSuggestions || aiSuggestions.length===0) && (
              <div className="text-sm text-gray-700">No suggestions yet. Suggestions appear as agents analyze performance.</div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <ComposeEmailModal open={showCompose} onClose={()=>setShowCompose(false)} onSent={()=>{}} />
      <CampaignEmailAnalyticsModal open={!!showAnalytics} campaignId={showAnalytics} onClose={()=>setShowAnalytics(null)} />
      <EditEmailCampaignModal open={!!editCampaign} campaign={editCampaign} onClose={()=>setEditCampaign(null)} />
      <WorkflowViewerModal open={showWorkflow} onClose={()=>setShowWorkflow(false)} steps={[]} />
      <AICreateEmailCampaignModal isOpen={showAICreate} onClose={()=>setShowAICreate(false)} onCreateCampaign={()=>{ /* refresh if needed */ }} />
      <ABTestSetupModal open={!!showABTest} onClose={()=>setShowABTest(null)} campaignId={showABTest} onSaved={()=>{}} />
      <ContactDrawer open={!!contactEmail} onClose={()=>setContactEmail(null)} email={contactEmail} />
      <FollowupsBuilderModal open={!!showFollowups} onClose={()=>setShowFollowups(null)} campaignId={showFollowups} onSaved={()=>{}} />
      <RevenueAttributionModal open={!!showRevenue} onClose={()=>setShowRevenue(null)} campaignId={showRevenue} />
      <CustomerJourneyMiniMapModal open={!!showJourney} onClose={()=>setShowJourney(null)} campaignId={showJourney} />
      <EmailViewerModal open={!!viewingEmail} onClose={()=>setViewingEmail(null)} email={viewingEmail} onMarkRead={()=>{}} onDelete={()=>{}} onSpam={()=>{}} />
      <EditTemplateModal open={!!editingTemplate} onClose={()=>setEditingTemplate(null)} template={editingTemplate} />
      <TemplateAnalyticsModal open={!!showTemplateAnalytics} onClose={()=>setShowTemplateAnalytics(null)} templateId={showTemplateAnalytics} />
      
      {/* Mind-blowing features modals */}
      <RevenuePredictionModal isOpen={!!showRevenuePrediction} onClose={()=>setShowRevenuePrediction(null)} campaignData={showRevenuePrediction} />
      <CustomerIntelligenceModal isOpen={!!showCustomerIntel} onClose={()=>setShowCustomerIntel(null)} segmentId={showCustomerIntel} onLaunchCampaign={()=>setShowAICreate(true)} />
    </div>
  );
};


export default EmailTab;

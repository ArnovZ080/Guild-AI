import React, { useMemo, useState } from 'react';
import { Mail, Plus, BarChart3, Pause, Play, Trash2, Eye, Calendar, Info, Sparkles, Zap, TrendingUp, Send, Upload, ChevronDown, ChevronUp, CheckCheck, Brain } from 'lucide-react';
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
              <div key={c.campaign_id||c.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-semibold text-gray-900">{c.name || c.title}</div>
                    <div className="text-xs text-gray-500">{c.objective} • {c.status}</div>
                  </div>
                  <button onClick={()=>setShowAnalytics(c.campaign_id||c.id)} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs flex items-center">
                    <BarChart3 className="w-3 h-3 mr-1"/>View
                  </button>
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
                  <button className="px-3 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors text-xs">Edit</button>
                  <button className="px-3 py-2 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 transition-colors text-xs">Analytics</button>
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
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900">Automated Reporting</h4>
        </div>
        <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
          <div className="text-sm font-medium text-gray-900 mb-2">Weekly Digest</div>
          <div className="text-xs text-gray-700 mb-3">Every Monday at 9am, receive a summary of email performance trends, top campaigns, and actionable insights.</div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">Configure Schedule</button>
        </div>
      </div>

      {/* AI Recommendations Hub */}
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
    </div>
  );
};

export default EmailTab;

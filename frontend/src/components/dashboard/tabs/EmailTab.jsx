import React, { useMemo, useState } from 'react';
import { Mail, Plus, Settings, BarChart3, Pause, Play, Trash2, Eye, Calendar, Info } from 'lucide-react';
import CampaignEmailAnalyticsModal from '../../dashboard/modals/CampaignEmailAnalyticsModal.jsx';
import ComposeEmailModal from '../../dashboard/modals/ComposeEmailModal.jsx';
import EditEmailCampaignModal from '../../dashboard/modals/EditEmailCampaignModal.jsx';
import WorkflowViewerModal from '../../dashboard/modals/WorkflowViewerModal.jsx';
import AICreateEmailCampaignModal from '../../dashboard/modals/AICreateEmailCampaignModal.jsx';
import { ContentIntelligenceAPIService, publishCampaignsUpdate, useInsightAnalysis } from '../../../services/contentIntelligenceApi';
import ABTestSetupModal from '../../dashboard/modals/ABTestSetupModal.jsx';
import ContactDrawer from '../../dashboard/modals/ContactDrawer.jsx';
import { useUnifiedInbox, useEmailCampaigns, useEmailTemplates, useEmailSegments, useEmailBestSendTimes } from '../../../services/contentIntelligenceApi';
import { ContentIntelligenceAPIService as CIAService } from '../../../services/contentIntelligenceApi';

const Section = ({ title, defaultOpen = true, children, right }) => {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center space-x-2">
          <button onClick={()=>setOpen(!open)} className="text-sm font-semibold text-gray-900">{open ? '▾' : '▸'} {title}</button>
        </div>
        <div className="flex items-center space-x-2">{right}</div>
      </div>
      {open && (
        <div className="p-4">{children}</div>
      )}
    </div>
  );
};

const MetricCard = ({ label, value, trend, color }) => (
  <div className={`text-center p-4 rounded-lg ${color||'bg-gray-50'}`}>
    <div className="text-3xl font-bold text-gray-900 mb-1">{value}%</div>
    <p className="text-sm text-gray-700">{label}</p>
    {trend!=null && (<p className="text-xs text-green-600">+{trend}% from last period</p>)}
  </div>
);

const TopBar = ({ onNewCampaign, onCompose, onSettings, metrics }) => (
  <div className="bg-white rounded-lg shadow-lg p-4 flex items-center justify-between">
    <div className="flex items-center space-x-2">
      <Mail className="w-5 h-5 text-blue-600" />
      <span className="font-semibold">Emails Command Center</span>
    </div>
    <div className="hidden md:grid grid-cols-4 gap-3 flex-1 mx-6">
      <MetricCard label="Open Rate" value={metrics.open} trend={metrics.open_trend} color="bg-blue-50" />
      <MetricCard label="Click-Through" value={metrics.click} trend={metrics.click_trend} color="bg-green-50" />
      <MetricCard label="Bounce Rate" value={metrics.bounce} trend={null} color="bg-yellow-50" />
      <MetricCard label="Revenue" value={metrics.revenue} trend={null} color="bg-purple-50" />
    </div>
    <div className="flex items-center space-x-2">
      <button onClick={onNewCampaign} className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm flex items-center"><Plus className="w-4 h-4 mr-1"/>New Campaign</button>
      <button onClick={onCompose} className="px-3 py-2 bg-gray-900 text-white rounded-md text-sm">Compose</button>
      <button onClick={onSettings} className="p-2 border rounded-md"><Settings className="w-4 h-4"/></button>
    </div>
  </div>
);

const EmailTab = ({ emailData, campaigns }) => {
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
  const [showAnalytics, setShowAnalytics] = useState(null); // campaignId
  const [editCampaign, setEditCampaign] = useState(null);
  const [showWorkflow, setShowWorkflow] = useState(false);
  const [showAICreate, setShowAICreate] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [showABTest, setShowABTest] = useState(null); // campaignId
  const [contactEmail, setContactEmail] = useState(null);

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
      // Simple rule: take top suggestion and apply its weekday/hour to scheduled email campaigns
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
      <TopBar
        metrics={topMetrics}
        onNewCampaign={()=>{ setShowAICreate(true); }}
        onCompose={()=>{ setShowCompose(true); }}
        onSettings={()=>{ setShowWorkflow(true); }}
      />

      <Section title="Active Campaigns" defaultOpen right={
        <div className="flex items-center space-x-2 text-sm">
          <button className="px-2 py-1 border rounded" onClick={()=>setShowAnalytics(mergedCampaigns?.[0]?.campaign_id || mergedCampaigns?.[0]?.id)}>View Analytics</button>
          <button className="px-2 py-1 border rounded flex items-center" onClick={()=>setShowWorkflow(true)}><Calendar className="w-3 h-3 mr-1"/>Calendar</button>
        </div>
      }>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="py-2 pr-4">Campaign</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Progress</th>
                <th className="py-2 pr-4">Open</th>
                <th className="py-2 pr-4">CTR</th>
                <th className="py-2 pr-4">Unsubs</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(mergedCampaigns||[]).map(c => (
                <tr key={c.campaign_id||c.id} className="border-t">
                  <td className="py-2 pr-4">
                    <div className="font-medium">{c.name || c.title}</div>
                    <div className="text-xs text-gray-500">{c.objective || 'Engagement'}</div>
                  </td>
                  <td className="py-2 pr-4 capitalize">{c.status || 'scheduled'}</td>
                  <td className="py-2 pr-4">
                    <div className="w-40 h-2 bg-gray-200 rounded">
                      <div className="h-2 bg-blue-600 rounded" style={{width: `${c.progress ?? (c.status==='completed'?100: (c.sent && c.delivered ? Math.min(100, Math.round((c.delivered/(c.sent||1))*100)) : 0))}%`}} />
                    </div>
                  </td>
                  <td className="py-2 pr-4">{c.open_rate!=null? `${c.open_rate}%` : '-'}</td>
                  <td className="py-2 pr-4">{c.click_rate!=null? `${c.click_rate}%` : '-'}</td>
                  <td className="py-2 pr-4">{c.unsubscribe_rate!=null? `${c.unsubscribe_rate}%` : '-'}</td>
                  <td className="py-2 pr-4">
                    <div className="flex items-center space-x-2">
                      <button className="px-2 py-1 border rounded flex items-center" onClick={()=>setShowAnalytics(c.campaign_id||c.id)}><BarChart3 className="w-3 h-3 mr-1"/>Analytics</button>
                      <button className="px-2 py-1 border rounded flex items-center" onClick={()=>setShowABTest(c.campaign_id||c.id)}>A/B Test</button>
                      {c.status==='paused' ? (
                        <button title="Resume sending this campaign" className={`px-2 py-1 border rounded flex items-center ${processingId===(c.campaign_id||c.id)?'opacity-50':''}`} disabled={processingId===(c.campaign_id||c.id)} onClick={()=>controlCampaign(c,'resume')}><Play className="w-3 h-3 mr-1"/>Resume</button>
                      ) : (
                        <button title="Pause further sends" className={`px-2 py-1 border rounded flex items-center ${processingId===(c.campaign_id||c.id)?'opacity-50':''}`} disabled={processingId===(c.campaign_id||c.id)} onClick={()=>controlCampaign(c,'pause')}><Pause className="w-3 h-3 mr-1"/>Pause</button>
                      )}
                      <button className="px-2 py-1 border rounded flex items-center" onClick={()=>setEditCampaign(c)}>Edit</button>
                      <button title="Cancel campaign (no further sends)" className={`px-2 py-1 border rounded flex items-center text-red-600 ${processingId===(c.campaign_id||c.id)?'opacity-50':''}`} disabled={processingId===(c.campaign_id||c.id)} onClick={()=>controlCampaign(c,'cancel')}><Trash2 className="w-3 h-3 mr-1"/>Cancel</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Unified Inbox" defaultOpen={false}>
        {!inboxLoading && !inboxData?.data?.inbox?.length && (
          <div className="text-sm text-gray-600">No messages yet. Connect your email providers in Settings.</div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(inboxData?.data?.inbox||[]).slice(0,8).map(msg => (
            <div key={msg.id} className="border rounded p-3 text-sm">
              <div className="flex items-center justify-between">
                <div className="font-medium truncate max-w-[70%]" title={msg.subject}>{msg.subject}</div>
                <div className="text-xs text-gray-500">{new Date(msg.received_at).toLocaleString()}</div>
              </div>
              <div className="text-xs text-gray-600 mt-0.5">From {msg.from} • {msg.provider}</div>
              <div className="text-xs text-gray-700 mt-1 line-clamp-2">{msg.snippet}</div>
              <div className="mt-2 flex items-center space-x-2">
                <button className="px-2 py-1 border rounded text-xs" onClick={()=>setContactEmail(msg.from)}>Open</button>
                <button className="px-2 py-1 border rounded text-xs">Reply (AI)</button>
                <button className="px-2 py-1 border rounded text-xs">Assign</button>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Automations & Sequences" defaultOpen={false}>
        <div className="text-sm text-gray-600">Connect CRM automation to view and optimize sequences. Coming next.</div>
      </Section>

      <Section title="Templates & Content Library" defaultOpen={false}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(templates||[]).map(t => (
            <div key={t.id} className="border rounded-lg p-3">
              <div className="font-semibold">{t.name}</div>
              <div className="text-xs text-gray-500 mb-2 capitalize">{t.type}</div>
              <div className="text-xs text-gray-600">Avg Open {t.performance?.avg_open ?? 0}% • Click {t.performance?.avg_click ?? 0}%</div>
              <div className="mt-2 flex items-center space-x-2">
                <button className="px-2 py-1 border rounded text-xs">Edit</button>
                <button className="px-2 py-1 border rounded text-xs">Repurpose</button>
                <button className="px-2 py-1 border rounded text-xs">Analytics</button>
          </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Audience Insights" defaultOpen={false}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {(segments||[]).map(s => (
            <div key={s.id} className="border rounded-lg p-3">
              <div className="font-semibold">{s.name}</div>
              <div className="text-xs text-gray-600">Count {s.count} • Engagement {(Math.round((s.engagement||0)*100))}%</div>
              <div className="mt-2 flex items-center space-x-2">
                <button className="px-2 py-1 border rounded text-xs flex items-center"><Eye className="w-3 h-3 mr-1"/>View</button>
                <button className="px-2 py-1 border rounded text-xs">Micro-campaign</button>
                <button title="Apply best send time recommendations to scheduled email campaigns" onClick={()=>applyBestTimes(s.id)} disabled={applyingTimes} className="px-2 py-1 border rounded text-xs">{applyingTimes?'Applying…':'Apply best times'}</button>
          </div>
            </div>
          ))}
        </div>
        {bestTimes?.data?.suggestions && (
          <div className="mt-4 text-xs text-gray-700">Best send times: {bestTimes.data.suggestions.map(s=>`${s.day} ${s.hour_local}:00`).join(', ')} (confidence-driven)</div>
        )}
      </Section>

      <Section title="Analytics & Reporting" defaultOpen={false}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className="border rounded p-3">
            <div className="text-gray-600">Avg Open Rate</div>
            <div className="text-2xl font-semibold">{(emailMetrics.open_rate ?? 42.3)}%</div>
          </div>
          <div className="border rounded p-3">
            <div className="text-gray-600">CTR by Campaign Type</div>
            <div className="text-2xl font-semibold">{(emailMetrics.click_rate ?? 5.8)}%</div>
          </div>
          <div className="border rounded p-3">
            <div className="text-gray-600">Deliverability Health</div>
            <div className="text-2xl font-semibold">{(emailMetrics.deliverability ?? 97.8)}%</div>
          </div>
          <div className="border rounded p-3">
            <div className="text-gray-600">Unsubscribe Rate</div>
            <div className="text-2xl font-semibold">{(emailMetrics.unsubscribe_rate ?? 0.3)}%</div>
          </div>
        </div>
        {deliverability && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className={`border rounded p-3 ${deliverability.spf?.status==='pass'?'bg-green-50 border-green-200':'bg-yellow-50 border-yellow-200'}`}>
              <div className="font-medium">SPF: {deliverability.spf?.status}</div>
              <div className="text-xs text-gray-700">{deliverability.spf?.record}</div>
            </div>
            <div className={`border rounded p-3 ${deliverability.dkim?.status==='pass'?'bg-green-50 border-green-200':'bg-yellow-50 border-yellow-200'}`}>
              <div className="font-medium">DKIM: {deliverability.dkim?.status}</div>
              <div className="text-xs text-gray-700">Selector {deliverability.dkim?.selector} @ {deliverability.dkim?.domain}</div>
            </div>
            <div className={`border rounded p-3 ${deliverability.dmarc?.status==='pass'?'bg-green-50 border-green-200':'bg-yellow-50 border-yellow-200'}`}>
              <div className="font-medium">DMARC: {deliverability.dmarc?.status}</div>
              <div className="text-xs text-gray-700">{deliverability.dmarc?.policy}</div>
              {deliverability.dmarc?.why && <div className="text-xs text-gray-600 mt-1">Why: {deliverability.dmarc.why}</div>}
            </div>
            <div className="border rounded p-3">
              <div className="font-medium">Spam Complaints</div>
              <div className="text-xs text-gray-700">Rate {deliverability.spam_complaints?.rate}% • Trend {deliverability.spam_complaints?.trend}</div>
            </div>
            <div className="border rounded p-3">
              <div className="font-medium">Bounce Rate</div>
              <div className="text-xs text-gray-700">{deliverability.bounce_rate?.rate}% • Trend {deliverability.bounce_rate?.trend}</div>
            </div>
            <div className="border rounded p-3">
              <div className="font-medium">Sender Score</div>
              <div className="text-xs text-gray-700">{deliverability.sender_score}</div>
            </div>
          </div>
        )}
      </Section>

      <Section title="AI Recommendations Hub" defaultOpen={false}>
        <div className="space-y-3">
          {(aiSuggestions||[]).map(s => (
            <div key={s.id} className="border rounded p-3 text-sm">
              <div className="flex items-center justify-between">
                <div className="font-medium">{s.title}</div>
                <div className="text-xs text-gray-600">Confidence {(Math.round((s.confidence||0)*100))}% • Expected ROI {s.expected_roi||'-'}</div>
              </div>
              <div className="mt-1 text-xs text-gray-700 flex items-start">
                <Info className="w-3 h-3 mr-1 mt-0.5 text-gray-500" />
                <span>Why: {s.reason}</span>
              </div>
              <div className="mt-2 flex items-center space-x-2">
                <button className="px-2 py-1 border rounded text-xs">Apply Suggestion</button>
                <button className="px-2 py-1 border rounded text-xs">Customize First</button>
              </div>
            </div>
          ))}
          {(!aiSuggestions || aiSuggestions.length===0) && (
            <div className="text-sm text-gray-700">No suggestions yet. Suggestions appear as agents analyze performance.</div>
          )}
      </div>
      </Section>

      <ComposeEmailModal open={showCompose} onClose={()=>setShowCompose(false)} onSent={()=>{}} />
      <CampaignEmailAnalyticsModal open={!!showAnalytics} campaignId={showAnalytics} onClose={()=>setShowAnalytics(null)} />
      <EditEmailCampaignModal open={!!editCampaign} campaign={editCampaign} onClose={()=>setEditCampaign(null)} />
      <WorkflowViewerModal open={showWorkflow} onClose={()=>setShowWorkflow(false)} steps={[]} />
      <AICreateEmailCampaignModal isOpen={showAICreate} onClose={()=>setShowAICreate(false)} onCreateCampaign={()=>{ /* refresh if needed */ }} />
      <ABTestSetupModal open={!!showABTest} onClose={()=>setShowABTest(null)} campaignId={showABTest} onSaved={()=>{}} />
      <ContactDrawer open={!!contactEmail} onClose={()=>setContactEmail(null)} email={contactEmail} />
    </div>
  );
};

export default EmailTab;

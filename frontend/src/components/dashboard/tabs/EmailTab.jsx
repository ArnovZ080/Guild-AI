import React, { useMemo, useState } from 'react';
import { Mail, Plus, Settings, BarChart3, Pause, Play, Trash2, Eye, Calendar } from 'lucide-react';
import CampaignEmailAnalyticsModal from '../../dashboard/modals/CampaignEmailAnalyticsModal.jsx';
import ComposeEmailModal from '../../dashboard/modals/ComposeEmailModal.jsx';
import EditEmailCampaignModal from '../../dashboard/modals/EditEmailCampaignModal.jsx';
import WorkflowViewerModal from '../../dashboard/modals/WorkflowViewerModal.jsx';
import { useUnifiedInbox, useEmailCampaigns, useEmailTemplates, useEmailSegments, useEmailBestSendTimes } from '../../../services/contentIntelligenceApi';

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

  const mergedCampaigns = useMemo(() => {
    const fromProp = Array.isArray(campaigns) ? campaigns.filter(c => (c?.platform || '').toLowerCase() === 'email') : [];
    const fromHook = Array.isArray(emailCampaigns) ? emailCampaigns : [];
    return [...fromProp, ...fromHook];
  }, [campaigns, emailCampaigns]);

  const [showCompose, setShowCompose] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(null); // campaignId
  const [editCampaign, setEditCampaign] = useState(null);
  const [showWorkflow, setShowWorkflow] = useState(false);

  return (
    <div className="space-y-6">
      <TopBar
        metrics={topMetrics}
        onNewCampaign={()=>{ setEditCampaign({}); }}
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
                      {c.status==='paused' ? (
                        <button className="px-2 py-1 border rounded flex items-center"><Play className="w-3 h-3 mr-1"/>Resume</button>
                      ) : (
                        <button className="px-2 py-1 border rounded flex items-center"><Pause className="w-3 h-3 mr-1"/>Pause</button>
                      )}
                      <button className="px-2 py-1 border rounded flex items-center" onClick={()=>setEditCampaign(c)}>Edit</button>
                      <button className="px-2 py-1 border rounded flex items-center text-red-600"><Trash2 className="w-3 h-3 mr-1"/>Cancel</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
      </Section>

      <Section title="AI Recommendations Hub" defaultOpen={false}>
        <div className="text-sm text-gray-700">Suggestions will surface here via agents with reasons and expected ROI.</div>
      </Section>

      <ComposeEmailModal open={showCompose} onClose={()=>setShowCompose(false)} onSent={()=>{}} />
      <CampaignEmailAnalyticsModal open={!!showAnalytics} campaignId={showAnalytics} onClose={()=>setShowAnalytics(null)} />
      <EditEmailCampaignModal open={!!editCampaign} campaign={editCampaign} onClose={()=>setEditCampaign(null)} />
      <WorkflowViewerModal open={showWorkflow} onClose={()=>setShowWorkflow(false)} steps={[]} />
    </div>
  );
};

export default EmailTab;

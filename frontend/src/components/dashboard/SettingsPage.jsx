import React, { useEffect, useMemo, useState } from 'react';
import { useSettings } from '../../contexts/SettingsContext.jsx';

const Section = ({ title, children }) => (
  <div className="bg-white rounded-lg shadow p-6 mb-6">
    <h2 className="text-xl font-semibold mb-4">{title}</h2>
    {children}
  </div>
);

const Row = ({ label, children }) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-3 py-2">
    <div className="sm:w-64 text-sm text-gray-600">{label}</div>
    <div className="flex-1">{children}</div>
  </div>
);

const Input = (props) => (
  <input {...props} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${props.className || ''}`} />
);

const Toggle = ({ checked, onChange }) => (
  <button
    onClick={() => onChange(!checked)}
    className={`w-12 h-6 rounded-full relative transition-colors ${checked ? 'bg-blue-500' : 'bg-gray-300'}`}
  >
    <span className={`absolute top-0.5 ${checked ? 'left-6' : 'left-0.5'} w-5 h-5 bg-white rounded-full transition-all`} />
  </button>
);

const Select = ({ value, onChange, options }) => (
  <select value={value} onChange={(e) => onChange(e.target.value)} className="px-3 py-2 border rounded-lg">
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

const Collapsible = ({ title, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-lg shadow mb-6">
      <button onClick={() => setOpen(!open)} className="w-full text-left p-4 border-b font-semibold">
        {title} {open ? '−' : '+'}
      </button>
      {open && <div className="p-6">{children}</div>}
    </div>
  );
};

const SettingsPage = () => {
  const { settings, updateSettings, appendAuditLog } = useSettings();
  const [plans, setPlans] = useState([]);
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [plansLoading, setPlansLoading] = useState(false);
  const [subLoading, setSubLoading] = useState(false);
  const [initLoadingPlan, setInitLoadingPlan] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  const userEmail = useMemo(() => settings?.profile?.email || '', [settings?.profile?.email]);

  useEffect(() => {
    const fetchPlans = async () => {
      setPlansLoading(true);
      try {
        const res = await fetch('/subscription/plans');
        const data = await res.json();
        setPlans(Array.isArray(data?.plans) ? data.plans : []);
      } catch {
        setPlans([]);
      } finally {
        setPlansLoading(false);
      }
    };
    const fetchInfo = async () => {
      setSubLoading(true);
      try {
        const res = await fetch('/subscription/info');
        if (res.ok) {
          const data = await res.json();
          setSubscriptionInfo(data);
        }
      } catch {
        setSubscriptionInfo(null);
      } finally {
        setSubLoading(false);
      }
    };
    fetchPlans();
    fetchInfo();
    // Handle Paystack return (reference in URL)
    const params = new URLSearchParams(window.location.search);
    const reference = params.get('reference');
    if (reference) {
      (async () => {
        try {
          setStatusMsg('Verifying payment...');
          const res = await fetch('/subscription/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reference }),
          });
          if (res.ok) {
            setStatusMsg('Subscription activated.');
            await fetchInfo();
          } else {
            setStatusMsg('Verification failed.');
          }
        } catch {
          setStatusMsg('Verification error.');
        } finally {
          // Clean reference param from URL
          const url = new URL(window.location.href);
          url.searchParams.delete('reference');
          window.history.replaceState({}, '', url.toString());
        }
      })();
    }
  }, []);

  const initializePlan = async (planId, email) => {
    if (!email) {
      setStatusMsg('Please set your email in Profile first.');
      return;
    }
    try {
      setInitLoadingPlan(planId);
      const res = await fetch('/subscription/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_id: planId, email }),
      });
      if (!res.ok) throw new Error('Failed to initialize');
      const data = await res.json();
      const url = data?.authorization_url;
      if (url) {
        window.location.href = url;
      } else {
        setStatusMsg('Missing authorization URL.');
      }
    } catch (e) {
      setStatusMsg('Failed to start checkout.');
    } finally {
      setInitLoadingPlan('');
    }
  };

  const uploadToEndpoint = async (endpoint, file, onUrl) => {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(endpoint, { method: 'POST', body: form });
    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    const url = data?.url;
    if (url) onUrl(url);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {/* 1. Profile */}
      <Section title="Profile">
        <Row label="Name">
          <Input
            value={settings.profile.name}
            onChange={(e) => updateSettings({ profile: { ...settings.profile, name: e.target.value } })}
            placeholder="Your name"
          />
        </Row>
        <Row label="First Name">
          <Input
            value={settings.profile.firstName}
            onChange={(e) => updateSettings({ profile: { ...settings.profile, firstName: e.target.value } })}
            placeholder="First name"
          />
        </Row>
        <Row label="Last Name">
          <Input
            value={settings.profile.lastName}
            onChange={(e) => updateSettings({ profile: { ...settings.profile, lastName: e.target.value } })}
            placeholder="Last name"
          />
        </Row>
        <Row label="Email">
          <Input
            type="email"
            value={settings.profile.email}
            onChange={(e) => updateSettings({ profile: { ...settings.profile, email: e.target.value } })}
            placeholder="you@example.com"
          />
        </Row>
        <Row label="Profile Picture URL">
          <Input
            value={settings.profile.profilePictureUrl}
            onChange={(e) => updateSettings({ profile: { ...settings.profile, profilePictureUrl: e.target.value } })}
            placeholder="https://..."
          />
        </Row>
        <Row label="Upload Profile Picture">
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files && e.target.files[0];
              if (!file) return;
              try {
                await uploadToEndpoint('/api/profile/avatar', file, (url) => {
                  updateSettings({ profile: { ...settings.profile, profilePictureUrl: url } });
                });
              } catch {}
            }}
          />
          {settings.profile.profilePictureUrl && (
            <img src={settings.profile.profilePictureUrl} alt="Profile" className="mt-2 h-16 w-16 rounded-full object-cover border" />
          )}
        </Row>
        <Row label="Brand: Business Name">
          <Input
            value={settings.profile.brand.businessName}
            onChange={(e) => updateSettings({ profile: { ...settings.profile, brand: { ...settings.profile.brand, businessName: e.target.value } } })}
            placeholder="Business name"
          />
        </Row>
        <Row label="Brand: Logo URL">
          <Input
            value={settings.profile.brand.logoUrl}
            onChange={(e) => updateSettings({ profile: { ...settings.profile, brand: { ...settings.profile.brand, logoUrl: e.target.value } } })}
            placeholder="https://..."
          />
        </Row>
        <Row label="Upload Brand Logo">
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files && e.target.files[0];
              if (!file) return;
              try {
                await uploadToEndpoint('/api/profile/logo', file, (url) => {
                  updateSettings({ profile: { ...settings.profile, brand: { ...settings.profile.brand, logoUrl: url } } });
                });
              } catch {}
            }}
          />
          {settings.profile.brand.logoUrl && (
            <img src={settings.profile.brand.logoUrl} alt="Logo" className="mt-2 h-12 w-12 rounded object-contain border bg-white" />
          )}
        </Row>
        <Row label="Notifications: Email">
          <Toggle
            checked={settings.notifications.email}
            onChange={(v) => updateSettings({ notifications: { ...settings.notifications, email: v } })}
          />
        </Row>
        <Row label="Notifications: In-App">
          <Toggle
            checked={settings.notifications.inApp}
            onChange={(v) => updateSettings({ notifications: { ...settings.notifications, inApp: v } })}
          />
        </Row>
        <Row label="Notifications: Integrations">
          <Toggle
            checked={settings.notifications.integrations}
            onChange={(v) => updateSettings({ notifications: { ...settings.notifications, integrations: v } })}
          />
        </Row>
        <Row label="Country/Region">
          <Input
            value={settings.profile.countryOrRegion}
            onChange={(e) => updateSettings({ profile: { ...settings.profile, countryOrRegion: e.target.value } })}
            placeholder="Country or region"
          />
        </Row>
        <Row label="City">
          <Input
            value={settings.profile.city}
            onChange={(e) => updateSettings({ profile: { ...settings.profile, city: e.target.value } })}
            placeholder="City"
          />
        </Row>
        <Row label="Office Address">
          <Input
            value={settings.profile.officeAddress}
            onChange={(e) => updateSettings({ profile: { ...settings.profile, officeAddress: e.target.value } })}
            placeholder="Office address"
          />
        </Row>
        <Row label="Address Line 1">
          <Input
            value={settings.profile.addressLine1}
            onChange={(e) => updateSettings({ profile: { ...settings.profile, addressLine1: e.target.value } })}
            placeholder="Address line 1"
          />
        </Row>
        <Row label="Address Line 2">
          <Input
            value={settings.profile.addressLine2}
            onChange={(e) => updateSettings({ profile: { ...settings.profile, addressLine2: e.target.value } })}
            placeholder="Address line 2 (optional)"
          />
        </Row>
        <Row label="State/Province">
          <Input
            value={settings.profile.stateProvince}
            onChange={(e) => updateSettings({ profile: { ...settings.profile, stateProvince: e.target.value } })}
            placeholder="State/Province"
          />
        </Row>
        <Row label="Postal Code">
          <Input
            value={settings.profile.postalCode}
            onChange={(e) => updateSettings({ profile: { ...settings.profile, postalCode: e.target.value } })}
            placeholder="Postal/ZIP code"
          />
        </Row>
        <Row label="Phone Number">
          <Input
            value={settings.profile.phoneNumber}
            onChange={(e) => updateSettings({ profile: { ...settings.profile, phoneNumber: e.target.value } })}
            placeholder="+1 555 123 4567"
          />
        </Row>
      </Section>

      {/* 2. Subscription & Billing (basic scaffold) */}
      <Section title="Subscription & Billing">
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            {subLoading ? 'Loading subscription...' : subscriptionInfo ? (
              <>
                <div>Tier: <span className="font-medium capitalize">{subscriptionInfo.tier || subscriptionInfo.plan_details?.name || 'free'}</span></div>
                {subscriptionInfo.credits && (
                  <div>Credits: {subscriptionInfo.credits.remaining} remaining of {subscriptionInfo.credits.limit}</div>
                )}
              </>
            ) : 'Not subscribed'}
          </div>

          <div>
            <div className="font-semibold mb-2">Plans</div>
            {plansLoading ? (
              <div className="text-sm text-gray-500">Loading plans...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plans.map((p) => (
                  <div key={p.id} className={`border rounded-lg p-4 ${p.popular ? 'border-blue-400' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-semibold">{p.name}</div>
                      {p.popular && <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700">Popular</span>}
                    </div>
                    <div className="text-2xl mt-1">{p.usd_display}</div>
                    {p.zar_display && <div className="text-xs text-gray-500">Billed about {p.zar_display} ZAR</div>}
                    <ul className="mt-3 text-sm text-gray-600 list-disc ml-5 space-y-1">
                      {(p.features || []).map((f) => <li key={f}>{f.replaceAll('_', ' ')}</li>)}
                    </ul>
                    <div className="mt-3 text-xs text-gray-600 space-y-1">
                      {Number.isFinite(p.included_agents_limit) && <div>Included agents: {p.included_agents_limit}</div>}
                      {p.extra_agent_monthly_usd != null && <div>Extra agent: ${p.extra_agent_monthly_usd}/mo</div>}
                      {p.extra_agent_daily_usd != null && <div>Daily rental: ${p.extra_agent_daily_usd}/day</div>}
                      {p.trial_days > 0 && <div className="text-green-700">Free trial: {p.trial_days} days</div>}
                    </div>
                    <button
                      onClick={() => initializePlan(p.id, userEmail)}
                      disabled={!!initLoadingPlan}
                      className="mt-4 w-full px-3 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50"
                    >
                      {initLoadingPlan === p.id ? 'Redirecting...' : 'Select / Upgrade'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          {statusMsg && <div className="text-xs text-gray-600">{statusMsg}</div>}
        </div>
      </Section>

      {/* 3. Onboarding & Business Source of Truth */}
      <Section title="Onboarding & Business Source of Truth">
        <Row label="Niche">
          <Input
            value={settings.onboarding.niche}
            onChange={(e) => updateSettings({ onboarding: { ...settings.onboarding, niche: e.target.value } })}
          />
        </Row>
        <Row label="Target Audience">
          <Input
            value={settings.onboarding.targetAudience}
            onChange={(e) => updateSettings({ onboarding: { ...settings.onboarding, targetAudience: e.target.value } })}
          />
        </Row>
        <Row label="Products/Services">
          <Input
            value={settings.onboarding.productsServices}
            onChange={(e) => updateSettings({ onboarding: { ...settings.onboarding, productsServices: e.target.value } })}
          />
        </Row>
        <Row label="Pricing">
          <Input
            value={settings.onboarding.pricing}
            onChange={(e) => updateSettings({ onboarding: { ...settings.onboarding, pricing: e.target.value } })}
          />
        </Row>
        <Row label="Goals">
          <Input
            value={settings.onboarding.goals}
            onChange={(e) => updateSettings({ onboarding: { ...settings.onboarding, goals: e.target.value } })}
          />
        </Row>
        <Row label="Business Blueprint (Markdown)">
          <textarea
            value={settings.onboarding.businessBlueprint}
            onChange={(e) => updateSettings({ onboarding: { ...settings.onboarding, businessBlueprint: e.target.value } })}
            className="w-full min-h-[120px] px-3 py-2 border rounded-lg"
            placeholder="Editable blueprint for agents to reference"
          />
        </Row>
      </Section>

      {/* 4. Advanced Settings (Collapsible) */}
      <Collapsible title="Advanced Settings">
        <Section title="Agent Settings">
          <Row label="Enable/Disable Agents (IDs, comma-separated)">
            <Input
              value={Object.keys(settings.agents.enabledAgents).filter(k => settings.agents.enabledAgents[k]).join(',')}
              onChange={(e) => {
                const ids = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                const map = ids.reduce((acc, id) => ({ ...acc, [id]: true }), {});
                updateSettings({ agents: { ...settings.agents, enabledAgents: map } });
              }}
              placeholder="agent_research,agent_growth"
            />
          </Row>
          <Row label="Only show opps > revenue">
            <Input
              type="number"
              value={settings.agents.revenueThresholdMin}
              onChange={(e) => updateSettings({ agents: { ...settings.agents, revenueThresholdMin: Number(e.target.value) } })}
            />
          </Row>
          <Row label="Agent confidence tolerance">
            <Input
              type="number"
              step="0.05"
              min="0"
              max="1"
              value={settings.agents.confidenceTolerance}
              onChange={(e) => updateSettings({ agents: { ...settings.agents, confidenceTolerance: Number(e.target.value) } })}
            />
          </Row>
          <Row label="Language/Tone">
            <Select
              value={settings.agents.languageTone}
              onChange={(v) => updateSettings({ agents: { ...settings.agents, languageTone: v } })}
              options={[
                { value: 'professional', label: 'Professional' },
                { value: 'friendly', label: 'Friendly' },
                { value: 'direct', label: 'Direct' },
              ]}
            />
          </Row>
          <Row label="AI Coach Persona">
            <Select
              value={settings.agents.persona}
              onChange={(v) => updateSettings({ agents: { ...settings.agents, persona: v } })}
              options={[
                { value: 'strategic_partner', label: 'Strategic Partner' },
                { value: 'mentor', label: 'Mentor' },
                { value: 'tactical_operator', label: 'Tactical Operator' },
              ]}
            />
          </Row>
        </Section>
      </Collapsible>

      {/* 5. Integrations */}
      <Section title="Integrations">
        <div className="text-sm text-gray-600">Manage connectors in the Connectors page. Quick link below.</div>
        <div className="mt-3">
          <a href="/connectors" className="text-blue-600 hover:underline">Open Connectors</a>
        </div>
      </Section>

      {/* 6. Notifications & Alerts */}
      <Section title="Notifications & Alerts">
        <Row label="Opportunity Alerts">
          <Toggle
            checked={settings.notifications.opportunityAlerts}
            onChange={(v) => updateSettings({ notifications: { ...settings.notifications, opportunityAlerts: v } })}
          />
        </Row>
        <Row label="Performance Drop Alerts">
          <Toggle
            checked={settings.notifications.performanceDropAlerts}
            onChange={(v) => updateSettings({ notifications: { ...settings.notifications, performanceDropAlerts: v } })}
          />
        </Row>
        <Row label="Agent Activity Digests">
          <Select
            value={settings.notifications.agentDigests}
            onChange={(v) => updateSettings({ notifications: { ...settings.notifications, agentDigests: v } })}
            options={[
              { value: 'daily', label: 'Daily' },
              { value: 'weekly', label: 'Weekly' },
              { value: 'monthly', label: 'Monthly' },
            ]}
          />
        </Row>
      </Section>

      {/* 7. Data & Privacy Controls */}
      <Section title="Data & Privacy Controls">
        <Row label="Data Retention (days)">
          <Input
            type="number"
            value={settings.dataPrivacy.dataRetentionDays}
            onChange={(e) => updateSettings({ dataPrivacy: { ...settings.dataPrivacy, dataRetentionDays: Number(e.target.value) } })}
          />
        </Row>
        <Row label="Export Format">
          <Select
            value={settings.dataPrivacy.exportFormat}
            onChange={(v) => updateSettings({ dataPrivacy: { ...settings.dataPrivacy, exportFormat: v } })}
            options={[
              { value: 'json', label: 'JSON' },
              { value: 'csv', label: 'CSV' },
              { value: 'pdf', label: 'PDF' },
            ]}
          />
        </Row>
        <div className="text-sm text-gray-600 mt-2">
          Manage connected data sources in Connectors. You can revoke there.
        </div>
      </Section>

      {/* 8. Customization */}
      <Section title="Customization">
        <Row label="Growth Horizon">
          <Select
            value={settings.customization.growthHorizon}
            onChange={(v) => updateSettings({ customization: { ...settings.customization, growthHorizon: v } })}
            options={[
              { value: 'short_term', label: 'Short-term' },
              { value: 'long_term', label: 'Long-term' },
            ]}
          />
        </Row>
        <Row label="Goal Alignment">
          <Select
            value={settings.customization.goalAlignment}
            onChange={(v) => updateSettings({ customization: { ...settings.customization, goalAlignment: v } })}
            options={[
              { value: 'profit', label: 'Profit' },
              { value: 'market_share', label: 'Market Share' },
              { value: 'customer_growth', label: 'Customer Growth' },
            ]}
          />
        </Row>
        <Row label="Automation Rule: Auto-accept Quick Wins">
          <Toggle
            checked={settings.customization.automationRules.find(r => r.id === 'auto_accept_quick_win')?.enabled || false}
            onChange={(v) => {
              const rules = settings.customization.automationRules.map(r => r.id === 'auto_accept_quick_win' ? { ...r, enabled: v } : r);
              updateSettings({ customization: { ...settings.customization, automationRules: rules } });
            }}
          />
        </Row>
      </Section>

      {/* 9. Audit & History */}
      <Section title="Audit & History">
        <div className="space-y-2">
          {settings.audit.decisions.slice(0, 10).map(d => (
            <div key={d.id} className="text-sm text-gray-700 border rounded px-3 py-2">
              <div className="font-medium">{d.type}</div>
              <div className="text-gray-600">{d.summary}</div>
              <div className="text-xs text-gray-500">{new Date(d.createdAt).toLocaleString()}</div>
            </div>
          ))}
          {settings.audit.decisions.length === 0 && (
            <div className="text-sm text-gray-500">No audit entries yet.</div>
          )}
        </div>
        <div className="mt-4">
          <button
            onClick={() => appendAuditLog({ type: 'manual_entry', summary: 'Test audit entry' })}
            className="px-4 py-2 bg-gray-800 text-white rounded"
          >
            Add Test Audit Entry
          </button>
        </div>
      </Section>
    </div>
  );
};

export default SettingsPage;



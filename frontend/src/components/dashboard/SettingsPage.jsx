import React, { useEffect, useMemo, useState } from 'react';
import { useSettings } from '../../contexts/SettingsContext.jsx';

const Section = ({ title, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-lg shadow mb-6">
      <div className="flex items-center justify-between px-6 py-4">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <button
          onClick={() => setOpen(!open)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
        >
          {open ? 'Hide' : 'View'}
        </button>
      </div>
      {open && (
        <div className="p-6">
          {children}
        </div>
      )}
    </div>
  );
};

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
  const [agentsAvailable, setAgentsAvailable] = useState([]);

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
    const fetchAgents = async () => {
      try {
        const res = await fetch('/agents/available');
        if (res.ok) {
          const data = await res.json();
          setAgentsAvailable(Array.isArray(data) ? data : (Array.isArray(data?.agents) ? data.agents : []));
        }
      } catch {
        // graceful fallback
        setAgentsAvailable([]);
      }
    };
    fetchPlans();
    fetchInfo();
    fetchAgents();
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

  const uploadToEndpoint = async (endpoint, file, onUrl) => {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(endpoint, { method: 'POST', body: form });
    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    const url = data?.url;
    if (url) onUrl(url);
  };

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

  // Smart address helpers (lightweight mock)
  const autoFillCountryState = (city, currentCountry, currentState) => {
    const db = {
      'cape town': { countryOrRegion: 'South Africa', stateProvince: 'Western Cape' },
      'johannesburg': { countryOrRegion: 'South Africa', stateProvince: 'Gauteng' },
      'pretoria': { countryOrRegion: 'South Africa', stateProvince: 'Gauteng' },
      'durban': { countryOrRegion: 'South Africa', stateProvince: 'KwaZulu-Natal' },
      'london': { countryOrRegion: 'United Kingdom', stateProvince: 'England' },
      'new york': { countryOrRegion: 'United States', stateProvince: 'New York' },
      'san francisco': { countryOrRegion: 'United States', stateProvince: 'California' }
    };
    const rec = db[(city || '').toLowerCase()];
    return rec ? rec : { countryOrRegion: currentCountry, stateProvince: currentState };
  };

  const getAddressSuggestions = (city) => {
    const c = (city || '').toLowerCase();
    const samples = {
      'cape town': [
        '1 Adderley St, Cape Town City Centre, Cape Town, 8000',
        '12 Kloof St, Gardens, Cape Town, 8001',
        '101 Main Rd, Sea Point, Cape Town, 8005'
      ],
      'johannesburg': [
        '24 Maude St, Sandton, Johannesburg, 2196',
        '155 West St, Sandown, Johannesburg, 2031'
      ],
      'london': [
        '10 Downing St, Westminster, London SW1A 2AA',
        '221B Baker St, London NW1 6XE'
      ],
      'new york': [
        '350 5th Ave, New York, NY 10118',
        '405 Lexington Ave, New York, NY 10174'
      ]
    };
    return samples[c] || [];
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
          <label className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm cursor-pointer">
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
              className="hidden"
            />
            Choose file
          </label>
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
          <label className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm cursor-pointer">
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
              className="hidden"
            />
            Choose file
          </label>
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
        <Row label="City">
          <div>
            <Input
              value={settings.profile.city}
              onChange={(e) => {
                const city = e.target.value;
                const auto = autoFillCountryState(city, settings.profile.countryOrRegion, settings.profile.stateProvince);
                updateSettings({ profile: { ...settings.profile, city, ...auto } });
              }}
              placeholder="City"
            />
            <div className="text-xs text-gray-500 mt-1">Typing a known city will auto-fill country and state/province.</div>
          </div>
        </Row>
        <Row label="Country/Region">
          <Input
            value={settings.profile.countryOrRegion}
            onChange={(e) => updateSettings({ profile: { ...settings.profile, countryOrRegion: e.target.value } })}
            placeholder="Country or region"
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
          <div>
            <Input
              value={settings.profile.addressLine1}
              onChange={(e) => updateSettings({ profile: { ...settings.profile, addressLine1: e.target.value } })}
              placeholder="Start typing your address..."
              list="address-suggestions"
            />
            <datalist id="address-suggestions">
              {getAddressSuggestions(settings.profile.city).map((s, idx) => (
                <option key={idx} value={s} />
              ))}
            </datalist>
            <div className="text-xs text-gray-500 mt-1">Autocomplete suggestions appear as you type.</div>
          </div>
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

      <Section title="Subscription & Billing">
        <div className="space-y-4">
          {Array.isArray(plans) && plans.find(p => p.trial_days > 0) && (
            <div className="p-3 rounded bg-green-50 text-green-700 text-sm">
              Enjoy a {plans.find(p => p.trial_days > 0)?.trial_days}-day free trial on paid plans.
            </div>
          )}
          {/* Subscription Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-500">Current Plan</div>
              <div className="text-2xl font-bold text-gray-900 mt-1 capitalize">
                {subLoading ? '—' : (subscriptionInfo?.tier || subscriptionInfo?.plan_details?.name || 'free')}
              </div>
              {subscriptionInfo?.current_period_end && (
                <div className="text-xs text-gray-500 mt-1">Renews {new Date(subscriptionInfo.current_period_end).toLocaleDateString()}</div>
              )}
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-500">Credits</div>
              <div className="mt-1">
                <div className="flex items-end justify-between">
                  <div className="text-2xl font-bold text-purple-600">
                    {subscriptionInfo?.credits?.remaining ?? '—'}
                  </div>
                  <div className="text-sm text-gray-500">of {subscriptionInfo?.credits?.limit ?? '—'}</div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: (() => {
                    const used = subscriptionInfo?.credits?.used ?? 0; const limit = subscriptionInfo?.credits?.limit ?? 0; return limit > 0 ? `${Math.min(100, Math.round(100 * used / limit))}%` : '0%';
                  })() }} />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-500">Included Agents</div>
              <div className="mt-1">
                <div className="text-2xl font-bold text-blue-600">
                  {(() => {
                    const included = agentsAvailable.filter(a => a.included_in_subscription).length;
                    return included;
                  })()}
                </div>
                <div className="text-xs text-gray-500">
                  Limit: {plans.find(p => (p.id === (subscriptionInfo?.tier || 'free')))?.included_agents_limit ?? '—'}
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-500">Hired Agents</div>
              <div className="mt-1">
                <div className="text-2xl font-bold text-emerald-600">
                  {agentsAvailable.filter(a => a.hired_until).length}
                </div>
                <div className="text-xs text-gray-500">Daily/Monthly rentals active</div>
              </div>
            </div>
          </div>

          {/* Agent Entitlements Summary */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Agent Entitlements</h3>
              <span className="text-xs text-gray-500">Live availability</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-medium text-gray-800 mb-1">Included</div>
                <ul className="space-y-1">
                  {agentsAvailable.filter(a => a.included_in_subscription).slice(0,6).map(a => (
                    <li key={a.id || a.agent_id} className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span className="text-gray-700">{a.name || a.agent_id}</span>
                    </li>
                  ))}
                  {agentsAvailable.filter(a => a.included_in_subscription).length === 0 && (
                    <li className="text-gray-500">None</li>
                  )}
                </ul>
              </div>
              <div>
                <div className="font-medium text-gray-800 mb-1">Hired</div>
                <ul className="space-y-1">
                  {agentsAvailable.filter(a => a.hired_until).slice(0,6).map(a => (
                    <li key={a.id || a.agent_id} className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                      <span className="text-gray-700">{a.name || a.agent_id}</span>
                      <span className="text-xs text-gray-500">until {new Date(a.hired_until).toLocaleDateString()}</span>
                    </li>
                  ))}
                  {agentsAvailable.filter(a => a.hired_until).length === 0 && (
                    <li className="text-gray-500">None</li>
                  )}
                </ul>
              </div>
              <div>
                <div className="font-medium text-gray-800 mb-1">Hireable</div>
                <ul className="space-y-1">
                  {agentsAvailable.filter(a => a.can_hire_daily || a.can_hire_monthly).slice(0,6).map(a => (
                    <li key={a.id || a.agent_id} className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <span className="text-gray-700">{a.name || a.agent_id}</span>
                      {(a.daily_rate_usd || a.monthly_rate_usd) && (
                        <span className="text-xs text-gray-500">${a.daily_rate_usd || '-'} /day · ${a.monthly_rate_usd || '-'} /mo</span>
                      )}
                    </li>
                  ))}
                  {agentsAvailable.filter(a => a.can_hire_daily || a.can_hire_monthly).length === 0 && (
                    <li className="text-gray-500">None</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <div>
            <div className="font-semibold mb-2">Plans</div>
            {plansLoading ? (
              <div className="text-sm text-gray-500">Loading plans...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(plans.length ? plans : [
                  { id: 'free', name: 'Always Free', usd_display: 'Free', zar_display: 'Free', features: ['basic_chat','limited_workflows'], included_agents_limit: 0, extra_agent_daily_usd: 2, extra_agent_monthly_usd: 15, trial_days: 0 },
                  { id: 'starter', name: 'Starter', usd_display: '$49', zar_display: 'R910', features: ['base_agents','basic_templates','marketplace_use'], included_agents_limit: 5, extra_agent_daily_usd: 1.5, extra_agent_monthly_usd: 12, trial_days: 21 },
                ]).map((p) => (
                  <div key={p.id} className={`border rounded-lg p-4 ${p.popular ? 'border-blue-400' : 'border-gray-200'} bg-white`}> 
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Business Overview</h4>
            <Row label="Business Type">
              <Input value={settings.onboarding.business_type || ''} onChange={(e) => updateSettings({ onboarding: { ...settings.onboarding, business_type: e.target.value } })} />
            </Row>
            <Row label="Business Stage">
              <Input value={settings.onboarding.business_stage || ''} onChange={(e) => updateSettings({ onboarding: { ...settings.onboarding, business_stage: e.target.value } })} />
            </Row>
            <Row label="Description">
              <textarea value={settings.onboarding.business_description || ''} onChange={(e) => updateSettings({ onboarding: { ...settings.onboarding, business_description: e.target.value } })} className="w-full min-h-[80px] px-3 py-2 border rounded-lg" />
            </Row>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Audience & Clients</h4>
            <Row label="Target Audience">
              <Input value={settings.onboarding.audience_type || settings.onboarding.targetAudience || ''} onChange={(e) => updateSettings({ onboarding: { ...settings.onboarding, audience_type: e.target.value, targetAudience: e.target.value } })} />
            </Row>
            <Row label="Customer Avatar">
              <Input value={settings.onboarding.customer_avatar || ''} onChange={(e) => updateSettings({ onboarding: { ...settings.onboarding, customer_avatar: e.target.value } })} />
            </Row>
            <Row label="Main Problem">
              <Input value={settings.onboarding.audience_problem || ''} onChange={(e) => updateSettings({ onboarding: { ...settings.onboarding, audience_problem: e.target.value } })} />
            </Row>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Goals & Priorities</h4>
            <Row label="3-Month Priority">
              <Input value={settings.onboarding.priority_3months || settings.onboarding.goals || ''} onChange={(e) => updateSettings({ onboarding: { ...settings.onboarding, priority_3months: e.target.value, goals: e.target.value } })} />
            </Row>
            <Row label="Guild Focus">
              <Input value={settings.onboarding.guild_support_focus || ''} onChange={(e) => updateSettings({ onboarding: { ...settings.onboarding, guild_support_focus: e.target.value } })} />
            </Row>
            <Row label="12-Month Vision">
              <Input value={settings.onboarding.vision_12months || ''} onChange={(e) => updateSettings({ onboarding: { ...settings.onboarding, vision_12months: e.target.value } })} />
            </Row>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Preferences</h4>
            <Row label="Data Storage">
              <Input value={settings.onboarding.data_storage || ''} onChange={(e) => updateSettings({ onboarding: { ...settings.onboarding, data_storage: e.target.value } })} />
            </Row>
            <Row label="Automation Level">
              <Input value={settings.onboarding.automation_level || ''} onChange={(e) => updateSettings({ onboarding: { ...settings.onboarding, automation_level: e.target.value } })} />
            </Row>
            <Row label="Connected Tools">
              <Input value={Array.isArray(settings.onboarding.selectedSoftware) ? settings.onboarding.selectedSoftware.join(', ') : (settings.onboarding.selectedSoftware || '')} onChange={(e) => updateSettings({ onboarding: { ...settings.onboarding, selectedSoftware: e.target.value } })} />
            </Row>
          </div>
          <div className="bg-white border rounded-lg p-4 md:col-span-2">
            <h4 className="font-semibold text-gray-900 mb-2">Business Blueprint (Markdown)</h4>
            <textarea
              value={settings.onboarding.businessBlueprint}
              onChange={(e) => updateSettings({ onboarding: { ...settings.onboarding, businessBlueprint: e.target.value } })}
              className="w-full min-h-[160px] px-3 py-2 border rounded-lg"
              placeholder="Editable blueprint for agents to reference"
            />
          </div>
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

      {/* Advanced Settings moved to bottom */}
      <Section title="Advanced Settings">
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

        {/* 8. Customization (moved under Advanced) */}
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

        {/* 7. Data & Privacy Controls (moved under Advanced) */}
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
          <div className="mt-3 flex gap-2">
            <button
              onClick={async () => {
                try {
                  const res = await fetch(`/api/settings/export?format=${settings.dataPrivacy.exportFormat || 'json'}`);
                  const data = await res.json();
                  if (data?.content) {
                    const blob = new Blob([
                      data.format === 'json' ? JSON.stringify(data.content, null, 2) : data.content
                    ], { type: data.format === 'json' ? 'application/json' : 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `guild-settings.${data.format === 'json' ? 'json' : 'csv'}`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }
                } catch {}
              }}
              className="px-3 py-2 rounded bg-gray-800 text-white text-sm hover:bg-gray-900"
            >
              Export
            </button>
          </div>
        </Section>

        {/* 9. Audit & History (moved under Advanced) */}
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
      </Section>
    </div>
  );
};

export default SettingsPage;



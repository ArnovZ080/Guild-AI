import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const SETTINGS_STORAGE_KEY = 'guild_settings_v1';

const defaultSettings = {
  profile: {
    name: '',
    firstName: '',
    lastName: '',
    countryOrRegion: '',
    city: '',
    officeAddress: '',
    addressLine1: '',
    addressLine2: '',
    stateProvince: '',
    postalCode: '',
    phoneNumber: '',
    email: '',
    profilePictureUrl: '',
    brand: {
      businessName: '',
      logoUrl: '',
    },
  },
  security: {
    passwordLastUpdatedAt: null,
    twoFactorEnabled: false,
    apiKeys: [],
  },
  notifications: {
    email: true,
    inApp: true,
    integrations: false,
    opportunityAlerts: true,
    performanceDropAlerts: true,
    agentDigests: 'weekly', // daily | weekly | monthly
    escalationRules: [],
  },
  subscription: {
    plan: 'Free',
    limits: { agents: 1, credits: 1000 },
    paymentMethods: [],
    invoices: [],
    usage: { creditsUsed: 0, agentHours: 0 },
  },
  onboarding: {
    niche: '',
    targetAudience: '',
    productsServices: '',
    pricing: '',
    goals: '',
    businessBlueprint: '',
  },
  agents: {
    enabledAgents: {},
    revenueThresholdMin: 10000,
    confidenceTolerance: 0.7,
    languageTone: 'professional',
    persona: 'strategic_partner', // strategic_partner | mentor | tactical_operator
  },
  integrations: {
    // mirror minimal status; source of truth for toggles we expose here
  },
  dataPrivacy: {
    dataRetentionDays: 365,
    connectedSources: [],
    exportFormat: 'json',
  },
  customization: {
    growthHorizon: 'short_term', // short_term | long_term
    goalAlignment: 'profit', // profit | market_share | customer_growth
    automationRules: [
      {
        id: 'auto_accept_quick_win',
        enabled: false,
        conditions: {
          positiveCashflow: true,
          growthAgentConfidenceGte: 0.8,
          maxCost: 5000,
        },
        action: 'accept_quick_win',
      },
    ],
  },
  audit: {
    decisions: [], // { id, type, summary, createdAt }
  },
};

const SettingsContext = createContext({
  settings: defaultSettings,
  updateSettings: () => {},
  resetSettings: () => {},
  appendAuditLog: () => {},
});

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    (async () => {
      try {
        // Try backend first
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          const fromServer = data?.data || {};
          // Merge onboarding summary if present locally (first-run hydration)
          let merged = { ...defaultSettings, ...fromServer };
          try {
            const ob = JSON.parse(localStorage.getItem('guild_onboarding_data') || '{}');
            merged = { ...merged, onboarding: { ...merged.onboarding, ...ob } };
          } catch {}
          setSettings(merged);
          return;
        }
      } catch {}
      // Fallback to local storage
      try {
        const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setSettings({ ...defaultSettings, ...parsed });
        }
      } catch {}
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: settings }),
        });
      } catch {}
      try { localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings)); } catch {}
    })();
  }, [settings]);

  const updateSettings = (partial) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  const resetSettings = () => setSettings(defaultSettings);

  const appendAuditLog = (entry) => {
    setSettings((prev) => ({
      ...prev,
      audit: {
        ...prev.audit,
        decisions: [
          { id: `${Date.now()}`, createdAt: new Date().toISOString(), ...entry },
          ...(prev.audit?.decisions || []),
        ],
      },
    }));
  };

  const value = useMemo(() => ({ settings, updateSettings, resetSettings, appendAuditLog }), [settings]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);

export default SettingsContext;



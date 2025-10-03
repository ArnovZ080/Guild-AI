// Funnel Integrations Scaffold
// Provides a unified interface to fetch funnel plans from external tools.

import { useCallback, useEffect, useState } from 'react';

const DEFAULT_TIMEOUT_MS = 8000;

async function fetchWithTimeout(url, options = {}, timeout = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(id);
  }
}

export async function getClickFunnelsPlan() {
  // Placeholder: connect via backend proxy API if needed
  return null;
}

export async function getGHLPlan() {
  return null;
}

export async function getHubSpotPlan() {
  return null;
}

export async function getN8NPlan() {
  return null;
}

export async function getSystemePlan() {
  return null;
}

export function mergeFunnelPlans(plans = []) {
  // Simple winner-first merge; replace with smarter logic later
  for (const plan of plans) {
    if (plan && Array.isArray(plan.stages) && plan.stages.length) return plan;
  }
  return null;
}

export function useIntegratedFunnelPlan(enabled = true) {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [source, setSource] = useState(null);

  const load = useCallback(async () => {
    if (!enabled) return;
    setLoading(true); setError(null);
    try {
      const results = await Promise.allSettled([
        getClickFunnelsPlan(),
        getGHLPlan(),
        getHubSpotPlan(),
        getN8NPlan(),
        getSystemePlan(),
      ]);
      const candidates = results.map(r => r.status === 'fulfilled' ? r.value : null);
      const merged = mergeFunnelPlans(candidates);
      setPlan(merged);
      if (merged) {
        const idx = candidates.findIndex(p => p && p === merged);
        const names = ['ClickFunnels','GoHighLevel','HubSpot','n8n','Systeme.io'];
        setSource(names[idx] || 'Connected funnel integrations');
      }
    } catch (e) {
      setError(e.message || 'Failed to load funnel integrations');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => { load(); }, [load]);

  return { plan, source, loading, error, refetch: load };
}



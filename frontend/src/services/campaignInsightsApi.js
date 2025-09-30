// Lightweight frontend-only insights stub for thresholds/benchmarks.
// Replace with real agent-backed endpoints when available.

// Agent-backed endpoints
export async function getBenchmarks() {
  const res = await fetch('/api/agents/benchmarks');
  if (!res.ok) throw new Error('Failed to fetch benchmarks');
  const data = await res.json();
  return data.ads;
}

export async function getEmailBenchmarks() {
  const res = await fetch('/api/agents/benchmarks');
  if (!res.ok) throw new Error('Failed to fetch email benchmarks');
  const data = await res.json();
  return data.email;
}

export async function getCompetitiveBenchmarks() {
  const res = await fetch('/api/agents/competitive');
  if (!res.ok) throw new Error('Failed to fetch competitive benchmarks');
  return await res.json();
}

// Simple local persistence for campaign assets (placeholder for backend wiring)
const ASSETS_STORE_KEY = 'guild_campaign_assets_store';

export function loadCampaignAssets(campaignId) {
  try {
    const raw = localStorage.getItem(ASSETS_STORE_KEY);
    const db = raw ? JSON.parse(raw) : {};
    return db[campaignId] || { copy: [], images: [], videos: [], emails: [] };
  } catch {
    return { copy: [], images: [], videos: [], emails: [] };
  }
}

export function saveCampaignAssets(campaignId, assets) {
  try {
    const raw = localStorage.getItem(ASSETS_STORE_KEY);
    const db = raw ? JSON.parse(raw) : {};
    db[campaignId] = assets;
    localStorage.setItem(ASSETS_STORE_KEY, JSON.stringify(db));
    return true;
  } catch {
    return false;
  }
}

// Server-backed assets for shared library
export async function fetchLibraryAssets() {
  const res = await fetch('/api/workspace/assets');
  if (!res.ok) return [];
  return await res.json();
}

export async function uploadLibraryAsset(formData) {
  const res = await fetch('/api/workspace/assets', {
    method: 'POST',
    body: formData
  });
  if (!res.ok) throw new Error('Upload failed');
  return await res.json();
}

// Anomaly thresholds persistence
const THRESHOLDS_KEY = 'guild_campaign_thresholds';

export function loadAnomalyThresholds() {
  try {
    const raw = localStorage.getItem(THRESHOLDS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function saveAnomalyThresholds(thresholds) {
  try {
    localStorage.setItem(THRESHOLDS_KEY, JSON.stringify(thresholds));
    return true;
  } catch { return false; }
}

// A/B results via backend
export async function loadABResults(campaignId) {
  const res = await fetch(`/api/agents/campaigns/${encodeURIComponent(campaignId)}/ab_results`);
  if (!res.ok) return null;
  const data = await res.json();
  return Object.keys(data).length ? data : null;
}

export async function saveABResults(campaignId, results) {
  const res = await fetch(`/api/agents/campaigns/${encodeURIComponent(campaignId)}/ab_results`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(results)
  });
  return res.ok;
}

export function computeABWinner(results) {
  if (!results) return null;
  const a = results.A || {};
  const b = results.B || {};
  // Simple rule: prioritize conversions, then CTR
  const convA = a.conversions ?? 0, convB = b.conversions ?? 0;
  if (convA !== convB) return convA > convB ? 'A' : 'B';
  const ctrA = a.ctr ?? 0, ctrB = b.ctr ?? 0;
  if (ctrA !== ctrB) return ctrA > ctrB ? 'A' : 'B';
  return null;
}

// Sentiment analysis via agent endpoint
export async function analyzeSentiment(texts = []) {
  const res = await fetch('/api/agents/sentiment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ texts })
  });
  if (!res.ok) throw new Error('Failed to analyze sentiment');
  return await res.json();
}

// Workflow activity log via backend
export async function logCampaignActivity(campaignId, entry) {
  const res = await fetch(`/api/agents/campaigns/${encodeURIComponent(campaignId)}/activity`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry)
  });
  return res.ok;
}

export async function loadCampaignActivity(campaignId) {
  const res = await fetch(`/api/agents/campaigns/${encodeURIComponent(campaignId)}/activity`);
  if (!res.ok) return [];
  return await res.json();
}

// Attribution via backend
export async function loadAttribution(campaignId) {
  const res = await fetch(`/api/agents/campaigns/${encodeURIComponent(campaignId)}/attribution`);
  if (!res.ok) return { touches: [] };
  return await res.json();
}

export async function saveAttribution(campaignId, touches) {
  const res = await fetch(`/api/agents/campaigns/${encodeURIComponent(campaignId)}/attribution`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(touches)
  });
  return res.ok;
}

// Learning loop endpoints
export async function ingestLearningSignal(payload) {
  const res = await fetch('/api/agents/learning/ingest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to ingest learning signal');
  return await res.json();
}

export async function fetchLearningRecommendations(campaignId) {
  const url = campaignId ? `/api/agents/learning/recommendations?campaign_id=${encodeURIComponent(campaignId)}` : '/api/agents/learning/recommendations';
  const res = await fetch(url);
  if (!res.ok) return { recommendations: [] };
  return await res.json();
}

export async function fetchLearningUpdates(campaignId) {
  const res = await fetch(`/api/agents/learning/updates/${encodeURIComponent(campaignId)}`);
  if (!res.ok) return { updates: [] };
  return await res.json();
}



// Lightweight frontend-only insights stub for thresholds/benchmarks.
// Replace with real agent-backed endpoints when available.

export async function getBenchmarks() {
  // Simulate fetch with a short delay
  await new Promise(r => setTimeout(r, 50));
  return {
    ctr_min: 1.2,      // %
    roas_min: 2.5,     // x
    cpa_max: 60        // USD
  };
}

export async function getEmailBenchmarks() {
  await new Promise(r => setTimeout(r, 50));
  return {
    delivery_min: 97,     // % delivered/sent
    open_rate_min: 22,    // %
    click_rate_min: 2.5,  // % CTR on email
    unsubscribe_max: 0.4, // %
    bounce_max: 1.0       // %
  };
}

// Competitive benchmarks per platform (stubbed averages)
export async function getCompetitiveBenchmarks() {
  await new Promise(r => setTimeout(r, 50));
  return {
    facebook: { cpa_avg: 40, ctr_avg: 1.5, roas_avg: 2.8 },
    instagram: { cpa_avg: 45, ctr_avg: 1.7, roas_avg: 3.0 },
    google: { cpa_avg: 55, ctr_avg: 2.5, roas_avg: 3.2 },
    tiktok: { cpa_avg: 35, ctr_avg: 2.2, roas_avg: 2.6 },
    linkedin: { cpa_avg: 80, ctr_avg: 0.9, roas_avg: 2.2 },
    twitter: { cpa_avg: 50, ctr_avg: 1.2, roas_avg: 2.0 }
  };
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



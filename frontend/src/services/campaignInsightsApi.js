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



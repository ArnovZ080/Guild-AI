const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : '');

function authHeaders() {
  const token = localStorage.getItem('guild.auth.jwt') || localStorage.getItem('auth_token') || localStorage.getItem('jwt');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function getSubscriptionInfo() {
  try {
    const res = await fetch(`${API_BASE}/subscription/info`, { headers: authHeaders() });
    if (!res.ok) throw new Error(String(res.status));
    return await res.json();
  } catch (e) {
    // Fallback to free tier structure so UI can render even without backend
    return {
      tier: 'free',
      status: 'free',
      credits: { used: 0, limit: 100, bonus: 0, remaining: 100 },
      plan_details: { name: 'Free', features: ['basic_chat', 'limited_workflows'] }
    };
  }
}

export async function getPlans() {
  try {
    const res = await fetch(`${API_BASE}/subscription/plans`, { headers: authHeaders() });
    if (!res.ok) throw new Error(String(res.status));
    return await res.json();
  } catch (e) {
    return { plans: [] };
  }
}



const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

function authHeaders() {
  const token = localStorage.getItem('guild.auth.jwt');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function listAvailableAgents(query = '') {
  const url = new URL(`${API_BASE}/api/agents/available`);
  if (query) url.searchParams.set('q', query);
  const res = await fetch(url.toString(), { headers: authHeaders() });
  if (!res.ok) throw new Error(`Failed to load agents (${res.status})`);
  const data = await res.json();
  return data.agents || [];
}

export async function sendTaskToAgent(agentId, payload) {
  const res = await fetch(`${API_BASE}/api/agents/${encodeURIComponent(agentId)}/tasks`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Task dispatch failed (${res.status})`);
  return await res.json();
}

export async function getTaskUpdates(taskId, sinceIso) {
  const url = new URL(`${API_BASE}/api/tasks/${encodeURIComponent(taskId)}/updates`);
  if (sinceIso) url.searchParams.set('since', sinceIso);
  const res = await fetch(url.toString(), { headers: authHeaders() });
  if (!res.ok) throw new Error(`Get updates failed (${res.status})`);
  return await res.json();
}



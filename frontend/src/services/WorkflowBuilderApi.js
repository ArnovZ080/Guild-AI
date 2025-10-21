/**
 * Workflow Builder API helpers
 */
import apiService from './api.js';

export async function saveWorkflow({ userId, name, description, definition }) {
  const res = await apiService.post('/api/workflows/save', {
    user_id: userId,
    name,
    description: description || '',
    definition
  });
  return res.data;
}

export async function listWorkflows(userId) {
  const res = await apiService.get(`/api/workflows/${userId}`);
  return res.data;
}

export async function activateWorkflow(workflowId, userId) {
  const res = await apiService.post(`/api/workflows/${workflowId}/activate`, null, {
    params: { user_id: userId }
  });
  return res.data;
}

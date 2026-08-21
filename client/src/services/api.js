const API_BASE = '/api';

/**
 * Helper to make authenticated HTTP requests with user persona header
 */
async function fetchApi(endpoint, options = {}) {
  const currentUserId = localStorage.getItem('approval_app_user_id') || 'usr_alex';
  
  const headers = {
    'Content-Type': 'application/json',
    'x-user-id': currentUserId,
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }
  return data;
}

export const api = {
  // Auth & Users
  getUsers: () => fetchApi('/auth/users'),
  login: (credentials) => fetchApi('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getMe: () => fetchApi('/auth/me'),

  // Requests
  getRequests: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchApi(`/requests${query ? `?${query}` : ''}`);
  },
  getRequestById: (id) => fetchApi(`/requests/${id}`),
  createRequest: (requestData) => fetchApi('/requests', { method: 'POST', body: JSON.stringify(requestData) }),
  previewPath: (formData) => fetchApi('/requests/preview-path', { method: 'POST', body: JSON.stringify(formData) }),
  approveRequest: (id, comment) => fetchApi(`/requests/${id}/approve`, { method: 'POST', body: JSON.stringify({ comment }) }),
  rejectRequest: (id, reason) => fetchApi(`/requests/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) }),
  requestInfo: (id, question) => fetchApi(`/requests/${id}/request-info`, { method: 'POST', body: JSON.stringify({ question }) }),
  respondInfo: (id, data) => fetchApi(`/requests/${id}/respond-info`, { method: 'POST', body: JSON.stringify(data) }),
  simulateSlaBreach: (id) => fetchApi(`/requests/${id}/simulate-sla-breach`, { method: 'POST' }),

  // Workflows
  getWorkflows: () => fetchApi('/workflows'),
  getWorkflowById: (id) => fetchApi(`/workflows/${id}`),
  saveWorkflow: (workflowData) => fetchApi('/workflows', { method: 'POST', body: JSON.stringify(workflowData) }),
  deleteWorkflow: (id) => fetchApi(`/workflows/${id}`, { method: 'DELETE' }),
  testRule: (testData) => fetchApi('/workflows/test-rule', { method: 'POST', body: JSON.stringify(testData) }),

  // Analytics
  getAnalytics: () => fetchApi('/analytics/overview'),

  // Notifications
  getNotifications: () => fetchApi('/notifications'),
  markNotificationRead: (id) => fetchApi(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => fetchApi('/notifications/read-all', { method: 'POST' }),

  // User Management
  getAllUsers: () => fetchApi('/users'),
  updateUser: (id, data) => fetchApi(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  createUser: (data) => fetchApi('/users', { method: 'POST', body: JSON.stringify(data) }),

  // Settings
  getSettings: () => fetchApi('/settings'),
  updateSettings: (data) => fetchApi('/settings', { method: 'PUT', body: JSON.stringify(data) }),
  resetDemoData: () => fetchApi('/settings/reset', { method: 'POST' })
};

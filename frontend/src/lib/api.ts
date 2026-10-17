import {
  AnalyticsOverview,
  UserSummary,
  UserActivityResponse,
  AlertItem,
  AIUsageStats,
  Application,
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
      next: { revalidate: 5 },
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`API call failed for ${path}:`, err);
    throw err;
  }
}

export const api = {
  getOverview: () => fetchJson<AnalyticsOverview>('/api/v1/analytics/overview'),
  getUsers: (search?: string, app?: string) => {
    const q = new URLSearchParams();
    if (search) q.set('search', search);
    if (app) q.set('app_id', app);
    return fetchJson<UserSummary[]>(`/api/v1/users?${q.toString()}`);
  },
  getUserActivity: (userId: string, app?: string, eventType?: string, page = 1) => {
    const q = new URLSearchParams();
    if (app) q.set('application_id', app);
    if (eventType) q.set('event_type', eventType);
    q.set('page', page.toString());
    return fetchJson<UserActivityResponse>(`/api/v1/users/${encodeURIComponent(userId)}/activity?${q.toString()}`);
  },
  getApplications: () => fetchJson<Application[]>('/api/v1/applications'),
  getAlerts: (status?: string, severity?: string) => {
    const q = new URLSearchParams();
    if (status) q.set('status', status);
    if (severity) q.set('severity', severity);
    return fetchJson<AlertItem[]>(`/api/v1/alerts?${q.toString()}`);
  },
  resolveAlert: (alertId: string, note?: string) =>
    fetchJson<AlertItem>(`/api/v1/alerts/${alertId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ note: note || 'Resolved by Administrator' }),
    }),
  getAIUsage: () => fetchJson<AIUsageStats>('/api/v1/analytics/ai-usage'),
  queryAssistant: (query: string, targetUserId?: string) =>
    fetchJson<any>('/api/v1/assistant/query', {
      method: 'POST',
      body: JSON.stringify({ query, target_user_id: targetUserId }),
    }),
};

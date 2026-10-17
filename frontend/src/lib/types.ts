export interface Application {
  id: string;
  code: string;
  name: string;
  description?: string;
  fqdn?: string;
  icon?: string;
  is_active: boolean;
  integration_status: string;
  events_count?: number;
  active_users_count?: number;
}

export interface UserSummary {
  id: string;
  issuer: string;
  sub: string;
  email?: string;
  name?: string;
  avatar_url?: string;
  role: string;
  is_active: boolean;
  last_active_at?: string;
  accessible_apps: string[];
  total_events: number;
}

export interface ActivityTimelineItem {
  event_id: string;
  event_type: string;
  application_id: string;
  application_name?: string;
  occurred_at: string;
  outcome: 'success' | 'failure' | 'denied';
  resource_type?: string;
  resource_id?: string;
  resource_name?: string;
  metadata: Record<string, any>;
  correlation_id?: string;
}

export interface UserActivityResponse {
  user: UserSummary;
  timeline: ActivityTimelineItem[];
  total_events: number;
  page: number;
  page_size: number;
  covered_apps: string[];
  unintegrated_apps: string[];
  date_range: { from?: string; to?: string };
}

export interface AnalyticsOverview {
  total_users: number;
  dau: number;
  wau: number;
  mau: number;
  total_events_today: number;
  total_events_all_time: number;
  active_alerts_count: number;
  successful_logins_24h: number;
  failed_logins_24h: number;
  ai_tokens_today: number;
  ai_cost_today_usd: number;
  top_applications: Array<{
    application_id: string;
    name: string;
    event_count: number;
    user_count: number;
    percentage: number;
    status: string;
  }>;
  activity_trend_7d: Array<{ date: string; count: number }>;
}

export interface AlertItem {
  id: string;
  rule_id?: string;
  application_id?: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  status: 'open' | 'acknowledged' | 'resolved';
  occurrence_count: number;
  first_seen_at: string;
  last_seen_at: string;
  resolved_at?: string;
  resolved_by?: string;
  metadata: Record<string, any>;
}

export interface AIUsageStats {
  total_requests: number;
  total_tokens: number;
  prompt_tokens: number;
  completion_tokens: number;
  estimated_cost_usd: number;
  error_count: number;
  models: Array<{ model: string; requests: number; tokens: number; cost: number }>;
  applications: Array<{ application_id: string; requests: number; tokens: number; cost: number }>;
  timeline: Array<{ date: string; tokens: number }>;
}

export interface SupervisorActor {
  issuer: string;
  sub: string;
  email?: string;
  name?: string;
}

export interface SupervisorResource {
  type: string;
  id: string;
  name?: string;
  mime_type?: string;
  size_bytes?: number;
}

export interface SupervisorEvent {
  event_id: string;
  event_type: string;
  event_version?: number;
  application?: string;
  actor?: SupervisorActor;
  occurred_at?: string;
  resource?: SupervisorResource;
  outcome?: 'success' | 'failure' | 'denied';
  metadata?: Record<string, any>;
  correlation_id?: string;
}

export interface SupervisorConfig {
  endpoint?: string;
  apiKey?: string;
  applicationId?: string;
  batchSize?: number;
  flushIntervalMs?: number;
  maxRetries?: number;
  timeoutMs?: number;
  enableOutbox?: boolean;
}

export interface AIUsageReport {
  requestId?: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens?: number;
  estimatedCost?: number;
  durationMs?: number;
  status?: 'success' | 'error' | 'timeout';
  userSub?: string;
  userEmail?: string;
}

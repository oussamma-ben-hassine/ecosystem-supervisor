import { randomUUID } from 'crypto';
import { SupervisorConfig, SupervisorEvent, SupervisorActor, AIUsageReport } from './types';

export class SupervisorClient {
  private endpoint: string;
  private apiKey: string;
  private applicationId: string;
  private batchSize: number;
  private flushIntervalMs: number;
  private maxRetries: number;
  private timeoutMs: number;

  private queue: SupervisorEvent[] = [];
  private flushTimer: any = null;
  private isFlushing = false;

  constructor(config: SupervisorConfig = {}) {
    this.endpoint = (
      config.endpoint ||
      process.env.SUPERVISOR_URL ||
      'https://supervisor.oussamma.tn'
    ).replace(/\/$/, '');
    this.apiKey = config.apiKey || process.env.SUPERVISOR_API_KEY || '';
    this.applicationId = config.applicationId || process.env.SUPERVISOR_APP_ID || '';
    this.batchSize = config.batchSize || 20;
    this.flushIntervalMs = config.flushIntervalMs || 3000;
    this.maxRetries = config.maxRetries || 3;
    this.timeoutMs = config.timeoutMs || 4000;

    if (typeof window === 'undefined') {
      this.startTimer();
    }
  }

  private startTimer() {
    if (this.flushTimer) clearInterval(this.flushTimer);
    this.flushTimer = setInterval(() => {
      this.flush().catch(() => {});
    }, this.flushIntervalMs);
    if (this.flushTimer.unref) {
      this.flushTimer.unref();
    }
  }

  /**
   * Track an arbitrary business or audit event safely and asynchronously.
   */
  public track(event: Partial<SupervisorEvent> & { event_type: string }): void {
    if (!this.apiKey) {
      // Graceful no-op if supervisor credentials not set
      return;
    }

    const payload: SupervisorEvent = {
      event_id: event.event_id || randomUUID(),
      event_type: event.event_type,
      event_version: event.event_version || 1,
      application: this.applicationId || event.application,
      actor: event.actor,
      occurred_at: event.occurred_at || new Date().toISOString(),
      resource: event.resource,
      outcome: event.outcome || 'success',
      metadata: event.metadata || {},
      correlation_id: event.correlation_id,
    };

    this.queue.push(payload);

    if (this.queue.length >= this.batchSize) {
      this.flush().catch(() => {});
    }
  }

  /**
   * Identify a user session or profile in the supervisor directory.
   */
  public identify(actor: SupervisorActor, metadata?: Record<string, any>): void {
    this.track({
      event_type: 'user.identified',
      actor,
      metadata,
    });
  }

  /**
   * Report AI token consumption and latency metrics from LiteLLM / LLMs.
   */
  public reportUsage(report: AIUsageReport): void {
    this.track({
      event_type: 'ai.completion',
      actor: report.userSub
        ? {
            issuer: process.env.SSO_ISSUER || 'https://sso-a.oussamma.tn',
            sub: report.userSub,
            email: report.userEmail,
          }
        : undefined,
      outcome: report.status === 'error' ? 'failure' : 'success',
      metadata: {
        model: report.model,
        prompt_tokens: report.promptTokens,
        completion_tokens: report.completionTokens,
        total_tokens: report.totalTokens || (report.promptTokens + report.completionTokens),
        cost: report.estimatedCost || 0.0,
        duration_ms: report.durationMs || 0,
        request_id: report.requestId,
      },
    });
  }

  /**
   * Flush in-memory queue to the Supervisor API with retry backoff.
   */
  public async flush(): Promise<void> {
    if (this.isFlushing || this.queue.length === 0 || !this.apiKey) return;
    this.isFlushing = true;

    const batch = this.queue.splice(0, this.batchSize);

    try {
      await this.sendBatchWithRetry(batch, 0);
    } catch (err) {
      // Put back into queue if under limit
      if (this.queue.length < 500) {
        this.queue.unshift(...batch);
      }
    } finally {
      this.isFlushing = false;
    }
  }

  private async sendBatchWithRetry(batch: SupervisorEvent[], attempt: number): Promise<void> {
    const url = `${this.endpoint}/api/v1/events/batch`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Supervisor-Key': this.apiKey,
        },
        body: JSON.stringify({ events: batch }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok && attempt < this.maxRetries) {
        const backoff = Math.pow(2, attempt) * 500;
        await new Promise((r) => setTimeout(r, backoff));
        return this.sendBatchWithRetry(batch, attempt + 1);
      }
    } catch (e) {
      if (attempt < this.maxRetries) {
        const backoff = Math.pow(2, attempt) * 500;
        await new Promise((r) => setTimeout(r, backoff));
        return this.sendBatchWithRetry(batch, attempt + 1);
      }
      throw e;
    }
  }

  public async close(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    await this.flush();
  }
}

let globalClient: SupervisorClient | null = null;

export function initSupervisor(config?: SupervisorConfig): SupervisorClient {
  globalClient = new SupervisorClient(config);
  return globalClient;
}

export function getSupervisor(): SupervisorClient {
  if (!globalClient) {
    globalClient = new SupervisorClient();
  }
  return globalClient;
}

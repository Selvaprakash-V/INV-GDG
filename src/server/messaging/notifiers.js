/**
 * Notifier interface (Strategy): send({ to, subject, text, html }) => Promise<void>
 * Swap channels (console, email provider, SMS) without touching business logic.
 */

export class ConsoleNotifier {
  constructor({ logger }) {
    this.logger = logger;
    this.kind = 'console';
  }

  /**
   * No email provider configured: the log IS the outbox (development, tests, or a pilot
   * before Resend is set up). Full text is logged so reset/confirmation links are usable.
   * Configure NOTIFIER=resend in production so links are not readable in logs.
   */
  async send({ to, subject, text }) {
    this.logger.info('notification (console)', { to, subject, body: text });
  }
}

export class ResendNotifier {
  constructor({ apiKey, from, fetchImpl = fetch, timeoutMs = 10_000 }) {
    this.apiKey = apiKey;
    this.from = from;
    this.fetch = fetchImpl;
    this.timeoutMs = timeoutMs;
    this.kind = 'resend';
  }

  async send({ to, subject, text, html }) {
    const res = await this.fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: this.from, to: [to], subject, text, html }),
      signal: AbortSignal.timeout(this.timeoutMs),
    });
    if (!res.ok) {
      // Throwing lets the job queue retry with backoff.
      throw new Error(`Email provider responded ${res.status}`);
    }
  }
}

export function createNotifier(env, logger) {
  if (env.NOTIFIER === 'resend') return new ResendNotifier({ apiKey: env.RESEND_API_KEY, from: env.NOTIFY_FROM });
  return new ConsoleNotifier({ logger });
}

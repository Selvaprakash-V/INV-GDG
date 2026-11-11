/**
 * Notifier interface (Strategy): send({ to, subject, text, html }) => Promise<void>
 * Swap channels (console, email provider, SMS) without touching business logic.
 */

export class ConsoleNotifier {
  constructor({ logger }) {
    this.logger = logger;
    this.kind = 'console';
  }

  async send({ to, subject, text }) {
    this.logger.info('notification (console)', { to, subject, preview: text?.slice(0, 200) });
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

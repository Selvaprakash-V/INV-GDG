import { JOBS } from '../config/constants';

/**
 * Durable async work queue (at-least-once delivery).
 * Handlers are registered per job type (Strategy registry) and must be idempotent.
 */
export class JobQueue {
  /** @param {{ jobRepository: import('../repositories/JobRepository').JobRepository, logger?: any, now?: () => Date }} deps */
  constructor({ jobRepository, logger, now = () => new Date() }) {
    this.jobs = jobRepository;
    this.logger = logger;
    this.now = now;
    /** @type {Map<string, (payload: any) => Promise<void>>} */
    this.handlers = new Map();
  }

  register(type, handler) {
    this.handlers.set(type, handler);
    return this;
  }

  enqueue(type, payload, opts = {}) {
    if (!this.handlers.has(type)) throw new Error(`No handler registered for job type ${type}`);
    // Use the queue's clock for runAt so "due" checks and scheduling agree.
    return this.jobs.enqueue({ type, payload, runAt: this.now(), ...opts });
  }

  static backoffMs(attempts) {
    return Math.min(JOBS.MAX_BACKOFF_MS, JOBS.BASE_BACKOFF_MS * 2 ** Math.max(0, attempts - 1));
  }

  /** Process up to `max` due jobs. Safe to run concurrently on many instances. */
  async drain({ max = JOBS.DRAIN_BATCH } = {}) {
    const summary = { processed: 0, succeeded: 0, failed: 0, dead: 0 };
    for (let i = 0; i < max; i += 1) {
      const job = await this.jobs.claimNext(this.now(), JOBS.LOCK_MS);
      if (!job) break;
      summary.processed += 1;
      const handler = this.handlers.get(job.type);
      try {
        if (!handler) throw new Error(`Unknown job type ${job.type}`);
        await handler(job.payload, job);
        await this.jobs.markDone(job._id, this.now());
        summary.succeeded += 1;
      } catch (err) {
        const dead = job.attempts >= job.maxAttempts || !handler;
        await this.jobs.markFailed(job._id, {
          error: err?.message || err,
          retryAt: new Date(this.now().getTime() + JobQueue.backoffMs(job.attempts)),
          dead,
        });
        summary[dead ? 'dead' : 'failed'] += 1;
        this.logger?.[dead ? 'error' : 'warn']('job failed', { jobId: String(job._id), type: job.type, attempts: job.attempts, dead, err });
      }
    }
    return summary;
  }
}

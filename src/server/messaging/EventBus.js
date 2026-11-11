/**
 * In-process domain event bus (Observer pattern).
 * Publishers (services) don't know who reacts: cache invalidation, alerts, etc.
 * Subscriber failures are isolated and logged; they never fail the request.
 */
export class EventBus {
  constructor({ logger } = {}) {
    this.logger = logger;
    /** @type {Map<string, Set<Function>>} */
    this.handlers = new Map();
  }

  on(event, handler) {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set());
    this.handlers.get(event).add(handler);
    return () => this.handlers.get(event)?.delete(handler);
  }

  async emit(event, payload) {
    const handlers = [...(this.handlers.get(event) || [])];
    // Wrap in a promise so synchronous throws are isolated too.
    const results = await Promise.allSettled(handlers.map((h) => Promise.resolve().then(() => h(payload))));
    results.forEach((r) => {
      if (r.status === 'rejected') this.logger?.error('event handler failed', { event, err: r.reason });
    });
  }
}

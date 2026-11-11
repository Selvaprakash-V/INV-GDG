import { addDays, daysUntil } from '@/shared/expiry';
import { EXPIRY, STOCK_LEVELS } from '@/shared/constants';
import { JOB_TYPES } from '../config/constants';
import { parse, contactSchema } from '../validation/schemas';

const DIGEST_ITEM_LIMIT = 50;

/**
 * Expiry & stock alerts. All sending happens in background jobs (off the request
 * path); this service only decides *what* to enqueue and how to render it.
 */
export class NotificationService {
  constructor({ userRepository, productRepository, jobQueue, notifier, appUrl, supportEmail, timezone, logger, now = () => new Date() }) {
    this.supportEmail = supportEmail;
    this.users = userRepository;
    this.products = productRepository;
    this.queue = jobQueue;
    this.notifier = notifier;
    this.appUrl = appUrl;
    this.timezone = timezone;
    this.logger = logger;
    this.now = now;
  }

  /** Called by the scheduler (cron). Idempotent per store per day via dedupeKey. */
  async scheduleExpiryDigests() {
    const now = this.now();
    const day = new Intl.DateTimeFormat('en-CA', { timeZone: this.timezone }).format(now);
    let scanned = 0;
    let enqueued = 0;
    for await (const admin of this.users.adminsWithEmailDigest()) {
      scanned += 1;
      const threshold = admin.notificationSettings?.expiryThresholdDays ?? EXPIRY.DEFAULT_THRESHOLD_DAYS;
      const count = await this.products.countExpiringForStore(admin._id, now, addDays(now, threshold));
      if (count === 0) continue;
      const { created } = await this.queue.enqueue(
        JOB_TYPES.EXPIRY_DIGEST,
        { storeId: String(admin._id) },
        { dedupeKey: `expiry-digest:${admin._id}:${day}` }
      );
      if (created) enqueued += 1;
    }
    return { scanned, enqueued, day };
  }

  /** Event subscriber: after a sale, alert on products that dropped below the threshold. */
  async onPurchaseRecorded({ storeId, purchaseId, remaining = [] }) {
    const low = remaining.filter((r) => r.stock < STOCK_LEVELS.LOW_STOCK_ALERT);
    if (low.length === 0) return;
    await this.queue.enqueue(
      JOB_TYPES.LOW_STOCK_ALERT,
      { storeId, items: low },
      { dedupeKey: `low-stock:${purchaseId}` }
    );
  }

  /** Contact form: validated, then delivered asynchronously to the support inbox. */
  async submitContactMessage(input) {
    const data = parse(contactSchema, input);
    await this.queue.enqueue(JOB_TYPES.CONTACT_MESSAGE, { ...data, receivedAt: this.now().toISOString() });
  }

  // ---------- job handlers (registered on the JobQueue) ----------

  async handleContactMessage({ name, email, message, receivedAt }) {
    await this.notifier.send({
      to: this.supportEmail,
      subject: `[TrackIt] Contact form: ${name}`,
      text: [`From: ${name} <${email}>`, `Received: ${receivedAt}`, '', message].join('\n'),
    });
  }

  async handleExpiryDigest({ storeId }) {
    const admin = await this.users.findById(storeId);
    if (!admin || admin.notificationSettings?.emailEnabled === false) return;
    const now = this.now();
    const threshold = admin.notificationSettings?.expiryThresholdDays ?? EXPIRY.DEFAULT_THRESHOLD_DAYS;
    const items = await this.products.findExpiringForStore(storeId, now, addDays(now, threshold), DIGEST_ITEM_LIMIT);
    if (items.length === 0) return;
    const lines = items.map((p) => `• ${p.name} — ${p.stock} in stock, expires in ${daysUntil(p.expiryDate, now)} day(s)`);
    await this.notifier.send({
      to: admin.email,
      subject: `[TrackIt] ${items.length} product(s) expiring within ${threshold} days at ${admin.shopName}`,
      text: [`Hi ${admin.fullName},`, '', 'These products are expiring soon:', ...lines, '', `Review them: ${this.appUrl}/admin/dashboard?tab=expiry`].join('\n'),
    });
  }

  async handleLowStock({ storeId, items }) {
    const admin = await this.users.findById(storeId);
    if (!admin || admin.notificationSettings?.emailEnabled === false) return;
    await this.notifier.send({
      to: admin.email,
      subject: `[TrackIt] Low stock: ${items.map((i) => i.name).join(', ').slice(0, 120)}`,
      text: [
        `Hi ${admin.fullName},`,
        '',
        `These products fell below ${STOCK_LEVELS.LOW_STOCK_ALERT} units after a sale:`,
        ...items.map((i) => `• ${i.name}: ${i.stock} left`),
        '',
        `${this.appUrl}/admin/dashboard?tab=inventory`,
      ].join('\n'),
    });
  }
}

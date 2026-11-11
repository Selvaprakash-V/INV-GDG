import { Job, JOB_STATUS } from '../db/models/Job';

export class JobRepository {
  constructor({ model = Job } = {}) {
    this.model = model;
  }

  /** Idempotent when dedupeKey is given (upsert; existing job is left untouched). */
  async enqueue({ type, payload, runAt = new Date(), dedupeKey, maxAttempts }) {
    if (!dedupeKey) {
      const doc = await this.model.create({ type, payload, runAt, ...(maxAttempts ? { maxAttempts } : {}) });
      return { id: String(doc._id), created: true };
    }
    const res = await this.model.updateOne(
      { dedupeKey },
      { $setOnInsert: { type, payload, runAt, dedupeKey, status: JOB_STATUS.PENDING, ...(maxAttempts ? { maxAttempts } : {}) } },
      { upsert: true }
    );
    return { id: res.upsertedId ? String(res.upsertedId) : null, created: Boolean(res.upsertedCount) };
  }

  /** Atomically claim the next due job (also recovers jobs whose lock expired). */
  async claimNext(now, lockMs) {
    return this.model
      .findOneAndUpdate(
        {
          $or: [
            { status: JOB_STATUS.PENDING, runAt: { $lte: now } },
            { status: JOB_STATUS.PROCESSING, lockedUntil: { $lte: now } },
          ],
        },
        { $set: { status: JOB_STATUS.PROCESSING, lockedUntil: new Date(now.getTime() + lockMs) }, $inc: { attempts: 1 } },
        { sort: { runAt: 1 }, new: true }
      )
      .lean();
  }

  async markDone(id, now = new Date()) {
    await this.model.updateOne({ _id: id }, { $set: { status: JOB_STATUS.DONE, completedAt: now, lockedUntil: null, lastError: null } });
  }

  async markFailed(id, { error, retryAt, dead }) {
    await this.model.updateOne(
      { _id: id },
      {
        $set: {
          status: dead ? JOB_STATUS.DEAD : JOB_STATUS.PENDING,
          runAt: retryAt,
          lockedUntil: null,
          lastError: String(error).slice(0, 1000),
        },
      }
    );
  }

  async stats() {
    const rows = await this.model.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    return Object.fromEntries(rows.map((r) => [r._id, r.count]));
  }
}

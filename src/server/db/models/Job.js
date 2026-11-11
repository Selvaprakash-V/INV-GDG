import mongoose from 'mongoose';
import { JOBS } from '../../config/constants';

export const JOB_STATUS = Object.freeze({
  PENDING: 'pending',
  PROCESSING: 'processing',
  DONE: 'done',
  DEAD: 'dead',
});

// Durable job queue (async messaging) stored in MongoDB, so no extra broker
// is needed for the pilot. See docs/ARCHITECTURE.md (Step 8) for the trade-off.
const JobSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    payload: { type: mongoose.Schema.Types.Mixed, default: {} },
    status: { type: String, enum: Object.values(JOB_STATUS), default: JOB_STATUS.PENDING },
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: JOBS.DEFAULT_MAX_ATTEMPTS },
    runAt: { type: Date, default: Date.now },
    lockedUntil: { type: Date, default: null },
    lastError: { type: String, default: null },
    /** Idempotency key: the same logical job is only enqueued once. */
    dedupeKey: { type: String },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

JobSchema.index({ status: 1, runAt: 1 });
JobSchema.index({ dedupeKey: 1 }, { unique: true, partialFilterExpression: { dedupeKey: { $type: 'string' } } });
JobSchema.index({ completedAt: 1 }, { expireAfterSeconds: JOBS.RETAIN_DONE_SECONDS });

export const Job = mongoose.models.Job || mongoose.model('Job', JobSchema);

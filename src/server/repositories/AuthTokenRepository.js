import { createHash, randomBytes } from 'node:crypto';
import { AuthToken } from '../db/models/AuthToken';
import { AUTH } from '../config/constants';

export const hashToken = (raw) => createHash('sha256').update(String(raw)).digest('hex');

export class AuthTokenRepository {
  constructor({ model = AuthToken } = {}) {
    this.model = model;
  }

  /**
   * Issue a new token and revoke any earlier unused one for the same purpose,
   * so only the most recent emailed link works. Returns the raw token (never stored).
   */
  async issue(userId, purpose, ttlMs, now = new Date()) {
    const raw = randomBytes(AUTH.TOKEN_BYTES).toString('base64url');
    await this.model.deleteMany({ userId, purpose, usedAt: null });
    await this.model.create({ userId, purpose, tokenHash: hashToken(raw), expiresAt: new Date(now.getTime() + ttlMs) });
    return raw;
  }

  /** Atomically mark a valid token as used. Returns { userId } or null (unknown, used or expired). */
  async consume(raw, purpose, now = new Date()) {
    if (!raw || typeof raw !== 'string') return null;
    const doc = await this.model
      .findOneAndUpdate(
        { tokenHash: hashToken(raw), purpose, usedAt: null, expiresAt: { $gt: now } },
        { $set: { usedAt: now } },
        { new: true }
      )
      .lean();
    return doc ? { userId: String(doc.userId) } : null;
  }

  async deleteForUser(userId, { purpose, session } = {}) {
    await this.model.deleteMany({ userId, ...(purpose ? { purpose } : {}) }, { session });
  }
}

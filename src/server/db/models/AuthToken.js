import mongoose from 'mongoose';
import { TOKEN_PURPOSE } from '../../config/constants';

/**
 * Single-use account tokens (password reset, email verification).
 * Only a SHA-256 hash is stored, so a database leak cannot be replayed as links.
 * Expired tokens are purged by MongoDB's TTL monitor.
 */
const AuthTokenSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    purpose: { type: String, enum: Object.values(TOKEN_PURPOSE), required: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

AuthTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
AuthTokenSchema.index({ userId: 1, purpose: 1 });

export const AuthToken = mongoose.models.AuthToken || mongoose.model('AuthToken', AuthTokenSchema);

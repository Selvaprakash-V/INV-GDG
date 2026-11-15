import { ROLES } from '@/shared/constants';
import { InvalidTokenError, NotFoundError, UnauthorizedError, ValidationError } from '../core/errors';
import { AUTH, EVENTS, JOB_TYPES, RATE_LIMITS, TOKEN_PURPOSE } from '../config/constants';
import { cacheNamespaces } from '../cache/CacheService';
import {
  parse,
  emailOnlySchema,
  resetPasswordSchema,
  verifyEmailSchema,
  changePasswordSchema,
  deleteAccountSchema,
} from '../validation/schemas';
import { passwordResetEmail, verifyEmailEmail } from './emailTemplates';

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;

/**
 * Account lifecycle (separate from UserService, which owns sign-up/login/settings):
 * password reset, email verification, password change, session validity,
 * data export and account deletion.
 *
 * Emails are sent from background jobs. Jobs carry only the userId; the handler
 * issues the token at send time, so a raw token is never persisted anywhere.
 */
export class AccountService {
  constructor({
    userRepository,
    authTokenRepository,
    productRepository,
    purchaseRepository,
    jobQueue,
    notifier,
    events,
    cache,
    rateLimiter,
    runInTransaction,
    appUrl,
    logger,
    now = () => new Date(),
  }) {
    this.users = userRepository;
    this.tokens = authTokenRepository;
    this.products = productRepository;
    this.purchases = purchaseRepository;
    this.queue = jobQueue;
    this.notifier = notifier;
    this.events = events;
    this.cache = cache;
    this.rateLimiter = rateLimiter;
    this.runInTransaction = runInTransaction;
    this.appUrl = appUrl;
    this.logger = logger;
    this.now = now;
  }

  // ---------- password reset ----------

  /**
   * Always resolves the same way whether or not the email exists (no account enumeration).
   * @returns {Promise<boolean>} whether a job was queued (for the caller to kick the worker; never shown to users)
   */
  async requestPasswordReset(input) {
    const { email } = parse(emailOnlySchema, input);
    if (!(await this.#allowEmailTo('pwreset', email))) return false;
    const user = await this.users.findByEmail(email);
    if (!user) return false;
    await this.queue.enqueue(JOB_TYPES.PASSWORD_RESET_EMAIL, { userId: user.id });
    return true;
  }

  async resetPassword(input) {
    const { token, password } = parse(resetPasswordSchema, input);
    const now = this.now();
    const redeemed = await this.tokens.consume(token, TOKEN_PURPOSE.PASSWORD_RESET, now);
    if (!redeemed) throw new InvalidTokenError();
    const user = await this.users.setPassword(redeemed.userId, password, now);
    if (!user) throw new InvalidTokenError();
    await this.tokens.deleteForUser(redeemed.userId, { purpose: TOKEN_PURPOSE.PASSWORD_RESET });
    // A successful reset lifts any login lockout for this account.
    await this.rateLimiter.reset('login', user.email, RATE_LIMITS.LOGIN);
    await this.events.emit(EVENTS.ACCOUNT_SECURITY_CHANGED, { userId: redeemed.userId, reason: 'password-reset' });
    this.logger?.info('password reset', { userId: redeemed.userId });
  }

  // ---------- email verification ----------

  /** Same silent behaviour as password reset. Already-verified accounts get no email. */
  async requestVerificationEmail(input) {
    const { email } = parse(emailOnlySchema, input);
    if (!(await this.#allowEmailTo('verify', email))) return false;
    const user = await this.users.findByEmail(email);
    if (!user || user.emailVerifiedAt !== null) return false;
    await this.queue.enqueue(JOB_TYPES.VERIFY_EMAIL, { userId: user.id });
    return true;
  }

  /** Event subscriber for USER_REGISTERED. */
  async onUserRegistered({ userId }) {
    await this.queue.enqueue(JOB_TYPES.VERIFY_EMAIL, { userId });
  }

  async verifyEmail(input) {
    const { token } = parse(verifyEmailSchema, input);
    const redeemed = await this.tokens.consume(token, TOKEN_PURPOSE.EMAIL_VERIFY, this.now());
    if (!redeemed) throw new InvalidTokenError();
    const user = await this.users.markEmailVerified(redeemed.userId, this.now());
    if (!user) throw new InvalidTokenError();
    await this.events.emit(EVENTS.ACCOUNT_SECURITY_CHANGED, { userId: redeemed.userId, reason: 'email-verified' });
    return { email: user.email };
  }

  // ---------- signed-in account management ----------

  async getAccount(userId) {
    const user = await this.users.findById(userId);
    if (!user) throw new NotFoundError('Account');
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      shopName: user.shopName ?? null,
      emailVerified: isEmailVerified(user),
      createdAt: user.createdAt,
    };
  }

  async changePassword(sessionUser, input) {
    const { currentPassword, password } = parse(changePasswordSchema, input);
    await this.#assertPassword(sessionUser.id, currentPassword, 'currentPassword');
    await this.users.setPassword(sessionUser.id, password, this.now());
    await this.tokens.deleteForUser(sessionUser.id, { purpose: TOKEN_PURPOSE.PASSWORD_RESET });
    await this.events.emit(EVENTS.ACCOUNT_SECURITY_CHANGED, { userId: sessionUser.id, reason: 'password-changed' });
  }

  /**
   * Deletes the account. Store admins: every product is deactivated in the same
   * transaction. Sales records are kept for the store's books but no longer link to
   * a person (the customer's name and email are deleted with the account).
   */
  async deleteAccount(sessionUser, input) {
    const { password } = parse(deleteAccountSchema, input);
    await this.#assertPassword(sessionUser.id, password, 'password');
    await this.runInTransaction(async (session) => {
      if (sessionUser.role === ROLES.ADMIN) await this.products.deactivateAllForStore(sessionUser.id, { session });
      await this.tokens.deleteForUser(sessionUser.id, { session });
      await this.users.deleteById(sessionUser.id, { session });
    });
    await this.events.emit(EVENTS.ACCOUNT_DELETED, { userId: sessionUser.id, role: sessionUser.role });
    this.logger?.info('account deleted', { userId: sessionUser.id, role: sessionUser.role });
  }

  /**
   * Streams the user's data as JSON chunks (async generator), so a large store
   * never has to fit in memory.
   */
  async *exportData(sessionUser) {
    const account = await this.getAccount(sessionUser.id);
    const settings = await this.users.findById(sessionUser.id);
    yield `{"exportedAt":${JSON.stringify(this.now().toISOString())},"account":${JSON.stringify(account)}`;
    yield `,"settings":${JSON.stringify({ notificationSettings: settings.notificationSettings, budget: settings.budget })}`;
    if (sessionUser.role === ROLES.ADMIN) {
      yield* jsonArray('products', this.products.cursorForStore(sessionUser.id));
      yield* jsonArray('sales', this.purchases.cursorFor({ storeId: sessionUser.id }));
    } else {
      yield* jsonArray('purchases', this.purchases.cursorFor({ customerId: sessionUser.id }));
    }
    yield '}';
  }

  // ---------- session validity ----------

  /**
   * JWT sessions cannot be revoked on their own; this check makes deleted accounts
   * and sessions older than the last password change stop working. Cached per
   * instance for SESSION_STATE_TTL_SECONDS and invalidated immediately on change.
   * @param {{ id: string }} sessionUser
   * @param {number | undefined} authAt ms timestamp the session signed in at
   */
  async assertSessionActive(sessionUser, authAt) {
    const state = await this.cache.wrap(cacheNamespaces.user(sessionUser.id), 'auth-state', AUTH.SESSION_STATE_TTL_SECONDS, () =>
      this.users.findAuthState(sessionUser.id)
    );
    if (!state) throw new UnauthorizedError('This account no longer exists', 'SESSION_REVOKED');
    const changedAt = state.passwordChangedAt ? new Date(state.passwordChangedAt).getTime() : 0;
    if (authAt && changedAt && authAt < changedAt) {
      throw new UnauthorizedError('Your password was changed. Please sign in again.', 'SESSION_REVOKED');
    }
  }

  // ---------- job handlers ----------

  async deliverPasswordReset({ userId }) {
    const user = await this.users.findById(userId);
    if (!user) return; // account deleted since the request
    const token = await this.tokens.issue(userId, TOKEN_PURPOSE.PASSWORD_RESET, AUTH.PASSWORD_RESET_TTL_MINUTES * MINUTE_MS, this.now());
    const url = `${this.appUrl}/reset-password?token=${encodeURIComponent(token)}`;
    await this.notifier.send({ to: user.email, ...passwordResetEmail({ name: user.fullName, url, ttlMinutes: AUTH.PASSWORD_RESET_TTL_MINUTES }) });
  }

  async deliverVerificationEmail({ userId }) {
    const user = await this.users.findById(userId);
    if (!user || isEmailVerified(user)) return;
    const token = await this.tokens.issue(userId, TOKEN_PURPOSE.EMAIL_VERIFY, AUTH.EMAIL_VERIFY_TTL_HOURS * HOUR_MS, this.now());
    const url = `${this.appUrl}/verify-email?token=${encodeURIComponent(token)}`;
    await this.notifier.send({ to: user.email, ...verifyEmailEmail({ name: user.fullName, url, ttlHours: AUTH.EMAIL_VERIFY_TTL_HOURS }) });
  }

  // ---------- helpers ----------

  async #assertPassword(userId, candidate, field) {
    const doc = await this.users.findByIdWithPassword(userId);
    if (!doc) throw new UnauthorizedError('This account no longer exists', 'SESSION_REVOKED');
    if (!(await doc.comparePassword(candidate))) {
      throw new ValidationError('Password is incorrect', { [field]: 'Password is incorrect' });
    }
  }

  /** Per-target-address cap so nobody can flood a mailbox through us. */
  async #allowEmailTo(kind, email) {
    const res = await this.rateLimiter.consume(`email-${kind}`, email, RATE_LIMITS.ACCOUNT_EMAIL_TARGET);
    return res.allowed;
  }
}

/** Missing field = account predates verification = treated as verified. */
export function isEmailVerified(user) {
  return user.emailVerifiedAt !== null;
}

async function* jsonArray(key, cursor) {
  yield `,${JSON.stringify(key)}:[`;
  let first = true;
  for await (const doc of cursor) {
    yield (first ? '' : ',') + JSON.stringify(doc);
    first = false;
  }
  yield ']';
}

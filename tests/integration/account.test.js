import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { startDb, stopDb, clearDb, makeContainer, seedUsers, productInput, fakeNotifier } from './helpers';
import { User } from '@/server/db/models/User';
import { Product } from '@/server/db/models/Product';
import { Purchase } from '@/server/db/models/Purchase';
import { AuthToken } from '@/server/db/models/AuthToken';
import { Job } from '@/server/db/models/Job';
import { InvalidTokenError, UnauthorizedError, ValidationError } from '@/server/core/errors';
import { AUTH, JOB_TYPES } from '@/server/config/constants';
import { hashToken } from '@/server/repositories/AuthTokenRepository';

let replSet;
let c;
let u;
let notifier;
let clock;

const NEW_PASSWORD = 'N3wPassword!';
const linkToken = (msg) => new URL(msg.text.match(/https?:\/\/\S+token=\S+/)[0]).searchParams.get('token');
const lastMailTo = (email) => notifier.sent.filter((m) => m.to === email).at(-1);

beforeAll(async () => {
  replSet = await startDb();
});
afterAll(async () => stopDb(replSet));
beforeEach(async () => {
  await clearDb();
  notifier = fakeNotifier();
  clock = { t: Date.now() };
  c = await makeContainer({ notifier, now: () => new Date(clock.t) });
  u = await seedUsers(c);
  await c.jobQueue.drain({ max: 100 }); // flush the sign-up verification emails
});

describe('password reset', () => {
  it('emails a single-use link; only the hash is stored; the new password works', async () => {
    await c.accountService.requestPasswordReset({ email: u.customer.email });
    expect(await Job.countDocuments({ type: JOB_TYPES.PASSWORD_RESET_EMAIL })).toBe(1);
    const job = await Job.findOne({ type: JOB_TYPES.PASSWORD_RESET_EMAIL }).lean();
    expect(JSON.stringify(job.payload)).not.toMatch(/token/i); // raw token never persisted in the queue

    await c.jobQueue.drain();
    const token = linkToken(lastMailTo(u.customer.email));
    const stored = await AuthToken.findOne({ purpose: 'password_reset' }).lean();
    expect(stored.tokenHash).toBe(hashToken(token));
    expect(JSON.stringify(stored)).not.toContain(token);

    await c.accountService.resetPassword({ token, password: NEW_PASSWORD, confirmPassword: NEW_PASSWORD });
    expect(await c.userService.authenticate(u.customer.email, NEW_PASSWORD)).not.toBeNull();
    expect(await c.userService.authenticate(u.customer.email, 'Passw0rdXy')).toBeNull();

    // single use
    await expect(c.accountService.resetPassword({ token, password: 'An0therPass', confirmPassword: 'An0therPass' })).rejects.toBeInstanceOf(
      InvalidTokenError
    );
  });

  it('answers identically for unknown emails and sends nothing', async () => {
    await expect(c.accountService.requestPasswordReset({ email: 'nobody@test.io' })).resolves.toBe(false);
    expect(await Job.countDocuments({ type: JOB_TYPES.PASSWORD_RESET_EMAIL })).toBe(0);
  });

  it('rejects expired links', async () => {
    await c.accountService.requestPasswordReset({ email: u.customer.email });
    await c.jobQueue.drain();
    const token = linkToken(lastMailTo(u.customer.email));
    clock.t += (AUTH.PASSWORD_RESET_TTL_MINUTES + 1) * 60_000;
    await expect(c.accountService.resetPassword({ token, password: NEW_PASSWORD, confirmPassword: NEW_PASSWORD })).rejects.toBeInstanceOf(
      InvalidTokenError
    );
  });

  it('only the newest link works', async () => {
    await c.accountService.requestPasswordReset({ email: u.customer.email });
    await c.jobQueue.drain();
    const first = linkToken(lastMailTo(u.customer.email));
    await c.accountService.requestPasswordReset({ email: u.customer.email });
    await c.jobQueue.drain();
    const second = linkToken(lastMailTo(u.customer.email));
    await expect(c.accountService.resetPassword({ token: first, password: NEW_PASSWORD, confirmPassword: NEW_PASSWORD })).rejects.toBeInstanceOf(
      InvalidTokenError
    );
    await c.accountService.resetPassword({ token: second, password: NEW_PASSWORD, confirmPassword: NEW_PASSWORD });
  });

  it('caps reset emails per address', async () => {
    const results = [];
    for (let i = 0; i < 5; i += 1) results.push(await c.accountService.requestPasswordReset({ email: u.customer.email }));
    expect(results.filter(Boolean)).toHaveLength(3);
  });

  it('revokes sessions that signed in before the reset', async () => {
    const signedInAt = clock.t;
    await c.accountService.assertSessionActive(u.customer, signedInAt);
    clock.t += 1000;
    await c.accountService.requestPasswordReset({ email: u.customer.email });
    await c.jobQueue.drain();
    await c.accountService.resetPassword({ token: linkToken(lastMailTo(u.customer.email)), password: NEW_PASSWORD, confirmPassword: NEW_PASSWORD });
    await expect(c.accountService.assertSessionActive(u.customer, signedInAt)).rejects.toBeInstanceOf(UnauthorizedError);
    await expect(c.accountService.assertSessionActive(u.customer, clock.t + 1)).resolves.toBeUndefined();
  });
});

describe('email verification', () => {
  it('sign-up sends a confirmation link that verifies the account', async () => {
    expect((await c.accountService.getAccount(u.customer.id)).emailVerified).toBe(false);
    const token = linkToken(lastMailTo(u.customer.email));
    await c.accountService.verifyEmail({ token });
    expect((await c.accountService.getAccount(u.customer.id)).emailVerified).toBe(true);
    await expect(c.accountService.verifyEmail({ token })).rejects.toBeInstanceOf(InvalidTokenError);
  });

  it('accounts created before verification existed count as verified', async () => {
    await User.updateOne({ _id: u.customer.id }, { $unset: { emailVerifiedAt: 1 } });
    expect((await c.accountService.getAccount(u.customer.id)).emailVerified).toBe(true);
    expect(await c.accountService.requestVerificationEmail({ email: u.customer.email })).toBe(false);
  });

  it('a password reset also confirms the email', async () => {
    await c.accountService.requestPasswordReset({ email: u.customer2.email });
    await c.jobQueue.drain();
    await c.accountService.resetPassword({ token: linkToken(lastMailTo(u.customer2.email)), password: NEW_PASSWORD, confirmPassword: NEW_PASSWORD });
    expect((await c.accountService.getAccount(u.customer2.id)).emailVerified).toBe(true);
  });
});

describe('change password', () => {
  it('requires the current password', async () => {
    const input = { currentPassword: 'wrong', password: NEW_PASSWORD, confirmPassword: NEW_PASSWORD };
    const err = await c.accountService.changePassword(u.customer, input).catch((e) => e);
    expect(err).toBeInstanceOf(ValidationError);
    expect(err.details.currentPassword).toBeTruthy();
    await c.accountService.changePassword(u.customer, { ...input, currentPassword: 'Passw0rdXy' });
    expect(await c.userService.authenticate(u.customer.email, NEW_PASSWORD)).not.toBeNull();
  });
});

describe('delete account', () => {
  it('store admin: account removed, products hidden, sales kept for the books, session revoked', async () => {
    const p = await c.productService.create(u.adminA, productInput({ stock: 5 }));
    await c.purchaseService.record(u.adminA, { customerEmail: u.customer.email, items: [{ productId: p.id, quantity: 1 }] });

    await expect(c.accountService.deleteAccount(u.adminA, { password: 'Passw0rdXy', confirmation: 'nope' })).rejects.toBeInstanceOf(ValidationError);
    await expect(c.accountService.deleteAccount(u.adminA, { password: 'bad', confirmation: 'DELETE' })).rejects.toBeInstanceOf(ValidationError);

    await c.accountService.deleteAccount(u.adminA, { password: 'Passw0rdXy', confirmation: 'DELETE' });
    expect(await User.exists({ _id: u.adminA.id })).toBeNull();
    expect(await Product.countDocuments({ storeId: u.adminA.id, isActive: true })).toBe(0);
    expect(await Purchase.countDocuments({ storeId: u.adminA.id })).toBe(1);
    await expect(c.accountService.assertSessionActive(u.adminA, Date.now())).rejects.toBeInstanceOf(UnauthorizedError);

    // The customer's history still shows the purchase, with the store marked as gone.
    const { purchases } = await c.purchaseService.list(u.customer, {});
    expect(purchases).toHaveLength(1);
    expect(purchases[0].store).toBeNull();
  });

  it('customer: personal data removed; the store keeps an anonymous sale', async () => {
    const p = await c.productService.create(u.adminA, productInput({ stock: 5 }));
    await c.purchaseService.record(u.adminA, { customerEmail: u.customer.email, items: [{ productId: p.id, quantity: 1 }] });
    await c.accountService.deleteAccount(u.customer, { password: 'Passw0rdXy', confirmation: 'DELETE' });
    const { purchases } = await c.purchaseService.list(u.adminA, {});
    expect(purchases).toHaveLength(1);
    expect(purchases[0].customer).toBeNull();
  });
});

describe('data export', () => {
  it('streams valid JSON with the account and its records, never the password hash', async () => {
    const p = await c.productService.create(u.adminA, productInput({ stock: 5 }));
    await c.purchaseService.record(u.adminA, { customerEmail: u.customer.email, items: [{ productId: p.id, quantity: 2 }] });

    let text = '';
    for await (const chunk of c.accountService.exportData(u.adminA)) text += chunk;
    const data = JSON.parse(text);
    expect(data.account.email).toBe(u.adminA.email);
    expect(data.products).toHaveLength(1);
    expect(data.sales).toHaveLength(1);
    expect(text).not.toMatch(/\$2[aby]\$/); // bcrypt hash

    let ctext = '';
    for await (const chunk of c.accountService.exportData(u.customer)) ctext += chunk;
    const cdata = JSON.parse(ctext);
    expect(cdata.purchases).toHaveLength(1);
    expect(cdata.products).toBeUndefined();
  });
});

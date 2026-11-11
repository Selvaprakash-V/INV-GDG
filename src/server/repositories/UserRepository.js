import { User } from '../db/models/User';
import { ROLES } from '@/shared/constants';
import { ConflictError } from '../core/errors';

export class UserRepository {
  constructor({ model = User } = {}) {
    this.model = model;
  }

  async create(data) {
    try {
      const doc = await this.model.create(data);
      return doc.toJSON();
    } catch (err) {
      // Two concurrent sign-ups with the same email: the unique index decides.
      if (err?.code === 11000) throw new ConflictError('Email already registered', 'EMAIL_TAKEN');
      throw err;
    }
  }

  async existsByEmail(email) {
    return Boolean(await this.model.exists({ email }));
  }

  /** Returns a hydrated document (with password) for credential checks only. */
  async findByEmailWithPassword(email) {
    return this.model.findOne({ email }).select('+password');
  }

  async findByIdWithPassword(id) {
    return this.model.findById(id).select('+password');
  }

  async findByEmail(email) {
    return this.model.findOne({ email }).select('fullName email role emailVerifiedAt').lean().then(normalize);
  }

  /** Minimal state needed to decide whether a session is still valid. */
  async findAuthState(id) {
    return this.model.findById(id).select('role passwordChangedAt').lean().then(normalize);
  }

  /** Sets a new password (hashed by the model hook) and stamps passwordChangedAt. */
  async setPassword(id, password, now = new Date()) {
    const doc = await this.model.findById(id).select('+password');
    if (!doc) return null;
    doc.password = password;
    doc.passwordChangedAt = now;
    // A working reset link proves the user controls the inbox.
    if (doc.emailVerifiedAt === null) doc.emailVerifiedAt = now;
    await doc.save();
    return doc.toJSON();
  }

  async markEmailVerified(id, now = new Date()) {
    return this.model
      .findByIdAndUpdate(id, { $set: { emailVerifiedAt: now } }, { new: true })
      .select('email emailVerifiedAt')
      .lean()
      .then(normalize);
  }

  async deleteById(id, { session } = {}) {
    const res = await this.model.deleteOne({ _id: id }, { session });
    return res.deletedCount === 1;
  }

  async findById(id) {
    return this.model.findById(id).lean().then(normalize);
  }

  async findCustomer({ id, email }) {
    const filter = { role: ROLES.CUSTOMER, ...(id ? { _id: id } : { email }) };
    return this.model.findOne(filter).select('fullName email role').lean().then(normalize);
  }

  async updateSettings(id, { notificationSettings, budget }) {
    const set = {};
    for (const [k, v] of Object.entries(notificationSettings || {})) set[`notificationSettings.${k}`] = v;
    for (const [k, v] of Object.entries(budget || {})) set[`budget.${k}`] = v;
    return this.model
      .findByIdAndUpdate(id, { $set: set }, { new: true, runValidators: true })
      .select('notificationSettings budget role')
      .lean()
      .then(normalize);
  }

  /** Cursor over admins who opted into email digests (streamed, not loaded at once). */
  adminsWithEmailDigest() {
    return this.model
      .find({ role: ROLES.ADMIN, 'notificationSettings.emailEnabled': { $ne: false }, 'notificationSettings.dailyDigest': { $ne: false } })
      .select('email fullName shopName notificationSettings')
      .lean()
      .cursor();
  }
}

function normalize(u) {
  if (!u) return null;
  const { _id, password: _pw, __v, ...rest } = u;
  return { ...rest, id: String(_id) };
}

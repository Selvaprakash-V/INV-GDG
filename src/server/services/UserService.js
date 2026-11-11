import { ROLES } from '@/shared/constants';
import { ConflictError, ForbiddenError, NotFoundError } from '../core/errors';
import { EVENTS, CACHE_TTL_SECONDS } from '../config/constants';
import { cacheNamespaces } from '../cache/CacheService';
import { parse, registerSchema, settingsUpdateSchema } from '../validation/schemas';

export class UserService {
  constructor({ userRepository, cache, events, allowAdminSignup = true }) {
    this.users = userRepository;
    this.cache = cache;
    this.events = events;
    this.allowAdminSignup = allowAdminSignup;
  }

  async register(input) {
    const data = parse(registerSchema, input);
    if (data.role === ROLES.ADMIN && !this.allowAdminSignup) {
      throw new ForbiddenError('Store administrator sign-up is by invitation during the pilot');
    }
    if (await this.users.existsByEmail(data.email)) {
      throw new ConflictError('Email already registered', 'EMAIL_TAKEN');
    }
    const user = await this.users.create({
      fullName: data.fullName,
      email: data.email,
      password: data.password, // hashed once by the model hook
      role: data.role,
      ...(data.role === ROLES.ADMIN ? { shopName: data.shopName } : {}),
    });
    return toPublicUser(user);
  }

  /** Returns the session user or null. Never reveals which check failed. */
  async authenticate(email, password) {
    const user = await this.users.findByEmailWithPassword(email);
    if (!user) return null;
    const ok = await user.comparePassword(password);
    if (!ok) return null;
    return toPublicUser(user.toJSON());
  }

  async getSettings(userId) {
    return this.cache.wrap(cacheNamespaces.user(userId), 'settings', CACHE_TTL_SECONDS.SETTINGS, async () => {
      const user = await this.users.findById(userId);
      if (!user) throw new NotFoundError('User');
      return { notificationSettings: user.notificationSettings, budget: user.budget };
    });
  }

  async updateSettings(userId, input) {
    const patch = parse(settingsUpdateSchema, input);
    const updated = await this.users.updateSettings(userId, patch);
    if (!updated) throw new NotFoundError('User');
    await this.events.emit(EVENTS.SETTINGS_CHANGED, { userId, role: updated.role });
    return { notificationSettings: updated.notificationSettings, budget: updated.budget };
  }
}

export function toPublicUser(u) {
  return {
    id: String(u.id ?? u._id),
    name: u.fullName,
    email: u.email,
    role: u.role,
    shopName: u.shopName ?? null,
  };
}

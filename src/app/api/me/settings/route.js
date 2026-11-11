import { withApi } from '@/server/core/http';
import { RATE_LIMITS } from '@/server/config/constants';

// Per-user settings persisted server-side (were only in localStorage before).
export const GET = withApi(
  async ({ user, container }) => ({ settings: await container.userService.getSettings(user.id) }),
  { roles: 'any' }
);

export const PATCH = withApi(
  async ({ user, request, container }) => ({
    message: 'Settings saved',
    settings: await container.userService.updateSettings(user.id, await request.json()),
  }),
  { roles: 'any', rateLimit: { name: 'write', policy: RATE_LIMITS.WRITE } }
);

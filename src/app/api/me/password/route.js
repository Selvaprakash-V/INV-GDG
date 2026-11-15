import { withApi } from '@/server/core/http';
import { RATE_LIMITS } from '@/server/config/constants';

// Body: { currentPassword, password, confirmPassword }. Other sessions are signed out.
export const POST = withApi(
  async ({ user, request, container }) => {
    await container.accountService.changePassword(user, await request.json());
    return { message: 'Password changed.' };
  },
  { roles: 'any', rateLimit: { name: 'sensitive', policy: RATE_LIMITS.SENSITIVE } }
);

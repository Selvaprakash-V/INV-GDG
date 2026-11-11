import { withApi } from '@/server/core/http';
import { RATE_LIMITS } from '@/server/config/constants';

export const GET = withApi(async ({ user, container }) => ({ account: await container.accountService.getAccount(user.id) }), {
  roles: 'any',
});

// Body: { password, confirmation: "DELETE" }
export const DELETE = withApi(
  async ({ user, request, container }) => {
    await container.accountService.deleteAccount(user, await request.json());
    return { message: 'Your account has been deleted.' };
  },
  { roles: 'any', rateLimit: { name: 'sensitive', policy: RATE_LIMITS.SENSITIVE } }
);

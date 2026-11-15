import { withApi } from '@/server/core/http';
import { RATE_LIMITS } from '@/server/config/constants';

export const POST = withApi(
  async ({ request, container }) => {
    await container.accountService.resetPassword(await request.json());
    return { message: 'Password updated. You can now sign in.' };
  },
  { rateLimit: { name: 'token-redeem', policy: RATE_LIMITS.TOKEN_REDEEM } }
);

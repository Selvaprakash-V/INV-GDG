import { withApi } from '@/server/core/http';
import { RATE_LIMITS } from '@/server/config/constants';

export const POST = withApi(
  async ({ request, container }) => {
    const { email } = await container.accountService.verifyEmail(await request.json());
    return { message: 'Email confirmed.', email };
  },
  { rateLimit: { name: 'token-redeem', policy: RATE_LIMITS.TOKEN_REDEEM } }
);

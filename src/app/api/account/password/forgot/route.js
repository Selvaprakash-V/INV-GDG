import { withApi } from '@/server/core/http';
import { RATE_LIMITS } from '@/server/config/constants';

// Always 202 with the same body: never reveals whether an account exists.
export const POST = withApi(
  async ({ request, container }) => {
    if (await container.accountService.requestPasswordReset(await request.json())) container.kickJobs();
    return { message: 'If an account exists for that email, a reset link is on its way.' };
  },
  { rateLimit: { name: 'account-email', policy: RATE_LIMITS.ACCOUNT_EMAIL_IP }, status: 202 }
);

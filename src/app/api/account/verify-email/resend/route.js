import { withApi } from '@/server/core/http';
import { RATE_LIMITS } from '@/server/config/constants';

// Public (users blocked by REQUIRE_EMAIL_VERIFICATION cannot sign in). Silent like forgot-password.
export const POST = withApi(
  async ({ request, container }) => {
    if (await container.accountService.requestVerificationEmail(await request.json())) container.kickJobs();
    return { message: 'If that account still needs confirming, a new link is on its way.' };
  },
  { rateLimit: { name: 'account-email', policy: RATE_LIMITS.ACCOUNT_EMAIL_IP }, status: 202 }
);

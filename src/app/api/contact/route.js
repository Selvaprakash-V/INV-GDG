import { withApi } from '@/server/core/http';
import { RATE_LIMITS } from '@/server/config/constants';

// POST { name, email, message } — queued and emailed to SUPPORT_EMAIL off the request path.
export const POST = withApi(
  async ({ request, container }) => {
    await container.notificationService.submitContactMessage(await request.json());
    container.kickJobs();
    return { message: "Thanks! We've received your message and will reply by email." };
  },
  { rateLimit: { name: 'contact', policy: RATE_LIMITS.CONTACT }, status: 202 }
);

import { withApi } from '@/server/core/http';
import { RATE_LIMITS } from '@/server/config/constants';

// Streams a JSON download of everything stored about the signed-in user.
export const GET = withApi(
  async ({ user, container, log }) => {
    const chunks = container.accountService.exportData(user);
    const encoder = new TextEncoder();
    const body = new ReadableStream({
      async pull(controller) {
        try {
          const { value, done } = await chunks.next();
          if (done) controller.close();
          else controller.enqueue(encoder.encode(value));
        } catch (err) {
          log.error('export failed', { err });
          controller.error(err);
        }
      },
      async cancel() {
        await chunks.return?.();
      },
    });
    const day = new Date().toISOString().slice(0, 10);
    return new Response(body, {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'content-disposition': `attachment; filename="trackit-export-${day}.json"`,
      },
    });
  },
  { roles: 'any', rateLimit: { name: 'export', policy: RATE_LIMITS.EXPORT } }
);

import { withApi } from '@/server/core/http';

// Scheduler entry point (Cloud Scheduler / Vercel Cron) — Authorization: Bearer $CRON_SECRET.
// Enqueues one idempotent digest job per store, then drains the queue.
async function run({ container }) {
  const result = await container.notificationService.scheduleExpiryDigests();
  const drained = await container.jobQueue.drain();
  return { result, drained };
}

export const GET = withApi(run, { cronAuth: true });
export const POST = withApi(run, { cronAuth: true });

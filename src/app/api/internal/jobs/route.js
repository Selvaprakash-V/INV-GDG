import { withApi } from '@/server/core/http';

// Worker tick: drains due jobs (exponential-backoff retries, dead-letter after max attempts).
async function run({ container }) {
  const drained = await container.jobQueue.drain();
  return { drained, queue: await container.jobRepository.stats() };
}

export const GET = withApi(run, { cronAuth: true });
export const POST = withApi(run, { cronAuth: true });

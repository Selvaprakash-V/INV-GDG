#!/usr/bin/env node
// Starts an isolated stack for browser tests: an in-memory MongoDB replica set
// (transactions need one) plus the production build (`npm run build` first).
// Server logs go to test-results/e2e-server.log; with NOTIFIER=console that log is
// the email outbox the tests read reset/confirmation links from.
import { spawn } from 'node:child_process';
import { createWriteStream, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { MongoMemoryReplSet } from 'mongodb-memory-server';

const PORT = Number(process.env.E2E_PORT || 3100);
const LOG_FILE = process.env.E2E_SERVER_LOG || 'test-results/e2e-server.log';
const require = createRequire(import.meta.url);

mkdirSync('test-results', { recursive: true });
const log = createWriteStream(LOG_FILE, { flags: 'w' });

const replSet = await MongoMemoryReplSet.create({ replSet: { count: 1, storageEngine: 'wiredTiger' } });
const base = `http://localhost:${PORT}`;

const server = spawn(process.execPath, [require.resolve('next/dist/bin/next'), 'start', '-p', String(PORT)], {
  env: {
    ...process.env,
    NODE_ENV: 'production',
    MONGODB_URI: replSet.getUri('trackit_e2e'),
    NEXTAUTH_SECRET: 'e2e-secret-that-is-long-enough-123',
    NEXTAUTH_URL: base,
    APP_URL: base,
    CRON_SECRET: 'e2e-cron-secret-1234567890',
    NOTIFIER: 'console',
    LOG_LEVEL: 'info',
    ALLOW_ADMIN_SIGNUP: 'true',
    NEXT_TELEMETRY_DISABLED: '1',
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});
server.stdout.pipe(log);
server.stderr.pipe(log);
server.stdout.on('data', (d) => process.stdout.write(d.toString().includes('Ready') ? d : ''));

const shutdown = async (code = 0) => {
  server.kill();
  await replSet.stop().catch(() => {});
  process.exit(code);
};
process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
server.on('exit', (code) => shutdown(code ?? 1));

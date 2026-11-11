import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.{js,mjs}'],
    testTimeout: 30_000,
    hookTimeout: 120_000,
    // Integration files share one in-memory replica set per file; run files serially for stable resource use.
    fileParallelism: false,
    coverage: {
      provider: 'v8',
      include: ['src/server/**', 'src/shared/**'],
      reporter: ['text-summary', 'html'],
    },
  },
});

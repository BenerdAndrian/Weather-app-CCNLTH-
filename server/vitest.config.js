import { defineConfig } from 'vitest/config';

// Own config so the frontend's vite.config.js (jsdom, src/**) is not used.
export default defineConfig({
  test: {
    root: import.meta.dirname,
    environment: 'node',
    include: ['test/**/*.test.js'],
  },
});

// @ts-check
const { defineConfig } = require('@playwright/test');

/**
 * Playwright configuration
 * - Expects frontend dev server running on http://localhost:3000
 * - Optionally set E2E_BASE_URL to override baseURL
 */
module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 30 * 1000,
  retries: 0,
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});

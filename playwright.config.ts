import { defineConfig, devices } from '@playwright/test';

const e2eUrl = 'http://127.0.0.1:4300';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: Boolean(process.env['CI']),
  retries: process.env['CI'] ? 1 : 0,
  workers: 1,
  timeout: 30_000,
  expect: {
    timeout: 15_000
  },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }]
  ],
  outputDir: 'test-results',
  use: {
    baseURL: e2eUrl,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  webServer: {
    // Visual-regression checks should run against deterministic built files,
    // not the Angular dev server. The dev server can rebuild between WebKit
    // tests even with HMR disabled, which occasionally leaves a fresh page
    // without Angular bootstrapped when geometry is measured.
    command: 'npm run build:prod && node scripts/serve-e2e.mjs',
    url: e2eUrl,
    reuseExistingServer: false,
    timeout: 180_000
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    }
  ]
});

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
    // Keep Playwright isolated from the developer's normal `npm start` server on
    // port 4200. Reusing that HMR-enabled server can reload WebKit while a test
    // is measuring the page and destroy its JavaScript execution context.
    command: 'npm start -- --host 127.0.0.1 --port 4300 --live-reload=false --hmr=false',
    url: e2eUrl,
    reuseExistingServer: false,
    timeout: 120_000
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

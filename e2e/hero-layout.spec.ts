import { expect, test, type Page } from '@playwright/test';

const desktopViewports = [
  { width: 1440, height: 1024 },
  { width: 1920, height: 1080 },
  { width: 1680, height: 900 },
  { width: 1366, height: 768 }
] as const;

async function blockExternalFonts(page: Page): Promise<void> {
  // The production app intentionally loads its design fonts from Google, but
  // viewport checks must not depend on an external network request. Local
  // Linux WebKit can otherwise stall before Angular renders the hero at all.
  await page.route(
    /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\//,
    route => route.abort()
  );
}

for (const viewport of desktopViewports) {
  test(`hero fits ${viewport.width}x${viewport.height} without scrollbars`, async ({ page }, testInfo) => {
    const pageErrors: string[] = [];
    page.on('pageerror', error => pageErrors.push(error.message));

    await blockExternalFonts(page);
    await page.setViewportSize(viewport);
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const hero = page.locator('.hero');
    await expect(hero, `Angular page errors: ${pageErrors.join(' | ') || 'none'}`).toBeVisible({ timeout: 15_000 });
    expect(page.viewportSize()).toEqual(viewport);

    type Metrics = {
      innerWidth: number;
      innerHeight: number;
      clientWidth: number;
      clientHeight: number;
      documentWidth: number;
      documentHeight: number;
      bodyWidth: number;
      bodyHeight: number;
      bodyMargin: string;
      heroX: number;
      heroY: number;
      heroWidth: number;
      heroHeight: number;
      heroOverflowX: string;
      heroOverflowY: string;
    };

    const readMetrics = async (): Promise<Metrics | null> => {
      try {
        return await page.evaluate(() => {
          const heroElement = document.querySelector<HTMLElement>('.hero');
          if (!heroElement) return null;

          const heroRect = heroElement.getBoundingClientRect();
          const bodyStyle = getComputedStyle(document.body);
          const heroStyle = getComputedStyle(heroElement);

          return {
            innerWidth: window.innerWidth,
            innerHeight: window.innerHeight,
            clientWidth: document.documentElement.clientWidth,
            clientHeight: document.documentElement.clientHeight,
            documentWidth: document.documentElement.scrollWidth,
            documentHeight: document.documentElement.scrollHeight,
            bodyWidth: document.body.scrollWidth,
            bodyHeight: document.body.scrollHeight,
            bodyMargin: bodyStyle.margin,
            heroX: heroRect.x,
            heroY: heroRect.y,
            heroWidth: heroRect.width,
            heroHeight: heroRect.height,
            heroOverflowX: heroStyle.overflowX,
            heroOverflowY: heroStyle.overflowY
          };
        });
      } catch {
        // A dev-server navigation can transiently destroy the page execution
        // context. expect.poll retries instead of turning that into a false
        // layout failure.
        return null;
      }
    };

    // Wait until Angular styles and the viewport geometry have settled. This is
    // deliberately navigation-safe and does not depend on requestAnimationFrame
    // running inside a page context that WebKit may replace during startup.
    await expect.poll(async () => {
      const metrics = await readMetrics();
      if (!metrics) return false;

      return metrics.bodyMargin === '0px'
        && metrics.heroOverflowX === 'hidden'
        && metrics.heroOverflowY === 'hidden'
        && metrics.documentWidth <= metrics.clientWidth
        && metrics.documentHeight <= metrics.clientHeight
        && metrics.bodyWidth <= metrics.clientWidth
        && metrics.bodyHeight <= metrics.clientHeight
        && Math.abs(metrics.heroX) <= 1
        && Math.abs(metrics.heroY) <= 1
        && Math.abs(metrics.heroWidth - metrics.clientWidth) <= 1
        && Math.abs(metrics.heroHeight - metrics.clientHeight) <= 1;
    }, {
      timeout: 15_000,
      intervals: [100, 150, 250, 500],
      message: `Hero never reached stable viewport geometry. Angular page errors: ${pageErrors.join(' | ') || 'none'}`
    }).toBe(true);

    const metrics = await readMetrics();
    expect(metrics).not.toBeNull();

    if (metrics) {
      const geometry = `body margin=${metrics.bodyMargin}; hero=${metrics.heroX},${metrics.heroY} ${metrics.heroWidth}x${metrics.heroHeight}; client=${metrics.clientWidth}x${metrics.clientHeight}; inner=${metrics.innerWidth}x${metrics.innerHeight}`;

      expect(metrics.documentWidth, geometry).toBeLessThanOrEqual(metrics.clientWidth);
      expect(metrics.documentHeight, geometry).toBeLessThanOrEqual(metrics.clientHeight);
      expect(metrics.bodyWidth, geometry).toBeLessThanOrEqual(metrics.clientWidth);
      expect(metrics.bodyHeight, geometry).toBeLessThanOrEqual(metrics.clientHeight);
      expect(Math.abs(metrics.heroX), geometry).toBeLessThanOrEqual(1);
      expect(Math.abs(metrics.heroY), geometry).toBeLessThanOrEqual(1);
      expect(Math.abs(metrics.heroWidth - metrics.clientWidth), geometry).toBeLessThanOrEqual(1);
      expect(Math.abs(metrics.heroHeight - metrics.clientHeight), geometry).toBeLessThanOrEqual(1);
    }

    await page.screenshot({
      path: testInfo.outputPath(`hero-${viewport.width}x${viewport.height}.png`),
      fullPage: false
    });
  });
}

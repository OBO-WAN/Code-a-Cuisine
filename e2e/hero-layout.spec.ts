import { expect, test } from '@playwright/test';

const desktopViewports = [
  { width: 1440, height: 1024 },
  { width: 1920, height: 1080 },
  { width: 1680, height: 900 },
  { width: 1366, height: 768 }
] as const;

for (const viewport of desktopViewports) {
  test(`hero fits ${viewport.width}x${viewport.height} without scrollbars`, async ({ page }, testInfo) => {
    const pageErrors: string[] = [];
    page.on('pageerror', error => pageErrors.push(error.message));

    await page.setViewportSize(viewport);
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // WebKit can take a little longer than Chromium/Firefox to bootstrap the
    // Angular dev bundle locally, especially while several browser processes
    // are starting. Wait for Angular to populate app-root before asserting UI.
    await page.waitForFunction(() => {
      const root = document.querySelector('app-root');
      return Boolean(root?.children.length);
    }, undefined, { timeout: 15_000 });

    const hero = page.locator('.hero');
    await expect(hero, `Angular page errors: ${pageErrors.join(' | ') || 'none'}`).toBeVisible({ timeout: 15_000 });

    const metrics = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      clientWidth: document.documentElement.clientWidth,
      clientHeight: document.documentElement.clientHeight,
      documentWidth: document.documentElement.scrollWidth,
      documentHeight: document.documentElement.scrollHeight,
      bodyWidth: document.body.scrollWidth,
      bodyHeight: document.body.scrollHeight
    }));

    // `clientWidth/clientHeight` are the actual CSS layout viewport. WebKit can
    // reserve a scrollbar gutter inside `innerWidth` even when the page itself
    // has no scrollable overflow, so compare scrolling dimensions to client size.
    expect(metrics.documentWidth).toBeLessThanOrEqual(metrics.clientWidth);
    expect(metrics.documentHeight).toBeLessThanOrEqual(metrics.clientHeight);
    expect(metrics.bodyWidth).toBeLessThanOrEqual(metrics.clientWidth);
    expect(metrics.bodyHeight).toBeLessThanOrEqual(metrics.clientHeight);

    const heroBox = await hero.boundingBox();
    expect(heroBox).not.toBeNull();
    expect(Math.abs((heroBox?.width ?? 0) - metrics.clientWidth)).toBeLessThanOrEqual(1);
    expect(Math.abs((heroBox?.height ?? 0) - metrics.clientHeight)).toBeLessThanOrEqual(1);

    await page.screenshot({
      path: testInfo.outputPath(`hero-${viewport.width}x${viewport.height}.png`),
      fullPage: false
    });
  });
}

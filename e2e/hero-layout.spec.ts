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

    await page.waitForFunction(() => {
      const root = document.querySelector('app-root');
      return Boolean(root?.children.length);
    }, undefined, { timeout: 15_000 });

    const hero = page.locator('.hero');
    await expect(hero, `Angular page errors: ${pageErrors.join(' | ') || 'none'}`).toBeVisible({ timeout: 15_000 });

    // First verify Playwright really created the requested browser viewport.
    expect(page.viewportSize()).toEqual(viewport);

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

    // The CSS layout viewport is documentElement.clientWidth/clientHeight.
    // Playwright's Linux WebKit can reserve a 16px classic scrollbar gutter,
    // so window.innerWidth may be larger even when the page has zero overflow.
    expect(metrics.documentWidth).toBeLessThanOrEqual(metrics.clientWidth);
    expect(metrics.documentHeight).toBeLessThanOrEqual(metrics.clientHeight);
    expect(metrics.bodyWidth).toBeLessThanOrEqual(metrics.clientWidth);
    expect(metrics.bodyHeight).toBeLessThanOrEqual(metrics.clientHeight);

    // The fixed hero must cover the entire CSS layout viewport and start at 0,0.
    const heroBox = await hero.boundingBox();
    expect(heroBox).not.toBeNull();
    expect(Math.abs(heroBox?.x ?? 0)).toBeLessThanOrEqual(1);
    expect(Math.abs(heroBox?.y ?? 0)).toBeLessThanOrEqual(1);
    expect(Math.abs((heroBox?.width ?? 0) - metrics.clientWidth)).toBeLessThanOrEqual(1);
    expect(Math.abs((heroBox?.height ?? 0) - metrics.clientHeight)).toBeLessThanOrEqual(1);

    await page.screenshot({
      path: testInfo.outputPath(`hero-${viewport.width}x${viewport.height}.png`),
      fullPage: false
    });
  });
}

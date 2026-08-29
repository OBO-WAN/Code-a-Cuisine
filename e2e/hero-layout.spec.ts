import { expect, test } from '@playwright/test';

const desktopViewports = [
  { width: 1440, height: 1024 },
  { width: 1920, height: 1080 },
  { width: 1680, height: 900 },
  { width: 1366, height: 768 }
] as const;

for (const viewport of desktopViewports) {
  test(`hero fits ${viewport.width}x${viewport.height} without scrollbars`, async ({ page }, testInfo) => {
    await page.setViewportSize(viewport);
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const hero = page.locator('.hero');
    await expect(hero).toBeVisible();

    const metrics = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      documentWidth: document.documentElement.scrollWidth,
      documentHeight: document.documentElement.scrollHeight,
      bodyWidth: document.body.scrollWidth,
      bodyHeight: document.body.scrollHeight
    }));

    expect(metrics.documentWidth).toBeLessThanOrEqual(metrics.innerWidth);
    expect(metrics.documentHeight).toBeLessThanOrEqual(metrics.innerHeight);
    expect(metrics.bodyWidth).toBeLessThanOrEqual(metrics.innerWidth);
    expect(metrics.bodyHeight).toBeLessThanOrEqual(metrics.innerHeight);

    const heroBox = await hero.boundingBox();
    expect(heroBox).not.toBeNull();
    expect(Math.abs((heroBox?.width ?? 0) - viewport.width)).toBeLessThanOrEqual(1);
    expect(Math.abs((heroBox?.height ?? 0) - viewport.height)).toBeLessThanOrEqual(1);

    await page.screenshot({
      path: testInfo.outputPath(`hero-${viewport.width}x${viewport.height}.png`),
      fullPage: false
    });
  });
}

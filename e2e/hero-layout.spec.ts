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
      const hero = document.querySelector<HTMLElement>('.hero');
      if (!root?.children.length || !hero) return false;

      const bodyStyle = getComputedStyle(document.body);
      const heroStyle = getComputedStyle(hero);

      return bodyStyle.marginTop === '0px'
        && bodyStyle.marginRight === '0px'
        && bodyStyle.marginBottom === '0px'
        && bodyStyle.marginLeft === '0px'
        && heroStyle.overflowX === 'hidden'
        && heroStyle.overflowY === 'hidden';
    }, undefined, { timeout: 15_000 });

    // Let WebKit finish one complete layout/paint cycle after styles are applied.
    await page.evaluate(() => new Promise<void>(resolve => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    }));

    const hero = page.locator('.hero');
    await expect(hero, `Angular page errors: ${pageErrors.join(' | ') || 'none'}`).toBeVisible({ timeout: 15_000 });

    expect(page.viewportSize()).toEqual(viewport);

    const metrics = await page.evaluate(() => {
      const heroElement = document.querySelector<HTMLElement>('.hero');
      const heroRect = heroElement?.getBoundingClientRect();
      const bodyStyle = getComputedStyle(document.body);

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
        heroX: heroRect?.x ?? Number.NaN,
        heroY: heroRect?.y ?? Number.NaN,
        heroWidth: heroRect?.width ?? Number.NaN,
        heroHeight: heroRect?.height ?? Number.NaN
      };
    });

    expect(metrics.documentWidth).toBeLessThanOrEqual(metrics.clientWidth);
    expect(metrics.documentHeight).toBeLessThanOrEqual(metrics.clientHeight);
    expect(metrics.bodyWidth).toBeLessThanOrEqual(metrics.clientWidth);
    expect(metrics.bodyHeight).toBeLessThanOrEqual(metrics.clientHeight);

    const geometry = `body margin=${metrics.bodyMargin}; hero=${metrics.heroX},${metrics.heroY} ${metrics.heroWidth}x${metrics.heroHeight}; client=${metrics.clientWidth}x${metrics.clientHeight}; inner=${metrics.innerWidth}x${metrics.innerHeight}`;
    expect(Math.abs(metrics.heroX), geometry).toBeLessThanOrEqual(1);
    expect(Math.abs(metrics.heroY), geometry).toBeLessThanOrEqual(1);
    expect(Math.abs(metrics.heroWidth - metrics.clientWidth), geometry).toBeLessThanOrEqual(1);
    expect(Math.abs(metrics.heroHeight - metrics.clientHeight), geometry).toBeLessThanOrEqual(1);

    await page.screenshot({
      path: testInfo.outputPath(`hero-${viewport.width}x${viewport.height}.png`),
      fullPage: false
    });
  });
}

import { expect, test } from '@playwright/test';

type Geometry = {
  innerWidth: number;
  clientWidth: number;
  documentWidth: number;
  bodyWidth: number;
  contentWidth: number;
  upperWidth: number;
  railClientWidth: number;
  railScrollWidth: number;
  firstCardWidth: number;
  firstImageWidth: number;
  firstImageHeight: number;
  brandWidth: number;
  brandHeight: number;
  backWidth: number;
  backHeight: number;
};

async function readGeometry(page: Parameters<typeof test>[0] extends never ? never : any): Promise<Geometry | null> {
  try {
    return await page.evaluate(() => {
      const content = document.querySelector<HTMLElement>('.cookbook-content');
      const upper = document.querySelector<HTMLElement>('.upper-panel');
      const rail = document.querySelector<HTMLElement>('.most-liked__rail');
      const firstCard = document.querySelector<HTMLElement>('.cuisine-card');
      const firstImage = document.querySelector<HTMLElement>('.cuisine-card__image-wrap');
      const brand = document.querySelector<HTMLElement>('.brand');
      const back = document.querySelector<HTMLElement>('.back-link');

      if (!content || !upper || !rail || !firstCard || !firstImage || !brand || !back) {
        return null;
      }

      return {
        innerWidth: window.innerWidth,
        clientWidth: document.documentElement.clientWidth,
        documentWidth: document.documentElement.scrollWidth,
        bodyWidth: document.body.scrollWidth,
        contentWidth: content.getBoundingClientRect().width,
        upperWidth: upper.getBoundingClientRect().width,
        railClientWidth: rail.clientWidth,
        railScrollWidth: rail.scrollWidth,
        firstCardWidth: firstCard.getBoundingClientRect().width,
        firstImageWidth: firstImage.getBoundingClientRect().width,
        firstImageHeight: firstImage.getBoundingClientRect().height,
        brandWidth: brand.getBoundingClientRect().width,
        brandHeight: brand.getBoundingClientRect().height,
        backWidth: back.getBoundingClientRect().width,
        backHeight: back.getBoundingClientRect().height
      };
    });
  } catch {
    return null;
  }
}

const cases = [
  {
    name: 'desktop',
    viewport: { width: 1440, height: 1024 },
    expected: {
      contentWidth: 1330,
      upperWidth: 1330,
      cardWidth: 400,
      imageWidth: 400,
      imageHeight: 400,
      brandWidth: 142,
      brandHeight: 48
    }
  },
  {
    name: 'mobile',
    viewport: { width: 375, height: 812 },
    expected: {
      contentWidth: 340,
      upperWidth: 340,
      cardWidth: 320,
      imageWidth: 320,
      imageHeight: 260,
      brandWidth: 95,
      brandHeight: 32
    }
  }
] as const;

for (const layout of cases) {
  test(`cookbook ${layout.name} layout matches approved Figma geometry`, async ({ page }, testInfo) => {
    const pageErrors: string[] = [];
    page.on('pageerror', error => pageErrors.push(error.message));

    await page.setViewportSize(layout.viewport);
    await page.goto('/cookbook', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'Cookbook', level: 1 }), `Angular page errors: ${pageErrors.join(' | ') || 'none'}`)
      .toBeVisible({ timeout: 15_000 });

    await expect.poll(async () => {
      const geometry = await readGeometry(page);
      if (!geometry) return false;

      return geometry.documentWidth <= geometry.clientWidth
        && geometry.bodyWidth <= geometry.clientWidth
        && Math.abs(geometry.contentWidth - layout.expected.contentWidth) <= 1
        && Math.abs(geometry.upperWidth - layout.expected.upperWidth) <= 1
        && Math.abs(geometry.firstCardWidth - layout.expected.cardWidth) <= 1
        && Math.abs(geometry.firstImageWidth - layout.expected.imageWidth) <= 1
        && Math.abs(geometry.firstImageHeight - layout.expected.imageHeight) <= 1
        && Math.abs(geometry.brandWidth - layout.expected.brandWidth) <= 1
        && Math.abs(geometry.brandHeight - layout.expected.brandHeight) <= 1
        && geometry.railScrollWidth > geometry.railClientWidth;
    }, {
      timeout: 15_000,
      intervals: [100, 150, 250, 500],
      message: `${layout.name} Cookbook never reached stable Figma geometry. Angular page errors: ${pageErrors.join(' | ') || 'none'}`
    }).toBe(true);

    const geometry = await readGeometry(page);
    expect(geometry).not.toBeNull();

    if (geometry) {
      const diagnostics = JSON.stringify(geometry);
      expect(geometry.documentWidth, diagnostics).toBeLessThanOrEqual(geometry.clientWidth);
      expect(geometry.bodyWidth, diagnostics).toBeLessThanOrEqual(geometry.clientWidth);
      expect(Math.abs(geometry.contentWidth - layout.expected.contentWidth), diagnostics).toBeLessThanOrEqual(1);
      expect(Math.abs(geometry.upperWidth - layout.expected.upperWidth), diagnostics).toBeLessThanOrEqual(1);
      expect(Math.abs(geometry.firstCardWidth - layout.expected.cardWidth), diagnostics).toBeLessThanOrEqual(1);
      expect(Math.abs(geometry.firstImageWidth - layout.expected.imageWidth), diagnostics).toBeLessThanOrEqual(1);
      expect(Math.abs(geometry.firstImageHeight - layout.expected.imageHeight), diagnostics).toBeLessThanOrEqual(1);
      expect(geometry.railScrollWidth, diagnostics).toBeGreaterThan(geometry.railClientWidth);
    }

    await page.screenshot({
      path: testInfo.outputPath(`cookbook-${layout.name}-${layout.viewport.width}x${layout.viewport.height}.png`),
      fullPage: true
    });
  });
}

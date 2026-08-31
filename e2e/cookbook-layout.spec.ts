import { expect, test, type Page } from '@playwright/test';

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

async function readGeometry(page: Page): Promise<Geometry | null> {
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
      contentMaxWidth: 1330,
      horizontalInset: 110,
      cardMaxWidth: 400,
      imageHeight: 400,
      brandWidth: 142,
      brandHeight: 48
    }
  },
  {
    name: 'mobile',
    viewport: { width: 375, height: 812 },
    expected: {
      contentMaxWidth: 340,
      horizontalInset: 32,
      cardMaxWidth: 320,
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

    await expect(
      page.getByRole('heading', { name: 'Cookbook', level: 1 }),
      `Angular page errors: ${pageErrors.join(' | ') || 'none'}`
    ).toBeVisible({ timeout: 15_000 });

    const matchesApprovedGeometry = (geometry: Geometry): boolean => {
      // WebKit on Linux can reserve a classic vertical scrollbar gutter while
      // Chromium uses overlay scrollbars. The design should use the same Figma
      // max widths without creating horizontal overflow, so derive the rendered
      // width from the actual CSS layout viewport (clientWidth).
      const expectedContentWidth = Math.min(
        layout.expected.contentMaxWidth,
        geometry.clientWidth - layout.expected.horizontalInset
      );
      const expectedCardWidth = Math.min(layout.expected.cardMaxWidth, expectedContentWidth);

      return geometry.documentWidth <= geometry.clientWidth
        && geometry.bodyWidth <= geometry.clientWidth
        && Math.abs(geometry.contentWidth - expectedContentWidth) <= 1
        && Math.abs(geometry.upperWidth - expectedContentWidth) <= 1
        && Math.abs(geometry.firstCardWidth - expectedCardWidth) <= 1
        && Math.abs(geometry.firstImageWidth - expectedCardWidth) <= 1
        && Math.abs(geometry.firstImageHeight - layout.expected.imageHeight) <= 1
        && Math.abs(geometry.brandWidth - layout.expected.brandWidth) <= 1
        && Math.abs(geometry.brandHeight - layout.expected.brandHeight) <= 1
        && geometry.railScrollWidth > geometry.railClientWidth;
    };

    await expect.poll(async () => {
      const geometry = await readGeometry(page);
      return geometry ? matchesApprovedGeometry(geometry) : false;
    }, {
      timeout: 15_000,
      intervals: [100, 150, 250, 500],
      message: `${layout.name} Cookbook never reached stable Figma geometry. Angular page errors: ${pageErrors.join(' | ') || 'none'}`
    }).toBe(true);

    const geometry = await readGeometry(page);
    expect(geometry).not.toBeNull();

    if (geometry) {
      const diagnostics = JSON.stringify(geometry);
      expect(matchesApprovedGeometry(geometry), diagnostics).toBe(true);
    }

    await page.screenshot({
      path: testInfo.outputPath(`cookbook-${layout.name}-${layout.viewport.width}x${layout.viewport.height}.png`),
      fullPage: true
    });
  });
}

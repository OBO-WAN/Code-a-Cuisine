import { expect, test, type Page } from '@playwright/test';

type LayoutCase = {
  name: 'desktop' | 'mobile';
  viewport: { width: number; height: number };
  expected: {
    contentWidth: number;
    contentY: number;
    titleWidth: number;
    titleHeight: number;
    adjustmentsHeight: number;
    cardWidth: number;
    cardHeight: number;
    cardY: number;
    brandWidth: number;
    brandHeight: number;
    ctaWidth: number;
    ctaHeight: number;
    ctaY: number;
  };
};

type Geometry = {
  innerWidth: number;
  documentWidth: number;
  bodyWidth: number;
  documentHeight: number;
  contentWidth: number;
  contentY: number;
  titleWidth: number;
  titleHeight: number;
  adjustmentsHeight: number;
  cardWidth: number;
  cardHeight: number;
  cardY: number;
  brandWidth: number;
  brandHeight: number;
  ctaWidth: number;
  ctaHeight: number;
  ctaY: number;
};

const layouts: readonly LayoutCase[] = [
  {
    name: 'desktop',
    viewport: { width: 1440, height: 1024 },
    expected: {
      contentWidth: 721,
      contentY: 200,
      titleWidth: 416,
      titleHeight: 35,
      adjustmentsHeight: 69,
      cardWidth: 721,
      cardHeight: 412,
      cardY: 392,
      brandWidth: 142,
      brandHeight: 48,
      ctaWidth: 258,
      ctaHeight: 62,
      ctaY: 860
    }
  },
  {
    name: 'mobile',
    viewport: { width: 375, height: 812 },
    expected: {
      contentWidth: 340,
      contentY: 120,
      titleWidth: 291,
      titleHeight: 30,
      adjustmentsHeight: 144,
      cardWidth: 340,
      cardHeight: 544,
      cardY: 350,
      brandWidth: 95,
      brandHeight: 32,
      ctaWidth: 155,
      ctaHeight: 52,
      ctaY: 934
    }
  }
] as const;

async function blockExternalFonts(page: Page): Promise<void> {
  await page.route(
    /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\//,
    route => route.abort()
  );
}

async function readGeometry(page: Page): Promise<Geometry | null> {
  try {
    return await page.evaluate(() => {
      const content = document.querySelector<HTMLElement>('.content');
      const title = document.querySelector<HTMLElement>('#preferences-title');
      const adjustments = document.querySelector<HTMLElement>('.adjustments');
      const card = document.querySelector<HTMLElement>('.preferences-card');
      const brand = document.querySelector<HTMLElement>('.brand');
      const cta = document.querySelector<HTMLElement>('.generate');

      if (!content || !title || !adjustments || !card || !brand || !cta) return null;

      const contentRect = content.getBoundingClientRect();
      const titleRect = title.getBoundingClientRect();
      const adjustmentsRect = adjustments.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      const brandRect = brand.getBoundingClientRect();
      const ctaRect = cta.getBoundingClientRect();

      return {
        innerWidth: window.innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        bodyWidth: document.body.scrollWidth,
        documentHeight: document.documentElement.scrollHeight,
        contentWidth: contentRect.width,
        contentY: contentRect.y,
        titleWidth: titleRect.width,
        titleHeight: titleRect.height,
        adjustmentsHeight: adjustmentsRect.height,
        cardWidth: cardRect.width,
        cardHeight: cardRect.height,
        cardY: cardRect.y,
        brandWidth: brandRect.width,
        brandHeight: brandRect.height,
        ctaWidth: ctaRect.width,
        ctaHeight: ctaRect.height,
        ctaY: ctaRect.y
      };
    });
  } catch {
    return null;
  }
}

function isApproved(layout: LayoutCase, geometry: Geometry): boolean {
  const expected = layout.expected;
  const within = (actual: number, target: number) => Math.abs(actual - target) <= 1;

  return geometry.documentWidth <= geometry.innerWidth
    && geometry.bodyWidth <= geometry.innerWidth
    && within(geometry.contentWidth, expected.contentWidth)
    && within(geometry.contentY, expected.contentY)
    && within(geometry.titleWidth, expected.titleWidth)
    && within(geometry.titleHeight, expected.titleHeight)
    && within(geometry.adjustmentsHeight, expected.adjustmentsHeight)
    && within(geometry.cardWidth, expected.cardWidth)
    && within(geometry.cardHeight, expected.cardHeight)
    && within(geometry.cardY, expected.cardY)
    && within(geometry.brandWidth, expected.brandWidth)
    && within(geometry.brandHeight, expected.brandHeight)
    && within(geometry.ctaWidth, expected.ctaWidth)
    && within(geometry.ctaHeight, expected.ctaHeight)
    && within(geometry.ctaY, expected.ctaY);
}

for (const layout of layouts) {
  test(`preferences ${layout.name} layout matches approved Figma geometry`, async ({ page }, testInfo) => {
    const pageErrors: string[] = [];
    page.on('pageerror', error => pageErrors.push(error.message));

    await blockExternalFonts(page);
    await page.setViewportSize(layout.viewport);
    await page.goto('/preferences', { waitUntil: 'domcontentloaded' });

    await expect(
      page.getByRole('heading', { name: 'Choose your preferences', level: 1 }),
      `Angular page errors: ${pageErrors.join(' | ') || 'none'}`
    ).toBeVisible({ timeout: 15_000 });

    await expect.poll(async () => {
      const geometry = await readGeometry(page);
      return geometry ? isApproved(layout, geometry) : false;
    }, {
      timeout: 15_000,
      intervals: [100, 150, 250, 500],
      message: `${layout.name} Preferences never reached approved Figma geometry. Angular page errors: ${pageErrors.join(' | ') || 'none'}`
    }).toBe(true);

    const geometry = await readGeometry(page);
    expect(geometry).not.toBeNull();
    if (geometry) {
      expect(isApproved(layout, geometry), JSON.stringify(geometry)).toBe(true);
      if (layout.name === 'mobile') {
        expect(Math.abs(geometry.documentHeight - 1026)).toBeLessThanOrEqual(2);
      } else {
        expect(geometry.documentHeight).toBeLessThanOrEqual(layout.viewport.height);
      }
    }

    if (layout.name === 'desktop') {
      await expect(page.getByText('Ingredients', { exact: true })).toBeVisible();
      await expect(page.locator('.generate__desktop-label')).toBeVisible();
      await expect(page.locator('.generate__mobile-label')).toBeHidden();
    } else {
      await expect(page.getByText('Ingredients', { exact: true })).toBeHidden();
      await expect(page.locator('.generate__desktop-label')).toBeHidden();
      await expect(page.locator('.generate__mobile-label')).toBeVisible();
    }

    expect(pageErrors, `Angular page errors: ${pageErrors.join(' | ')}`).toEqual([]);

    await page.screenshot({
      path: testInfo.outputPath(`preferences-${layout.name}.png`),
      fullPage: layout.name === 'mobile'
    });
  });

  test(`preferences ${layout.name} counters and tags preserve interaction state`, async ({ page }, testInfo) => {
    const pageErrors: string[] = [];
    page.on('pageerror', error => pageErrors.push(error.message));

    await blockExternalFonts(page);
    await page.setViewportSize(layout.viewport);
    await page.goto('/preferences', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'Choose your preferences', level: 1 })).toBeVisible({ timeout: 15_000 });

    const portionsValue = page.locator('.adjustment--portions .counter strong');
    const peopleValue = page.locator('.adjustment--chefs .counter strong');

    await expect(portionsValue).toHaveText('2');
    await page.getByRole('button', { name: 'Decrease portions' }).click();
    await page.getByRole('button', { name: 'Decrease portions' }).click();
    await expect(portionsValue).toHaveText('1');
    await page.getByRole('button', { name: 'Increase portions' }).click();
    await expect(portionsValue).toHaveText('2');

    await expect(peopleValue).toHaveText('1');
    await page.getByRole('button', { name: 'Increase cooking people' }).click();
    await page.getByRole('button', { name: 'Increase cooking people' }).click();
    await page.getByRole('button', { name: 'Increase cooking people' }).click();
    await expect(peopleValue).toHaveText('3');
    await expect(page.locator('.adjustment--chefs .counter__label')).toHaveText('People');

    const medium = page.getByRole('button', { name: 'Medium', exact: true });
    const japanese = page.getByRole('button', { name: 'Japanese', exact: true });
    const vegan = page.getByRole('button', { name: 'Vegan', exact: true });

    await medium.click();
    await japanese.click();
    await vegan.click();

    await expect(medium).toHaveAttribute('aria-pressed', 'true');
    await expect(japanese).toHaveAttribute('aria-pressed', 'true');
    await expect(vegan).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: 'Quick', exact: true })).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByRole('button', { name: 'Italian', exact: true })).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByRole('button', { name: 'No preferences', exact: true })).toHaveAttribute('aria-pressed', 'false');

    const overflow = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      bodyWidth: document.body.scrollWidth
    }));
    expect(overflow.documentWidth, JSON.stringify(overflow)).toBeLessThanOrEqual(overflow.innerWidth);
    expect(overflow.bodyWidth, JSON.stringify(overflow)).toBeLessThanOrEqual(overflow.innerWidth);
    expect(pageErrors, `Angular page errors: ${pageErrors.join(' | ')}`).toEqual([]);

    await page.screenshot({
      path: testInfo.outputPath(`preferences-${layout.name}-interaction.png`),
      fullPage: layout.name === 'mobile'
    });
  });
}

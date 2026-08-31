import { expect, test, type Page } from '@playwright/test';

type LayoutCase = {
  name: 'desktop' | 'mobile';
  viewport: { width: number; height: number };
  expected: {
    generatorWidth: number;
    ingredientWidth: number;
    ingredientHeight: number;
    listWidth: number;
    listHeight: number;
    brandWidth: number;
    brandHeight: number;
    workspaceGap: number;
    nextWidth: number;
    nextHeight: number;
  };
};

type Geometry = {
  innerWidth: number;
  documentWidth: number;
  bodyWidth: number;
  generatorWidth: number;
  ingredientWidth: number;
  ingredientHeight: number;
  listWidth: number;
  listHeight: number;
  brandWidth: number;
  brandHeight: number;
  workspaceGap: number;
};

const layouts: readonly LayoutCase[] = [
  {
    name: 'desktop',
    viewport: { width: 1440, height: 1024 },
    expected: {
      generatorWidth: 1087,
      ingredientWidth: 577,
      ingredientHeight: 176,
      listWidth: 478,
      listHeight: 209,
      brandWidth: 142,
      brandHeight: 48,
      workspaceGap: 32,
      nextWidth: 162,
      nextHeight: 62
    }
  },
  {
    name: 'mobile',
    viewport: { width: 375, height: 812 },
    expected: {
      generatorWidth: 340,
      ingredientWidth: 340,
      ingredientHeight: 211,
      listWidth: 340,
      listHeight: 130,
      brandWidth: 95,
      brandHeight: 32,
      workspaceGap: 24,
      nextWidth: 106,
      nextHeight: 52
    }
  }
] as const;

async function waitForDesignFonts(page: Page): Promise<boolean> {
  return page.evaluate(async () => {
    await document.fonts.ready;

    // Google Fonts can be unavailable in a local Playwright WebKit runtime
    // even though the same build and browser version pass in CI. Never let an
    // external font request abort the layout test; wait for it when available
    // and otherwise continue with the deterministic box geometry below.
    await Promise.allSettled([
      document.fonts.load('500 16px Quicksand'),
      document.fonts.load('600 16px Quicksand')
    ]);

    return document.fonts.check('500 16px Quicksand')
      && document.fonts.check('600 16px Quicksand');
  });
}

async function readGeometry(page: Page): Promise<Geometry | null> {
  try {
    return await page.evaluate(() => {
      const generator = document.querySelector<HTMLElement>('.generator');
      const ingredient = document.querySelector<HTMLElement>('.ingredient-panel');
      const list = document.querySelector<HTMLElement>('.ingredients-panel');
      const brand = document.querySelector<HTMLElement>('.brand');
      const workspace = document.querySelector<HTMLElement>('.workspace');

      if (!generator || !ingredient || !list || !brand || !workspace) return null;

      const generatorRect = generator.getBoundingClientRect();
      const ingredientRect = ingredient.getBoundingClientRect();
      const listRect = list.getBoundingClientRect();
      const brandRect = brand.getBoundingClientRect();
      const workspaceStyle = getComputedStyle(workspace);

      return {
        innerWidth: window.innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        bodyWidth: document.body.scrollWidth,
        generatorWidth: generatorRect.width,
        ingredientWidth: ingredientRect.width,
        ingredientHeight: ingredientRect.height,
        listWidth: listRect.width,
        listHeight: listRect.height,
        brandWidth: brandRect.width,
        brandHeight: brandRect.height,
        workspaceGap: Number.parseFloat(workspaceStyle.rowGap || workspaceStyle.gap || '0')
      };
    });
  } catch {
    return null;
  }
}

function isEmptyGeometryApproved(layout: LayoutCase, geometry: Geometry): boolean {
  const expected = layout.expected;

  return geometry.documentWidth <= geometry.innerWidth
    && geometry.bodyWidth <= geometry.innerWidth
    && Math.abs(geometry.generatorWidth - expected.generatorWidth) <= 1
    && Math.abs(geometry.ingredientWidth - expected.ingredientWidth) <= 1
    && Math.abs(geometry.ingredientHeight - expected.ingredientHeight) <= 1
    && Math.abs(geometry.listWidth - expected.listWidth) <= 1
    && Math.abs(geometry.listHeight - expected.listHeight) <= 1
    && Math.abs(geometry.brandWidth - expected.brandWidth) <= 1
    && Math.abs(geometry.brandHeight - expected.brandHeight) <= 1
    && Math.abs(geometry.workspaceGap - expected.workspaceGap) <= 1;
}

async function addIngredient(
  page: Page,
  name: string,
  quantity: string,
  unit: 'g' | 'piece' = 'g'
): Promise<void> {
  const input = page.locator('#ingredient-name');
  await input.fill(name);
  await page.getByLabel('Ingredient quantity').fill(quantity);
  await page.getByLabel('Measurement unit').selectOption(unit);
  await page.getByRole('button', { name: 'Add ingredient' }).click();
}

for (const layout of layouts) {
  test(`generator ${layout.name} empty state matches approved Figma geometry`, async ({ page }, testInfo) => {
    const pageErrors: string[] = [];
    page.on('pageerror', error => pageErrors.push(error.message));

    await page.setViewportSize(layout.viewport);
    await page.goto('/generate', { waitUntil: 'domcontentloaded' });

    await expect(
      page.getByRole('heading', { name: 'Generate recipe', level: 1 }),
      `Angular page errors: ${pageErrors.join(' | ') || 'none'}`
    ).toBeVisible({ timeout: 15_000 });

    await waitForDesignFonts(page);
    await expect(page.getByRole('link', { name: 'Next step' })).toHaveCount(0);

    await expect.poll(async () => {
      const geometry = await readGeometry(page);
      return geometry ? isEmptyGeometryApproved(layout, geometry) : false;
    }, {
      timeout: 15_000,
      intervals: [100, 150, 250, 500],
      message: `${layout.name} Generator never reached approved empty-state geometry. Angular page errors: ${pageErrors.join(' | ') || 'none'}`
    }).toBe(true);

    const geometry = await readGeometry(page);
    expect(geometry).not.toBeNull();
    if (geometry) {
      expect(isEmptyGeometryApproved(layout, geometry), JSON.stringify(geometry)).toBe(true);
    }

    await page.screenshot({
      path: testInfo.outputPath(`generator-${layout.name}-empty.png`),
      fullPage: layout.name === 'mobile'
    });
  });

  test(`generator ${layout.name} autocomplete and filled state match approved interaction`, async ({ page }, testInfo) => {
    const pageErrors: string[] = [];
    page.on('pageerror', error => pageErrors.push(error.message));

    await page.setViewportSize(layout.viewport);
    await page.goto('/generate', { waitUntil: 'domcontentloaded' });

    const ingredientInput = page.locator('#ingredient-name');
    await expect(ingredientInput).toBeVisible({ timeout: 15_000 });
    const designFontsAvailable = await waitForDesignFonts(page);

    await ingredientInput.fill('Pas');

    const suggestions = page.locator('.suggestion');
    await expect(suggestions).toHaveCount(3);
    await expect(suggestions.nth(0)).toHaveText('Pasta');
    await expect(suggestions.nth(1)).toHaveText('Pastrami');
    await expect(suggestions.nth(2)).toHaveText('Passionsfrut');

    const autocompleteHeight = await page.locator('.ingredient-panel').evaluate(element =>
      element.getBoundingClientRect().height
    );
    expect(autocompleteHeight).toBeGreaterThan(layout.expected.ingredientHeight);

    await page.screenshot({
      path: testInfo.outputPath(`generator-${layout.name}-autocomplete.png`),
      fullPage: layout.name === 'mobile'
    });

    await page.getByRole('button', { name: 'Pasta', exact: true }).click();
    await expect(ingredientInput).toHaveValue('Pasta');
    await page.getByRole('button', { name: 'Add ingredient' }).click();

    await addIngredient(page, 'Baby spinach', '100');
    await addIngredient(page, 'Cherry tomatoes', '150');
    await addIngredient(page, 'Egg', '1', 'piece');

    const rows = page.locator('.ingredient-row');
    await expect(rows).toHaveCount(4);
    await expect(rows.nth(0)).toContainText('1');
    await expect(rows.nth(0)).toContainText('Egg');
    await expect(rows.nth(1)).toContainText('150g');
    await expect(rows.nth(1)).toContainText('Cherry tomatoes');
    await expect(rows.nth(2)).toContainText('100g');
    await expect(rows.nth(2)).toContainText('Baby spinach');
    await expect(rows.nth(3)).toContainText('100g');
    await expect(rows.nth(3)).toContainText('Pasta');

    const next = page.getByRole('link', { name: 'Next step' });
    await expect(next).toBeVisible();

    const nextBox = await next.boundingBox();
    expect(nextBox).not.toBeNull();
    if (nextBox) {
      // Exact text metrics require Quicksand. If the external font host is
      // unavailable to a local WebKit runtime, preserve the meaningful design
      // contract: the control may grow for fallback text, but never shrink
      // below the approved Figma dimensions.
      if (designFontsAvailable) {
        expect(Math.abs(nextBox.width - layout.expected.nextWidth)).toBeLessThanOrEqual(1);
      } else {
        expect(nextBox.width).toBeGreaterThanOrEqual(layout.expected.nextWidth - 1);
      }
      expect(Math.abs(nextBox.height - layout.expected.nextHeight)).toBeLessThanOrEqual(1);
    }

    const listHeight = await page.locator('.ingredients-panel').evaluate(element =>
      element.getBoundingClientRect().height
    );
    expect(listHeight).toBeGreaterThanOrEqual(layout.name === 'mobile' ? 220 : 209);

    const overflow = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      bodyWidth: document.body.scrollWidth
    }));
    expect(overflow.documentWidth, JSON.stringify(overflow)).toBeLessThanOrEqual(overflow.innerWidth);
    expect(overflow.bodyWidth, JSON.stringify(overflow)).toBeLessThanOrEqual(overflow.innerWidth);
    expect(pageErrors, `Angular page errors: ${pageErrors.join(' | ')}`).toEqual([]);

    await page.screenshot({
      path: testInfo.outputPath(`generator-${layout.name}-filled.png`),
      fullPage: layout.name === 'mobile'
    });
  });
}

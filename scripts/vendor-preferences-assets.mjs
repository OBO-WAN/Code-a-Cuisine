import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const componentPath = join(root, 'src/app/features/preferences.component.ts');
const outputDir = join(root, 'public/assets/preferences');

const assets = [
  {
    name: 'minus.svg',
    remote: 'https://www.figma.com/api/mcp/asset/70e7007d-9915-4dd5-9a51-87e1eae2f353.svg',
    local: '/assets/preferences/minus.svg'
  },
  {
    name: 'plus.svg',
    remote: 'https://www.figma.com/api/mcp/asset/5c641811-f614-4ded-80f9-0f7d18bb3aed.svg',
    local: '/assets/preferences/plus.svg'
  },
  {
    name: 'back-desktop.svg',
    remote: 'https://www.figma.com/api/mcp/asset/05cd7041-b562-42f4-8c84-dce3f0d41144.svg',
    local: '/assets/preferences/back-desktop.svg'
  },
  {
    name: 'back-mobile.svg',
    remote: 'https://www.figma.com/api/mcp/asset/e6d60444-a5d7-4b5e-a88a-e62a216cf982.svg',
    local: '/assets/preferences/back-mobile.svg'
  },
  {
    name: 'schedule.svg',
    remote: 'https://www.figma.com/api/mcp/asset/93fa497c-1ea6-4197-b5e1-966ed1bbbfcd.svg',
    local: '/assets/preferences/schedule.svg'
  },
  {
    name: 'cuisine.svg',
    remote: 'https://www.figma.com/api/mcp/asset/ba982e01-1e02-45dc-ba87-e5064eefaffe.svg',
    local: '/assets/preferences/cuisine.svg'
  },
  {
    name: 'diet.svg',
    remote: 'https://www.figma.com/api/mcp/asset/e3200b0d-b9cb-4760-a0c7-c3d495a05d7a.svg',
    local: '/assets/preferences/diet.svg'
  }
];

await mkdir(outputDir, { recursive: true });
let component = await readFile(componentPath, 'utf8');

for (const asset of assets) {
  if (!component.includes(asset.remote) && component.includes(asset.local)) {
    console.log(`↷ ${asset.name} already vendored`);
    continue;
  }

  if (!component.includes(asset.remote)) {
    throw new Error(`Could not find expected Figma URL for ${asset.name} in preferences.component.ts.`);
  }

  const response = await fetch(asset.remote);
  if (!response.ok) {
    throw new Error(`Failed to download ${asset.name}: ${response.status} ${response.statusText}`);
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  await writeFile(join(outputDir, asset.name), bytes);
  component = component.replaceAll(asset.remote, asset.local);
  console.log(`✓ ${asset.name} (${bytes.length.toLocaleString()} bytes)`);
}

await writeFile(componentPath, component, 'utf8');

console.log('\nPreferences assets are now local and preferences.component.ts points to /assets/preferences/.');
console.log('Run npm run test:e2e, review desktop + 375px mobile, then commit public/assets/preferences/ and preferences.component.ts.');

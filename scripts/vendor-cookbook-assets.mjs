import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const componentPath = join(root, 'src/app/features/cookbook.component.ts');
const outputDir = join(root, 'public/assets/cookbook');

const assets = [
  {
    name: 'clock.svg',
    remote: 'https://www.figma.com/api/mcp/asset/2d480034-7971-409b-9912-1645bc66620a.svg',
    local: '/assets/cookbook/clock.svg'
  },
  {
    name: 'favorite.svg',
    remote: 'https://www.figma.com/api/mcp/asset/dfcfc424-02d1-4ec1-a089-736354cc3571.svg',
    local: '/assets/cookbook/favorite.svg'
  },
  {
    name: 'heart.svg',
    remote: 'https://www.figma.com/api/mcp/asset/cbe35565-ae3f-49de-bc97-5b791717288a.svg',
    local: '/assets/cookbook/heart.svg'
  },
  {
    name: 'italian.png',
    remote: 'https://www.figma.com/api/mcp/asset/b45ef269-275f-407f-be4c-1c7acbb08560.png',
    local: '/assets/cookbook/italian.png'
  },
  {
    name: 'german.png',
    remote: 'https://www.figma.com/api/mcp/asset/80193f38-814f-428f-8dd0-a7226c04c9da.png',
    local: '/assets/cookbook/german.png'
  },
  {
    name: 'japanese.png',
    remote: 'https://www.figma.com/api/mcp/asset/dc1df6c6-4fcc-4603-ad0c-509710b1d79e.png',
    local: '/assets/cookbook/japanese.png'
  },
  {
    name: 'gourmet.png',
    remote: 'https://www.figma.com/api/mcp/asset/f1354d2d-d2e8-44ff-8394-9f57b7d7f738.png',
    local: '/assets/cookbook/gourmet.png'
  },
  {
    name: 'indian.png',
    remote: 'https://www.figma.com/api/mcp/asset/ddea254f-1760-47c6-9c6b-efa84243de07.png',
    local: '/assets/cookbook/indian.png'
  },
  {
    name: 'fusion.png',
    remote: 'https://www.figma.com/api/mcp/asset/70f6ebe9-0732-4e2b-805a-4b75a8a3729a.png',
    local: '/assets/cookbook/fusion.png'
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
    throw new Error(`Could not find expected Figma URL for ${asset.name} in cookbook.component.ts.`);
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

console.log('\nCookbook assets are now local and cookbook.component.ts points to /assets/cookbook/.');
console.log('Review desktop + 375px mobile, run npm run test:e2e, then commit public/assets/cookbook/ and cookbook.component.ts.');

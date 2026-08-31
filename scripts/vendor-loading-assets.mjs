import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const componentPath = join(root, 'src/app/features/loading.component.ts');
const outputDir = join(root, 'public/assets/loading');

const assets = [
  {
    name: 'generating.gif',
    remote: 'https://www.figma.com/api/mcp/asset/89c42c87-8310-4580-b947-34906f98c6ea',
    local: '/assets/loading/generating.gif'
  },
  {
    name: 'close-desktop.svg',
    remote: 'https://www.figma.com/api/mcp/asset/8e33adb0-5c07-4a48-81d1-df8b34e5ebb6.svg',
    local: '/assets/loading/close-desktop.svg'
  },
  {
    name: 'close-mobile.svg',
    remote: 'https://www.figma.com/api/mcp/asset/e3c9ad52-c16d-4985-b696-50d9367ed866.svg',
    local: '/assets/loading/close-mobile.svg'
  },
  {
    name: 'arrow-desktop.svg',
    remote: 'https://www.figma.com/api/mcp/asset/57341654-60d6-4940-acc8-5858b2955cb4.svg',
    local: '/assets/loading/arrow-desktop.svg'
  },
  {
    name: 'arrow-mobile.svg',
    remote: 'https://www.figma.com/api/mcp/asset/51a0341b-2bbf-4aa0-a126-d929d6ecbbd4.svg',
    local: '/assets/loading/arrow-mobile.svg'
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
    throw new Error(`Could not find expected Figma URL for ${asset.name} in loading.component.ts.`);
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

console.log('\nLoading assets are now local and loading.component.ts points to /assets/loading/.');
console.log('Review /loading?preview=loading and /loading?preview=insufficient, then commit public/assets/loading/ and loading.component.ts.');

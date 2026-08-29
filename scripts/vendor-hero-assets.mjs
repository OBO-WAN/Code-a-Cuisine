import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const componentPath = resolve('src/app/features/home.component.ts');
const outputDir = resolve('public/assets/hero');

const assets = [
  { key: 'topPlate', file: 'plate-top.png', local: '/assets/hero/plate-top.png', type: 'image/png' },
  { key: 'middlePlate', file: 'plate-middle.png', local: '/assets/hero/plate-middle.png', type: 'image/png' },
  { key: 'bottomPlate', file: 'plate-bottom.png', local: '/assets/hero/plate-bottom.png', type: 'image/png' },
  { key: 'arrow', file: 'arrow.svg', local: '/assets/hero/arrow.svg', type: 'image/svg+xml' },
  { key: 'logoMark', file: 'logo-mark.svg', local: '/assets/hero/logo-mark.svg', type: 'image/svg+xml' },
  { key: 'logoWordmark', file: 'logo-wordmark.svg', local: '/assets/hero/logo-wordmark.svg', type: 'image/svg+xml' }
];

let source = await readFile(componentPath, 'utf8');
await mkdir(outputDir, { recursive: true });

for (const asset of assets) {
  const pattern = new RegExp(`${asset.key}:\\s*'([^']+)'`);
  const match = source.match(pattern);

  if (!match) {
    throw new Error(`Could not find ${asset.key} in ${componentPath}`);
  }

  const currentValue = match[1];
  if (currentValue.startsWith('/assets/')) {
    console.log(`✓ ${asset.file} already points to a local asset`);
    continue;
  }

  if (!currentValue.startsWith('https://www.figma.com/api/mcp/asset/')) {
    throw new Error(`${asset.key} is not a Figma MCP asset URL: ${currentValue}`);
  }

  const response = await fetch(currentValue);
  if (!response.ok) {
    throw new Error(`Failed to download ${asset.key}: ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes(asset.type.split(';')[0])) {
    console.warn(`! ${asset.key}: expected ${asset.type}, received ${contentType || 'unknown content type'}`);
  }

  const destination = resolve(outputDir, asset.file);
  const buffer = Buffer.from(await response.arrayBuffer());
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, buffer);

  source = source.replace(pattern, `${asset.key}: '${asset.local}'`);
  console.log(`✓ ${asset.file} (${buffer.length.toLocaleString()} bytes)`);
}

await writeFile(componentPath, source, 'utf8');

console.log('\nHero assets are now local and home.component.ts points to /assets/hero/.');
console.log('Review the page, then commit public/assets/hero/ and src/app/features/home.component.ts.');

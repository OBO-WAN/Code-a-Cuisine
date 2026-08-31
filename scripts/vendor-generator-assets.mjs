import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const componentPath = join(root, 'src/app/features/generate.component.ts');
const outputDir = join(root, 'public/assets/generator');

const assets = [
  {
    name: 'add.svg',
    remote: 'https://www.figma.com/api/mcp/asset/57309082-99dd-4a2d-8a1b-b7d83b7e03fb.svg',
    local: '/assets/generator/add.svg'
  },
  {
    name: 'dropdown.svg',
    remote: 'https://www.figma.com/api/mcp/asset/c3485686-1ce5-48a5-a99c-564a14788a63.svg',
    local: '/assets/generator/dropdown.svg'
  },
  {
    name: 'edit.svg',
    remote: 'https://www.figma.com/api/mcp/asset/9e3f9afb-0b7a-416c-af75-a885e23c1900.svg',
    local: '/assets/generator/edit.svg'
  },
  {
    name: 'delete.svg',
    remote: 'https://www.figma.com/api/mcp/asset/6e2df522-d233-4cc4-84a0-55ed331711ba.svg',
    local: '/assets/generator/delete.svg'
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
    throw new Error(`Could not find expected Figma URL for ${asset.name} in generate.component.ts.`);
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

const focusVisibleRule = `    .add-button:focus-visible {\n      outline: 2px solid rgba(30, 85, 21, 0.55);\n      outline-offset: 2px;\n    }`;

if (!component.includes(focusVisibleRule)) {
  const anchor = `    .add-button img {`;
  if (!component.includes(anchor)) {
    throw new Error('Could not find the Add button CSS block to apply focus-state polish.');
  }

  const focusRules = `    .add-button:focus {\n      outline: none;\n    }\n\n${focusVisibleRule}\n\n`;
  component = component.replace(anchor, focusRules + anchor);
  console.log('✓ add-button pointer focus polished; keyboard focus remains visible');
} else {
  console.log('↷ add-button focus polish already applied');
}

await writeFile(componentPath, component, 'utf8');

console.log('\nGenerator assets are now local and generate.component.ts points to /assets/generator/.');
console.log('Run npm run test:e2e, review desktop + 375px mobile, then commit public/assets/generator/ and generate.component.ts.');

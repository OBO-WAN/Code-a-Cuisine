import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const componentPath = join(root, 'src/app/features/preferences.component.ts');

const oldMethod = `  generate(): void {\n    if (this.state.ingredients().length === 0 || this.loading()) {\n      void this.router.navigate(['/generate']);\n      return;\n    }\n\n    const preferences = {\n      portions: this.portions(),\n      cookingPeople: this.cookingPeople(),\n      timeCategory: this.timeCategory(),\n      cuisine: this.cuisine(),\n      diet: this.diet()\n    };\n\n    this.state.setPreferences(preferences);\n    this.loading.set(true);\n    this.error.set('');\n\n    this.api.generateRecipes({ ingredients: this.state.ingredients(), preferences }).subscribe({\n      next: (response) => {\n        this.state.setResponse(response);\n        this.loading.set(false);\n        void this.router.navigate(['/results']);\n      },\n      error: (error: unknown) => {\n        this.loading.set(false);\n        this.error.set(error instanceof Error ? error.message : 'Recipe generation failed. Please try again.');\n      }\n    });\n  }`;

const newMethod = `  generate(): void {\n    if (this.state.ingredients().length === 0 || this.loading()) {\n      void this.router.navigate(['/generate']);\n      return;\n    }\n\n    const preferences = {\n      portions: this.portions(),\n      cookingPeople: this.cookingPeople(),\n      timeCategory: this.timeCategory(),\n      cuisine: this.cuisine(),\n      diet: this.diet()\n    };\n\n    this.state.setPreferences(preferences);\n    void this.router.navigate(['/loading']);\n  }`;

let component = await readFile(componentPath, 'utf8');

if (component.includes("this.router.navigate(['/loading'])")) {
  console.log('↷ Preferences already routes through /loading');
  process.exit(0);
}

if (!component.includes(oldMethod)) {
  throw new Error('Could not find the expected Preferences generate() implementation. Pull main and retry.');
}

component = component.replace(oldMethod, newMethod);
await writeFile(componentPath, component, 'utf8');

console.log('✓ Preferences now stores preferences and routes to /loading');
console.log('Review the loading + popup screens, then commit src/app/features/preferences.component.ts.');

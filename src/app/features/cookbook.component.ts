import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Cuisine, Recipe } from '../core/models/recipe.models';
import { RecipeStoreService } from '../core/services/recipe-store.service';
import { SiteHeaderComponent } from '../shared/site-header.component';

@Component({
  selector: 'app-cookbook',
  imports: [RouterLink, SiteHeaderComponent],
  template: `
    <main class="page">
      <app-site-header tone="cream" />

      <section class="content" aria-labelledby="cookbook-title">
        <header>
          <div>
            <h1 id="cookbook-title">Cookbook</h1>
            <p>Every generated recipe can become inspiration for the next meal.</p>
          </div>

          <label>
            <span>Filter by cuisine</span>
            <select (change)="filterCuisine($event)">
              <option value="">All cuisines</option>
              @for (option of cuisines; track option) {
                <option [value]="option">{{ option }}</option>
              }
            </select>
          </label>
        </header>

        @if (loading()) {
          <p class="status">Loading cookbook…</p>
        } @else if (error()) {
          <p class="status status--error" role="alert">{{ error() }}</p>
        } @else if (recipes().length === 0) {
          <section class="empty">
            <h2>No recipes yet</h2>
            <p>Generate the first recipes and they will appear here.</p>
            <a routerLink="/generate">Generate recipes</a>
          </section>
        } @else {
          <div class="grid">
            @for (recipe of recipes(); track recipe.id ?? recipe.title) {
              <article class="card">
                <p class="meta">{{ recipe.cuisine }} · {{ recipe.cookingTimeMinutes }} min</p>
                <h2>{{ recipe.title }}</h2>
                <p>{{ recipe.diet === 'None' ? 'No dietary restriction' : recipe.diet }}</p>
                <a [routerLink]="['/recipe', recipe.id]">View full recipe →</a>
              </article>
            }
          </div>
        }
      </section>
    </main>
  `,
  styles: `
    .page { min-height: 100dvh; color: var(--green-dark); background: #fff; }
    .content { width: min(1330px, calc(100% - 32px)); margin: 64px auto 80px; }
    header { display: flex; justify-content: space-between; align-items: end; gap: 32px; margin-bottom: 56px; }
    h1 { margin: 0; font-size: 54px; color: var(--middle-green); }
    header p { font-size: 20px; max-width: 520px; }
    label { display: grid; gap: 8px; font-size: 16px; }
    select { min-height: 42px; border: 1px solid color-mix(in srgb, var(--olive) 45%, transparent); border-radius: 8px; padding: 8px 12px; font: inherit; color: var(--green-dark); background: var(--cream); }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 44px 56px; }
    .card { min-height: 300px; padding: 28px; border-radius: 20px; background: linear-gradient(180deg, color-mix(in srgb, var(--olive) 8%, white), color-mix(in srgb, var(--olive) 24%, white)); display: flex; flex-direction: column; }
    .meta { font-size: 16px; }
    .card h2 { font-size: 30px; line-height: 1.15; }
    .card a { margin-top: auto; color: var(--middle-green); font-weight: 600; text-decoration: none; }
    .status, .empty { text-align: center; padding: 80px 16px; }
    .status--error { color: #8c1c13; }
    .empty a { color: var(--middle-green); }

    @media (max-width: 900px) { .grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 620px) {
      .content { margin-top: 40px; }
      header { align-items: stretch; flex-direction: column; }
      .grid { grid-template-columns: 1fr; }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CookbookComponent implements OnInit {
  private readonly store = inject(RecipeStoreService);
  readonly cuisines: Cuisine[] = ['German', 'Italian', 'Japanese', 'Indian', 'Gourmet', 'Fusion'];
  readonly recipes = signal<Recipe[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

  /** Loads the newest recipe page from Firestore. */
  ngOnInit(): void {
    void this.load();
  }

  /** Applies the selected cuisine filter and reloads Firestore results. */
  filterCuisine(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as Cuisine | '';
    void this.load(value || undefined);
  }

  /** Loads up to 20 recipes, matching the checklist pagination page size. */
  private async load(cuisine?: Cuisine): Promise<void> {
    this.loading.set(true);
    this.error.set('');

    try {
      this.recipes.set(await this.store.listRecipes(20, cuisine));
    } catch (error: unknown) {
      console.error('Failed to load cookbook.', error);
      this.error.set('Cookbook data is unavailable. Check your Firebase configuration.');
    } finally {
      this.loading.set(false);
    }
  }
}

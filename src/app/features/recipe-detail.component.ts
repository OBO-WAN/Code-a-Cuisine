import { Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  input,
  signal
} from '@angular/core';
import { Recipe } from '../core/models/recipe.models';
import { RecipeStoreService } from '../core/services/recipe-store.service';
import { SiteHeaderComponent } from '../shared/site-header.component';

@Component({
  selector: 'app-recipe-detail',
  imports: [SiteHeaderComponent],
  template: `
    <main class="page">
      <app-site-header tone="cream" />
      <div class="back-row"><button type="button" (click)="goBack()">← Back</button></div>

      @if (loading()) {
        <p class="status">Loading recipe…</p>
      } @else if (recipe(); as current) {
        <article class="recipe">
          <header>
            <p>Cooking time: {{ current.cookingTimeMinutes }} min</p>
            <h1>{{ current.title }}</h1>
            <div class="tags">
              <span>{{ current.cuisine }}</span>
              <span>{{ current.diet === 'None' ? 'No preferences' : current.diet }}</span>
            </div>
          </header>

          <section class="nutrition" aria-labelledby="nutrition-title">
            <h2 id="nutrition-title">Nutritional information</h2>
            <dl>
              <div><dt>Energy</dt><dd>{{ current.nutritionPerPortion.calories }} kcal</dd></div>
              <div><dt>Protein</dt><dd>{{ current.nutritionPerPortion.proteinG }}g</dd></div>
              <div><dt>Fat</dt><dd>{{ current.nutritionPerPortion.fatG }}g</dd></div>
              <div><dt>Carbs</dt><dd>{{ current.nutritionPerPortion.carbsG }}g</dd></div>
            </dl>
          </section>

          <section aria-labelledby="ingredients-title">
            <h2 id="ingredients-title">Ingredients</h2>
            <ul>
              @for (ingredient of current.ingredients; track $index) {
                <li>{{ ingredient.quantity }} {{ ingredient.unit }} {{ ingredient.name }}</li>
              }
            </ul>
          </section>

          <section aria-labelledby="directions-title">
            <h2 id="directions-title">Directions</h2>
            <ol class="steps">
              @for (step of current.steps; track step.order) {
                <li>
                  <div><strong>{{ step.title }}</strong><span>Cook {{ step.cook }}</span></div>
                  <p>{{ step.instruction }}</p>
                </li>
              }
            </ol>
          </section>
        </article>
      } @else {
        <p class="status status--error">Recipe not found.</p>
      }
    </main>
  `,
  styles: `
    .page { min-height: 100dvh; color: var(--green-dark); }
    .back-row { width: min(1248px, calc(100% - 32px)); margin: 12px auto 0; }
    .back-row button { border: 0; background: transparent; color: var(--middle-green); font: inherit; cursor: pointer; }
    .recipe { width: min(1248px, calc(100% - 32px)); margin: 48px auto 80px; padding: 40px 48px 64px; border-radius: 24px; background: color-mix(in srgb, var(--olive) 10%, white); }
    header h1 { margin: 6px 0 18px; font-size: clamp(44px, 5vw, 68px); line-height: 1.05; color: var(--middle-green); }
    .tags { display: flex; flex-wrap: wrap; gap: 12px; }
    .tags span { padding: 6px 12px; border-radius: 30px; background: var(--cream); }
    section { margin-top: 48px; }
    h2 { font-size: 30px; color: var(--middle-green); }
    dl { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
    dt { font-weight: 600; }
    dd { margin: 6px 0 0; }
    section ul { columns: 2; padding-left: 20px; }
    .steps { display: grid; grid-template-columns: 1fr 1fr; gap: 38px 64px; padding-left: 28px; }
    .steps li > div { display: flex; justify-content: space-between; gap: 12px; }
    .steps span { font-size: 14px; padding: 4px 10px; border-radius: 20px; background: var(--cream); }
    .status { text-align: center; padding: 100px 16px; }
    .status--error { color: #8c1c13; }

    @media (max-width: 700px) {
      .recipe { margin-top: 30px; padding: 24px 20px 44px; }
      dl, .steps { grid-template-columns: 1fr; }
      section ul { columns: 1; }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecipeDetailComponent implements OnInit {
  private readonly store = inject(RecipeStoreService);
  private readonly location = inject(Location);
  readonly id = input.required<string>();
  readonly recipe = signal<Recipe | null>(null);
  readonly loading = signal(true);

  /** Resolves the recipe either from navigation state or Firestore. */
  ngOnInit(): void {
    const stateRecipe = history.state?.recipe as Recipe | undefined;

    if (stateRecipe) {
      this.recipe.set(stateRecipe);
      this.loading.set(false);
      return;
    }

    void this.loadFromStore();
  }

  /** Navigates to the previous context, matching the Figma back-button note. */
  goBack(): void {
    this.location.back();
  }

  /** Fetches the persisted recipe by route id. */
  private async loadFromStore(): Promise<void> {
    try {
      this.recipe.set(await this.store.getRecipe(this.id()));
    } finally {
      this.loading.set(false);
    }
  }
}

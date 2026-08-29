import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Cuisine, Diet, TimeCategory } from '../core/models/recipe.models';
import { RecipeApiService } from '../core/services/recipe-api.service';
import { GenerationStateService } from '../core/services/generation-state.service';
import { SiteHeaderComponent } from '../shared/site-header.component';

@Component({
  selector: 'app-preferences',
  imports: [RouterLink, SiteHeaderComponent],
  template: `
    <main class="page">
      <app-site-header tone="cream" />
      <a class="back" routerLink="/generate" aria-label="Back to ingredients">← Ingredients</a>

      <section class="content" aria-labelledby="preferences-title">
        <h1 id="preferences-title">Choose your preferences</h1>

        <div class="counters">
          <div>
            <p>How many portions you need?</p>
            <div class="counter">
              <button type="button" (click)="changePortions(-1)" aria-label="Decrease portions">−</button>
              <strong>{{ portions() }}</strong>
              <span>Portions</span>
              <button type="button" (click)="changePortions(1)" aria-label="Increase portions">+</button>
            </div>
          </div>

          <div>
            <p>How many are cooking?</p>
            <div class="counter">
              <button type="button" (click)="changePeople(-1)" aria-label="Decrease cooking people">−</button>
              <strong>{{ cookingPeople() }}</strong>
              <span>{{ cookingPeople() === 1 ? 'Person' : 'People' }}</span>
              <button type="button" (click)="changePeople(1)" aria-label="Increase cooking people">+</button>
            </div>
          </div>
        </div>

        <section class="preferences-card" aria-label="Recipe preferences">
          <fieldset>
            <legend>◷ Cooking time:</legend>
            <div class="tags">
              @for (option of timeOptions; track option.value) {
                <button type="button" class="tag" [class.tag--active]="timeCategory() === option.value" (click)="timeCategory.set(option.value)">{{ option.label }}</button>
              }
            </div>
          </fieldset>

          <fieldset>
            <legend>◉ Cuisine</legend>
            <div class="tags">
              @for (option of cuisines; track option) {
                <button type="button" class="tag" [class.tag--active]="cuisine() === option" (click)="cuisine.set(option)">{{ option }}</button>
              }
            </div>
          </fieldset>

          <fieldset>
            <legend>♜ Diet preferences</legend>
            <div class="tags">
              @for (option of diets; track option) {
                <button type="button" class="tag" [class.tag--active]="diet() === option" (click)="diet.set(option)">{{ option === 'None' ? 'No preferences' : option }}</button>
              }
            </div>
          </fieldset>
        </section>

        <button class="generate" type="button" [disabled]="loading()" (click)="generate()">
          {{ loading() ? 'Generating ...' : 'Generate a recipe' }}
        </button>

        @if (error()) {
          <p class="error" role="alert">{{ error() }}</p>
        }
      </section>
    </main>
  `,
  styles: `
    .page { min-height: 100dvh; background: #fff; color: var(--green-dark); }
    .back { display: block; width: min(1344px, calc(100% - 32px)); margin: 0 auto; color: var(--middle-green); text-decoration: none; font-size: 14px; }
    .content { width: min(721px, calc(100% - 32px)); margin: 42px auto 60px; text-align: center; }
    h1 { margin: 0 0 42px; font-size: 28px; font-weight: 600; }
    .counters { display: grid; grid-template-columns: 1fr 1fr; gap: 72px; text-align: left; margin-bottom: 32px; }
    .counters p { font-size: 20px; }
    .counter { display: flex; align-items: center; gap: 8px; font-size: 20px; }
    .counter button { width: 28px; height: 28px; border: 2px solid var(--middle-green); background: transparent; color: var(--middle-green); line-height: 20px; cursor: pointer; }
    .counter strong { min-width: 22px; text-align: center; background: color-mix(in srgb, var(--olive) 20%, transparent); }
    .preferences-card { padding: 32px 24px; border-radius: 20px; background: color-mix(in srgb, var(--olive) 20%, transparent); text-align: left; display: grid; gap: 34px; }
    fieldset { border: 0; padding: 0; margin: 0; }
    legend { font-size: 24px; margin-bottom: 18px; }
    .tags { display: flex; flex-wrap: wrap; gap: 12px 20px; }
    .tag { min-height: 32px; padding: 5px 12px; border: 1px solid transparent; border-radius: 30px; background: var(--cream); color: var(--middle-green); font: inherit; font-size: 16px; cursor: pointer; }
    .tag--active { border-color: var(--middle-green); box-shadow: inset 0 0 0 1px var(--middle-green); }
    .generate { margin-top: 40px; min-height: 62px; padding: 16px 26px; border: 0; background: var(--olive); color: var(--cream); font: inherit; font-size: 20px; font-weight: 600; cursor: pointer; }
    .generate:disabled { opacity: .55; cursor: wait; }
    .error { color: #8c1c13; font-size: 16px; }

    @media (max-width: 680px) {
      .content { margin-top: 32px; }
      .counters { grid-template-columns: 1fr; gap: 22px; }
      .preferences-card { padding: 26px 20px; }
      legend { font-size: 20px; }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreferencesComponent {
  private readonly state = inject(GenerationStateService);
  private readonly api = inject(RecipeApiService);
  private readonly router = inject(Router);

  readonly cuisines: Cuisine[] = ['German', 'Italian', 'Indian', 'Japanese', 'Gourmet', 'Fusion'];
  readonly diets: Diet[] = ['Vegetarian', 'Vegan', 'Keto', 'None'];
  readonly timeOptions: Array<{ label: string; value: TimeCategory }> = [
    { label: 'Quick', value: 'quick' },
    { label: 'Medium', value: 'medium' },
    { label: 'Complex', value: 'complex' }
  ];

  readonly portions = signal(2);
  readonly cookingPeople = signal(1);
  readonly timeCategory = signal<TimeCategory>('quick');
  readonly cuisine = signal<Cuisine>('Italian');
  readonly diet = signal<Diet>('None');
  readonly loading = signal(false);
  readonly error = signal('');

  /** Adjusts portions while enforcing the checklist range of 1–12. */
  changePortions(delta: number): void {
    this.portions.update((current) => Math.min(12, Math.max(1, current + delta)));
  }

  /** Adjusts cooking helpers while enforcing the checklist range of 1–3. */
  changePeople(delta: number): void {
    this.cookingPeople.update((current) => Math.min(3, Math.max(1, current + delta)));
  }

  /** Sends the complete generation request to n8n and navigates to results. */
  generate(): void {
    if (this.state.ingredients().length === 0 || this.loading()) {
      void this.router.navigate(['/generate']);
      return;
    }

    const preferences = {
      portions: this.portions(),
      cookingPeople: this.cookingPeople(),
      timeCategory: this.timeCategory(),
      cuisine: this.cuisine(),
      diet: this.diet()
    };

    this.state.setPreferences(preferences);
    this.loading.set(true);
    this.error.set('');

    this.api.generateRecipes({ ingredients: this.state.ingredients(), preferences }).subscribe({
      next: (response) => {
        this.state.setResponse(response);
        this.loading.set(false);
        void this.router.navigate(['/results']);
      },
      error: (error: unknown) => {
        this.loading.set(false);
        this.error.set(error instanceof Error ? error.message : 'Recipe generation failed. Please try again.');
      }
    });
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IngredientUnit } from '../core/models/recipe.models';
import { GenerationStateService } from '../core/services/generation-state.service';
import { SiteHeaderComponent } from '../shared/site-header.component';

@Component({
  selector: 'app-generate',
  imports: [FormsModule, RouterLink, SiteHeaderComponent],
  template: `
    <main class="page">
      <app-site-header tone="cream" />

      <section class="content" aria-labelledby="generate-title">
        <h1 id="generate-title">Generate recipe</h1>
        <p class="intro">
          Got random stuff in your kitchen? Pop it in—we’ve got the perfect recipe waiting.
        </p>

        <div class="ingredient-grid">
          <form class="panel form-panel" (ngSubmit)="addIngredient()">
            <label>
              <span>Ingredient</span>
              <input
                [(ngModel)]="name"
                name="ingredient"
                autocomplete="off"
                placeholder="e.g. baby spinach"
                required
              >
            </label>

            <fieldset>
              <legend>Serving size</legend>
              <input
                [(ngModel)]="quantity"
                name="quantity"
                type="number"
                min="0.1"
                step="0.1"
                required
                aria-label="Ingredient quantity"
              >
              <select [(ngModel)]="unit" name="unit" aria-label="Measurement unit">
                @for (option of units; track option) {
                  <option [value]="option">{{ option }}</option>
                }
              </select>
              <button type="submit" class="add" aria-label="Add ingredient">+</button>
            </fieldset>
          </form>

          <section class="panel list-panel" aria-labelledby="ingredients-title">
            <h2 id="ingredients-title">List of your Ingredients</h2>

            @if (ingredients().length === 0) {
              <p class="empty">Add at least one ingredient to continue.</p>
            } @else {
              <ul>
                @for (ingredient of ingredients(); track $index) {
                  <li>
                    <span>{{ ingredient.quantity }} {{ ingredient.unit }} {{ ingredient.name }}</span>
                    <button
                      type="button"
                      (click)="removeIngredient($index)"
                      [attr.aria-label]="'Remove ' + ingredient.name"
                    >×</button>
                  </li>
                }
              </ul>
            }
          </section>
        </div>

        <div class="actions">
          <a class="button" routerLink="/preferences" [class.button--disabled]="!canContinue()">
            Preferences
          </a>
        </div>
      </section>
    </main>
  `,
  styles: `
    .page { min-height: 100dvh; background: #fff; color: var(--green-dark); }
    .content { width: min(1087px, calc(100% - 32px)); margin: 28px auto 0; text-align: center; }
    h1 { margin: 0; color: var(--middle-green); font-size: clamp(40px, 4vw, 54px); line-height: 1.2; }
    .intro { margin: 20px auto 44px; font-size: 24px; max-width: 920px; }
    .ingredient-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 32px; text-align: left; }
    .panel { min-height: 176px; border-radius: 20px; background: color-mix(in srgb, var(--olive) 30%, transparent); padding: 24px; }
    .form-panel { display: grid; grid-template-columns: 1.4fr 1fr; gap: 28px; }
    label, fieldset { display: flex; flex-direction: column; gap: 16px; border: 0; padding: 0; margin: 0; min-width: 0; font-size: 20px; }
    fieldset { display: grid; grid-template-columns: 74px 1fr 40px; align-content: start; column-gap: 8px; }
    legend { grid-column: 1 / -1; margin-bottom: 16px; }
    input, select { min-height: 40px; border: 0; border-radius: 20px; background: color-mix(in srgb, var(--cream) 80%, transparent); padding: 8px 14px; color: var(--green-dark); font: inherit; font-size: 16px; }
    .add { border: 0; background: transparent; color: var(--green-dark); font-size: 30px; cursor: pointer; }
    h2 { margin: 0; font-size: 20px; font-weight: 500; }
    .empty { opacity: .65; font-size: 16px; }
    ul { list-style: none; margin: 20px 0 0; padding: 0; }
    li { min-height: 36px; display: flex; align-items: center; justify-content: space-between; gap: 12px; border-bottom: 1px solid rgba(16,49,11,.16); }
    li button { border: 0; background: transparent; cursor: pointer; font-size: 24px; color: var(--green-dark); }
    .actions { display: flex; justify-content: flex-end; margin-top: 42px; }
    .button { background: var(--olive); color: var(--cream); text-decoration: none; padding: 15px 26px; min-height: 52px; font-weight: 600; font-size: 20px; }
    .button--disabled { opacity: .4; pointer-events: none; }

    @media (max-width: 760px) {
      .content { margin-top: 38px; }
      .intro { font-size: 18px; }
      .ingredient-grid { grid-template-columns: 1fr; }
      .form-panel { grid-template-columns: 1fr; }
      .actions { justify-content: center; }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenerateComponent {
  private readonly state = inject(GenerationStateService);

  readonly units: IngredientUnit[] = ['g', 'kg', 'ml', 'l', 'piece', 'tbsp', 'tsp'];
  readonly ingredients = this.state.ingredients;
  readonly canContinue = computed(() => this.ingredients().length > 0);

  name = '';
  quantity = 100;
  unit: IngredientUnit = 'g';

  /** Validates and adds the ingredient from the form. */
  addIngredient(): void {
    const name = this.name.trim();

    if (!name || !Number.isFinite(this.quantity) || this.quantity <= 0) {
      return;
    }

    this.state.addIngredient({ name, quantity: this.quantity, unit: this.unit });
    this.name = '';
    this.quantity = 100;
    this.unit = 'g';
  }

  /** Removes the selected ingredient from the local generation state. */
  removeIngredient(index: number): void {
    this.state.removeIngredient(index);
  }
}

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

const INGREDIENT_SUGGESTIONS = [
  'Pasta',
  'Pastrami',
  'Passionsfrut',
  'Baby spinach',
  'Cherry tomatoes',
  'Egg'
] as const;

@Component({
  selector: 'app-generate',
  imports: [FormsModule, RouterLink],
  template: `
    <main class="generate-page">
      <header class="generate-header">
        <a routerLink="/" class="brand" aria-label="Code à Cuisine home">
          <span class="brand__mark" aria-hidden="true"></span>
          <span class="brand__wordmark" aria-hidden="true"></span>
        </a>
      </header>

      <section class="generator" aria-labelledby="generate-title">
        <div class="generator__copy">
          <h1 id="generate-title">Generate recipe</h1>
          <p>
            Got random stuff in your kitchen? Pop it in—we’ve got the perfect recipe waiting.
          </p>
        </div>

        <div class="workspace">
          <form class="ingredient-panel" (ngSubmit)="addIngredient()">
            <div class="ingredient-field">
              <label for="ingredient-name">Ingredient</label>
              <input
                id="ingredient-name"
                [(ngModel)]="name"
                name="ingredient"
                autocomplete="off"
                required
                (input)="onIngredientInput()"
                (focus)="onIngredientFocus()"
              >

              @if (visibleSuggestions().length > 0) {
                <div class="suggestions" aria-label="Ingredient suggestions">
                  @for (suggestion of visibleSuggestions(); track suggestion) {
                    <button
                      type="button"
                      class="suggestion"
                      (mousedown)="$event.preventDefault()"
                      (click)="selectSuggestion(suggestion)"
                    >
                      {{ suggestion }}
                    </button>
                  }
                </div>
              }
            </div>

            <fieldset class="serving-field">
              <legend>Serving size</legend>
              <div class="serving-controls">
                <input
                  class="quantity-input"
                  [(ngModel)]="quantity"
                  name="quantity"
                  type="number"
                  min="0.1"
                  step="0.1"
                  required
                  aria-label="Ingredient quantity"
                >

                <span class="unit-select">
                  <select [(ngModel)]="unit" name="unit" aria-label="Measurement unit">
                    @for (option of units; track option.value) {
                      <option [value]="option.value">{{ option.label }}</option>
                    }
                  </select>
                  <img [src]="icons.dropdown" alt="" aria-hidden="true" />
                </span>

                <button type="submit" class="add-button" aria-label="Add ingredient">
                  <img [src]="icons.add" alt="" aria-hidden="true" />
                </button>
              </div>
            </fieldset>
          </form>

          <section class="ingredients-panel" aria-labelledby="ingredients-title">
            <h2 id="ingredients-title">List of your Ingredients</h2>

            @if (ingredients().length > 0) {
              <div class="ingredient-list">
                @for (ingredient of ingredients(); track $index) {
                  <div class="ingredient-row">
                    <span class="ingredient-row__copy">
                      <span class="bullet" aria-hidden="true">•</span>
                      <span class="amount">{{ formatAmount(ingredient.quantity, ingredient.unit) }}</span>
                      <span class="ingredient-name">{{ ingredient.name }}</span>
                    </span>

                    <span class="ingredient-row__actions">
                      <button
                        type="button"
                        class="icon-button"
                        (click)="editIngredient($index)"
                        [attr.aria-label]="'Edit ' + ingredient.name"
                      >
                        <img [src]="icons.edit" alt="" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        class="icon-button"
                        (click)="removeIngredient($index)"
                        [attr.aria-label]="'Remove ' + ingredient.name"
                      >
                        <img [src]="icons.delete" alt="" aria-hidden="true" />
                      </button>
                    </span>
                  </div>
                }
              </div>
            }
          </section>
        </div>

        @if (canContinue()) {
          <a class="next-button" routerLink="/preferences">Next step</a>
        }
      </section>
    </main>
  `,
  styles: `
    :host {
      display: block;
    }

    .generate-page {
      min-height: 100vh;
      overflow-x: clip;
      color: var(--green-dark);
      background: #fff;
    }

    .generate-header {
      width: min(1440px, 100%);
      height: 88px;
      margin-inline: auto;
      padding: 40px 40px 0 68px;
    }

    .brand {
      position: relative;
      display: block;
      width: 142px;
      height: 48px;
      overflow: hidden;
    }

    .brand__mark,
    .brand__wordmark {
      position: absolute;
      display: block;
      background: var(--olive);
      -webkit-mask-repeat: no-repeat;
      mask-repeat: no-repeat;
      -webkit-mask-position: center;
      mask-position: center;
      -webkit-mask-size: contain;
      mask-size: contain;
    }

    .brand__mark {
      inset: 0 64.69% 0 0;
      width: 35.31%;
      height: 100%;
      -webkit-mask-image: url('/assets/hero/logo-mark.svg');
      mask-image: url('/assets/hero/logo-mark.svg');
    }

    .brand__wordmark {
      top: 7.21%;
      right: 0;
      bottom: 1.84%;
      left: 38.78%;
      width: 61.22%;
      height: 90.95%;
      -webkit-mask-image: url('/assets/hero/logo-wordmark.svg');
      mask-image: url('/assets/hero/logo-wordmark.svg');
    }

    .generator {
      display: flex;
      width: min(1087px, calc(100% - 64px));
      margin: 64px auto 0;
      padding-bottom: 80px;
      flex-direction: column;
      align-items: stretch;
    }

    .generator__copy {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 24px;
      text-align: center;
    }

    .generator__copy h1 {
      width: min(567px, 100%);
      margin: 0;
      color: var(--middle-green);
      font-size: 54px;
      font-weight: 600;
      line-height: 65px;
    }

    .generator__copy p {
      width: min(919px, 100%);
      margin: 0;
      color: var(--green-dark);
      font-size: 24px;
      font-weight: 500;
      line-height: 1.25;
    }

    .workspace {
      display: grid;
      grid-template-columns: 577px 478px;
      gap: 32px;
      margin-top: 64px;
      align-items: start;
    }

    .ingredient-panel,
    .ingredients-panel {
      border-radius: 20px;
      background: rgba(57, 96, 57, 0.3);
    }

    .ingredient-panel {
      display: grid;
      grid-template-columns: 300px 178px;
      gap: 32px;
      min-height: 176px;
      padding: 25px 33px;
    }

    .ingredient-field {
      display: flex;
      min-width: 0;
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }

    .ingredient-field label,
    .serving-field legend,
    .ingredients-panel h2 {
      color: var(--green-dark);
      font-size: 20px;
      font-weight: 500;
      line-height: 20px;
    }

    .ingredient-field input {
      width: 300px;
      height: 36px;
      padding: 8px 12px;
      border: 0;
      border-radius: 20px;
      outline: 0;
      color: var(--green-dark);
      background: rgba(250, 240, 230, 0.8);
      font-size: 16px;
      font-weight: 500;
      line-height: 20px;
    }

    .ingredient-field input:focus-visible,
    .quantity-input:focus-visible,
    .unit-select select:focus-visible {
      outline: 2px solid rgba(30, 85, 21, 0.55);
      outline-offset: 2px;
    }

    .suggestions {
      display: flex;
      width: 300px;
      margin-top: -12px;
      padding-left: 16px;
      flex-direction: column;
      align-items: stretch;
    }

    .suggestion {
      width: 100%;
      min-height: 28px;
      padding: 4px 8px;
      border: 0;
      border-radius: 8px;
      color: var(--green-dark);
      background: transparent;
      font-size: 16px;
      font-weight: 500;
      line-height: 20px;
      text-align: left;
      cursor: pointer;
    }

    .suggestion:hover,
    .suggestion:focus-visible {
      background: rgba(250, 240, 230, 0.55);
    }

    .serving-field {
      display: flex;
      min-width: 0;
      margin: 0;
      padding: 0;
      border: 0;
      flex-direction: column;
      gap: 16px;
    }

    .serving-field legend {
      margin: 0 0 16px;
      padding: 0;
    }

    .serving-controls {
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }

    .quantity-input {
      width: 61px;
      height: 36px;
      padding: 3px 10px;
      border: 0;
      border-radius: 48px;
      outline: 0;
      color: var(--green-dark);
      background: var(--cream);
      font-size: 18px;
      font-weight: 500;
      text-align: center;
      -moz-appearance: textfield;
    }

    .quantity-input::-webkit-outer-spin-button,
    .quantity-input::-webkit-inner-spin-button {
      margin: 0;
      -webkit-appearance: none;
    }

    .unit-select {
      position: relative;
      display: inline-flex;
      height: 36px;
      align-items: center;
      border-radius: 48px;
      background: var(--cream);
    }

    .unit-select select {
      height: 36px;
      min-width: 68px;
      padding: 3px 24px 3px 8px;
      border: 0;
      border-radius: 48px;
      outline: 0;
      color: var(--green-dark);
      background: transparent;
      font-size: 16px;
      font-weight: 500;
      line-height: 20px;
      appearance: none;
      cursor: pointer;
    }

    .unit-select img {
      position: absolute;
      right: 8px;
      width: 10px;
      height: 5px;
      pointer-events: none;
    }

    .add-button {
      display: inline-flex;
      width: 36px;
      height: 36px;
      align-items: center;
      justify-content: center;
      padding: 0;
      border: 0;
      border-radius: 5px;
      background: transparent;
      cursor: pointer;
    }

    .add-button img {
      display: block;
      width: 24px;
      height: 24px;
    }

    .ingredients-panel {
      min-height: 209px;
      padding: 24px;
    }

    .ingredients-panel h2 {
      margin: 0;
    }

    .ingredient-list {
      display: flex;
      margin-top: 24px;
      flex-direction: column;
      gap: 6px;
    }

    .ingredient-row {
      display: flex;
      width: 430px;
      min-height: 28px;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 2px 4px;
    }

    .ingredient-row__copy {
      display: grid;
      width: 347px;
      grid-template-columns: 14px 78px minmax(0, 1fr);
      align-items: center;
      column-gap: 8px;
      color: var(--green-dark);
      font-size: 18px;
      font-weight: 500;
      line-height: 1.2;
    }

    .bullet {
      text-align: center;
    }

    .amount {
      white-space: nowrap;
    }

    .ingredient-name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .ingredient-row__actions {
      display: inline-flex;
      align-items: center;
      gap: 16px;
    }

    .icon-button {
      display: inline-flex;
      width: 19px;
      height: 19px;
      align-items: center;
      justify-content: center;
      padding: 0;
      border: 0;
      background: transparent;
      cursor: pointer;
    }

    .icon-button img {
      display: block;
      width: 19px;
      height: 19px;
      object-fit: contain;
    }

    .next-button {
      display: inline-flex;
      width: fit-content;
      min-width: 162px;
      height: 62px;
      margin-top: 56px;
      margin-left: auto;
      align-items: center;
      justify-content: center;
      padding: 16px 26px;
      color: var(--cream);
      background: var(--olive);
      font-size: 24px;
      font-weight: 600;
      line-height: 1;
      text-decoration: none;
    }

    @media (max-width: 1150px) {
      .workspace {
        grid-template-columns: minmax(0, 1fr);
      }

      .ingredient-panel,
      .ingredients-panel {
        width: min(577px, 100%);
        justify-self: center;
      }

      .next-button {
        margin-right: auto;
      }
    }

    @media (max-width: 700px) {
      .generate-header {
        width: min(375px, 100%);
        height: 52px;
        padding: 12px 16px 8px;
      }

      .brand {
        width: 95px;
        height: 32px;
      }

      .generator {
        width: min(340px, calc(100% - 32px));
        margin-top: 40px;
        padding-bottom: 40px;
      }

      .generator__copy {
        align-items: flex-start;
        gap: 24px;
        padding-left: 6.5px;
        text-align: left;
      }

      .generator__copy h1 {
        width: 249px;
        font-size: 32px;
        line-height: 1;
      }

      .generator__copy p {
        width: min(327px, 100%);
        font-size: 18px;
        font-weight: 600;
        line-height: 1.28;
      }

      .workspace {
        display: flex;
        margin-top: 40px;
        flex-direction: column;
        gap: 24px;
      }

      .ingredient-panel,
      .ingredients-panel {
        width: 340px;
        max-width: 100%;
        justify-self: auto;
      }

      .ingredient-panel {
        display: flex;
        min-height: 211px;
        padding: 25px 20px;
        flex-direction: column;
        gap: 16px;
      }

      .ingredient-field {
        width: 300px;
        max-width: 100%;
        gap: 11px;
      }

      .ingredient-field label,
      .ingredients-panel h2 {
        font-size: 18px;
        line-height: 1;
      }

      .ingredient-field input,
      .suggestions {
        width: 300px;
        max-width: 100%;
      }

      .suggestions {
        margin-top: -7px;
      }

      .serving-field {
        width: 300px;
        max-width: 100%;
        gap: 16px;
      }

      .serving-field legend {
        margin-bottom: 16px;
        font-size: 18px;
        line-height: 1;
      }

      .ingredients-panel {
        min-height: 130px;
        padding: 24px 16px;
      }

      .ingredient-list {
        gap: 8px;
      }

      .ingredient-row {
        width: 300px;
        max-width: 100%;
        padding-right: 2px;
        padding-left: 0;
      }

      .ingredient-row__copy {
        width: 212px;
        grid-template-columns: 10px 52px minmax(0, 1fr);
        column-gap: 6px;
      }

      .amount {
        font-size: 18px;
      }

      .ingredient-name {
        font-size: 16px;
        line-height: 20px;
      }

      .next-button {
        min-width: 106px;
        height: 52px;
        margin: 40px auto 0;
        padding: 4px 16px;
        font-size: 16px;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenerateComponent {
  private readonly state = inject(GenerationStateService);

  readonly units: ReadonlyArray<{ value: IngredientUnit; label: string }> = [
    { value: 'g', label: 'gram' },
    { value: 'kg', label: 'kilogram' },
    { value: 'ml', label: 'ml' },
    { value: 'l', label: 'liter' },
    { value: 'piece', label: 'piece' },
    { value: 'tbsp', label: 'tbsp' },
    { value: 'tsp', label: 'tsp' }
  ];

  readonly icons = {
    add: 'https://www.figma.com/api/mcp/asset/57309082-99dd-4a2d-8a1b-b7d83b7e03fb.svg',
    dropdown: 'https://www.figma.com/api/mcp/asset/c3485686-1ce5-48a5-a99c-564a14788a63.svg',
    edit: 'https://www.figma.com/api/mcp/asset/9e3f9afb-0b7a-416c-af75-a885e23c1900.svg',
    delete: 'https://www.figma.com/api/mcp/asset/6e2df522-d233-4cc4-84a0-55ed331711ba.svg'
  } as const;

  readonly ingredients = this.state.ingredients;
  readonly canContinue = computed(() => this.ingredients().length > 0);

  name = '';
  quantity = 100;
  unit: IngredientUnit = 'g';
  showSuggestions = false;
  editingIndex: number | null = null;

  visibleSuggestions(): readonly string[] {
    if (!this.showSuggestions) {
      return [];
    }

    const query = this.name.trim().toLowerCase();
    if (!query) {
      return [];
    }

    return INGREDIENT_SUGGESTIONS
      .filter((suggestion) => suggestion.toLowerCase().startsWith(query))
      .slice(0, 3);
  }

  onIngredientInput(): void {
    this.showSuggestions = this.name.trim().length > 0;
  }

  onIngredientFocus(): void {
    this.showSuggestions = this.name.trim().length > 0;
  }

  selectSuggestion(suggestion: string): void {
    this.name = suggestion;
    this.showSuggestions = false;
  }

  addIngredient(): void {
    const name = this.name.trim();

    if (!name || !Number.isFinite(this.quantity) || this.quantity <= 0) {
      return;
    }

    const ingredient = { name, quantity: Number(this.quantity), unit: this.unit };

    if (this.editingIndex === null) {
      this.state.addIngredient(ingredient);
    } else {
      this.state.updateIngredient(this.editingIndex, ingredient);
    }

    this.resetForm();
  }

  editIngredient(index: number): void {
    const ingredient = this.ingredients()[index];
    if (!ingredient) {
      return;
    }

    this.name = ingredient.name;
    this.quantity = ingredient.quantity;
    this.unit = ingredient.unit;
    this.editingIndex = index;
    this.showSuggestions = false;
  }

  removeIngredient(index: number): void {
    this.state.removeIngredient(index);

    if (this.editingIndex === index) {
      this.resetForm();
    } else if (this.editingIndex !== null && index < this.editingIndex) {
      this.editingIndex -= 1;
    }
  }

  formatAmount(quantity: number, unit: IngredientUnit): string {
    const formattedQuantity = Number.isInteger(quantity) ? quantity.toString() : quantity.toString();
    return unit === 'piece' ? formattedQuantity : `${formattedQuantity}${unit}`;
  }

  private resetForm(): void {
    this.name = '';
    this.quantity = 100;
    this.unit = 'g';
    this.editingIndex = null;
    this.showSuggestions = false;
  }
}

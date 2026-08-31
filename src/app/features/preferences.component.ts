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

const PREFERENCE_ASSETS = {
  minus: 'https://www.figma.com/api/mcp/asset/70e7007d-9915-4dd5-9a51-87e1eae2f353.svg',
  plus: 'https://www.figma.com/api/mcp/asset/5c641811-f614-4ded-80f9-0f7d18bb3aed.svg',
  backDesktop: 'https://www.figma.com/api/mcp/asset/05cd7041-b562-42f4-8c84-dce3f0d41144.svg',
  backMobile: 'https://www.figma.com/api/mcp/asset/e6d60444-a5d7-4b5e-a88a-e62a216cf982.svg',
  schedule: 'https://www.figma.com/api/mcp/asset/93fa497c-1ea6-4197-b5e1-966ed1bbbfcd.svg',
  cuisine: 'https://www.figma.com/api/mcp/asset/ba982e01-1e02-45dc-ba87-e5064eefaffe.svg',
  diet: 'https://www.figma.com/api/mcp/asset/e3200b0d-b9cb-4760-a0c7-c3d495a05d7a.svg'
} as const;

@Component({
  selector: 'app-preferences',
  imports: [RouterLink],
  template: `
    <main class="preferences-page">
      <header class="preferences-header">
        <a routerLink="/" class="brand" aria-label="Code à Cuisine home">
          <span class="brand__mark" aria-hidden="true"></span>
          <span class="brand__wordmark" aria-hidden="true"></span>
        </a>

        <a class="back" routerLink="/generate" aria-label="Back to ingredients">
          <span class="back__desktop-icon" aria-hidden="true">
            <img [src]="assets.backDesktop" alt="" />
          </span>
          <img class="back__mobile-icon" [src]="assets.backMobile" alt="" aria-hidden="true" />
          <span class="back__label">Ingredients</span>
        </a>
      </header>

      <section class="content" aria-labelledby="preferences-title">
        <div class="content__without-cta">
          <section class="first-group">
            <h1 id="preferences-title">Choose your preferences</h1>

            <div class="adjustments">
              <div class="adjustment adjustment--portions">
                <p>How many portions you need?</p>
                <div class="counter">
                  <button type="button" class="counter__button" (click)="changePortions(-1)" aria-label="Decrease portions">
                    <img [src]="assets.minus" alt="" aria-hidden="true" />
                  </button>
                  <strong>{{ portions() }}</strong>
                  <span class="counter__label">Portions</span>
                  <button type="button" class="counter__button" (click)="changePortions(1)" aria-label="Increase portions">
                    <img [src]="assets.plus" alt="" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div class="adjustment adjustment--chefs">
                <p>How many are cooking?</p>
                <div class="counter">
                  <button type="button" class="counter__button" (click)="changePeople(-1)" aria-label="Decrease cooking people">
                    <img [src]="assets.minus" alt="" aria-hidden="true" />
                  </button>
                  <strong>{{ cookingPeople() }}</strong>
                  <span class="counter__label">{{ cookingPeople() === 1 ? 'Person' : 'People' }}</span>
                  <button type="button" class="counter__button" (click)="changePeople(1)" aria-label="Increase cooking people">
                    <img [src]="assets.plus" alt="" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section class="preferences-card" aria-label="Recipe preferences">
            <fieldset class="preference preference--time">
              <legend>
                <span class="preference__icon preference__icon--schedule" aria-hidden="true">
                  <img [src]="assets.schedule" alt="" />
                </span>
                <span>Cooking time:</span>
              </legend>

              <div class="time-options">
                @for (option of timeOptions; track option.value) {
                  <div class="time-option">
                    <button
                      type="button"
                      class="tag"
                      [class.tag--active]="timeCategory() === option.value"
                      [attr.aria-pressed]="timeCategory() === option.value"
                      (click)="timeCategory.set(option.value)"
                    >
                      {{ option.label }}
                    </button>
                    <span>{{ option.description }}</span>
                  </div>
                }
              </div>
            </fieldset>

            <fieldset class="preference preference--cuisine">
              <legend>
                <span class="preference__icon" aria-hidden="true">
                  <img [src]="assets.cuisine" alt="" />
                </span>
                <span>Cuisine</span>
              </legend>

              <div class="tags tags--cuisine">
                @for (option of cuisines; track option) {
                  <button
                    type="button"
                    class="tag"
                    [class.tag--active]="cuisine() === option"
                    [attr.aria-pressed]="cuisine() === option"
                    (click)="cuisine.set(option)"
                  >
                    {{ option }}
                  </button>
                }
              </div>
            </fieldset>

            <fieldset class="preference preference--diet">
              <legend>
                <span class="preference__icon" aria-hidden="true">
                  <img [src]="assets.diet" alt="" />
                </span>
                <span>Diet preferences</span>
              </legend>

              <div class="tags tags--diet">
                @for (option of diets; track option) {
                  <button
                    type="button"
                    class="tag"
                    [class.tag--active]="diet() === option"
                    [attr.aria-pressed]="diet() === option"
                    (click)="diet.set(option)"
                  >
                    {{ option === 'None' ? 'No preferences' : option }}
                  </button>
                }
              </div>
            </fieldset>
          </section>
        </div>

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
    :host {
      display: block;
    }

    .preferences-page {
      min-height: 100dvh;
      overflow-x: clip;
      padding-bottom: 40px;
      background: #fff;
      color: var(--green-dark);
      font-family: 'Quicksand', sans-serif;
    }

    .preferences-header {
      width: min(1440px, 100%);
      margin-inline: auto;
      padding: 40px 40px 0 68px;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 32px;
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

    .back {
      height: 16px;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      color: var(--middle-green);
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      line-height: 10px;
    }

    .back__desktop-icon {
      width: 20px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: visible;
    }

    .back__desktop-icon img {
      width: 22px;
      height: 16px;
      transform: rotate(180deg);
    }

    .back__mobile-icon {
      display: none;
    }

    .content {
      width: 721px;
      max-width: calc(100% - 32px);
      margin: 64px auto 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 56px;
    }

    .content__without-cta {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 56px;
    }

    .first-group {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 56px;
    }

    h1 {
      width: 416px;
      max-width: 100%;
      margin: 0;
      color: var(--green-dark);
      font-size: 28px;
      font-weight: 600;
      line-height: 1;
      text-align: center;
    }

    .adjustments {
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      gap: 120px;
    }

    .adjustment {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }

    .adjustment--portions {
      width: 290px;
    }

    .adjustment--chefs {
      width: 263px;
    }

    .adjustment p {
      min-width: 100%;
      margin: 0;
      color: var(--green-dark);
      font-size: 20px;
      font-weight: 500;
      line-height: 20px;
    }

    .counter {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--green-dark);
    }

    .counter__button {
      width: 28px;
      height: 28px;
      padding: 0;
      border: 0;
      background: transparent;
      cursor: pointer;
    }

    .counter__button img {
      display: block;
      width: 28px;
      height: 28px;
    }

    .counter strong {
      min-width: 22px;
      height: 20px;
      padding: 0 5px 1px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(57, 96, 57, 0.2);
      font-size: 20px;
      font-weight: 500;
      line-height: 20px;
    }

    .counter__label {
      min-width: 69px;
      font-size: 20px;
      font-weight: 500;
      line-height: 20px;
    }

    .preferences-card {
      width: 100%;
      padding: 32px 24px;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 40px;
      border-radius: 20px;
      background: rgba(57, 96, 57, 0.2);
    }

    .preference {
      width: 100%;
      padding: 0;
      margin: 0;
      border: 0;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 24px;
    }

    .preference legend {
      padding: 0;
      display: flex;
      align-items: center;
      gap: 2px;
      color: var(--green-dark);
      font-size: 24px;
      font-weight: 500;
      line-height: 1;
    }

    .preference__icon {
      width: 24px;
      height: 24px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 24px;
    }

    .preference__icon img {
      display: block;
      width: 24px;
      height: 24px;
    }

    .preference__icon--schedule img {
      width: 30px;
      height: 30px;
    }

    .time-options,
    .tags {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .time-option {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    .time-option:nth-child(1) { width: 83px; }
    .time-option:nth-child(2) { width: 102px; }
    .time-option:nth-child(3) { width: 110px; }

    .time-option > span {
      width: 100%;
      color: var(--middle-green);
      font-size: 14px;
      font-weight: 500;
      line-height: 10px;
      text-align: center;
      white-space: nowrap;
    }

    .tag {
      height: 28px;
      padding: 4px 12px;
      border: 1px solid transparent;
      border-radius: 30px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: var(--cream);
      color: var(--middle-green);
      font: inherit;
      font-size: 20px;
      font-weight: 500;
      line-height: 20px;
      white-space: nowrap;
      cursor: pointer;
    }

    .tag--active {
      border-color: var(--middle-green);
      box-shadow: inset 0 0 0 1px var(--middle-green);
    }

    .generate {
      min-height: 62px;
      padding: 16px 26px;
      border: 0;
      background: var(--olive);
      color: var(--cream);
      font: inherit;
      font-size: 24px;
      font-weight: 600;
      line-height: 1;
      cursor: pointer;
    }

    .generate:disabled {
      opacity: 0.55;
      cursor: wait;
    }

    .error {
      margin: -36px 0 0;
      color: #8c1c13;
      font-size: 16px;
      text-align: center;
    }

    @media (max-width: 700px) {
      .preferences-page {
        padding-bottom: 40px;
      }

      .preferences-header {
        width: min(375px, 100%);
        padding: 12px 16px 0;
        gap: 16px;
      }

      .brand {
        width: 95px;
        height: 32px;
      }

      .back {
        width: 32px;
        height: 20px;
        gap: 0;
      }

      .back__desktop-icon,
      .back__label {
        display: none;
      }

      .back__mobile-icon {
        display: block;
        width: 32px;
        height: 20px;
      }

      .content {
        width: 340px;
        max-width: calc(100% - 35px);
        margin-top: 40px;
        gap: 40px;
      }

      .content__without-cta {
        gap: 32px;
      }

      .first-group {
        width: 291px;
        max-width: 100%;
        align-items: flex-start;
        gap: 24px;
      }

      h1 {
        width: 291px;
        font-size: 24px;
        text-align: left;
      }

      .adjustments {
        width: auto;
        flex-direction: column;
        align-items: flex-start;
        gap: 24px;
      }

      .adjustment {
        gap: 8px;
      }

      .adjustment p {
        font-size: 16px;
        line-height: 20px;
      }

      .counter__label {
        font-size: 18px;
        line-height: 1;
      }

      .preferences-card {
        width: 340px;
        max-width: 100%;
        padding: 32px 24px;
        align-items: center;
        gap: 40px;
      }

      .preference {
        width: 300px;
        max-width: 100%;
      }

      .preference legend {
        font-size: 24px;
        font-weight: 600;
      }

      .time-options {
        gap: 8px;
      }

      .tags {
        flex-wrap: wrap;
        gap: 16px;
      }

      .generate {
        height: 52px;
        min-height: 52px;
        padding: 4px 16px;
        font-size: 16px;
      }

      .error {
        margin-top: -20px;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreferencesComponent {
  private readonly state = inject(GenerationStateService);
  private readonly api = inject(RecipeApiService);
  private readonly router = inject(Router);

  readonly assets = PREFERENCE_ASSETS;
  readonly cuisines: Cuisine[] = ['German', 'Italian', 'Indian', 'Japanese', 'Gourmet', 'Fusion'];
  readonly diets: Diet[] = ['Vegetarian', 'Vegan', 'Keto', 'None'];
  readonly timeOptions: Array<{ label: string; value: TimeCategory; description: string }> = [
    { label: 'Quick', value: 'quick', description: 'ab to 20min' },
    { label: 'Medium', value: 'medium', description: '25-40min' },
    { label: 'Complex', value: 'complex', description: 'over 45min' }
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

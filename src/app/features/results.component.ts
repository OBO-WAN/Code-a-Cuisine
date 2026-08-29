import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GenerationStateService } from '../core/services/generation-state.service';
import { SiteHeaderComponent } from '../shared/site-header.component';

@Component({
  selector: 'app-results',
  imports: [DecimalPipe, RouterLink, SiteHeaderComponent],
  template: `
    <main class="page">
      <app-site-header tone="cream" />

      <section class="content" aria-labelledby="results-title">
        <header>
          <div>
            <h1 id="results-title">The recipe results</h1>
            <p>We took what you have and let our AI do the thinking. Here are 3 recipes you can make right now!</p>
          </div>
        </header>

        @if (response(); as current) {
          <div class="recipe-grid">
            @for (recipe of current.recipes; track recipe.title) {
              <article class="recipe-card">
                <p class="meta">{{ recipe.cookingTimeMinutes }} min · {{ recipe.cuisine }}</p>
                <h2>{{ recipe.title }}</h2>
                <p>{{ recipe.usedIngredientRatio * 100 | number:'1.0-0' }}% of your ingredients used</p>
                @if (recipe.missingIngredients.length) {
                  <p class="missing">Extra: {{ recipe.missingIngredients.join(', ') }}</p>
                }
                <a routerLink="/recipe/preview" [state]="{ recipe }">View recipe →</a>
              </article>
            }
          </div>

          <p class="quota">{{ current.quota.remainingForIp }} generation(s) remaining for your IP today.</p>
        } @else {
          <section class="empty">
            <h2>No generated recipes yet</h2>
            <p>Start with your ingredients, then choose your preferences.</p>
            <a class="button" routerLink="/generate">Generate recipes</a>
          </section>
        }
      </section>
    </main>
  `,
  styles: `
    .page { min-height: 100dvh; color: var(--green-dark); }
    .content { width: min(1282px, calc(100% - 32px)); margin: 44px auto 72px; }
    header { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; margin-bottom: 60px; }
    h1 { color: var(--middle-green); font-size: clamp(42px, 4vw, 54px); margin: 0 0 18px; }
    header p { font-size: 24px; max-width: 620px; }
    .recipe-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
    .recipe-card { min-height: 338px; padding: 28px; border-radius: 20px; background: color-mix(in srgb, var(--olive) 20%, transparent); display: flex; flex-direction: column; }
    .meta { font-size: 16px; margin: 0; }
    h2 { font-size: 28px; line-height: 1.15; margin: 18px 0; }
    .missing { opacity: .75; }
    .recipe-card a { margin-top: auto; color: var(--middle-green); font-weight: 600; text-decoration: none; }
    .quota { text-align: right; margin-top: 24px; font-size: 14px; }
    .empty { text-align: center; padding: 72px 16px; }
    .button { display: inline-block; background: var(--olive); color: var(--cream); text-decoration: none; padding: 14px 22px; }

    @media (max-width: 850px) {
      header { grid-template-columns: 1fr; }
      .recipe-grid { grid-template-columns: 1fr; }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResultsComponent {
  private readonly state = inject(GenerationStateService);
  readonly response = this.state.lastResponse;
}

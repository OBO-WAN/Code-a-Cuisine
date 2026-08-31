import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Cuisine, Recipe } from '../core/models/recipe.models';
import { RecipeStoreService } from '../core/services/recipe-store.service';

type CookbookCategory = {
  name: Cuisine;
  label: string;
  emoji: string;
  image: string;
  objectPosition: string;
};

type MostLikedRecipe = {
  id?: string;
  title: string;
  cookingTimeMinutes: number;
  likes: number;
};

const FALLBACK_MOST_LIKED: MostLikedRecipe[] = [
  {
    title: 'Pasta with spinach and cherry tomatoes',
    cookingTimeMinutes: 20,
    likes: 66
  },
  {
    title: 'Low Carb Vegan No-Bake Paleo Bars',
    cookingTimeMinutes: 35,
    likes: 57
  },
  {
    title: 'Schnitzel with fries',
    cookingTimeMinutes: 35,
    likes: 93
  }
];

@Component({
  selector: 'app-cookbook',
  imports: [RouterLink],
  template: `
    <main class="cookbook-page">
      <header class="menu-bar">
        <a routerLink="/" class="brand" aria-label="Code à Cuisine home">
          <span class="brand__mark" aria-hidden="true"></span>
          <span class="brand__wordmark" aria-hidden="true"></span>
        </a>

        <a routerLink="/" class="back-link" aria-label="Back to home">
          <span class="back-link__icon" aria-hidden="true"></span>
          <span class="back-link__label">Back</span>
        </a>
      </header>

      <section class="cookbook-content" aria-labelledby="cookbook-title">
        <section class="upper-panel">
          <div class="cookbook-intro">
            <h1 id="cookbook-title">Cookbook</h1>
            <p>
              From quick bites to gourmet delights, explore them all in our ultimate cookbook and
              get inspired for your next culinary adventure.
            </p>
          </div>

          <div class="most-liked">
            <div class="most-liked__heading">
              <h2>Most liked recipes</h2>
              <img [src]="icons.heart" alt="" aria-hidden="true" />
            </div>

            <div class="most-liked__rail" aria-label="Most liked recipes">
              @for (recipe of mostLikedRecipes(); track recipe.id ?? recipe.title) {
                <a
                  class="liked-card"
                  [routerLink]="recipe.id ? ['/recipe', recipe.id] : ['/cookbook']"
                  [attr.aria-disabled]="recipe.id ? null : 'true'"
                >
                  <div class="liked-card__copy">
                    <div class="liked-card__time">
                      <img [src]="icons.clock" alt="" aria-hidden="true" />
                      <span>Cooking time: {{ recipe.cookingTimeMinutes }}min</span>
                    </div>
                    <h3>{{ recipe.title }}</h3>
                  </div>

                  <span class="likes-pill" aria-label="{{ recipe.likes }} likes">
                    <img [src]="icons.favorite" alt="" aria-hidden="true" />
                    <span>{{ recipe.likes }}</span>
                  </span>
                </a>
              }
            </div>
          </div>
        </section>

        @if (error()) {
          <p class="sr-only" role="status">
            Live cookbook data is unavailable. Showing the design preview content instead.
          </p>
        }

        <section class="cuisine-grid" aria-label="Cuisine categories">
          @for (category of categories; track category.name) {
            <button
              type="button"
              class="cuisine-card"
              [class.cuisine-card--selected]="selectedCuisine() === category.name"
              (click)="selectCuisine(category.name)"
            >
              <span class="cuisine-card__title">
                <span>{{ category.label }}</span>
                <span aria-hidden="true">{{ category.emoji }}</span>
              </span>
              <span class="cuisine-card__image-wrap">
                <img
                  [src]="category.image"
                  [alt]="category.label + ' inspiration'"
                  [style.object-position]="category.objectPosition"
                />
              </span>
            </button>
          }
        </section>

        <a routerLink="/generate" class="generate-link">
          <span>Generate new recipe</span>
          <span class="generate-link__icon" aria-hidden="true"></span>
        </a>
      </section>
    </main>
  `,
  styles: `
    :host {
      display: block;
    }

    .cookbook-page {
      min-height: 100%;
      overflow-x: clip;
      color: var(--green-dark);
      background: #fff;
    }

    .menu-bar {
      display: flex;
      width: 100%;
      flex-direction: column;
      align-items: flex-start;
      gap: 32px;
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
    .brand__wordmark,
    .back-link__icon,
    .generate-link__icon {
      display: block;
      background: var(--olive);
      -webkit-mask-repeat: no-repeat;
      mask-repeat: no-repeat;
      -webkit-mask-position: center;
      mask-position: center;
      -webkit-mask-size: contain;
      mask-size: contain;
    }

    .brand__mark,
    .brand__wordmark {
      position: absolute;
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

    .back-link {
      display: inline-flex;
      height: 16px;
      align-items: center;
      gap: 10px;
      color: var(--middle-green);
      font-size: 14px;
      font-weight: 500;
      line-height: 10px;
      text-decoration: none;
    }

    .back-link__icon {
      width: 20px;
      height: 15px;
      flex: 0 0 auto;
      background: var(--middle-green);
      transform: rotate(180deg);
      -webkit-mask-image: url('/assets/hero/arrow.svg');
      mask-image: url('/assets/hero/arrow.svg');
    }

    .cookbook-content {
      display: flex;
      width: min(1330px, calc(100% - 110px));
      margin: 64px auto 80px;
      flex-direction: column;
      align-items: stretch;
      gap: 80px;
    }

    .upper-panel {
      display: grid;
      grid-template-columns: 454px minmax(0, 1fr);
      align-items: end;
      gap: 17px;
      overflow: hidden;
      padding: 40px 24px;
      border-radius: 20px;
      background: rgba(57, 96, 57, 0.04);
    }

    .cookbook-intro {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .cookbook-intro h1 {
      margin: 0;
      color: var(--middle-green);
      font-family: var(--font-body);
      font-size: 64px;
      font-weight: 700;
      line-height: 65px;
    }

    .cookbook-intro p {
      margin: 0;
      color: var(--green-dark);
      font-size: 24px;
      font-weight: 500;
      line-height: 1.25;
    }

    .most-liked {
      display: flex;
      min-width: 0;
      flex-direction: column;
      justify-content: center;
      gap: 16px;
      overflow: hidden;
    }

    .most-liked__heading {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .most-liked__heading h2 {
      margin: 0;
      color: var(--middle-green);
      font-size: 24px;
      font-weight: 600;
      line-height: 1;
    }

    .most-liked__heading img {
      width: 28px;
      height: 26px;
    }

    .most-liked__rail {
      display: flex;
      width: 100%;
      gap: 12px;
      overflow-x: auto;
      overflow-y: hidden;
      padding-right: 20px;
      border-radius: 16px;
      scrollbar-width: thin;
      scroll-snap-type: x proximity;
    }

    .liked-card {
      display: flex;
      flex: 0 0 356px;
      min-height: 124px;
      align-items: flex-start;
      justify-content: space-between;
      gap: 24px;
      padding: 16px 12px;
      border-radius: 16px;
      color: inherit;
      background: rgba(219, 224, 219, 0.7);
      text-decoration: none;
      scroll-snap-align: start;
    }

    .liked-card__copy {
      display: flex;
      width: 258px;
      min-width: 0;
      flex-direction: column;
      gap: 8px;
    }

    .liked-card__time {
      display: flex;
      align-items: center;
      gap: 4px;
      color: var(--olive);
      font-size: 16px;
      font-weight: 500;
      line-height: 20px;
    }

    .liked-card__time img {
      width: 24px;
      height: 24px;
    }

    .liked-card h3 {
      width: 263px;
      max-width: 100%;
      margin: 0;
      color: var(--middle-green);
      font-size: 24px;
      font-weight: 500;
      line-height: 1.16;
    }

    .likes-pill {
      display: inline-flex;
      flex: 0 0 auto;
      align-items: center;
      padding: 6px 12px;
      border-radius: 30px;
      color: var(--green-dark);
      background: rgba(57, 96, 57, 0.3);
      font-family: 'Mulish', var(--font-body);
      font-size: 16px;
      font-weight: 500;
      line-height: 1;
    }

    .likes-pill img {
      width: 20px;
      height: 20px;
    }

    .cuisine-grid {
      display: grid;
      grid-template-columns: repeat(3, 400px);
      justify-content: space-between;
      gap: 52px 28px;
    }

    .cuisine-card {
      display: flex;
      width: 400px;
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
      padding: 0;
      border: 0;
      color: inherit;
      background: transparent;
      cursor: pointer;
      text-align: left;
    }

    .cuisine-card__title {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: var(--middle-green);
      font-size: 28px;
      font-weight: 600;
      line-height: 1;
      white-space: nowrap;
    }

    .cuisine-card__image-wrap {
      display: block;
      width: 400px;
      height: 400px;
      overflow: hidden;
      background: rgba(57, 96, 57, 0.06);
    }

    .cuisine-card__image-wrap img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 180ms ease;
    }

    .cuisine-card:hover .cuisine-card__image-wrap img,
    .cuisine-card:focus-visible .cuisine-card__image-wrap img,
    .cuisine-card--selected .cuisine-card__image-wrap img {
      transform: scale(1.025);
    }

    .generate-link {
      display: inline-flex;
      align-self: flex-end;
      height: 52px;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 16px 26px;
      border-radius: 5px;
      color: var(--olive);
      font-size: 20px;
      font-weight: 500;
      line-height: 20px;
      text-decoration: none;
    }

    .generate-link__icon {
      width: 24px;
      height: 15px;
      flex: 0 0 auto;
      -webkit-mask-image: url('/assets/hero/arrow.svg');
      mask-image: url('/assets/hero/arrow.svg');
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    @media (max-width: 1240px) {
      .upper-panel {
        grid-template-columns: 1fr;
        align-items: start;
        gap: 36px;
      }

      .cookbook-intro {
        max-width: 560px;
      }

      .cuisine-grid {
        grid-template-columns: repeat(2, minmax(0, 400px));
      }
    }

    @media (max-width: 900px) {
      .menu-bar {
        padding-right: 28px;
        padding-left: 28px;
      }

      .cookbook-content {
        width: calc(100% - 56px);
      }

      .cuisine-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .cuisine-card,
      .cuisine-card__image-wrap {
        width: 100%;
      }

      .cuisine-card__image-wrap {
        height: auto;
        aspect-ratio: 1;
      }
    }

    @media (max-width: 620px) {
      .cookbook-page {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 40px;
        padding-bottom: 40px;
      }

      .menu-bar {
        width: min(375px, 100%);
        gap: 16px;
        padding: 12px 16px 0;
      }

      .brand {
        width: 95px;
        height: 32px;
      }

      .back-link {
        width: 32px;
        height: 20px;
        justify-content: center;
        gap: 0;
      }

      .back-link__icon {
        width: 20px;
        height: 15px;
      }

      .back-link__label {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
      }

      .cookbook-content {
        width: min(340px, calc(100% - 32px));
        margin: 0;
        gap: 40px;
      }

      .upper-panel {
        display: flex;
        width: 100%;
        flex-direction: column;
        align-items: stretch;
        gap: 24px;
        padding: 16px 10px;
        border-radius: 20px;
      }

      .cookbook-intro {
        width: 100%;
        max-width: none;
        gap: 16px;
      }

      .cookbook-intro h1 {
        min-height: 44px;
        font-size: 40px;
        line-height: 44px;
      }

      .cookbook-intro p {
        font-size: 18px;
        line-height: 1.18;
      }

      .most-liked {
        width: 100%;
        gap: 16px;
      }

      .most-liked__heading {
        gap: 16px;
        align-items: center;
      }

      .most-liked__heading h2 {
        font-size: 24px;
        line-height: 1;
      }

      .most-liked__heading img {
        width: 21px;
        height: 20px;
      }

      .most-liked__rail {
        width: 100%;
        gap: 12px;
        padding-right: 0;
        scrollbar-width: none;
      }

      .most-liked__rail::-webkit-scrollbar {
        display: none;
      }

      .liked-card {
        flex: 0 0 281px;
        min-height: 106px;
        gap: 16px;
        padding: 16px 12px;
      }

      .liked-card__copy {
        width: 195px;
        gap: 8px;
      }

      .liked-card__time {
        height: 20px;
        font-size: 16px;
        line-height: 20px;
        white-space: nowrap;
      }

      .liked-card__time img {
        width: 16px;
        height: 16px;
      }

      .liked-card h3 {
        width: 195px;
        font-size: 18px;
        line-height: 1.12;
      }

      .likes-pill {
        padding: 2px 6px;
        font-family: var(--font-body);
        font-size: 16px;
        line-height: 20px;
      }

      .likes-pill img {
        width: 20px;
        height: 20px;
      }

      .cuisine-grid {
        display: flex;
        width: 320px;
        max-width: 100%;
        flex-direction: column;
        align-self: center;
        gap: 24px;
      }

      .cuisine-card {
        width: 320px;
        max-width: 100%;
        gap: 8px;
      }

      .cuisine-card__title {
        font-size: 28px;
        line-height: 1;
      }

      .cuisine-card__image-wrap {
        width: 320px;
        max-width: 100%;
        height: 260px;
        aspect-ratio: auto;
      }

      .cuisine-card__image-wrap img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .generate-link {
        align-self: center;
        height: 52px;
        padding: 4px 16px;
        font-size: 18px;
        line-height: 1;
      }

      .generate-link__icon {
        width: 20px;
        height: 15px;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CookbookComponent implements OnInit {
  private readonly store = inject(RecipeStoreService);

  readonly recipes = signal<Recipe[]>([]);
  readonly selectedCuisine = signal<Cuisine | undefined>(undefined);
  readonly error = signal('');

  readonly icons = {
    clock: 'https://www.figma.com/api/mcp/asset/2d480034-7971-409b-9912-1645bc66620a.svg',
    favorite: 'https://www.figma.com/api/mcp/asset/dfcfc424-02d1-4ec1-a089-736354cc3571.svg',
    heart: 'https://www.figma.com/api/mcp/asset/cbe35565-ae3f-49de-bc97-5b791717288a.svg'
  } as const;

  readonly categories: CookbookCategory[] = [
    {
      name: 'Italian',
      label: 'Italian cuisine',
      emoji: '🤌',
      image: 'https://www.figma.com/api/mcp/asset/b45ef269-275f-407f-be4c-1c7acbb08560.png',
      objectPosition: '50% 50%'
    },
    {
      name: 'German',
      label: 'German cuisine',
      emoji: '🥨',
      image: 'https://www.figma.com/api/mcp/asset/80193f38-814f-428f-8dd0-a7226c04c9da.png',
      objectPosition: '50% 50%'
    },
    {
      name: 'Japanese',
      label: 'Japanese cuisine',
      emoji: '🥢',
      image: 'https://www.figma.com/api/mcp/asset/dc1df6c6-4fcc-4603-ad0c-509710b1d79e.png',
      objectPosition: '50% 50%'
    },
    {
      name: 'Gourmet',
      label: 'Gourmet cuisine',
      emoji: '✨',
      image: 'https://www.figma.com/api/mcp/asset/f1354d2d-d2e8-44ff-8394-9f57b7d7f738.png',
      objectPosition: '50% 50%'
    },
    {
      name: 'Indian',
      label: 'Indian cuisine',
      emoji: '🍛',
      image: 'https://www.figma.com/api/mcp/asset/ddea254f-1760-47c6-9c6b-efa84243de07.png',
      objectPosition: '50% 50%'
    },
    {
      name: 'Fusion',
      label: 'Fusion cuisine',
      emoji: '🍢',
      image: 'https://www.figma.com/api/mcp/asset/70f6ebe9-0732-4e2b-805a-4b75a8a3729a.png',
      objectPosition: '50% 50%'
    }
  ];

  readonly mostLikedRecipes = computed<MostLikedRecipe[]>(() => {
    const live = [...this.recipes()]
      .filter((recipe) => typeof recipe.likes === 'number')
      .sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0))
      .slice(0, 5)
      .map((recipe) => ({
        id: recipe.id,
        title: recipe.title,
        cookingTimeMinutes: recipe.cookingTimeMinutes,
        likes: recipe.likes ?? 0
      }));

    return live.length > 0 ? live : FALLBACK_MOST_LIKED;
  });

  ngOnInit(): void {
    void this.load();
  }

  selectCuisine(cuisine: Cuisine): void {
    this.selectedCuisine.set(cuisine);
    void this.load(cuisine);
  }

  private async load(cuisine?: Cuisine): Promise<void> {
    this.error.set('');

    try {
      this.recipes.set(await this.store.listRecipes(20, cuisine));
    } catch (error: unknown) {
      console.error('Failed to load cookbook.', error);
      this.recipes.set([]);
      this.error.set('Cookbook data is unavailable.');
    }
  }
}

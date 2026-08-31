import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GenerationStateService } from '../core/services/generation-state.service';
import { RecipeApiService } from '../core/services/recipe-api.service';

const LOADING_ASSETS = {
  spinner: 'https://www.figma.com/api/mcp/asset/89c42c87-8310-4580-b947-34906f98c6ea',
  closeDesktop: 'https://www.figma.com/api/mcp/asset/8e33adb0-5c07-4a48-81d1-df8b34e5ebb6.svg',
  closeMobile: 'https://www.figma.com/api/mcp/asset/e3c9ad52-c16d-4985-b696-50d9367ed866.svg',
  arrowDesktop: 'https://www.figma.com/api/mcp/asset/57341654-60d6-4940-acc8-5858b2955cb4.svg',
  arrowMobile: 'https://www.figma.com/api/mcp/asset/51a0341b-2bbf-4aa0-a126-d929d6ecbbd4.svg'
} as const;

@Component({
  selector: 'app-loading',
  imports: [RouterLink],
  template: `
    <main class="loading-page" aria-labelledby="loading-title">
      <header class="loading-header">
        <a routerLink="/" class="brand" aria-label="Code à Cuisine home">
          <span class="brand__mark" aria-hidden="true"></span>
          <span class="brand__wordmark" aria-hidden="true"></span>
        </a>
      </header>

      <section class="loading-content" aria-live="polite">
        <div class="loader" aria-hidden="true">
          <div class="loader__crop">
            <img class="loader__animation" [src]="assets.spinner" alt="" />
          </div>
        </div>
        <h1 id="loading-title">Generating ...</h1>

        @if (genericError()) {
          <div class="generic-error" role="alert">
            <p>{{ genericError() }}</p>
            <a routerLink="/preferences">Back to preferences</a>
          </div>
        }
      </section>

      @if (insufficientQuantity()) {
        <div class="modal-backdrop">
          <section
            class="quantity-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="quantity-modal-title"
            aria-describedby="quantity-modal-description"
          >
            <div class="quantity-modal__close-row">
              <button
                type="button"
                class="quantity-modal__close"
                aria-label="Close insufficient ingredient quantities dialog"
                (click)="closeQuantityDialog()"
              >
                <img class="quantity-modal__close-desktop" [src]="assets.closeDesktop" alt="" />
                <img class="quantity-modal__close-mobile" [src]="assets.closeMobile" alt="" />
              </button>
            </div>

            <div class="quantity-modal__content">
              <div class="quantity-modal__copy">
                <h2 id="quantity-modal-title">
                  <span class="quantity-modal__title-desktop">Ups! Not quite enough...</span>
                  <span class="quantity-modal__title-mobile">Ups!<br />Not quite enough...</span>
                </h2>
                <p id="quantity-modal-description">
                  It looks like some ingredient quantities aren’t sufficient for your selected servings. Please add or adjust quantities and try again.
                </p>
              </div>

              <a class="quantity-modal__back" routerLink="/generate">
                <span>Go back to ingredients</span>
                <span class="quantity-modal__arrow" aria-hidden="true">
                  <img class="quantity-modal__arrow-desktop" [src]="assets.arrowDesktop" alt="" />
                  <img class="quantity-modal__arrow-mobile" [src]="assets.arrowMobile" alt="" />
                </span>
              </a>
            </div>
          </section>
        </div>
      }
    </main>
  `,
  styles: `
    :host {
      display: block;
    }

    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }

    .loading-page {
      position: relative;
      width: 100%;
      height: 100dvh;
      min-height: 720px;
      overflow: hidden;
      background: #396039;
      color: #faf0e6;
    }

    .loading-header {
      position: absolute;
      top: 0;
      left: 50%;
      width: min(1440px, 100%);
      padding: 40px 40px 0 68px;
      transform: translateX(-50%);
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
      background: #faf0e6;
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

    .loading-content {
      position: absolute;
      top: 341px;
      left: 50%;
      width: 429px;
      transform: translateX(-50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 32px;
    }

    .loader {
      position: relative;
      width: 253px;
      height: 309px;
      flex: 0 0 309px;
      overflow: hidden;
      border-radius: 20px;
      background: #c4d0c4;
    }

    .loader__crop {
      position: absolute;
      top: 0;
      left: 0;
      width: 253px;
      height: 291px;
      overflow: hidden;
    }

    .loader__animation {
      position: absolute;
      top: -22.36%;
      left: -0.04%;
      width: 100.08%;
      height: 122.36%;
      max-width: none;
      object-fit: fill;
    }

    h1 {
      width: 100%;
      margin: 0;
      color: #faf0e6;
      font-family: 'Ubuntu', sans-serif;
      font-size: 48px;
      font-weight: 700;
      line-height: normal;
      text-align: center;
    }

    .generic-error {
      width: min(429px, calc(100vw - 32px));
      margin-top: -12px;
      text-align: center;
      font-family: 'Quicksand', sans-serif;
    }

    .generic-error p {
      margin: 0 0 12px;
      font-size: 16px;
    }

    .generic-error a {
      color: #faf0e6;
      font-weight: 600;
    }

    .modal-backdrop {
      position: fixed;
      inset: 0;
      z-index: 20;
      display: grid;
      place-items: center;
      padding: 24px;
      background: rgba(16, 49, 11, 0.42);
    }

    .quantity-modal {
      width: 567px;
      height: 345px;
      padding: 44px 64px 64px;
      border-radius: 30px;
      background: #396039;
      color: #faf0e6;
      font-family: 'Quicksand', sans-serif;
    }

    .quantity-modal__close-row {
      width: 100%;
      height: 24px;
      display: flex;
      justify-content: flex-end;
      align-items: flex-start;
    }

    .quantity-modal__close {
      position: relative;
      width: 24px;
      height: 24px;
      padding: 0;
      border: 0;
      background: transparent;
      cursor: pointer;
    }

    .quantity-modal__close img {
      position: absolute;
      inset: 0;
      width: 24px;
      height: 24px;
    }

    .quantity-modal__close-mobile,
    .quantity-modal__arrow-mobile,
    .quantity-modal__title-mobile {
      display: none;
    }

    .quantity-modal__content {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 24px;
    }

    .quantity-modal__copy {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .quantity-modal h2,
    .quantity-modal p {
      width: 100%;
      margin: 0;
    }

    .quantity-modal h2 {
      font-size: 28px;
      font-weight: 600;
      line-height: normal;
    }

    .quantity-modal p {
      font-size: 18px;
      font-weight: 600;
      line-height: 26px;
    }

    .quantity-modal__back {
      height: 52px;
      padding: 16px 26px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      border-radius: 5px;
      color: #faf0e6;
      text-decoration: none;
      font-size: 20px;
      font-weight: 500;
      line-height: 20px;
      white-space: nowrap;
    }

    .quantity-modal__arrow {
      position: relative;
      width: 24px;
      height: 0;
      display: block;
    }

    .quantity-modal__arrow img {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 26px;
      transform: translate(-50%, -50%);
    }

    @media (max-width: 700px) {
      .loading-page {
        min-height: 812px;
      }

      .loading-header {
        position: relative;
        top: auto;
        left: auto;
        width: min(375px, 100%);
        height: 44px;
        padding: 12px 16px 0;
        transform: none;
      }

      .brand {
        width: 95px;
        height: 32px;
      }

      .loading-content {
        position: relative;
        top: auto;
        left: auto;
        width: 340px;
        height: 640px;
        margin: 40px auto 0;
        transform: none;
        justify-content: center;
        gap: 32px;
      }

      .loader__crop {
        top: 50%;
        left: 50%;
        width: 243px;
        height: 280px;
        transform: translate(-50%, -50%);
      }

      h1 {
        font-size: 36px;
      }

      .generic-error {
        position: absolute;
        top: calc(50% + 220px);
      }

      .modal-backdrop {
        padding: 17px;
      }

      .quantity-modal {
        width: 340px;
        height: 314px;
        padding: 16px 24px 24px;
      }

      .quantity-modal__close-desktop,
      .quantity-modal__arrow-desktop,
      .quantity-modal__title-desktop {
        display: none;
      }

      .quantity-modal__close-mobile,
      .quantity-modal__arrow-mobile,
      .quantity-modal__title-mobile {
        display: block;
      }

      .quantity-modal h2 {
        font-size: 28px;
        line-height: normal;
      }

      .quantity-modal p {
        font-family: 'Mulish', sans-serif;
        font-size: 16px;
        font-weight: 400;
        line-height: normal;
      }

      .quantity-modal__back {
        height: 52px;
        padding: 4px 16px;
        font-size: 18px;
        line-height: normal;
      }

      .quantity-modal__arrow {
        width: 20px;
      }

      .quantity-modal__arrow img {
        width: 22px;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingComponent implements OnInit {
  private readonly state = inject(GenerationStateService);
  private readonly api = inject(RecipeApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly assets = LOADING_ASSETS;
  readonly insufficientQuantity = signal(false);
  readonly genericError = signal('');

  ngOnInit(): void {
    const preview = this.route.snapshot.queryParamMap.get('preview');
    if (preview === 'loading') {
      return;
    }
    if (preview === 'insufficient') {
      this.insufficientQuantity.set(true);
      return;
    }

    const ingredients = this.state.ingredients();
    if (ingredients.length === 0) {
      void this.router.navigate(['/generate']);
      return;
    }

    this.api.generateRecipes({
      ingredients,
      preferences: this.state.preferences()
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.state.setResponse(response);
          void this.router.navigate(['/results']);
        },
        error: (error: unknown) => {
          if (this.isInsufficientQuantityError(error)) {
            this.insufficientQuantity.set(true);
            return;
          }

          this.genericError.set(
            error instanceof Error
              ? error.message
              : 'Recipe generation failed. Please try again.'
          );
        }
      });
  }

  closeQuantityDialog(): void {
    void this.router.navigate(['/preferences']);
  }

  private isInsufficientQuantityError(error: unknown): boolean {
    if (error instanceof HttpErrorResponse) {
      const payload = error.error;
      const code = typeof payload === 'object' && payload !== null
        ? String(payload.code ?? payload.error?.code ?? '')
        : '';
      const message = typeof payload === 'string'
        ? payload
        : typeof payload === 'object' && payload !== null
          ? String(payload.message ?? payload.error?.message ?? '')
          : '';

      return code === 'INSUFFICIENT_QUANTITY'
        || message.includes('INSUFFICIENT_QUANTITY');
    }

    return error instanceof Error
      && error.message.includes('INSUFFICIENT_QUANTITY');
  }
}

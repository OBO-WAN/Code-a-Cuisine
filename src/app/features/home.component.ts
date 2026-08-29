import { ChangeDetectionStrategy, Component, HostListener, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  template: `
    <main class="home">
      <section class="hero" aria-labelledby="hero-title">
        <div class="hero__canvas" [style.transform]="'scale(' + heroScale() + ')'">
          <a routerLink="/" class="hero__brand" aria-label="Code à Cuisine home">
            <img class="hero__brand-mark" [src]="assets.logoMark" alt="" />
            <img class="hero__brand-wordmark" [src]="assets.logoWordmark" alt="Code à Cuisine" />
          </a>

          <div class="hero__copy">
            <div class="hero__heading">
              <p class="eyebrow">AI-Powered recipe generator</p>
              <h1 id="hero-title">Code à Cuisine</h1>
            </div>
            <a class="button button--cream" routerLink="/generate">Get started</a>
          </div>

          <div class="hero__visuals" aria-hidden="true">
            <img class="hero__plate hero__plate--top" [src]="assets.topPlate" alt="" />
            <img class="hero__plate hero__plate--middle" [src]="assets.middlePlate" alt="" />
            <div class="hero__plate-bottom-frame">
              <img class="hero__plate hero__plate--bottom" [src]="assets.bottomPlate" alt="" />
            </div>
          </div>

          <div class="hero__secondary">
            <strong>Hungry for inspiration?</strong>
            <a class="hero__cookbook-link" routerLink="/cookbook">
              <span>Go to cookbook</span>
              <img [src]="assets.arrow" alt="" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
    </main>
  `,
  styles: `
    :host {
      position: fixed;
      inset: 0;
      display: block;
      overflow: hidden;
    }

    .home,
    .hero {
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    .home {
      background: var(--olive);
      color: var(--cream);
    }

    .hero {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: flex-start;
    }

    .hero__canvas {
      position: relative;
      flex: 0 0 auto;
      width: 1440px;
      height: 1024px;
      transform-origin: top center;
      overflow: hidden;
    }

    .hero__brand {
      position: absolute;
      z-index: 4;
      top: 40px;
      left: 68px;
      width: 142px;
      height: 48px;
      overflow: hidden;
    }

    .hero__brand-mark,
    .hero__brand-wordmark {
      position: absolute;
      display: block;
    }

    .hero__brand-mark {
      inset: 0 64.69% 0 0;
      width: 35.31%;
      height: 100%;
    }

    .hero__brand-wordmark {
      top: 7.21%;
      right: 0;
      bottom: 1.84%;
      left: 38.78%;
      width: 61.22%;
      height: 90.95%;
    }

    .hero__copy {
      position: absolute;
      z-index: 3;
      top: 240px;
      left: 65px;
      display: flex;
      width: 755px;
      flex-direction: column;
      align-items: flex-start;
      gap: 64px;
    }

    .hero__heading {
      width: 100%;
    }

    .eyebrow {
      width: 100%;
      margin: 0;
      color: var(--cream-soft);
      font-family: var(--font-body);
      font-size: 48px;
      font-weight: 600;
      line-height: 1;
    }

    h1 {
      width: 755px;
      margin: 0;
      color: var(--cream);
      font-family: var(--font-display);
      font-size: 104px;
      font-weight: 700;
      line-height: 1;
      white-space: nowrap;
    }

    .button {
      display: inline-flex;
      height: 60px;
      align-items: center;
      justify-content: center;
      padding: 16px 26px;
      text-decoration: none;
      font-size: 24px;
      font-weight: 600;
      line-height: 1;
    }

    .button--cream {
      background: var(--cream);
      color: var(--green);
    }

    .hero__visuals {
      position: absolute;
      z-index: 2;
      top: -42px;
      left: 911px;
      width: 480px;
      height: 1145px;
      pointer-events: none;
    }

    .hero__plate {
      position: absolute;
      display: block;
      max-width: none;
      object-fit: contain;
    }

    .hero__plate--top {
      top: 0;
      left: 5px;
      width: 480px;
      height: 478px;
    }

    .hero__plate--middle {
      top: 315px;
      left: -8px;
      width: 494px;
      height: 492px;
    }

    .hero__plate-bottom-frame {
      position: absolute;
      top: 553.86px;
      left: -68.87px;
      display: flex;
      width: 617.733px;
      height: 633.284px;
      align-items: center;
      justify-content: center;
    }

    .hero__plate--bottom {
      position: relative;
      width: 490px;
      height: 513px;
      transform: rotate(18.91deg);
    }

    .hero__secondary {
      position: absolute;
      z-index: 3;
      top: 846px;
      left: 65px;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .hero__secondary strong {
      width: 342px;
      color: var(--cream);
      font-family: var(--font-display);
      font-size: 32px;
      font-weight: 500;
      line-height: 1.04;
    }

    .hero__cookbook-link {
      display: inline-flex;
      height: 52px;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 16px 26px;
      color: var(--cream);
      text-decoration: none;
      font-size: 20px;
      font-weight: 500;
      line-height: 20px;
    }

    .hero__cookbook-link img {
      display: block;
      width: 26px;
      height: 15px;
      object-fit: contain;
    }

    @media (max-width: 700px) {
      .hero__canvas {
        width: 100%;
        height: 100%;
        transform: none !important;
      }

      .hero__brand {
        top: 20px;
        left: 20px;
        width: 118px;
        height: 40px;
      }

      .hero__copy {
        top: 154px;
        left: 20px;
        width: calc(100% - 40px);
        gap: 40px;
      }

      .eyebrow {
        width: 66%;
        font-size: 28px;
        line-height: 1.08;
      }

      h1 {
        width: 78%;
        margin-top: 8px;
        font-size: clamp(58px, 17vw, 76px);
        white-space: normal;
      }

      .button {
        height: 52px;
        padding: 14px 22px;
        font-size: 20px;
      }

      .hero__visuals {
        top: 68px;
        left: 65%;
        transform: scale(.52);
        transform-origin: top left;
      }

      .hero__secondary {
        top: auto;
        right: 20px;
        bottom: 32px;
        left: 20px;
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }

      .hero__secondary strong {
        width: auto;
        font-size: 22px;
      }

      .hero__cookbook-link {
        height: 40px;
        padding: 8px 0;
        font-size: 16px;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {
  readonly heroScale = signal(1);

  readonly assets = {
    topPlate: 'https://www.figma.com/api/mcp/asset/a7f2614a-df36-4c20-a11c-b96ed0700242.png',
    middlePlate: 'https://www.figma.com/api/mcp/asset/70778520-c0e9-443e-9ec6-18722ba9cc9a.png',
    bottomPlate: 'https://www.figma.com/api/mcp/asset/e6d8c266-6430-4f25-9f79-05f8df7d8de5.png',
    arrow: 'https://www.figma.com/api/mcp/asset/d20cd9b0-78a2-405b-9e04-f30635ea70a8.svg',
    logoMark: 'https://www.figma.com/api/mcp/asset/804625fa-92e9-4e9b-a6e6-5392e19d8326.svg',
    logoWordmark: 'https://www.figma.com/api/mcp/asset/9b0626c1-c676-4ac4-bab9-98439855af21.svg'
  } as const;

  constructor() {
    this.updateHeroScale();
  }

  @HostListener('window:resize')
  updateHeroScale(): void {
    if (typeof document === 'undefined') {
      return;
    }

    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;

    if (viewportWidth <= 700) {
      this.heroScale.set(1);
      return;
    }

    const widthScale = viewportWidth / 1440;
    const heightScale = viewportHeight / 1024;
    this.heroScale.set(Math.min(widthScale, heightScale));
  }
}

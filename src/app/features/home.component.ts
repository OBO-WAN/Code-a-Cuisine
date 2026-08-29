import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiteHeaderComponent } from '../shared/site-header.component';

@Component({
  selector: 'app-home',
  imports: [RouterLink, SiteHeaderComponent],
  template: `
    <main class="home">
      <app-site-header />

      <section class="hero" aria-labelledby="hero-title">
        <div class="hero__copy">
          <p class="eyebrow">AI-Powered recipe generator</p>
          <h1 id="hero-title">Code à Cuisine</h1>
          <a class="button button--cream" routerLink="/generate">Get started</a>
        </div>

        <div class="plates" aria-hidden="true">
          <div class="plate plate--one"><span>🥦</span><span>🍚</span><span>🍅</span></div>
          <div class="plate plate--two"><span>🥗</span><span>🐟</span><span>🍋</span></div>
          <div class="plate plate--three"><span>🥩</span><span>🥔</span><span>🥬</span></div>
        </div>

        <div class="hero__secondary">
          <strong>Hungry for inspiration?</strong>
          <a routerLink="/cookbook">Go to cookbook <span aria-hidden="true">→</span></a>
        </div>
      </section>
    </main>
  `,
  styles: `
    .home {
      min-height: 100dvh;
      background: var(--olive);
      color: var(--cream);
      overflow: hidden;
    }

    .hero {
      position: relative;
      min-height: calc(100dvh - 88px);
      width: min(100%, 1440px);
      margin-inline: auto;
      padding: 104px 64px 72px;
    }

    .hero__copy {
      position: relative;
      z-index: 2;
      width: min(760px, 65vw);
    }

    .eyebrow {
      margin: 0;
      font-size: clamp(28px, 3.4vw, 48px);
      font-weight: 600;
      color: var(--cream-soft);
    }

    h1 {
      margin: 8px 0 46px;
      font-family: var(--font-display);
      font-size: clamp(64px, 7.2vw, 104px);
      line-height: .98;
    }

    .button {
      display: inline-flex;
      min-height: 60px;
      align-items: center;
      padding: 14px 26px;
      text-decoration: none;
      font-size: 24px;
      font-weight: 600;
    }

    .button--cream {
      background: var(--cream);
      color: var(--green);
    }

    .hero__secondary {
      position: absolute;
      left: 64px;
      bottom: 70px;
      display: flex;
      align-items: center;
      gap: 16px;
      font-size: 20px;
    }

    .hero__secondary strong {
      font-size: 32px;
    }

    .hero__secondary a {
      color: inherit;
      text-decoration: none;
    }

    .plates {
      position: absolute;
      top: -80px;
      right: -10px;
      width: 520px;
      height: 1040px;
    }

    .plate {
      position: absolute;
      right: 40px;
      width: 430px;
      height: 430px;
      border-radius: 50%;
      background: radial-gradient(circle at 50% 50%, #fff 0 62%, #cde7e7 63% 67%, transparent 68%), var(--cream);
      filter: drop-shadow(0 14px 12px rgba(0,0,0,.24));
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      place-items: center;
      padding: 80px;
      font-size: 60px;
    }

    .plate--one { top: 0; }
    .plate--two { top: 310px; right: 10px; }
    .plate--three { top: 670px; right: 30px; }

    @media (max-width: 900px) {
      .hero { padding: 48px 32px 56px; }
      .hero__copy { width: 62%; }
      .plates { right: -160px; }
      .hero__secondary { left: 32px; }
    }

    @media (max-width: 700px) {
      .hero {
        min-height: calc(100dvh - 52px);
        padding: 44px 16px 38px;
      }

      .hero__copy { width: 68%; }
      .eyebrow { font-size: 26px; }
      h1 { font-size: 66px; margin-bottom: 38px; }
      .button { min-height: 52px; font-size: 20px; }
      .plates {
        top: -20px;
        right: -250px;
        transform: scale(.72);
        transform-origin: top right;
      }
      .hero__secondary {
        left: 16px;
        bottom: 38px;
        width: 55%;
        flex-direction: column;
        align-items: flex-start;
      }
      .hero__secondary strong { font-size: 20px; }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {}

import {
  ChangeDetectionStrategy,
  Component,
  input
} from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-site-header',
  imports: [RouterLink],
  template: `
    <header class="site-header" [class.site-header--cream]="tone() === 'cream'">
      <a routerLink="/" class="brand" aria-label="Code à Cuisine home">
        <span class="brand__mark" aria-hidden="true">♣</span>
        <span class="brand__text">Code à<br>Cuisine</span>
      </a>

      <nav aria-label="Primary navigation">
        <a routerLink="/generate">Generate</a>
        <a routerLink="/cookbook">Cookbook</a>
      </nav>
    </header>
  `,
  styles: `
    .site-header {
      width: min(100%, 1440px);
      min-height: 88px;
      margin-inline: auto;
      padding: 28px 48px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: var(--cream);
    }

    .site-header--cream {
      color: var(--green-dark);
      background: var(--cream);
    }

    .brand {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: inherit;
      font-weight: 600;
      text-decoration: none;
      line-height: .88;
    }

    .brand__mark {
      font-size: 38px;
      transform: rotate(18deg);
    }

    .brand__text {
      font-size: 20px;
    }

    nav {
      display: flex;
      gap: 28px;
    }

    nav a {
      color: inherit;
      text-decoration: none;
      font-size: 16px;
    }

    @media (max-width: 700px) {
      .site-header {
        min-height: 52px;
        padding: 10px 16px;
      }

      nav {
        display: none;
      }

      .brand__mark {
        font-size: 28px;
      }

      .brand__text {
        font-size: 16px;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiteHeaderComponent {
  readonly tone = input<'green' | 'cream'>('green');
}

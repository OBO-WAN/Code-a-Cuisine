import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SiteHeaderComponent } from '../shared/site-header.component';

@Component({
  selector: 'app-imprint',
  imports: [SiteHeaderComponent],
  template: `
    <main>
      <app-site-header tone="cream" />
      <article class="legal">
        <h1>Imprint</h1>
        <p>Add the legally required publisher/contact information for the deployed project here.</p>
        <p>This placeholder exists so the required route is present without inventing personal or company details.</p>
      </article>
    </main>
  `,
  styles: `
    .legal { width: min(760px, calc(100% - 32px)); margin: 64px auto; }
    h1 { color: var(--middle-green); font-size: 48px; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImprintComponent {}

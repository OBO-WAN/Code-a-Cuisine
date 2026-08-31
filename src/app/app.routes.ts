import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home.component').then((module) => module.HomeComponent)
  },
  {
    path: 'generate',
    loadComponent: () =>
      import('./features/generate.component').then(
        (module) => module.GenerateComponent
      )
  },
  {
    path: 'preferences',
    loadComponent: () =>
      import('./features/preferences.component').then(
        (module) => module.PreferencesComponent
      )
  },
  {
    path: 'loading',
    loadComponent: () =>
      import('./features/loading.component').then(
        (module) => module.LoadingComponent
      )
  },
  {
    path: 'results',
    loadComponent: () =>
      import('./features/results.component').then(
        (module) => module.ResultsComponent
      )
  },
  {
    path: 'cookbook',
    loadComponent: () =>
      import('./features/cookbook.component').then(
        (module) => module.CookbookComponent
      )
  },
  {
    path: 'recipe/:id',
    loadComponent: () =>
      import('./features/recipe-detail.component').then(
        (module) => module.RecipeDetailComponent
      )
  },
  {
    path: 'imprint',
    loadComponent: () =>
      import('./features/imprint.component').then(
        (module) => module.ImprintComponent
      )
  },
  {
    path: '**',
    redirectTo: ''
  }
];

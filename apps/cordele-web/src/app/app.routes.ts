import { Routes } from '@angular/router';
import { AppShellComponent } from './shell/app-shell.component';

export const appRoutes: Routes = [
  {
    path: '',
    component: AppShellComponent,
    children: [
      {
        path: 'imp',
        // Load from canonical shell-entry path
        loadChildren: () =>
          import('@cordele/imp/shell-entry').then(m => m.IMP_ROUTES),
      },
      {
        path: 'comp',
        loadChildren: () =>
          import('@cordele/comp').then(r => r.COMP_ROUTES),
      },
      {
        path: 'pub',
        // Load from canonical shell-entry (Foundation)
        loadChildren: () =>
          import('@cordele/pub-shell-entry').then(r => r.PUB_ROUTES),
      },
      {
        path: 'proj',
        loadChildren: () =>
          import('@cordele/proj').then(r => r.PROJ_ROUTES),
      },
      { path: '**', redirectTo: '' },
    ],
  },
];

/**
 * proj.routes.ts — PROJ module routes (exported as PROJ_ROUTES for loadChildren).
 * Registered in app.routes.ts as:
 *   { path: 'proj', loadChildren: () => import('@cordele/proj').then(r => r.PROJ_ROUTES) }
 *
 * Routes:
 *   /proj/biblioteca-de-projetos          → BibliotecaDeProjetosComponent (library)
 *   /proj/projetos/:projetoId/historico   → DownloadEHistoricoComponent (histórico, parametrized)
 *
 * Guards:
 *   authGuard        — JWT present and valid (@cordele/shared/access-decision)
 *   empresaGuard     — EmpresaContext resolved (@cordele/shared/empresa-context)
 *   projProjetoGuard — :projetoId is a well-formed UUID (only on histórico route)
 */
import { Routes } from '@angular/router';
import { authGuard } from '@cordele/shared/access-decision';
import { empresaGuard } from '@cordele/shared/empresa-context';
import { projProjetoGuard } from './access/proj-projeto.guard';
import { provideProj } from './proj.providers';

export const PROJ_ROUTES: Routes = [
  {
    // Providers no escopo da rota lazy (PROJETO_PORT + PUBLICACAO_PORT).
    path: '',
    providers: [provideProj({ adapter: 'mock' })],
    children: [
      {
        path: 'biblioteca-de-projetos',
        loadComponent: () =>
          import('./feature-library/biblioteca-de-projetos.component').then(
            m => m.BibliotecaDeProjetosComponent,
          ),
        canActivate: [authGuard, empresaGuard],
      },
      {
        path: 'projetos/:projetoId/historico',
        loadComponent: () =>
          import('./feature-history/download-e-historico.component').then(
            m => m.DownloadEHistoricoComponent,
          ),
        canActivate: [authGuard, empresaGuard, projProjetoGuard],
      },
      { path: '', redirectTo: 'biblioteca-de-projetos', pathMatch: 'full' },
    ],
  },
];

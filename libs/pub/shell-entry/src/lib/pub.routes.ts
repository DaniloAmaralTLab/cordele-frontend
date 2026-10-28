/**
 * pub.routes.ts — PUB module routes with full guards.
 * update: components migrated from flat lib to feature sub-libs.
 *
 * Registered in app.routes.ts as:
 *   { path: 'pub', loadChildren: () => import('@cordele/pub-shell-entry').then(r => r.PUB_ROUTES) }
 *
 * Routes:
 *   /pub/projetos/:projetoId/exportacao-e-validacao   → ExportacaoEValidacaoComponent (exportação)
 *   /pub/projetos/:projetoId/download-e-historico     → DownloadEHistoricoComponent (histórico)
 *
 * Guards (ordered — all must pass):
 *   authGuard           — JWT present and valid   (@cordele/shared/access-decision)
 *   empresaGuard        — EmpresaContext resolved  (@cordele/shared/empresa-context)
 *   accessGuard(perm)   — named permission check   (@cordele/shared/access-decision)
 * pubProjetoGuard — UUID-v4 format check (@cordele/pub-access, stub)
 * pubStatusGuard — project status check (@cordele/pub-access, stub)
 */
import { Routes } from '@angular/router';
import { authGuard, accessGuard } from '@cordele/shared/access-decision';
import { empresaGuard } from '@cordele/shared/empresa-context';
import { pubProjetoGuard, pubStatusGuard } from '@cordele/pub-access';

/** Guards applied to all PUB routes (auth + empresa context). */
const PUB_BASE_GUARDS = [authGuard, empresaGuard];

export const PUB_ROUTES: Routes = [
  {
    path: 'projetos/:projetoId/exportacao-e-validacao',
    // loadComponent from @cordele/pub-feature-export
    loadComponent: () =>
      import('@cordele/pub-feature-export').then(m => m.ExportacaoEValidacaoComponent),
    canActivate: [
      ...PUB_BASE_GUARDS,
      pubProjetoGuard,
      pubStatusGuard('export'),
      accessGuard('pub.export'),
    ],
    title: 'Exportação e Validação',
  },
  {
    path: 'projetos/:projetoId/download-e-historico',
    // loadComponent from @cordele/pub-feature-history
    loadComponent: () =>
      import('@cordele/pub-feature-history').then(m => m.DownloadEHistoricoComponent),
    canActivate: [
      ...PUB_BASE_GUARDS,
      pubProjetoGuard,
      pubStatusGuard('history'),
      accessGuard('pub.view'),
    ],
    title: 'Download e Histórico',
  },
  { path: '', redirectTo: '/proj/biblioteca-de-projetos', pathMatch: 'full' },
];

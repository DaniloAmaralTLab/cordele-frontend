/**
 * imp.routes.ts — IMP module routes with guards.
 * Shell Entry + Bootstrap.
 *
 * Registered in app.routes.ts as:
 *   { path: 'imp', loadChildren: () => import('@cordele/imp/shell-entry').then(r => r.IMP_ROUTES) }
 *
 * Routes:
 *   /imp/upload                              → UploadComponent (upload, new project)
 *   /imp/projetos/:projetoId/importar        → UploadComponent (upload, existing project)
 *   /imp/manuscritos/:manuscritoId/revisao   → RevisaoDeEstruturaComponent (revisão de estrutura, deep-linkable)
 *
 * Guards (ordered — all must pass):
 *   authGuard           — JWT present and valid   (@cordele/shared/access-decision)
 *   empresaGuard        — EmpresaContext resolved  (@cordele/shared/empresa-context)
 *   accessGuard(perm)   — named permission check   (@cordele/shared/access-decision)
 * impProjetoGuard — UUID-v4 format check (@cordele/imp/access)
 *
 * Guards wired; loadComponent kept for code-splitting.
 * Real impProjetoGuard from imp-access.
 */
import { Routes } from '@angular/router';
import { authGuard, accessGuard } from '@cordele/shared/access-decision';
import { empresaGuard } from '@cordele/shared/empresa-context';
import { impProjetoGuard } from '@cordele/imp/access';

/** Guards applied to all IMP routes (auth + empresa context). */
const IMP_BASE_GUARDS = [authGuard, empresaGuard];

export const IMP_ROUTES: Routes = [
  {
    path: 'upload',
    loadComponent: () =>
      import('@cordele/imp/feature-upload').then(m => m.UploadComponent),
    canActivate: [...IMP_BASE_GUARDS, accessGuard('imp.import')],
    title: 'Importar Manuscrito',
  },
  {
    path: 'projetos/:projetoId/importar',
    loadComponent: () =>
      import('@cordele/imp/feature-upload').then(m => m.UploadComponent),
    // impProjetoGuard validates UUID-v4 format of :projetoId (wired)
    canActivate: [...IMP_BASE_GUARDS, impProjetoGuard, accessGuard('imp.import')],
    title: 'Importar para Projeto',
  },
  {
    path: 'manuscritos/:manuscritoId/revisao',
    loadComponent: () =>
      import('@cordele/imp/feature-review').then(m => m.RevisaoDeEstruturaComponent),
    canActivate: [...IMP_BASE_GUARDS, accessGuard('imp.review')],
    title: 'Revisão de Estrutura',
  },
  { path: '', redirectTo: 'upload', pathMatch: 'full' },
];

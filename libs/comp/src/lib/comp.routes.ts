/**
 * comp.routes.ts — COMP module routes (exported as COMP_ROUTES for loadChildren).
 *
 * Registered in app.routes.ts as:
 *   { path: 'comp', loadChildren: () => import('@cordele/comp').then(r => r.COMP_ROUTES) }
 *
 * Routes:
 *   /comp/projetos/:projetoId/config                    → ConfiguracoesComponent (configurações)
 *   /comp/projetos/:projetoId/editor-de-layout-preview  → EditorDeLayoutPreviewComponent (editor de layout)
 *
 * Guards (ordered — all 5 must pass):
 * authGuard — JWT present and valid (stub)
 * empresaGuard — EmpresaContext resolved (stub)
 * accessGuard — comp:read scope (stub)
 * compProjetoGuard — projetoId resolves to existing project (stub)
 * compStatusGuard — project status = em_composicao (stub)
 *
 * Added auth/empresa/access guards + breadcrumb titles.
 */
import { Routes } from '@angular/router';
import { authGuard } from './access/auth.guard';
import { empresaGuard } from './access/empresa.guard';
import { accessGuard } from './access/access.guard';
import { compProjetoGuard } from './access/comp-projeto.guard';
import { compStatusGuard } from './access/comp-status.guard';

const COMP_GUARDS = [
  authGuard,
  empresaGuard,
  accessGuard('comp.view'),
  compProjetoGuard,
  compStatusGuard,
];

export const COMP_ROUTES: Routes = [
  {
    path: 'projetos/:projetoId/config',
    title: '{nome} · Configurar',
    loadComponent: () =>
      import('./feature-configuracoes/configuracoes.component').then(
        m => m.ConfiguracoesComponent,
      ),
    canActivate: COMP_GUARDS,
  },
  {
    path: 'projetos/:projetoId/editor-de-layout-preview',
    title: '{nome} · Edição',
    loadComponent: () =>
      import('./feature-editor/editor-de-layout-preview.component').then(
        m => m.EditorDeLayoutPreviewComponent,
      ),
    canActivate: COMP_GUARDS,
  },
  { path: '', redirectTo: 'projetos', pathMatch: 'full' },
];

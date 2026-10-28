/**
 * layout.port.ts — Port interface for the Layout + Preview resources.
 * Covers:
 *   GET  /api/v1/comp/projetos/{projetoId}/layout          → getLayout (editor de layout panel)
 *   PUT  /api/v1/comp/projetos/{projetoId}/layout          → upsertLayout (editor de layout export — pessimistic)
 *   GET  /api/v1/comp/projetos/{projetoId}/preview-context → getPreviewContext (editor de layout pages)
 * Added UpsertLayoutBody; renamed updateLayout → upsertLayout.
 * Moved to @cordele/comp/data-access.
 */
import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { ConfiguracaoLayoutDto, PreviewContextDto, UpsertLayoutBody } from '../models/comp.models';

export interface LayoutPort {
  /**
   * GET /api/v1/comp/projetos/{projetoId}/layout
   * Returns current layout config or defaults (materialized:false).
   */
  getLayout(projetoId: string): Observable<ConfiguracaoLayoutDto>;

  /**
   * PUT /api/v1/comp/projetos/{projetoId}/layout.
   * Body: typography params + non-stale image-alignment overrides (tipo='imagem' only).
   * NEVER sends tipo='em-branco'. Await 200 before navigating (pessimistic).
   */
  upsertLayout(projetoId: string, body: UpsertLayoutBody): Observable<ConfiguracaoLayoutDto>;

  /**
   * GET /api/v1/comp/projetos/{projetoId}/preview-context
   * Returns manuscript tree + layout + overrides.
   * FE renders the preview client-side — never calls imp-service.
   * 409 urn:cordele:comp:manuscript-missing if no manuscript imported.
   */
  getPreviewContext(projetoId: string): Observable<PreviewContextDto>;
}

export const LAYOUT_PORT = new InjectionToken<LayoutPort>('LayoutPort');

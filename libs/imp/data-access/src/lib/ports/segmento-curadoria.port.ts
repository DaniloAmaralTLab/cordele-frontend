/**
 * segmento-curadoria.port.ts — Port interface for editorial revisão de estrutura actions.
 *
 * Covers:
 *   POST   /api/v1/imp/manuscripts/{id}/segmentos/{segId}/ignore  → ignore (201|200 idempotent)
 *   DELETE /api/v1/imp/manuscripts/{id}/segmentos/{segId}/ignore  → restore (204|404)
 *   GET    /api/v1/imp/manuscripts/{id}/segmentos/ignored         → getIgnored
 *   POST   /api/v1/imp/manuscripts/{id}/confirm-estrutura         → confirmEstrutura (200)
 */
import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { IgnoredSegmentsResponse, SegmentoCuradoriaDto } from '../models/imp.models';

export interface SegmentoCuradoriaPort {
  /**
   * Persist ignore annotation for an unparsed segment.
   * 201 on first ignore; 200 if already ignored (idempotent).
   * On any 4xx/5xx the ReviewFacade MUST roll back the optimistic UI state.
   */
  ignore(manuscritoId: string, segmentoId: string): Observable<SegmentoCuradoriaDto>;

  /**
   * Remove ignore annotation — restore the segment.
   * Returns void (204 body is empty). Throws on 404 (segment was not ignored).
   * On any 4xx/5xx the ReviewFacade MUST roll back the optimistic UI state.
   */
  restoreIgnore(manuscritoId: string, segmentoId: string): Observable<void>;

  /** Fetch the current set of ignored segmentoIds for revisão de estrutura hydration (deep-link path). */
  getIgnored(manuscritoId: string): Observable<IgnoredSegmentsResponse>;

  /**
   * Confirm structure review complete → advances ProjetoEditorial.status to em_composicao.
   * On success, navigate to COMP. On error, stay on revisão de estrutura and show toast.
   */
  confirmEstrutura(manuscritoId: string): Observable<void>;
}

export const SEGMENTO_CURADORIA_PORT = new InjectionToken<SegmentoCuradoriaPort>(
  'SegmentoCuradoriaPort',
);

/**
 * manuscrito.port.ts — Port interface for the Manuscrito resource.
 *
 * Covers:
 * POST /api/v1/imp/manuscripts → create (synchronous parse)
 *   GET  /api/v1/imp/manuscripts/{id}                    → get (reload / deep-link)
 *   GET  /api/v1/imp/manuscripts/{id}/estrutura          → getEstrutura (content tree only)
 *   GET  /api/v1/imp/projetos/{projetoId}/manuscritos    → listByProjeto (history)
 */
import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import {
  ContentTree,
  ManuscritoDetail,
  ManuscritoSummary,
  UploadParams,
} from '../models/imp.models';

export interface ManuscritoPort {
  /** Upload file + synchronous parse → returns 201 ManuscritoDetail.
   * File + exactly one of {projetoTitulo | projetoId}.
   */
  create(params: UploadParams): Observable<ManuscritoDetail>;

  /** Read one manuscript — reload / deep-link / revisão de estrutura hydration fallback. */
  get(manuscritoId: string): Observable<ManuscritoDetail>;

  /** Content tree only (lighter than full ManuscritoDetail). */
  getEstrutura(manuscritoId: string): Observable<ContentTree>;

  /** Immutable import history for a project (newest first). */
  listByProjeto(projetoId: string): Observable<ManuscritoSummary[]>;
}

export const MANUSCRITO_PORT = new InjectionToken<ManuscritoPort>('ManuscritoPort');

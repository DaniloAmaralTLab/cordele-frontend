/**
 * segmento-curadoria-http.adapter.ts — HTTP adapter for revisão de estrutura editorial actions.
 * Activated by imp.providers.ts when adapter: 'http'.
 *
 * Replaced HttpClient with ImpHttpClient.
 *
 * Endpoints (confirmed against imp.controller.ts):
 *   POST   /api/v1/imp/manuscripts/{id}/segmentos/{segId}/ignore   → ignore (with motivo body)
 *   DELETE /api/v1/imp/manuscripts/{id}/segmentos/{segId}/ignore   → restoreIgnore (204)
 *   GET    /api/v1/imp/manuscripts/{id}/segmentos/ignored          → getIgnored
 *   POST   /api/v1/imp/manuscripts/{id}/confirm-estrutura          → confirmEstrutura (200)
 */
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { moduleBase } from '@cordele/shared/access-http-base';
import { IgnoredSegmentsResponse, SegmentoCuradoriaDto } from '../models/imp.models';
import { SegmentoCuradoriaPort } from '../ports/segmento-curadoria.port';
import { ImpHttpClient } from '../imp-http-client';

/** Base path for imp-service manuscripts. Derives from ACCESS_HTTP_BASE — /v1 prefix lives in one place. */
const BASE = `${moduleBase('imp')}/manuscripts`;

/** Request body shape for the ignore endpoint (mirrors IgnoreSegmentoDto on the backend). */
interface IgnoreBody {
  motivo?: string;
}

@Injectable({ providedIn: 'root' })
export class SegmentoCuradoriaHttpAdapter implements SegmentoCuradoriaPort {
  /** ImpHttpClient (not HttpClient) — empresa context from JWT `empresa_id` claim. */
  private readonly http = inject(ImpHttpClient);

  /**
   * POST /api/v1/imp/manuscripts/{manuscritoId}/segmentos/{segmentoId}/ignore
   * 201 first ignore; 200 idempotent. Body: { motivo? } per IgnoreSegmentoDto.
   */
  ignore(manuscritoId: string, segmentoId: string, body: IgnoreBody = {}): Observable<SegmentoCuradoriaDto> {
    return this.http.post<SegmentoCuradoriaDto>(
      `${BASE}/${manuscritoId}/segmentos/${segmentoId}/ignore`,
      body,
    );
  }

  /**
   * DELETE /api/v1/imp/manuscripts/{manuscritoId}/segmentos/{segmentoId}/ignore
   * 204 No Content — body is empty.
   */
  restoreIgnore(manuscritoId: string, segmentoId: string): Observable<void> {
    return this.http
      .delete(`${BASE}/${manuscritoId}/segmentos/${segmentoId}/ignore`)
      .pipe(map(() => undefined));
  }

  /**
   * GET /api/v1/imp/manuscripts/{manuscritoId}/segmentos/ignored
   * Returns the current set of ignored segmentoIds for revisão de estrutura hydration (deep-link path).
   *
   * NOTE: This endpoint was not found in imp.controller.ts at time of implementation.
   * If it returns 404 in integration, the backend endpoint is missing.
   */
  getIgnored(manuscritoId: string): Observable<IgnoredSegmentsResponse> {
    return this.http.get<IgnoredSegmentsResponse>(
      `${BASE}/${manuscritoId}/segmentos/ignored`,
    );
  }

  /**
   * POST /api/v1/imp/manuscripts/{manuscritoId}/confirm-estrutura
   * 200 OK (command, not resource creation). Advances pipeline to Composição.
   */
  confirmEstrutura(manuscritoId: string): Observable<void> {
    return this.http
      .post<void>(`${BASE}/${manuscritoId}/confirm-estrutura`, {})
      .pipe(map(() => undefined));
  }
}

/**
 * publicacao-http.adapter.ts — HTTP adapter stub for PublicacaoPort.
 * URLs (base path /api/v1/proj/projetos).
 * getDownloadUrl returns signed URL; SPA opens it directly (no proxy).
 */
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AccessHttpClient, moduleBase } from '@cordele/shared/access-http-base';
import { PublicacaoHistoryItem, SignedDownloadUrl } from '../models/proj.models';
import { PublicacaoPort } from './publicacao.port';

@Injectable({ providedIn: 'root' })
export class PublicacaoHttpAdapter implements PublicacaoPort {
  /** AccessHttpClient (not HttpClient) — empresa context from JWT `empresa_id` claim. */
  private readonly http = inject(AccessHttpClient);
  /** Derives from ACCESS_HTTP_BASE via moduleBase() — /v1 prefix lives in one place. */
  private readonly base = `${moduleBase('proj')}/projetos`;

  /** GET /api/v1/proj/projetos/{projetoId}/publicacoes — publication history (histórico). */
  list(projetoId: string): Observable<PublicacaoHistoryItem[]> {
    return this.http.get<PublicacaoHistoryItem[]>(`${this.base}/${projetoId}/publicacoes`);
  }

  /**
   * GET /api/v1/proj/projetos/{projetoId}/publicacoes/{publicacaoId}/download.
   * Returns short-TTL signed URL. 409 for erros_criticos/pendente. No proxy.
   */
  getDownloadUrl(projetoId: string, publicacaoId: string): Observable<SignedDownloadUrl> {
    return this.http.get<SignedDownloadUrl>(
      `${this.base}/${projetoId}/publicacoes/${publicacaoId}/download`,
    );
  }
}

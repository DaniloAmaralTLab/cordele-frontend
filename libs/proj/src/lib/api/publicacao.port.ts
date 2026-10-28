/**
 * publicacao.port.ts — Port interface for the Publicacao resource.
 * Covers:
 *   GET /api/v1/proj/projetos/{projetoId}/publicacoes                               → list (histórico history)
 * GET /api/v1/proj/projetos/{projetoId}/publicacoes/{publicacaoId}/download → signed URL
 */
import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { PublicacaoHistoryItem, SignedDownloadUrl } from '../models/proj.models';

export interface PublicacaoPort {
  /** GET .../publicacoes — publication history newest first (histórico list). */
  list(projetoId: string): Observable<PublicacaoHistoryItem[]>;

  /**
   * GET .../publicacoes/{publicacaoId}/download — mint a short-TTL signed URL.
   * 409 if epubcheckStatus ∈ {erros_criticos, pendente} (artifact not available).
   * The SPA opens the returned arquivoUrl directly — never proxies bytes.
   */
  getDownloadUrl(projetoId: string, publicacaoId: string): Observable<SignedDownloadUrl>;
}

export const PUBLICACAO_PORT = new InjectionToken<PublicacaoPort>('PublicacaoPort');

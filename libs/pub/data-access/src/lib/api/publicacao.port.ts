/**
 * publicacao.port.ts — Port interface for the PUB Publicacao resource.
 * Migrated from libs/pub (flat lib) to libs/pub/data-access.
 *
 * Covers (all paths versioned: /api/v1/pub/... — NestJS URI versioning):
 * POST /api/v1/pub/projetos/{projetoId}/publicacoes → trigger (202 idempotent)
 * GET  /api/v1/pub/projetos/{projetoId}/publicacoes/{id}/status → pollStatus (bounded poll)
 *   GET  /api/v1/pub/projetos/{projetoId}/publicacoes                          → list (histórico history)
 * GET  /api/v1/pub/projetos/{projetoId}/publicacoes/{id}/download → getDownloadUrl (signed URL)
 * GET  /api/v1/pub/projetos/{projetoId}/publicacoes/stats → getStats (KPI)
 * GET  /api/v1/pub/projetos/{projetoId}/publicacoes/{id}/validation-messages → getValidationMessages
 */
import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import {
  PublicacaoHistoryItem,
  PublicacaoStatus,
  PublicationStats,
  SignedDownloadUrl,
  ValidationMessageItem,
  ValidationMessageSeverity,
} from '../models/pub.models';

export interface PublicacaoPort {
  /**
   * POST /api/v1/pub/projetos/{projetoId}/publicacoes
   * Trigger export. Returns 202 with PublicacaoStatus (gerando) on new build, or
   * 200 with the in-flight record when a build is already non-terminal (idempotent).
   * 409 manuscript-missing | 422 metadata-incomplete → propagated as errors.
   */
  triggerExport(projetoId: string): Observable<PublicacaoStatus>;

  /**
   * GET /api/v1/pub/projetos/{projetoId}/publicacoes/{publicacaoId}/status
   * Single poll tick. Caller (ExportFacade) drives the bounded retry loop honouring Retry-After.
   * Returns the current PublicacaoStatus until terminal (publicado | com_erros).
   */
  pollStatus(projetoId: string, publicacaoId: string): Observable<PublicacaoStatus>;

  /**
   * GET /api/v1/pub/projetos/{projetoId}/publicacoes
   * Full publication history, newest first. Used by histórico DownloadEHistoricoComponent.
   */
  list(projetoId: string): Observable<PublicacaoHistoryItem[]>;

  /**
   * GET /api/v1/pub/projetos/{projetoId}/publicacoes/{publicacaoId}/download
   * mint a short-TTL signed URL. SPA opens it directly; never proxies bytes.
   * 409 artifact-not-available if epubcheckStatus ∈ {erros_criticos, pendente}.
   */
  getDownloadUrl(projetoId: string, publicacaoId: string): Observable<SignedDownloadUrl>;

  /**
   * GET /api/v1/pub/projetos/{projetoId}/publicacoes/stats
   * live KPI projection from Publicacao rows. Used by exportação/histórico KPI cards (if source lands).
   */
  getStats(projetoId: string): Observable<PublicationStats>;

  /**
   * GET /api/v1/pub/projetos/{projetoId}/publicacoes/{publicacaoId}/validation-messages
   * detailed epubcheck messages ordered by `ordem ASC`.
   *
   * `severity` is optional: when omitted all severities are returned.
   * 404 (urn:cordele:pub:publicacao-not-found) when publicacaoId does not belong
   * to the projetoId or the active empresa (cross-tenant guard — never reveals existence).
   */
  getValidationMessages(
    projetoId: string,
    publicacaoId: string,
    severity?: ValidationMessageSeverity,
  ): Observable<ValidationMessageItem[]>;
}

export const PUBLICACAO_PORT = new InjectionToken<PublicacaoPort>('PubPublicacaoPort');

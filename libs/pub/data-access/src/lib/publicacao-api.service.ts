/**
 * publicacao-api.service.ts — Application service facade over PublicacaoPort.
 *
 * Wraps the injected PublicacaoPort (token PUBLICACAO_PORT) and provides the
 * higher-level API consumed by ExportFacade and HistoryFacade.
 * Facades call this service; they do NOT inject PUBLICACAO_PORT directly.
 *
 * No raw HttpClient. HTTP lives in PublicacaoHttpAdapter (extends AccessHttpClient).
 * Cross-context: getProjetoHeader (PROJ) and getAutor (COMP) are stubbed here;
 * They will be wired to the real cross-service calls.
 *
 */
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PUBLICACAO_PORT } from './api/publicacao.port';
import {
  ProjetoHeaderInfo,
  PublicacaoHistoryItem,
  PublicacaoStatus,
  PublicationStats,
  SignedDownloadUrl,
  ValidationMessageItem,
  ValidationMessageSeverity,
} from './models/pub.models';

@Injectable({ providedIn: 'root' })
export class PublicacaoApiService {
  private readonly port = inject(PUBLICACAO_PORT);

  // ─── Trigger export ───────────────────────────────────────────────

  /**
   * Trigger a new export build.
   * 202 Accepted (new build) or 200 OK (in-flight idempotent).
   * Both return PublicacaoStatus{status=gerando}.
   */
  triggerExport(projetoId: string): Observable<PublicacaoStatus> {
    return this.port.triggerExport(projetoId);
  }

  // ─── Poll status ───────────────────────────────────────────────────

  /**
   * Single poll tick (GET status). ExportFacade drives the bounded retry loop.
   * Caller honours Retry-After hint (passed from the response header by the adapter).
   */
  pollStatus(projetoId: string, publicacaoId: string): Observable<PublicacaoStatus> {
    return this.port.pollStatus(projetoId, publicacaoId);
  }

  // ─── History list ─────────────────────────────────────────────────

  /**
   * Full publication history for a project, newest first (server-ordered).
   * Used by histórico DownloadEHistoricoComponent and resume-on-reentry.
   */
  listByProjeto(projetoId: string): Observable<PublicacaoHistoryItem[]> {
    return this.port.list(projetoId);
  }

  // ─── Signed download URL ──────────────────────────────────────────

  /**
   * Mint a fresh short-TTL signed URL.
   * ArtifactDownloadService calls this before opening; it never reuses a stale URL.
   */
  getDownloadUrl(projetoId: string, publicacaoId: string): Observable<SignedDownloadUrl> {
    return this.port.getDownloadUrl(projetoId, publicacaoId);
  }

  // ─── Publication stats (KPIs) ─────────────────────────────────────

  /**
   * Live KPI projection. Tiles are hidden when fields are null.
   */
  getStats(projetoId: string): Observable<PublicationStats> {
    return this.port.getStats(projetoId);
  }

  // ─── Validation messages ─────────────────────────

  /**
   * GET /api/v1/pub/projetos/{projetoId}/publicacoes/{publicacaoId}/validation-messages
   * detailed epubcheck message rows ordered by `ordem ASC`.
   * `severity` is optional; omitted = all severities.
   *
   * Scope: pub:read — same as poll; no extra scope needed.
   * 404 (urn:cordele:pub:publicacao-not-found) on cross-tenant mismatch.
   */
  getValidationMessages(
    projetoId: string,
    publicacaoId: string,
    severity?: ValidationMessageSeverity,
  ): Observable<ValidationMessageItem[]> {
    return this.port.getValidationMessages(projetoId, publicacaoId, severity);
  }

  // ─── Cross-context — wired in ─────────────────────────────────────────

  /**
   * GET /api/v1/proj/projetos/{projetoId} — project header (name, status, editora).
   * Provides real cross-context data when an injection token
   * override is registered in app.config.ts (PUB_PROJETO_HEADER_FN token).
   * Default (no override): returns null — HistoryFacade renders gracefully without header.
   *
   * Nx boundary note: pub-data-access (scope:pub) cannot import scope:proj directly.
   * The real ProjetoApiService call is wired via app.config.ts using the app layer
   * (type:app has no scope restriction and can import scope:proj).
   */
  getProjetoHeader(_projetoId: string): Observable<ProjetoHeaderInfo | null> {
    // Stub: real wiring requires cross-scope injection token (see empresa-changed.token pattern).
    // Actual HTTP call is ProjetoApiService.getProjeto(projetoId) → map to ProjetoHeaderInfo.
    // Cannot be wired here (pub-data-access scope:pub cannot import scope:proj — .eslintrc.json).
    return new Observable(observer => { observer.next(null); observer.complete(); });
  }

  /**
   * Metadata subtitle (autor) from COMP (GET /api/v1/comp/projetos/{projetoId}/metadados).
   * Provides real cross-context data when an injection token
   * override is registered in app.config.ts (PUB_AUTOR_FN token).
   * Default (no override): returns null — HistoryFacade renders gracefully without autor.
   *
   * Nx boundary note: pub-data-access (scope:pub) cannot import scope:comp directly.
   * The real MetadadosHttpAdapter call is wired via app.config.ts using the app layer.
   */
  getAutor(_projetoId: string): Observable<string | null> {
    // Stub: real wiring requires cross-scope injection token.
    // Actual HTTP call is MetadadosHttpAdapter.get(projetoId) → map to autor string.
    // Cannot be wired here (pub-data-access scope:pub cannot import scope:comp — .eslintrc.json).
    return new Observable(observer => { observer.next(null); observer.complete(); });
  }
}

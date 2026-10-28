/**
 * pub.models.ts — Domain types for the PUB (Publicação) module.
 * Migrated from libs/pub (flat lib) to libs/pub/data-access.
 * Mirrors (PublicacaoStatus, PublicacaoHistoryItem,
 * PublicationStats, ValidationMessageItem) and view models.
 *
 *
 * DO NOT redefine BE types — import from @cordele/pub-data-access in ports, adapters and facades.
 */

/** Build lifecycle state machine. */
export type BuildStatus = 'gerando' | 'validando' | 'publicado' | 'com_erros';

/** Epubcheck verdict. */
export type EpubcheckStatus = 'valido' | 'avisos' | 'erros_criticos' | 'pendente';

/** UI phase for exportação (derived from BuildStatus + EpubcheckStatus phase mapping). */
export type ExportPhase = 'gerando' | 'valido' | 'erros' | 'error';

// ─── PublicacaoStatus (trigger + poll — exportação) ──────────────────────────

/** Response shape for POST trigger (202) and GET status poll (200). */
export interface PublicacaoStatus {
  publicacaoId: string;
  projetoId: string;
  status: BuildStatus;
  epubcheckStatus: EpubcheckStatus;
  sequencia: number;
  totalErros: number;
  totalAvisos: number;
  resumoErro: string | null;
  arquivoDisponivel: boolean;
  iniciadaEm: string;          // ISO UTC
  concluidaEm: string | null;  // ISO UTC; null while non-terminal
  /**
   * ePub KPI fields — non-null only when status = 'publicado'.
   * null for in-flight builds or builds with errors.
   * totalPaginas intentionally absent: ePub reflowable has no fixed pagination.
   */
  tamanhoBytes:   number | null;
  totalCapitulos: number | null;
  totalImagens:   number | null;
}

// ─── EpubSummaryVM (KPI view model — exportação) ──────────────

/**
 * View model for ePub KPI tiles shown in exportação after a successful export.
 * Produced by ExportFacade.summary when status = 'publicado'; null otherwise.
 *
 * Paginas is PERMANENTLY null — ePub reflowable has no fixed pagination;
 * this is a product decision, not a data gap.
 */
export interface EpubSummaryVM {
  /** Formatted size string (e.g. '1.4 MB'), or null when tamanhoBytes is null. */
  tamanho:   string | null;
  /** Always null. Do NOT display a tile for this field. */
  paginas:   null;
  /** Number of chapters, or null when not yet available. */
  capitulos: number | null;
  /** Number of images, or null when not yet available. */
  imagens:   number | null;
}

/**
 * Formats a byte count to a human-readable string.
 * Used to populate EpubSummaryVM.tamanho from PublicacaoStatus.tamanhoBytes.
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1_024) return `${bytes} B`;
  if (bytes < 1_048_576) return `${(bytes / 1_024).toFixed(1)} KB`;
  return `${(bytes / 1_048_576).toFixed(1)} MB`;
}

// ─── PublicacaoHistoryItem (histórico history list) ─────────────────────────

/** One row in the histórico history list. */
export interface PublicacaoHistoryItem {
  publicacaoId: string;
  projetoId: string;
  epubcheckStatus: EpubcheckStatus;
  totalErros: number;
  totalAvisos: number;
  erros: string | null;
  arquivoUrl: string | null;   // null for erros_criticos / pendente
  criadoEm: string;            // ISO UTC
}

// ─── PublicationStats (KPI — exportação/histórico) ─────────────────────────────────

/** Live KPI projection. */
export interface PublicationStats {
  total: number;
  publicadas: number;
  comAvisos: number;
  comErros: number;
  emAndamento: number;
  latestOutcome: EpubcheckStatus | null;
}

// ─── Signed download URL ───────────────────────────────────────────────

/** Short-TTL signed URL minted by PUB; browser opens directly, SPA never proxies bytes. */
export interface SignedDownloadUrl {
  publicacaoId: string;
  arquivoUrl: string;
  expiresAt: string;  // ISO UTC
}

// ─── ValidationMessageItem (detail list) ───

/** Severity level for a single epubcheck validation message. */
export type ValidationMessageSeverity = 'error' | 'warning' | 'info';

/**
 * One epubcheck report line returned by
 * GET /api/v1/pub/projetos/{projetoId}/publicacoes/{publicacaoId}/validation-messages.
 * Ordered by `ordem ASC` — 0-based insertion order from the epubcheck run.
 *
 * `location` is nullable: not every epubcheck message includes a file/line reference.
 */
export interface ValidationMessageItem {
  id: string;                           // UUID v4
  severity: ValidationMessageSeverity;  // 'error' | 'warning' | 'info'
  code: string;                         // epubcheck message id (e.g. PKG-006, OPF-033)
  message: string;                      // human-readable epubcheck message text
  location: string | null;              // nullable — file/line reference may be absent
  ordem: number;                        // 0-based; list is returned ordered by this ASC
}

/**
 * FE view model for one validation message row.
 * Produced by `toAvisoVM(item)` from a `ValidationMessageItem`.
 *
 * `local` mirrors `location` (nullable); rendered as em-dash when null (never "null").
 */
export interface AvisoVM {
  code: string;
  msg: string;
  local: string | null;
  severity: ValidationMessageSeverity;
}

/**
 * Maps a BE `ValidationMessageItem` to the FE `AvisoVM` view model.
 * Preserves `location: null` as `local: null` — the UI renders it as "—" (em-dash).
 */
export function toAvisoVM(item: ValidationMessageItem): AvisoVM {
  return {
    code:     item.code,
    msg:      item.message,
    local:    item.location,
    severity: item.severity,
  };
}

// ─── Cross-context types ────────────────────────────

/**
 * Minimal project header info consumed by PUB's HistoryFacade.
 * Resolved via cross-context call to proj-service (GET /api/v1/proj/projetos/{id}).
 * Defined here (scope:pub type:domain) to avoid boundary violation from pub-data-access
 * importing scope:proj models directly.
 * Real wiring: app.config.ts provides an injection token that maps to ProjetoApiService.
 */
export interface ProjetoHeaderInfo {
  nome: string;
  status: string;     // ProjetoStatus enum value (rascunho | em_composicao | publicado | com_erros)
  editoraId: string;
}

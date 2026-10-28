/**
 * proj.models.ts — domain types for the PROJ module.
 * Matches the backend shapes (ProjetoCard, ProjetoDetail, PublicacaoHistoryItem)
 * and view-models (LibraryVM, HistoryVM, StatusBadgeVM).
 */

// ── Status enums ──────────────────────────────────────────────────────────────

export type ProjetoStatus = 'rascunho' | 'em_composicao' | 'publicado' | 'com_erros';
export type EpubcheckStatus = 'valido' | 'avisos' | 'erros_criticos' | 'pendente';
export type BadgeTone = 'draft' | 'progress' | 'valid' | 'warn' | 'error' | 'pending';

// ── API shapes ──────────────────────────────────────────────

/**
 * Paginated library page (GET /api/v1/proj/projetos).
 * `nextCursor` is opaque base64 keyset; pass as `?cursor=` on the next request.
 * `null` means this is the last page.
 */
export interface ProjetoListPage {
  items: ProjetoCard[];
  nextCursor: string | null;
}

/**
 * Composite result from listProjetos(): bundles the page body and the
 * `X-Degraded` header flag so callers don't need to touch HttpResponse directly.
 * `degraded=true` means cross-context aggregation data (autor, chapters, epubcheck)
 * may be incomplete — the projects themselves are always correct.
 */
export interface ProjetoListResult {
  page: ProjetoListPage;
  /** True when the backend set X-Degraded: true on the response. */
  degraded: boolean;
}

/** Library card (GET /api/v1/proj/projetos) */
export interface ProjetoCard {
  id: string;
  nome: string;
  autor: string | null;
  status: ProjetoStatus;
  totalCapitulos: number;
  totalImagens: number;
  ultimoEpubcheckStatus: EpubcheckStatus | null;
  ultimaAtividadeEm: string;
  criadoEm: string;
}

/** One publication row (GET .../publicacoes) */
export interface PublicacaoHistoryItem {
  publicacaoId: string;
  projetoId: string;
  epubcheckStatus: EpubcheckStatus;
  totalErros: number;
  totalAvisos: number;
  erros: string | null;
  arquivoUrl: string | null;
  criadoEm: string;
}

/** Full project aggregate (GET /api/v1/proj/projetos/{id} + reopen response) */
export interface ProjetoDetail {
  id: string;
  editoraId: string;
  nome: string;
  descricao: string | null;
  status: ProjetoStatus;
  criadoEm: string;
  atualizadoEm: string;
  manuscriptSummary: ManuscriptSummary | null;
  metadata: { autor: string | null } | null;
  publicationHistory: PublicacaoHistoryItem[];
  degraded: boolean;
}

export interface ManuscriptSummary {
  manuscritoId: string | null;
  nomeArquivo: string;
  formato: string;
  totalCapitulos: number;
  totalImagens: number;
  trechosNaoParseados: number;
  criadoEm: string;
}

/** Signed URL response */
export interface SignedDownloadUrl {
  publicacaoId: string;
  arquivoUrl: string;
  expiresAt: string;
}

/** Project creation request */
export interface CriarProjetoRequest {
  nome: string;
  descricao?: string;
}

// ── View-model types ────────────────────────────────────────────────

export interface StatusBadgeVM {
  tone: BadgeTone;
  label: string;
  icon: string;
}

export interface ProjetoCardVM extends ProjetoCard {
  badge: StatusBadgeVM;
  canQuickDownload: boolean;
  openTarget: 'imp' | 'comp' | 'history';
}

/** Derives a StatusBadgeVM from badge-derivation rule. */
export function deriveBadge(
  status: ProjetoStatus,
  ultimoEpubcheckStatus: EpubcheckStatus | null,
): StatusBadgeVM {
  if (status === 'rascunho') {
    return { tone: 'draft',    label: 'Rascunho',      icon: 'edit_note' };
  }
  if (status === 'em_composicao') {
    return { tone: 'progress', label: 'Em andamento',  icon: 'pending' };
  }
  // publication exists — fold epubcheck status
  switch (ultimoEpubcheckStatus) {
    case 'valido':         return { tone: 'valid',   label: 'Válido',    icon: 'check_circle' };
    case 'avisos':         return { tone: 'warn',    label: 'Avisos',    icon: 'check_circle' };
    case 'erros_criticos': return { tone: 'error',   label: 'Erros',     icon: 'cancel' };
    default:               return { tone: 'pending', label: 'Pendente',  icon: 'hourglass_empty' };
  }
}

/** Derives openTarget from project status (no dead ends). */
export function deriveOpenTarget(status: ProjetoStatus): 'imp' | 'comp' | 'history' {
  if (status === 'rascunho')      return 'imp';
  if (status === 'em_composicao') return 'comp';
  return 'history';
}

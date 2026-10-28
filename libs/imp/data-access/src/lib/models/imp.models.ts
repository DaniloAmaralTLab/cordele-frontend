/**
 * imp.models.ts — IMP domain models.
 */

// ─── Manuscrito ───────────────────────────────────────────────────────────────

export type ManuscritoFormato = 'docx' | 'markdown';
export type ManuscritoStatus = 'imported' | 'parsing' | 'import_failed';

/** Diagnostic counters + full content tree — returned by POST (201) and GET. */
export interface ManuscritoDetail {
  id: string;
  projetoId: string;
  nomeArquivo: string;
  formato: ManuscritoFormato;
  status: ManuscritoStatus;
  totalCapitulos: number;
  totalImagens: number;
  trechosNaoParseados: number;
  tamanhoBytes: number;
  estrutura: ContentTree;
  criadoEm: string;
}

/** Summary row — returned by GET /projetos/{id}/manuscritos (history list). */
export interface ManuscritoSummary {
  id: string;
  projetoId: string;
  nomeArquivo: string;
  formato: ManuscritoFormato;
  status: ManuscritoStatus;
  totalCapitulos: number;
  totalImagens: number;
  trechosNaoParseados: number;
  criadoEm: string;
}

// ─── Content tree ────────────────────────────────────────

export interface ContentTree {
  schemaVersion: '1.0';
  formato: ManuscritoFormato;
  chapters: Chapter[];
}

export interface Chapter {
  id: string;
  order: number;
  title: string;
  blocks: Block[];
  sections: Section[];
}

export interface Section {
  id: string;
  order: number;
  title: string;
  blocks: Block[];
}

export type Block = ParagraphBlock | ImageBlock | UnparsedBlock;

export interface ParagraphBlock {
  type: 'paragraph';
  id: string;
  order: number;
  text: string;
  runs?: Run[];
}

export interface ImageBlock {
  type: 'image';
  id: string;
  order: number;
  storageKey: string;
  mime: string;
  alt: string;
  originalName: string;
}

/** Reason is a closed enum; never dropped. */
export type UnparsedReason =
  | 'complex_table'
  | 'math_equation'
  | 'nested_footnote'
  | 'unknown_docx_style'
  | 'unsupported_markup'
  | 'embedded_object'
  | 'other';

export interface UnparsedBlock {
  type: 'unparsed';
  id: string;
  order: number;
  rawContent: string;
  reason: UnparsedReason;
  sourceLocation: DocxLocation | MarkdownLocation;
}

export interface DocxLocation {
  kind: 'docx';
  paragraphIndex: number;
  styleName: string;
}

export interface MarkdownLocation {
  kind: 'markdown';
  line: number;
  column: number;
}

export interface Run {
  text: string;
  marks: Array<'bold' | 'italic' | 'underline' | 'strikethrough' | 'code' | 'superscript' | 'subscript'>;
}

// ─── Upload form (upload) ────────────────────────────────────────────────────────

/** Exactly one of projetoTitulo | projetoId must be set. */
export interface UploadParams {
  file: File;
  projetoTitulo?: string;
  projetoId?: string;
}

// ─── Segmento curadoria ────────────────────────────────────

export interface SegmentoCuradoriaDto {
  id: string;
  manuscritoId: string;
  segmentoId: string;
  criadoEm: string;
}

export interface IgnoredSegmentsResponse {
  manuscritoId: string;
  ignoredSegmentoIds: string[];
}

// ─── additions ─────────────────────

/**
 * ManuscritoHistoryDto — entry in the immutable import history list.
 * status maps to ManuscritoStatus plus 'confirmado'/'descartado' pipeline states.
 */
export interface ManuscritoHistoryDto {
  manuscritoId: string;
  projetoId: string;
  createdAt: string; // ISO-8601
  status: 'importado' | 'confirmado' | 'descartado';
}

/**
 * ConfirmResponseDto — response from POST /manuscripts/:id/confirm-estrutura.
 * compJobId is the COMP job id used for navigation to the Composição module.
 *
 * NOTE: The backend currently returns 200 with empty body (void). This DTO is
 * defined for forward-compatibility when the backend starts returning the compJobId.
 * Callers should treat it as optional; ReviewFacade falls back to '/comp' if absent.
 */
export interface ConfirmResponseDto {
  manuscritoId: string;
  compJobId: string; // ID do job COMP para navegação
}

/**
 * FragmentIgnoreDto — representation of an ignore annotation on a fragment/segmento.
 * Used for optimistic UI state and rollback tracking in ReviewFacade.
 */
export interface FragmentIgnoreDto {
  fragmentId: string;
  ignored: boolean;
}

// ─── Portuguese reason labels (revisão de estrutura UI) ──────────────────────────────

export const UNPARSED_REASON_LABEL: Record<UnparsedReason, string> = {
  complex_table:       'Tabela complexa',
  math_equation:       'Equação matemática',
  nested_footnote:     'Nota de rodapé aninhada',
  unknown_docx_style:  'Estilo DOCX desconhecido',
  unsupported_markup:  'Marcação não suportada',
  embedded_object:     'Objeto incorporado',
  other:               'Elemento não reconhecido',
};

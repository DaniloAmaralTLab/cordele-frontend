/**
 * pub-nav.config.ts — navigation config for the PUB module.
 * Breadcrumb screen resolution.
 *
 * Defines how PUB integrates with the shell step-bar:
 * pipeline steps (Importar › Compor › Exportar) and breadcrumb label.
 *
 * stageIndex: 3 → fourth step in the pipeline step-bar (0-indexed):
 *   0: Projetos (PROJ)
 *   1: Importar (IMP)
 *   2: Compor   (COMP)
 *   3: Exportar (PUB)
 *
 * Consumed by:
 *   - PubShellIntegrationService (to register with NavigationService)
 *   - Shell step-bar component (to highlight active step)
 */

// ── NavConfig type (local until @cordele/shared/navigation defines it) ────────

/**
 * NavConfig — describes how a module integrates with the shell step-bar and breadcrumbs.
 * Aligns with the step-bar contract expected by the shell NavigationService.
 */
export interface NavConfig {
  /** Canonical module key (matches MODULE_KEY). */
  moduleKey: string;
  /** 0-based index in the pipeline step-bar. */
  stageIndex: number;
  /** Human-readable label for the step-bar item. */
  stageLabel: string;
  /** Label used in breadcrumb trail (e.g. "Publicação > Exportação e Validação"). */
  breadcrumbLabel: string;
}

// ── PUB_NAV_CONFIG ─────────────────────────────────────────────────────────────

/**
 * PUB_NAV_CONFIG — shell integration config for the PUB module.
 *
 * stageIndex: 3 → "Exportar" is the 4th step (0-indexed) in the pipeline step-bar.
 * breadcrumbLabel: "Publicação" — root breadcrumb for all PUB screens.
 *
 * Breadcrumb for exportação = "Publicação › Exportação e Validação".
 * Breadcrumb for histórico = "Publicação › Download e Histórico".
 */
export const PUB_NAV_CONFIG: NavConfig = {
  moduleKey: 'pub',
  stageIndex: 3,
  stageLabel: 'Exportar',
  breadcrumbLabel: 'Publicação',
};

// ── Breadcrumb resolution ───────────────────────────────────

/**
 * PubNavScreen — identifies a PUB screen for breadcrumb resolution.
 *
 * exportação: exportar          → "Projetos › {nomeProjeto} › Exportar"
 * histórico: download-historico → "Projetos › {nomeProjeto} › Download e Histórico"
 */
export type PubNavScreen = 'exportar' | 'download-historico';

/**
 * BREADCRUMB_TEMPLATES — label segments per PUB screen.
 * `{nomeProjeto}` is replaced at runtime with the project name or projetoId.
 */
const BREADCRUMB_TEMPLATES: Record<PubNavScreen, string[]> = {
  'exportar':            ['Projetos', '{nomeProjeto}', 'Exportar'],
  'download-historico':  ['Projetos', '{nomeProjeto}', 'Download e Histórico'],
};

/**
 * resolvePubBreadcrumbs — resolves breadcrumb segments for a given PUB screen.
 *
 * Replaces `{nomeProjeto}` with the provided project name (or projetoId when the
 * name is not yet available — mirrors the COMP pattern).
 *
 * @param screen      - The active PUB screen.
 * @param nomeProjeto - Project display name or projetoId fallback.
 * @returns           Resolved breadcrumb label array (e.g. ['Projetos', 'Meu Livro', 'Exportar']).
 */
export function resolvePubBreadcrumbs(screen: PubNavScreen, nomeProjeto: string): string[] {
  return BREADCRUMB_TEMPLATES[screen].map(s => s.replace('{nomeProjeto}', nomeProjeto));
}

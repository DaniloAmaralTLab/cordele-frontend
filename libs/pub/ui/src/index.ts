/**
 * Public API barrel for @cordele/pub-ui.
 *
 * Boundary: type:ui — components receive data via @Input (primitives + AvisoRow).
 * No imports from type:data-access. Consumers: pub-feature-export, pub-feature-history.
 */

// Avisos / Erros do epubcheck — contagens + lista detalhada
// AvisoRow exported so feature consumers can use the type without importing data-access directly.
export { WarningsDetailsComponent } from './lib/warnings-details/warnings-details.component';
export type { AvisoRow } from './lib/warnings-details/warnings-details.component';

// Grid de KPIs do ePub — tiles omitted when null
export { EpubSummaryGridComponent } from './lib/epub-summary-grid/epub-summary-grid.component';

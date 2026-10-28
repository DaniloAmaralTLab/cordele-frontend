/**
 * pub-shell-integration.service.ts -- PUB shell bridge (navigation / breadcrumbs).
 *
 * Responsibilities:
 *   - start(): registers PUB_NAV_CONFIG locally (stores _registeredConfig); tracks empresa changes.
 *   - stop(): deregisters nav config; resets breadcrumbs; cancels polls.
 *   - updateBreadcrumb(nomeProjeto): resolves exportação/histórico breadcrumbs; called via token.
 *   - Callers (ExportFacade) react to empresaChanged to cancel polls.
 *
 * PUB_EMPRESA_CHANGED token wired in app.config.ts.
 * PUB_UPDATE_BREADCRUMB token wired in app.config.ts.
 *
 * Boundaries:
 *   - scope:pub, type:feature -- imports scope:shared type:domain libs only.
 *   - No HttpClient. No imports from pub-data-access, pub-shell-entry, or pub-navigation.
 *     (ng-packagr-lite fails when tsconfig path aliases resolve to another lib source.)
 *   - NavConfig + PUB_NAV_CONFIG inlined to avoid cross-lib source import.
 *
 * TODO: navegação compartilhada entre módulos
 * Registration stored locally -- mirrors CompShellIntegrationService.
 *
 * publishBreadcrumb() delegates to ObservabilityService.event() (no-op stub, no console.log).
 */
import { Injectable, effect, inject, signal } from '@angular/core';
import { EmpresaContextService } from '@cordele/shared/empresa-context';
import { ObservabilityService } from '@cordele/shared/observability';

// -- NavConfig (local -- avoids cross-lib source import that breaks ng-packagr-lite) --

interface NavConfig {
  moduleKey: string;
  stageIndex: number;
  stageLabel: string;
  breadcrumbLabel: string;
}

const PUB_NAV_CONFIG_LOCAL: NavConfig = {
  moduleKey: 'pub',
  stageIndex: 3,
  stageLabel: 'Exportar',
  breadcrumbLabel: 'Publicação',
};

// -- Breadcrumb resolution  --

type PubNavScreen = 'exportar' | 'download-historico';

const BREADCRUMB_TEMPLATES: Record<PubNavScreen, string[]> = {
  'exportar':            ['Projetos', '{nomeProjeto}', 'Exportar'],
  'download-historico':  ['Projetos', '{nomeProjeto}', 'Download e Histórico'],
};

function resolvePubBreadcrumbs(screen: PubNavScreen, nomeProjeto: string): string[] {
  return BREADCRUMB_TEMPLATES[screen].map(s => s.replace('{nomeProjeto}', nomeProjeto));
}

// -- Service --

@Injectable({ providedIn: 'root' })
export class PubShellIntegrationService {
  private readonly empresaCtx    = inject(EmpresaContextService);
  private readonly observability = inject(ObservabilityService);

  // Navigation registration
  private _registeredConfig: NavConfig | null = null;

  get registeredConfig(): NavConfig | null {
    return this._registeredConfig;
  }

  private readonly _resolvedBreadcrumbs = signal<Record<PubNavScreen, string[]>>({
    'exportar':           [],
    'download-historico': [],
  });

  readonly resolvedBreadcrumbs = this._resolvedBreadcrumbs.asReadonly();

  // Empresa-changed counter
  private readonly _empresaChangedCount = signal(0);

  readonly empresaChanged = this._empresaChangedCount.asReadonly();

  private _bootstrapped = false;
  private _active = false;

  constructor() {
    effect(() => {
      this.empresaCtx.current();
      if (this._bootstrapped) {
        this._empresaChangedCount.update(n => n + 1);
      } else {
        this._bootstrapped = true;
      }
    });
  }

  start(): void {
    if (this._active) return;
    this._active = true;
    // Register nav config locally.
    this._registeredConfig = PUB_NAV_CONFIG_LOCAL;
  }

  stop(): void {
    if (!this._active) return;
    this._active = false;
    // Clear nav registration and breadcrumbs.
    this._registeredConfig = null;
    this._resolvedBreadcrumbs.set({ 'exportar': [], 'download-historico': [] });
    // Signal poll cancellation.
    this._empresaChangedCount.update(n => n + 1);
  }

  /**
   * updateBreadcrumb()
   * Called via PUB_UPDATE_BREADCRUMB token (pub-data-access) from feature components.
   * Token pattern decouples type:feature -> type:feature (Nx boundary rule).
   */
  updateBreadcrumb(nomeProjeto: string): void {
    this._resolvedBreadcrumbs.set({
      'exportar':           resolvePubBreadcrumbs('exportar', nomeProjeto),
      'download-historico': resolvePubBreadcrumbs('download-historico', nomeProjeto),
    });
  }

  /**
   * publishBreadcrumb()
   * Called via PUB_BREADCRUMB token from ExportFacade, ExportacaoEValidacaoComponent,
   * and HistoryFacade to emit lifecycle telemetry events.
   *
   * Delegates to ObservabilityService.event() — a no-op stub (real backend wired later).
   * No console.log: the stub is silent by design; lint enforces this.
   *
   * @param event        Telemetry event name (e.g. 'export-requested', 'verdict-shown', 'downloaded').
   * @param projetoId    The project identifier associated with the event.
   * @param correlationId Optional X-Correlation-Id from the last backend response (support reference).
   */
  publishBreadcrumb(event: string, projetoId: string, correlationId?: string): void {
    const data: Record<string, string> = { projetoId };
    if (correlationId) {
      data['correlationId'] = correlationId;
    }
    this.observability.event(event, data);
  }
}

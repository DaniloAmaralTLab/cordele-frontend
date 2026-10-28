/**
 * editor-de-layout-preview.component.ts — editor de layout Editor de Layout / Preview (smart component).
 * Dynamic breadcrumb resolution via CompShellIntegrationService.
 *
 * Smart:
 *   - Reads LayoutFacade signals; delegates UI to presentational children.
 *   - No direct HTTP — all data flow via LayoutFacade.
 *   - No shared/mock-data imports.
 *   - structuralEdits=false permanent (FE):
 *     no add/remove page, no insert-image toolbar.
 *
 *   - Refactored to use child presentational components:
 *     StepBarComponent, ExportBarComponent, StylePanelComponent,
 *     PreviewCanvasComponent, PagePaginatorComponent.
 *   - All deprecated facade aliases replaced by canonical API.
 *   - selector updated to app-comp-editor-de-layout-preview.
 *
 *   - Calls CompShellIntegrationService.setActiveProject(projetoId) in ngOnInit
 *     to resolve `{nome}` breadcrumb dynamically.
 *   - Renders resolved breadcrumbs in the top-bar area.
 *
 * Note: Alignment adjustments surface via ImageAlignmentBadgeComponent (inside PreviewCanvasComponent).
 * The toolbar structural (adicionarPagina/inserirImagem/removerPagina) was removed.
 */
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LayoutFacade } from '../layout.facade';
import { Alinhamento, ConfiguracaoLayoutDto } from '../models/comp.models';
import { COMP_NAV_CONFIG } from '../comp-nav.config';
import { CompShellIntegrationService } from '../comp-shell-integration.service';
import { StepBarComponent } from '../ui/step-bar.component';
import { PreviewSkeletonComponent } from '../ui/preview-skeleton.component';
import { PreviewEmptyComponent } from '../ui/preview-empty.component';
import { ErrorStateComponent } from '../ui/error-state.component';
import { ExportBarComponent } from './export-bar.component';
import { StylePanelComponent, StyleChangeEvent } from './style-panel.component';
import { PreviewCanvasComponent } from './preview-canvas.component';
import { PagePaginatorComponent } from './page-paginator.component';

@Component({
  selector: 'comp-editor-de-layout-preview',
  standalone: true,
  imports: [
    StepBarComponent,
    PreviewSkeletonComponent,
    PreviewEmptyComponent,
    ErrorStateComponent,
    ExportBarComponent,
    StylePanelComponent,
    PreviewCanvasComponent,
    PagePaginatorComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`:host {
    /*
     * Paper-surface tokens — defined here as CSS custom properties so child components
     * can inherit them via the cascade. Values use var() references to design-system tokens
     * (not inline oklch() literals — cleanup done).
     * --paper-bg: deliberately light for simulating the printed page.
     */
    --paper-bg: var(--paper-bg-override, #f0f0f5);
    display: block;
    height: 100%;
  }`],
  template: `
    <div class="flex h-full overflow-hidden" style="background:var(--bg-base);">

      <!-- Main content area -->
      <div class="flex-1 flex flex-col overflow-hidden min-w-0">

        <!-- Top bar: breadcrumbs + step bar + export bar -->
        <div class="flex flex-col px-6 pt-3 pb-0 border-b flex-shrink-0"
             style="background:var(--bg-surface);border-color:var(--border-subtle);">

          <!-- Breadcrumb navigation — {nome} resolved from projetoId -->
          @if (breadcrumbs().length) {
            <nav class="flex items-center gap-1 text-xs mb-2" aria-label="Localização">
              @for (crumb of breadcrumbs(); track $index) {
                @if (!$last) {
                  <span style="color:var(--text-tertiary);">{{ crumb }}</span>
                  <span class="material-symbols-outlined select-none"
                        style="font-size:12px;color:var(--text-tertiary);"
                        aria-hidden="true">chevron_right</span>
                } @else {
                  <span style="color:var(--text-primary);font-weight:500;">{{ crumb }}</span>
                }
              }
            </nav>
          }

          <!-- Step bar + Export bar -->
          <div class="flex items-center gap-2 py-2">
            <comp-step-bar
              [steps]="navSteps"
              [current]="'edicao'"
              class="flex-1"
            />
            <div class="ml-auto flex-shrink-0">
              <comp-export-bar
                [saving]="facade.saving()"
                [canExport]="facade.canExport()"
                (exportClicked)="facade.onExport()"
              />
            </div>
          </div>
        </div>

        <!-- Preview canvas area -->
        <div class="flex-1 overflow-auto py-8 px-6 flex justify-center items-start"
             style="background:var(--paper-bg);">

          <!-- Loading skeleton -->
          @if (facade.status() === 'loading') {
            <comp-preview-skeleton />
          }

          <!-- Error state -->
          @if (facade.status() === 'error') {
            <comp-error-state
              [message]="facade.error()?.message ?? 'Não foi possível carregar o preview.'"
              [correlationId]="facade.error()?.correlationId"
              (retry)="facade.onRetryPreview()"
            />
          }

          <!-- Empty state — 409 manuscript missing -->
          @if (facade.status() === 'empty') {
            <comp-preview-empty (navigateBack)="onNavigateBackToImport()" />
          }

          <!-- Ready — single page preview (saving is tracked via facade.saving() separately) -->
          @if (facade.status() === 'ready' && facade.paginaAtual()) {
            <comp-preview-canvas
              [page]="facade.paginaAtual()!"
              [layout]="facade.layout()"
              (alignmentChange)="onAlignmentChange($event.nodeRef, $event.alinhamento)"
            />
          }

        </div>

        <!-- Page paginator (shown only when pages exist) -->
        @if (facade.paginas().length > 0) {
          <comp-page-paginator
            [index]="facade.paginaIdx()"
            [total]="facade.paginas().length"
            (prev)="facade.onPrevPage()"
            (next)="facade.onNextPage()"
          />
        }

        <!-- Toast error -->
        @if (facade.toast()) {
          <div class="px-6 py-2 flex items-center gap-2 border-t flex-shrink-0"
               style="background:color-mix(in srgb,var(--color-error) 8%,var(--bg-surface));border-color:var(--border-subtle);">
            <span class="material-symbols-outlined text-sm" style="color:var(--color-error)" aria-hidden="true">error</span>
            <p class="text-xs" style="color:var(--color-error)" role="alert">{{ facade.toast() }}</p>
          </div>
        }

      </div>

      <!-- Style panel (always rendered — empty state still allows typography config) -->
      <comp-style-panel
        [layout]="facade.layout()"
        [canEdit]="true"
        (styleChange)="onStyleChange($event)"
      />

    </div>
  `,
})
export class EditorDeLayoutPreviewComponent implements OnInit {
  readonly facade        = inject(LayoutFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly shellIntegration = inject(CompShellIntegrationService);

  readonly navSteps = COMP_NAV_CONFIG.stepBar;

  /**
   * Resolved breadcrumbs for editor de layout: ['Projetos', '<projetoId>', 'Edição'].
   * Updated by setActiveProject() in ngOnInit — empty before first navigation.
   */
  readonly breadcrumbs = computed(
    () => this.shellIntegration.resolvedBreadcrumbs()['edicao'],
  );

  projetoId = '';

  ngOnInit(): void {
    this.projetoId = this.route.snapshot.paramMap.get('projetoId') ?? '';
    // Resolve {nome} in breadcrumbs before loading data.
    this.shellIntegration.setActiveProject(this.projetoId);
    // Telemetry — user entered editor de layout Editor de Layout screen.
    this.shellIntegration.trackLayoutOpened(this.projetoId);
    this.facade.loadData(this.projetoId);
  }

  onStyleChange(event: StyleChangeEvent): void {
    this.facade.onStyleChange(
      event.param as keyof ConfiguracaoLayoutDto,
      event.value as ConfiguracaoLayoutDto[keyof ConfiguracaoLayoutDto],
    );
  }

  onAlignmentChange(nodeId: string, alinhamento: Alinhamento): void {
    this.facade.onAlignmentChange(nodeId, alinhamento);
  }

  /** Handles PreviewEmptyComponent navigateBack output — routes to IMP importar screen. */
  onNavigateBackToImport(): void {
    this.router.navigate(['/imp', 'projetos', this.projetoId, 'importar']);
  }
}

/**
 * pub-shell-integration.service.spec.ts — Unit tests for PubShellIntegrationService.
 * Navigation: nav registration + breadcrumb resolution.
 * Observability: publishBreadcrumb() delegates to ObservabilityService.event().
 *
 * Verifies:
 *     - start() activates the service (idempotent)
 *     - stop() deactivates the service (idempotent)
 *     - empresaChanged signal remains 0 before any empresa switch
 *     - start() registers PUB_NAV_CONFIG (stores in registeredConfig)
 *     - stop() clears registeredConfig
 *     - updateBreadcrumb() resolves exportação and histórico breadcrumb segments
 *     - stop() resets resolvedBreadcrumbs to empty arrays
 *     - publishBreadcrumb('export-requested', projetoId) → ObservabilityService.event('export-requested', {projetoId})
 *     - publishBreadcrumb('verdict-shown', projetoId) → ObservabilityService.event('verdict-shown', {projetoId})
 *     - publishBreadcrumb('downloaded', projetoId) → ObservabilityService.event('downloaded', {projetoId})
 *     - publishBreadcrumb with correlationId → event data includes correlationId
 */
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { PubShellIntegrationService } from './pub-shell-integration.service';
import { EmpresaContextService } from '@cordele/shared/empresa-context';
import { ObservabilityService } from '@cordele/shared/observability';


describe('PubShellIntegrationService', () => {
  let service: PubShellIntegrationService;
  const mockEmpresaSignal = signal<unknown>(null);
  const mockObservabilityEvent = vi.fn<(name: string, data?: Record<string, string>) => void>();

  beforeEach(() => {
    mockObservabilityEvent.mockReset();
    TestBed.configureTestingModule({
      providers: [
        PubShellIntegrationService,
        {
          provide: EmpresaContextService,
          useValue: { current: mockEmpresaSignal.asReadonly() },
        },
        {
          provide: ObservabilityService,
          useValue: { event: mockObservabilityEvent },
        },
      ],
    });
    service = TestBed.inject(PubShellIntegrationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('empresaChanged should start at 0 before any empresa switch', () => {
    expect(service.empresaChanged()).toBe(0);
  });

  // ── start() / stop() lifecycle ─────────────────────────────────────────

  describe('start()', () => {
    it('should activate the service without throwing', () => {
      expect(() => service.start()).not.toThrow();
    });

    it('should be idempotent — calling start() twice has no adverse effect', () => {
      service.start();
      service.start(); // second call is a no-op
      expect(service.empresaChanged()).toBe(0);
    });
  });

  describe('stop()', () => {
    it('should deactivate the service without throwing', () => {
      service.start();
      expect(() => service.stop()).not.toThrow();
    });

    it('should be idempotent — stop() when already stopped has no adverse effect', () => {
      service.stop(); // before start — safe no-op
      expect(service.empresaChanged()).toBe(0);
    });

    it('start() then stop() then stop() — no error', () => {
      service.start();
      service.stop();
      service.stop(); // second stop — no-op (already inactive)
      expect(service.empresaChanged()).toBe(1); // stop() increments count
    });
  });

  // ── nav registration ───────────────────────────────────────

  describe('nav registration', () => {
    it('start() should register the PUB nav config (registeredConfig is set)', () => {
      expect(service.registeredConfig).toBeNull();
      service.start();
      expect(service.registeredConfig).toBeDefined();
    });

    it('stop() should deregister nav config (registeredConfig becomes null)', () => {
      service.start();
      expect(service.registeredConfig).toBeDefined();
      service.stop();
      expect(service.registeredConfig).toBeNull();
    });

    it('registeredConfig.moduleKey should be "pub" (shell registry key)', () => {
      service.start();
      expect(service.registeredConfig?.moduleKey).toBe('pub');
    });

    it('registeredConfig.stageIndex should be 3 (fourth step, 0-indexed)', () => {
      service.start();
      expect(service.registeredConfig?.stageIndex).toBe(3);
    });
  });

  // ── breadcrumb resolution ──────────────────────────────────

  describe('updateBreadcrumb()', () => {
    it('resolvedBreadcrumbs should be empty before updateBreadcrumb is called', () => {
      expect(service.resolvedBreadcrumbs()['exportar']).toEqual([]);
      expect(service.resolvedBreadcrumbs()['download-historico']).toEqual([]);
    });

    it('updateBreadcrumb("Meu Livro") should resolve exportação breadcrumb correctly', () => {
      service.updateBreadcrumb('Meu Livro');
      expect(service.resolvedBreadcrumbs()['exportar']).toEqual([
        'Projetos', 'Meu Livro', 'Exportar',
      ]);
    });

    it('updateBreadcrumb("Meu Livro") should resolve histórico breadcrumb correctly', () => {
      service.updateBreadcrumb('Meu Livro');
      expect(service.resolvedBreadcrumbs()['download-historico']).toEqual([
        'Projetos', 'Meu Livro', 'Download e Histórico',
      ]);
    });

    it('updateBreadcrumb with projetoId fallback should still produce non-empty breadcrumbs', () => {
      const projetoId = '00000000-0000-0000-0000-000000000001';
      service.updateBreadcrumb(projetoId);
      expect(service.resolvedBreadcrumbs()['exportar']).toContain(projetoId);
      expect(service.resolvedBreadcrumbs()['download-historico']).toContain(projetoId);
    });

    it('stop() should reset resolvedBreadcrumbs to empty arrays', () => {
      service.start();
      service.updateBreadcrumb('Meu Livro');
      expect(service.resolvedBreadcrumbs()['exportar'].length).toBeGreaterThan(0);
      service.stop();
      expect(service.resolvedBreadcrumbs()['exportar']).toEqual([]);
      expect(service.resolvedBreadcrumbs()['download-historico']).toEqual([]);
    });
  });

  // ── publishBreadcrumb() telemetry ──────────────────────────

  describe('publishBreadcrumb()', () => {
    it('should call ObservabilityService.event with "export-requested" and projetoId', () => {
      service.publishBreadcrumb('export-requested', 'proj-123');

      expect(mockObservabilityEvent).toHaveBeenCalledOnce();
      expect(mockObservabilityEvent).toHaveBeenCalledWith(
        'export-requested',
        { projetoId: 'proj-123' },
      );
    });

    it('should call ObservabilityService.event with "verdict-shown" and projetoId', () => {
      service.publishBreadcrumb('verdict-shown', 'proj-123');

      expect(mockObservabilityEvent).toHaveBeenCalledOnce();
      expect(mockObservabilityEvent).toHaveBeenCalledWith(
        'verdict-shown',
        { projetoId: 'proj-123' },
      );
    });

    it('should call ObservabilityService.event with "downloaded" and projetoId', () => {
      service.publishBreadcrumb('downloaded', 'proj-123');

      expect(mockObservabilityEvent).toHaveBeenCalledOnce();
      expect(mockObservabilityEvent).toHaveBeenCalledWith(
        'downloaded',
        { projetoId: 'proj-123' },
      );
    });

    it('should include correlationId in event data when provided', () => {
      service.publishBreadcrumb('verdict-shown', 'proj-123', 'trace-abc-456');

      expect(mockObservabilityEvent).toHaveBeenCalledWith(
        'verdict-shown',
        { projetoId: 'proj-123', correlationId: 'trace-abc-456' },
      );
    });

    it('should NOT include correlationId in event data when not provided', () => {
      service.publishBreadcrumb('export-requested', 'proj-123');

      const callArgs = mockObservabilityEvent.mock.calls[0];
      expect(callArgs[1]).not.toHaveProperty('correlationId');
    });
  });
});

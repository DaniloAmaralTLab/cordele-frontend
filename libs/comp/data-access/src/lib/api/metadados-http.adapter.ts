/**
 * metadados-http.adapter.ts — HTTP adapter for MetadadosPort.
 * URLs (base path /api/v1/comp/projetos/{projetoId}).
 * Activate via provideComp({ adapter: 'http' }) in production app.config.ts.
 *
 * Injects AccessHttpClient — no module adapter
 * may inject HttpClient directly. Empresa context is resolved server-side from the JWT
 * `empresa_id` claim; AccessHttpClient does not send X-Empresa-Id.
 *
 * Pattern: composition (inject AccessHttpClient) rather than inheritance, to avoid
 * naming conflicts between MetadadosPort.get() and AccessHttpClient.get<T>().
 *
 * Delegates to AccessHttpClient.
 * Moved to @cordele/comp/data-access.
 */
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AccessHttpClient, moduleBase } from '@cordele/shared/access-http-base';
import { CapaUploadResponse, MetadadosDto } from '../models/comp.models';
import { MetadadosPort } from './metadados.port';

@Injectable({ providedIn: 'root' })
export class MetadadosHttpAdapter implements MetadadosPort {
  private readonly http = inject(AccessHttpClient);

  /** Derives from ACCESS_HTTP_BASE via moduleBase() — /v1 prefix lives in one place. */
  private baseUrl(projetoId: string): string {
    return `${moduleBase('comp')}/projetos/${projetoId}`;
  }

  get(projetoId: string): Observable<MetadadosDto> {
    return this.http.get<MetadadosDto>(`${this.baseUrl(projetoId)}/metadados`);
  }

  update(projetoId: string, dto: Partial<MetadadosDto>): Observable<MetadadosDto> {
    return this.http.put<MetadadosDto>(`${this.baseUrl(projetoId)}/metadados`, dto);
  }

  uploadCapa(projetoId: string, file: File): Observable<CapaUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<CapaUploadResponse>(`${this.baseUrl(projetoId)}/capa`, formData);
  }

  removeCapa(projetoId: string): Observable<void> {
    return this.http.delete(`${this.baseUrl(projetoId)}/capa`) as Observable<void>;
  }
}

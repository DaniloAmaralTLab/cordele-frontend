/**
 * Root ApplicationConfig for cordele-web: router, HttpClient with DI interceptors,
 * bootstrap initializers (session token, module permissions) and module providers.
 * Empresa context is resolved server-side from the JWT, so no X-Empresa-Id header is sent.
 */
import {
  ApplicationConfig,
  APP_INITIALIZER,
  inject,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { appRoutes } from './app.routes';
// Import from the sublib directly (bypasses the legacy @cordele/imp barrel)
import {
  provideImp,
  IMP_PERMISSION_MAP_METADATA,
  IMP_FEATURE_FLAGS_METADATA,
} from '@cordele/imp/data-access';
// Non-lazy sublib, to stay within the module boundaries
import { provideComp } from '@cordele/comp/data-access';
import { PUB_BREADCRUMB, PUB_EMPRESA_CHANGED, providePub, PUB_UPDATE_BREADCRUMB, PUB_PERMISSION_MAP_STATIC, PUB_FEATURE_FLAGS_STATIC } from '@cordele/pub-data-access';
import { PubShellIntegrationService } from '@cordele/pub-integration';
import { AuthSessionService } from '@cordele/shared/auth-session';
import { AccessDecisionService } from '@cordele/shared/access-decision';

/**
 * initAuthSession — APP_INITIALIZER factory.
 * Reads localStorage['cordele_access_token'] at bootstrap and calls setToken()
 * so AuthSessionService.isAuthenticated is true before any route guard runs.
 *
 * Covers:
 *  - Real users: token was written to localStorage after OIDC login.
 *  - E2E specs: token injected via page.addInitScript() before Angular bootstraps.
 *
 * Wrapped in try/catch: localStorage is unavailable in some sandboxed contexts (e.g. SSR).
 */
function initAuthSession(): () => void {
  const authService = inject(AuthSessionService);
  return () => {
    try {
      const token = localStorage.getItem('cordele_access_token');
      if (token) {
        authService.setToken(token);
      }
    // eslint-disable-next-line no-restricted-syntax -- SSR/sandbox: localStorage unavailable in some environments (SSR, sandboxed iframes, private-browsing locks); silence is correct here because the app initializes without a token and Keycloak redirect handles re-auth.
    } catch {
      // localStorage unavailable (SSR, sandboxed iframe, private-browsing locks) — safe to ignore.
    }
  };
}

/**
 * initImpPermissions — APP_INITIALIZER factory.
 * Registers IMP_PERMISSION_MAP and IMP_FEATURE_FLAGS in AccessDecisionService
 * so that accessGuard('imp.import') and accessGuard('imp.review') can resolve
 * the BE scope from JWT claims and evaluate correctly.
 *
 * Without this, AccessDecisionService.can('imp.import') returns false (fail-closed
 * on unknown permission) → accessGuard redirects to /acesso-negado even for
 * authenticated users with the correct JWT scopes.
 */
function initImpPermissions(): () => void {
  const ads = inject(AccessDecisionService);
  return () => {
    ads.registerPermissions(IMP_PERMISSION_MAP_METADATA);
    ads.registerFlags(IMP_FEATURE_FLAGS_METADATA);
  };
}

/**
 * initPubPermissions — APP_INITIALIZER factory.
 * Registers PUB_PERMISSION_MAP_STATIC and PUB_FEATURE_FLAGS_STATIC in AccessDecisionService
 * so that accessGuard('pub.export'), accessGuard('pub.view'), and accessGuard('pub.download')
 * can resolve BE scopes from JWT claims and evaluate correctly.
 *
 * Without this, AccessDecisionService.can('pub.export') returns false (fail-closed
 * on unknown permission) → accessGuard redirects to /acesso-negado even for
 * authenticated users with the correct JWT scopes (pub:write).
 *
 * Mirrors initImpPermissions above — same pattern, PUB module.
 */
function initPubPermissions(): () => void {
  const ads = inject(AccessDecisionService);
  return () => {
    ads.registerPermissions(PUB_PERMISSION_MAP_STATIC);
    ads.registerFlags(
      Object.fromEntries(
        Object.entries(PUB_FEATURE_FLAGS_STATIC).map(([k, v]) => [k, { defaultState: v.defaultState }]),
      ),
    );
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideHttpClient(withInterceptorsFromDi()),
    // Reads localStorage token at bootstrap → authGuard sees isAuthenticated = true.
    {
      provide: APP_INITIALIZER,
      useFactory: initAuthSession,
      multi: true,
    },
    // Registers IMP permissions so accessGuard('imp.import') evaluates correctly.
    {
      provide: APP_INITIALIZER,
      useFactory: initImpPermissions,
      multi: true,
    },
    // Registers PUB permissions so accessGuard('pub.export') evaluates correctly.
    // Without this, pub.export → pub:write lookup returns false (unknown perm) → guard redirect.
    {
      provide: APP_INITIALIZER,
      useFactory: initPubPermissions,
      multi: true,
    },
    // HTTP adapters: the e2e suite intercepts requests at the network layer.
    provideImp({ adapter: 'http' }),
    provideComp({ adapter: 'http' }),
    // provideProj removed — now self-provided inside PROJ_ROUTES lazy route scope (proj.routes.ts).
    providePub({ adapter: 'http' }),
    // Wire PUB_EMPRESA_CHANGED to PubShellIntegrationService.empresaChanged.
    // ExportFacade watches this signal; when empresa switches, it cancels any in-flight export poll.
    // PubShellIntegrationService is scope:pub type:feature — importable from type:app (no scope restriction on app).
    // provideHttpClient is declared above, so interceptors are active before this DI factory runs.
    {
      provide: PUB_EMPRESA_CHANGED,
      useFactory: () => inject(PubShellIntegrationService).empresaChanged,
    },
    // Wire PUB_UPDATE_BREADCRUMB to PubShellIntegrationService.updateBreadcrumb.
    // Feature components inject PUB_UPDATE_BREADCRUMB from @cordele/pub-data-access and call
    // it with the projetoId/nomeProjeto to resolve breadcrumb segments for the active screen.
    // This avoids the Nx boundary violation: type:feature (pub-feature-*) cannot import type:feature (pub-integration).
    {
      provide: PUB_UPDATE_BREADCRUMB,
      useFactory: () => {
        const svc = inject(PubShellIntegrationService);
        return (nomeProjeto: string) => svc.updateBreadcrumb(nomeProjeto);
      },
    },
    // Wire PUB_BREADCRUMB to PubShellIntegrationService.publishBreadcrumb.
    // ExportFacade, HistoryFacade (type:data-access) and ExportacaoEValidacaoComponent (type:feature)
    // inject PUB_BREADCRUMB from @cordele/pub-data-access and call it to emit lifecycle telemetry events.
    // Token in pub-data-access (not pub-integration) because data-access cannot import feature — same
    // boundary pattern as PUB_EMPRESA_CHANGED and PUB_UPDATE_BREADCRUMB.
    {
      provide: PUB_BREADCRUMB,
      useFactory: () => {
        const svc = inject(PubShellIntegrationService);
        return (event: string, projetoId: string, correlationId?: string) =>
          svc.publishBreadcrumb(event, projetoId, correlationId);
      },
    },
  ],
};

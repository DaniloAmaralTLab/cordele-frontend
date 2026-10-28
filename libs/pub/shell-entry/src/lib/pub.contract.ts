/**
 * pub.contract.ts — public module-level contract for the PUB module.
 * MODULE_KEY, PUB_MENU_METADATA, PUB_PERMISSION_MAP, PUB_FEATURE_FLAGS.
 *
 * PUB is the final step of the editorial pipeline: export → epubcheck → download.
 * Accessed only with a projetoId from COMP (editor de layout "Exportar") or PROJ.
 * order: 3 → third pipeline step (IMP=1, COMP=2, PUB=3).
 * hiddenFromNav: false → PUB is visible in the left-nav sidebar.
 */
import { Routes } from '@angular/router';

// ── Shared type aliases (local until @cordele/shared defines a ModuleDescriptor lib) ──

/** Menu metadata shape expected by the shell step-bar and left-nav. */
export interface ModuleMenuMetadata {
  label: string;
  icon: string;
  order: number;
  isHome: boolean;
  hiddenFromNav: boolean;
  route: string;
}

/** FE permission key → BE scope mapping entry. */
export interface ModulePermissionEntry {
  readonly beScope: string;
}

/** Full permission map: FE perm key → ModulePermissionEntry. */
export type ModulePermissionMap = Record<string, ModulePermissionEntry>;

/** Feature flag entry: default state (on|off). */
export interface ModuleFeatureFlagEntry {
  defaultState: 'on' | 'off';
}

/** Feature flag map: flag key → ModuleFeatureFlagEntry. */
export type ModuleFeatureFlags = Record<string, ModuleFeatureFlagEntry>;

// ── PubContract ────────────────────────────────────────────────────

/**
 * PubContract — public contract surface of the PUB module.
 * Consumed by the shell to register routes, permissions and feature flags.
 */
export interface PubContract {
  routes: Routes;
  permissions: readonly ['pub.view', 'pub.export', 'pub.download'];
  featureFlags: readonly ['pub.rexport', 'pub.pdfExport'];
}

// ── Module constants ───────────────────────────────────────────────

/** Canonical key for the PUB module (matches BE module prefix). */
export const MODULE_KEY = 'pub' as const;

/**
 * PUB_MENU_METADATA — describes how the shell positions PUB.
 * hiddenFromNav: false → PUB is visible in the global left-nav.
 * order: 3 → third in the pipeline step-bar (IMP=1, COMP=2, PUB=3).
 */
export const PUB_MENU_METADATA: ModuleMenuMetadata = {
  label: 'Publicação',
  icon: 'publish',
  order: 3,
  isHome: false,
  hiddenFromNav: false,
  route: '/pub',
};

/**
 * PUB_PERMISSION_MAP — maps FE permission keys to BE scopes.
 *   pub.view     → pub:read  (view publications and history)
 *   pub.export   → pub:write (trigger ePub generation)
 *   pub.download → pub:read  (download ePub via signed URL)
 */
export const PUB_PERMISSION_MAP: ModulePermissionMap = {
  'pub.view':     { beScope: 'pub:read'  },
  'pub.export':   { beScope: 'pub:write' },
  'pub.download': { beScope: 'pub:read'  },
};

/**
 * PUB_FEATURE_FLAGS — toggleable features in the PUB module.
 *   pub.rexport:   on  → re-export allowed (overwrite latest ePub)
 *   pub.pdfExport: off → PDF export outside MVP — never implement
 */
export const PUB_FEATURE_FLAGS: ModuleFeatureFlags = {
  'pub.rexport':   { defaultState: 'on'  },
  'pub.pdfExport': { defaultState: 'off' },
};

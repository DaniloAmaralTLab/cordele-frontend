/**
 * Public API barrel for @cordele/pub-shell-entry.
 *
 * Exports all public artifacts of the PUB shell-entry:
 *   - Routes barrel — consumed by app.routes.ts loadChildren
 *   - Contract constants — MODULE_KEY, PUB_MENU_METADATA, PUB_PERMISSION_MAP, PUB_FEATURE_FLAGS
 *   - Module descriptor — PUB_MODULE_DESCRIPTOR (consumed by module-descriptors.ts)
 *   - Bootstrap lifecycle — initPub / destroyPub
 */

// Routes — consumed by app.routes.ts loadChildren
export { PUB_ROUTES } from './lib/pub.routes';

// Contract
export { MODULE_KEY, PUB_MENU_METADATA, PUB_PERMISSION_MAP, PUB_FEATURE_FLAGS } from './lib/pub.contract';
export type {
  PubContract,
  ModuleMenuMetadata,
  ModulePermissionEntry,
  ModulePermissionMap,
  ModuleFeatureFlagEntry,
  ModuleFeatureFlags,
} from './lib/pub.contract';

// Module descriptor
export { PUB_MODULE_DESCRIPTOR } from './lib/pub.descriptor';
export type { PubModuleDescriptor } from './lib/pub.descriptor';

// Bootstrap lifecycle
export { initPub, destroyPub } from './lib/pub.bootstrap';

/**
 * Public API barrel for @cordele/imp/shell-entry.
 * Shell Entry + Bootstrap.
 *
 * Exports all public artifacts of the IMP shell-entry:
 *   - Routes barrel — consumed by app.routes.ts loadChildren
 *   - Contract interface — ImpContract
 *   - Permission map — IMP_PERMISSION_MAP
 *   - Feature flags — IMP_FEATURE_FLAGS
 *   - Module descriptor — IMP_MODULE_DESCRIPTOR (consumed by module-descriptors.ts)
 */

// Routes — consumed by app.routes.ts loadChildren
export { IMP_ROUTES } from './lib/imp.routes';

// Contract
export type { ImpContract } from './lib/imp.contract';
export type {
  ModuleMenuMetadata,
  ModulePermissionEntry,
  ModulePermissionMap,
  ModuleFeatureFlagEntry,
  ModuleFeatureFlags,
} from './lib/imp.contract';

// Permission map
export { IMP_PERMISSION_MAP } from './lib/imp.permission-map';

// Feature flags
export { IMP_FEATURE_FLAGS } from './lib/imp.feature-flags';

// Module descriptor
export { IMP_MODULE_DESCRIPTOR } from './lib/imp.module-descriptor';
export type { ImpModuleDescriptor } from './lib/imp.module-descriptor';

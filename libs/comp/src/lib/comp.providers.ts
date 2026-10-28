/**
 * comp.providers.ts — re-export shim.
 * The actual DI factory lives in @cordele/comp/data-access.
 * Retained for backwards compatibility within @cordele/comp internal usage.
 */
export { provideComp } from '@cordele/comp/data-access';
export type { CompFeatureConfig } from '@cordele/comp/data-access';

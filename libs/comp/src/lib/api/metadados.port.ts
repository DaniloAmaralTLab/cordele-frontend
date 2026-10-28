/**
 * metadados.port.ts — re-export shim.
 * The actual implementation lives in @cordele/comp/data-access.
 * This file is retained so internal imports within @cordele/comp (facades)
 * continue to resolve without path changes.
 */
export { METADADOS_PORT } from '@cordele/comp/data-access';
export type { MetadadosPort } from '@cordele/comp/data-access';

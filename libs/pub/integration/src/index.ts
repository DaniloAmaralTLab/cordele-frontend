/**
 * Public API barrel for @cordele/pub-integration.
 *
 * Exports PubShellIntegrationService consumed by:
 *   - ExportFacade: empresaChanged signal to cancel in-flight polls
 *   - app.config.ts (optional): start() at module activation
 */
export { PubShellIntegrationService } from './lib/pub-shell-integration.service';

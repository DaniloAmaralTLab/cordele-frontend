/**
 * access.guard.ts — re-exports accessGuard factory from @cordele/shared/access-decision.
 * Wired to AccessDecisionService.can(permission).
 *
 * Usage: canActivate: [accessGuard('comp.view')]
 * Evaluates COMP_PERMISSION_MAP entries against JWT scopes.
 * Every COMP permission check goes through AccessDecisionService.
 */
export { accessGuard } from '@cordele/shared/access-decision';

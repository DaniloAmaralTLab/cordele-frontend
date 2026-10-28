/**
 * auth.guard.ts — re-exports authGuard from @cordele/shared/access-decision.
 * Wired to AccessDecisionService.hasSession() (JWT present + not expired).
 *
 * COMP does not implement its own session logic — all auth is delegated to the shared layer.
 */
export { authGuard } from '@cordele/shared/access-decision';

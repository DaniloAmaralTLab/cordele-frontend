/**
 * ImpHttpClient — module-scoped HTTP client for @cordele/imp.
 *
 * Extends AccessHttpClient from @cordele/shared/access-http-base.
 * Empresa context is resolved server-side from the JWT `empresa_id` claim.
 *
 * NEVER use HttpClient directly in any imp-data-access adapter.
 * This client is the ONLY legal HTTP entry point for the IMP module.
 */
import { Injectable } from '@angular/core';
import { AccessHttpClient } from '@cordele/shared/access-http-base';

@Injectable({ providedIn: 'root' })
export class ImpHttpClient extends AccessHttpClient {}

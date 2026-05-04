import { SetMetadata } from '@nestjs/common';

export interface PolicyRule {
  action: string;
  subject: string | Function;
}

export const CHECK_POLICIES_KEY = 'check_policies';

/**
 * Decorator to define the required CASL policy for a route handler.
 * 
 * Usage:
 *   @CheckPolicies({ action: 'create', subject: 'User' })
 *   @CheckPolicies({ action: 'manage', subject: 'all' })
 */
export const CheckPolicies = (...policies: PolicyRule[]) =>
  SetMetadata(CHECK_POLICIES_KEY, policies);

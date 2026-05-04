import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AbilityFactory } from './ability.factory';
import { CHECK_POLICIES_KEY, PolicyRule } from './check-policies.decorator';

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private abilityFactory: AbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policies = this.reflector.get<PolicyRule[]>(
      CHECK_POLICIES_KEY,
      context.getHandler(),
    );

    // If no policies are defined, allow access
    if (!policies || policies.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Chưa xác thực người dùng');
    }

    const ability = await this.abilityFactory.createForUser(user);

    for (const policy of policies) {
      // Resolve subject: if it's a class (Function), get its name as string
      const subject =
        typeof policy.subject === 'function'
          ? policy.subject.name
          : policy.subject;

      if (!ability.can(policy.action, subject)) {
        throw new ForbiddenException(
          `Bạn không có quyền "${policy.action}" trên "${subject}"`,
        );
      }
    }

    return true;
  }
}

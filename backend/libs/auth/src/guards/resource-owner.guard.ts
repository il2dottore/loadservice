import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLE_METADATA_KEY } from '../decorators/role.decorator';

/** Requires the authenticated user to own the user-scoped resource in the request. */
@Injectable()
export class ResourceOwnerGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      user?: {
        sub?: string;
        details?: { roles?: Array<{ name?: string }> };
      };
      params?: { id?: string; userId?: string };
      body?: { userId?: string };
    }>();
    const resourceUserId =
      request.params?.id ?? request.params?.userId ?? request.body?.userId;

    const allowedRoles = this.reflector.getAllAndOverride<string[]>(
      ROLE_METADATA_KEY,
      [context.getHandler(), context.getClass()],
    );
    const userRoles = request.user?.details?.roles?.map((role) => role.name).filter(Boolean) ?? [];
    const hasAllowedRole = allowedRoles?.some((role) => userRoles.includes(role));

    if (hasAllowedRole) {
      return true;
    }

    if (!resourceUserId || request.user?.sub !== resourceUserId) {
      throw new ForbiddenException('You can only access your own resource');
    }

    return true;
  }
}

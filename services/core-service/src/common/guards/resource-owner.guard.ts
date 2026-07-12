import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Role } from '@modules/admin/role/enums/role.enum';

/** Requires the authenticated user to own the user-scoped resource in the request. */
@Injectable()
export class ResourceOwnerGuard implements CanActivate {
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

    const isAdministrator = request.user?.details?.roles?.some(
      (role) => role.name === Role.ADMINISTRATOR,
    );

    if (isAdministrator) {
      return true;
    }

    if (!resourceUserId || request.user?.sub !== resourceUserId) {
      throw new ForbiddenException('You can only access your own resource');
    }

    return true;
  }
}

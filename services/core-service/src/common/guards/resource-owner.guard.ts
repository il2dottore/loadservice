import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

/** Requires the authenticated user to own the user-scoped resource in the request. */
@Injectable()
export class ResourceOwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      user?: { sub?: string };
      params?: { id?: string; userId?: string };
      body?: { userId?: string };
    }>();
    const resourceUserId =
      request.params?.id ?? request.params?.userId ?? request.body?.userId;

    if (!resourceUserId || request.user?.sub !== resourceUserId) {
      throw new ForbiddenException('You can only access your own resource');
    }

    return true;
  }
}

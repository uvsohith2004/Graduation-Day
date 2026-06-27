import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.session?.user;

    if (!user) {
      throw new ForbiddenException('User session not found');
    }

    if (user.role !== 'admin') {
      throw new ForbiddenException('Insufficient permissions. Admin role required.');
    }

    return true;
  }
}

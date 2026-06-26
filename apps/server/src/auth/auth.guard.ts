import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@Inject('BETTER_AUTH') private readonly auth: any) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    try {
      const session = await this.auth.api.getSession({
        headers: request.headers,
      });

      if (!session || !session.user) {
        throw new UnauthorizedException('Invalid or expired session');
      }

      // Attach the session to the request object so the decorator can access it
      request.session = session;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Authentication failed');
    }
  }
}

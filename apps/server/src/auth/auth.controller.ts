import { Controller, All, Req, Res, Inject } from '@nestjs/common';

@Controller('api/auth')
export class AuthController {
  private nodeHandler: any = null;

  constructor(@Inject('BETTER_AUTH') private readonly auth: any) {}

  @All(['', '*'])
  async handleAuth(@Req() req: any, @Res() res: any) {
    if (!this.nodeHandler) {
      const { toNodeHandler } = await import('better-auth/node');
      this.nodeHandler = toNodeHandler(this.auth);
    }
    
    // Delegate the request to better-auth's native node handler
    return this.nodeHandler(req, res);
  }
}

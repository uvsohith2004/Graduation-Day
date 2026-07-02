import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('public/template')
  async getPublicTemplate() {
    return this.appService.getPublicTemplate();
  }

  @Get('public/branches')
  async getPublicBranches() {
    return this.appService.getPublicBranches();
  }
}

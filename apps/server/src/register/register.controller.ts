import { Controller, Post, Get, Body, UseGuards, ValidationPipe, HttpException, HttpStatus } from '@nestjs/common';
import { AuthGuard, Session } from '@thallesp/nestjs-better-auth';
import { RegisterService } from './register.service';
import { CreateAlumniDto } from './dto/create-alumni.dto';

@Controller('register')
export class RegisterController {
  constructor(private readonly registerService: RegisterService) {}
  
  @Post()
  @UseGuards(AuthGuard)
  async createAlumni(
    @Session() session: any,
    @Body(new ValidationPipe({ whitelist: true })) body: CreateAlumniDto
  ) {
    const userId = session.user.id;
    const email = session.user.email;
    
    await this.registerService.createAlumni(userId, email, body);
    
    return {
      success: true,
      message: 'Graduation registration saved successfully!',
    };
  }

  @Post('check-eligibility')
  async checkEligibility(@Body('rollNo') rollNo: string) {
    if (!rollNo) {
      throw new HttpException('Roll number is required', HttpStatus.BAD_REQUEST);
    }
    return this.registerService.checkEligibility(rollNo);
  }

  @Get('ticket')
  @UseGuards(AuthGuard)
  async getTicket(@Session() session: any) {
    const userId = session.user.id;
    const email = session.user.email;
    return this.registerService.getTicket(userId, email);
  }
}

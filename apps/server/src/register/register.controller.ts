import { Controller, Post, Get, Put, Body, UseGuards, ValidationPipe, HttpException, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { Session } from '../auth/session.decorator';
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

  @Put('ticket')
  @UseGuards(AuthGuard)
  async updateTicket(@Session() session: any, @Body() body: any) {
    const userId = session.user.id;
    await this.registerService.updateTicket(userId, body);
    return {
      success: true,
      message: 'Ticket updated successfully!',
    };
  }

  @Post('ticket/photo-edit-request')
  @UseGuards(AuthGuard)
  async requestPhotoEdit(@Session() session: any) {
    const userId = session.user.id;
    await this.registerService.requestPhotoEdit(userId);
    return {
      success: true,
      message: 'Photo edit request submitted!',
    };
  }
}

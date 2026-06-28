import { Controller, Post, Body, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { Session } from '../auth/session.decorator';
import { ContactService } from './contact.service';

@Controller('contact')
@UseGuards(AuthGuard)
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  async submitMessage(@Session() session: any, @Body('message') message: string) {
    if (!message || !message.trim()) {
      throw new HttpException('Message is required', HttpStatus.BAD_REQUEST);
    }
    return this.contactService.createMessage(
      session.user.id,
      session.user.email,
      session.user.name,
      message.trim(),
    );
  }
}

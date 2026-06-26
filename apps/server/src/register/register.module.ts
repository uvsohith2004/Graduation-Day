import { Module } from '@nestjs/common';
import { RegisterController } from './register.controller';
import { AuthModule } from '../auth/auth.module';
import { RegisterService } from './register.service';

@Module({
  imports: [AuthModule],
  controllers: [RegisterController],
  providers: [RegisterService],
})
export class RegisterModule {}

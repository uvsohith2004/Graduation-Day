import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { DatabaseModule } from './database/database.module';
import { ConfigModule } from './config/config.module';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { RegisterModule } from './register/register.module';

import { StorageModule } from './storage/storage.module';
import { auth } from "./auth"
@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    AuthModule.forRoot({auth}),
    RegisterModule,
    StorageModule,
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 60,
    }]),
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    AppService,
  ],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { AuthModule as BetterAuthModule } from '@thallesp/nestjs-better-auth';
import { createAuth } from '@repo/auth/server';
import { createPool, createDatabase } from '@repo/db';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { ConfigService } from '../config/config.service';

const pool = createPool();
const db = createDatabase(pool);


const nestConfigService = new NestConfigService();
const configService = new ConfigService(nestConfigService);

const auth = createAuth({
  baseURL: configService.getBaseUrl(),
  secret: configService.getAuthSecret(),
  db,
  trustedOrigins: [configService.getWebUrl()],
  socialProviders: {
    google: {
      clientId: configService.getGoogleClientId(),
      clientSecret: configService.getGoogleClientSecret(),
    },
  },
});

@Module({
  imports: [BetterAuthModule.forRoot({ auth })],
  exports: [BetterAuthModule],
})
export class AuthModule {}

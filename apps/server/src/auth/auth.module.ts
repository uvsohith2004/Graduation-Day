import { Module, Global } from '@nestjs/common';
import { db } from '../database/db';
import * as schema from '../database/schemas';

import { AuthController } from './auth.controller';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  controllers: [AuthController],
  providers: [
    {
      provide: 'BETTER_AUTH',
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const { betterAuth } = await import('better-auth');
        const { drizzleAdapter } = await import('better-auth/adapters/drizzle');

        return betterAuth({
          baseURL: configService.getOrThrow<string>('BETTER_AUTH_URL'),
          trustedOrigins: [process.env.WEB_URL || 'http://localhost:5173'],
          database: drizzleAdapter(db, {
            provider: 'pg',
            schema: schema,
          }),
          socialProviders: {
            google: {
              clientId: process.env.GOOGLE_CLIENT_ID!,
              clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            },
          },
        });
      },
    },
  ],
  exports: ['BETTER_AUTH'],
})
export class AuthModule {}

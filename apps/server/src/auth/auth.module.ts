import { Module, Global } from '@nestjs/common';
import { db } from '../database/db';
import * as schema from '../database/schemas';

import { AuthController } from './auth.controller';

@Global()
@Module({
  controllers: [AuthController],
  providers: [
    {
      provide: 'BETTER_AUTH',
      useFactory: async () => {
        const { betterAuth } = await import('better-auth');
        const { drizzleAdapter } = await import('better-auth/adapters/drizzle');

        return betterAuth({
          baseURL:
            process.env.BETTER_AUTH_URL ||
            process.env.BASE_URL ||
            'https://pbrvits-graduation-day.vercel.app',
          trustedOrigins: [
            process.env.WEB_URL || 'http://localhost:5173',
            'https://graduation-day-web.vercel.app',
          ],
          database: drizzleAdapter(db, {
            provider: 'pg',
            schema: schema,
          }),
          advanced: {
            defaultCookieAttributes: {
              sameSite: 'none',
              secure: true,
            },
          },
          socialProviders: {
            google: {
              clientId: process.env.GOOGLE_CLIENT_ID!,
              clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            },
          },
          plugins: [(await import('better-auth/plugins')).admin()],
        });
      },
    },
  ],
  exports: ['BETTER_AUTH'],
})
export class AuthModule {}

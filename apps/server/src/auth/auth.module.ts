import { Module, Global } from '@nestjs/common';
import { db } from '../database/db';
import * as schema from '../database/schemas';

@Global()
@Module({
  controllers: [],
  providers: [
    {
      provide: 'BETTER_AUTH',
      useFactory: async () => {
        const { betterAuth } = await import('better-auth');
        const { drizzleAdapter } = await import('better-auth/adapters/drizzle');

        const isProduction = process.env.NODE_ENV === 'production';
        const backendUrl = process.env.BETTER_AUTH_URL || process.env.BASE_URL || 'http://localhost:3000';
        const webUrl = process.env.WEB_URL || 'http://localhost:5173';

        return betterAuth({
          baseURL: backendUrl,
          trustedOrigins: [
            webUrl,
            'https://pbrvits-graduation-day.vercel.app',
          ],
          database: drizzleAdapter(db, {
            provider: 'pg',
            schema: schema,
          }),
          advanced: {
            // On Vercel serverless, we must use 'lax' to allow the state cookie
            // to survive the redirect from Google back to the callback endpoint.
            // 'none' requires the cookie to be set and read across different 
            // origins, which Vercel's edge network can interfere with.
            useSecureCookies: isProduction,
            defaultCookieAttributes: {
              sameSite: 'lax',
              secure: isProduction,
              path: '/',
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


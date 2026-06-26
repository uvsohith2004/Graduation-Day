import { Module, Global } from '@nestjs/common';
import { db } from "../database/db"; 
import * as schema from "../database/schemas"; 

@Global()
@Module({
  providers: [
    {
      provide: 'BETTER_AUTH',
      useFactory: async () => {
        // Dynamic imports natively bypass the CommonJS restriction
        const { betterAuth } = await import('better-auth');
        const { drizzleAdapter } = await import('better-auth/adapters/drizzle');
        
        return betterAuth({
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

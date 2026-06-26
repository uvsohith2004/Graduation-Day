import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "@repo/db";
import type { Database } from "@repo/db";

export interface AuthConfig {
  baseURL: string;
  secret: string;
  db: Database;
  trustedOrigins?: string[];
  socialProviders: {
    google: { clientId: string; clientSecret: string };
  };
}

export function createAuth(config: AuthConfig) {
  const socialProviders: Record<string, any> = {};

  if (config.socialProviders.google.clientId && config.socialProviders.google.clientSecret) {
    socialProviders.google = {
      clientId: config.socialProviders.google.clientId,
      clientSecret: config.socialProviders.google.clientSecret,
    };
  }



  return betterAuth({
    baseURL: config.baseURL,
    secret: config.secret,
    database: drizzleAdapter(config.db, { provider: "pg", schema }),
    trustedOrigins: config.trustedOrigins ?? [],
    socialProviders,
  });
}

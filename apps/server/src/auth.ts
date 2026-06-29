import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./database/db"; 
import * as schema from "./database/schemas"; 
import "dotenv/config"

const isProduction = process.env.NODE_ENV === 'production';

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL || process.env.BASE_URL || 'http://localhost:3000',
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: schema,
    }),
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
    },
    trustedOrigins: [
        "http://localhost:5173",
        "https://graduation-day-web.vercel.app",
        "https://pbrvits-graduation-day.vercel.app",
        process.env.WEB_URL as string
    ].filter(Boolean),
    advanced: {
        useSecureCookies: isProduction,
        defaultCookieAttributes: {
            sameSite: "lax",
            secure: isProduction,
            path: "/",
        },
    },
    plugins: [
        admin()
    ]
}) as any;


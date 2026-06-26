import type { Config } from "drizzle-kit";

const DATABASE_URL = process.env["DATABASE_URL"];

if (!DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Add it to your .env file."
  );
}

export default {
  schema: "./src/schemas/**/*.schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: DATABASE_URL,
  },
  strict: true,
} satisfies Config;

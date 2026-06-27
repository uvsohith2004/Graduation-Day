import 'dotenv/config';
import type { Config } from "drizzle-kit";
console.log("CONFIG START");
const DATABASE_URL = process.env["DATABASE_URL"];
console.log("DATABASE_URL exists:", !!DATABASE_URL);
if (!DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Add it to your .env file."
  );
}

export default {
  schema: "./src/database/schemas/*.schema.ts",


  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: DATABASE_URL,
  },
  strict: true,
} satisfies Config;
console.log("CONFIG END");

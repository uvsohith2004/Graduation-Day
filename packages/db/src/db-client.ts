import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import type { Pool } from "pg";
import * as schema from "./schemas";

export type Database = NodePgDatabase<typeof schema>;

export function createDatabase(pool: Pool, enableLogging = false): Database {
  return drizzle(pool, { schema, logger: enableLogging });
}

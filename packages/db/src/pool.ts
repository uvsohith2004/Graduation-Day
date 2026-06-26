import { Pool } from "pg";
import type { PoolConfig } from "pg";
import { DatabaseConfigError, DatabasePoolError } from "./error";

export function createPool(
  overrides: Partial<PoolConfig> = {}
): Pool {
  const url = overrides.connectionString || process.env["DATABASE_URL"];

  if (!url) {
    throw new DatabaseConfigError(
      "DATABASE_URL is not set. Provide a connectionString or add it to your .env file."
    );
  }

  const pool = new Pool({
    connectionString: url,
    min: 2,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    ...overrides,
  });

 
  pool.on("error", (err) => {
    const wrapped = new DatabasePoolError(
      `Idle client error: ${err.message}`,
      err
    );
    console.error("[db] Pool error:", wrapped.message);
  });

  return pool;
}

export async function destroyPool(pool: Pool): Promise<void> {
  await pool.end();
}

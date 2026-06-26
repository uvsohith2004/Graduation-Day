import type { PoolConfig } from "pg";
import type { Pool } from "pg";

export type DatabasePoolConfig = PoolConfig;

export interface DatabaseOptions {
  pool: Pool;
  logger?: boolean;
}

export interface PoolFactoryOptions {
  enableGlobalCache?: boolean;
}

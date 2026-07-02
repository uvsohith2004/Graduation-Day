import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();
  const db = drizzle(client);

  const sqlPath = path.join(process.cwd(), "drizzle", "0003_cynical_nightmare.sql");
  const sql = fs.readFileSync(sqlPath, "utf-8");

  try {
    await client.query(sql);
    console.log("Migration executed successfully!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await client.end();
  }
}

run();

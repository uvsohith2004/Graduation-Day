import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const client = new pg.Client(process.env.DATABASE_URL);
async function run() {
  await client.connect();
  await client.query(`
    ALTER TABLE "alumni" ADD COLUMN "photo_edit_request" boolean DEFAULT false NOT NULL;
    ALTER TABLE "alumni" ADD COLUMN "can_edit_photo" boolean DEFAULT false NOT NULL;
  `);
  console.log('Migration successful');
  await client.end();
}

run().catch(console.error);

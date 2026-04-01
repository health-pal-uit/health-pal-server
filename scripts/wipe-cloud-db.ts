#!/usr/bin/env ts-node

// npx ts-node scripts/wipe-cloud-db.ts

import 'dotenv/config';
import { Client } from 'pg';

async function main() {
  const host = process.env.CLOUD_DB_HOST;
  const port = +(process.env.CLOUD_DB_PORT || 6543);
  const user = process.env.CLOUD_DB_USERNAME;
  const password = process.env.CLOUD_DB_PASSWORD;
  const database = process.env.CLOUD_DB_DATABASE;

  if (!host || !user || !password || !database) {
    console.error(
      'Missing one or more required cloud DB env vars: CLOUD_DB_HOST, CLOUD_DB_PORT, CLOUD_DB_USERNAME, CLOUD_DB_PASSWORD, CLOUD_DB_DATABASE',
    );
    process.exit(1);
  }

  const client = new Client({
    host,
    port,
    user,
    password,
    database,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log(`Connected to cloud DB ${host}:${port}/${database}`);

  await client.query('BEGIN');
  try {
    await client.query('DROP SCHEMA IF EXISTS public CASCADE');
    await client.query('CREATE SCHEMA public');
    await client.query('GRANT ALL ON SCHEMA public TO postgres');
    await client.query('GRANT ALL ON SCHEMA public TO public');
    await client.query('COMMIT');
    console.log('Cloud DB wiped: public schema dropped and recreated successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error('Failed to wipe cloud DB:', error);
  process.exit(1);
});

/**
 * Runs schema migrations against DATABASE_URL_TEST.
 * Usage: DATABASE_URL_TEST=<test_db_url> bun scripts/migrate-test.js
 */

import postgres from 'postgres';
import path from 'path';
import { fileURLToPath } from 'url';

const url = process.env.DATABASE_URL_TEST;
if (!url) {
  console.error('❌  DATABASE_URL_TEST environment variable is not set.');
  console.error('   Set it to your test Neon branch connection string and try again.');
  process.exit(1);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.join(__dirname, '../lib/db/schema.sql');

console.log('🔄  Running migrations on test database…');
const sql = postgres(url, { ssl: 'require' });

try {
  await sql.file(schemaPath);
  console.log('✅  Schema migrations applied successfully.');
} catch (err) {
  console.error('❌  Migration failed:', err.message);
  process.exit(1);
} finally {
  await sql.end();
}

import sql from '@/lib/db/index.js';
import auth from '@/lib/auth.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

export async function migrate() {
  await sql.file(SCHEMA_PATH);
  const ctx = await auth.$context;
  await ctx.runMigrations();
}

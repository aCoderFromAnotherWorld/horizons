import postgres from 'postgres';

const url = process.env.DATABASE_URL_TEST ?? process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL environment variable is not set');

const sql = postgres(url);

export default sql;

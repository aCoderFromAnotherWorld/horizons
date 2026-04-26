import { betterAuth } from 'better-auth';
import { toNextJsHandler } from 'better-auth/next-js';
import { admin } from 'better-auth/plugins';
import sql from '@/lib/db/index.js';

if (!process.env.BETTER_AUTH_SECRET || process.env.BETTER_AUTH_SECRET.length < 32) {
  throw new Error('BETTER_AUTH_SECRET must be at least 32 characters');
}
if (!process.env.BETTER_AUTH_URL) {
  throw new Error('BETTER_AUTH_URL is required');
}

// Wrap postgres.js in a pg-compatible pool interface that Kysely expects.
// Kysely's PostgresDialect detects a pool by checking for a `.connect()` method.
function createPgCompatiblePool(pgSql) {
  return {
    async connect() {
      const reserved = await pgSql.reserve();
      return {
        async query(text, parameters = []) {
          const result = await reserved.unsafe(text, parameters);
          return {
            command: result.command || 'SELECT',
            rowCount: result.count ?? result.length,
            rows: Array.from(result),
          };
        },
        release() {
          reserved.release();
        },
      };
    },
    async end() {
      await pgSql.end();
    },
  };
}

const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: createPgCompatiblePool(sql),
  session: {
    expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
    updateAge: 24 * 60 * 60,     // refresh if older than 1 day
    cookieCache: { enabled: false },
  },
  advanced: {
    cookiePrefix: 'horizons',
    useSecureCookies: process.env.NODE_ENV === 'production',
  },
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    password: { minLength: 8 },
  },
  user: {
    additionalFields: {
      is_active: {
        type: 'boolean',
        defaultValue: true,
        required: false,
      },
    },
  },
  plugins: [
    admin({
      defaultRole: 'researcher',
      adminRoles: ['admin'],
    }),
  ],
});

export { toNextJsHandler };
export default auth;

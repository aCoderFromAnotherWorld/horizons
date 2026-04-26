import { betterAuth } from 'better-auth';
import { toNextJsHandler } from 'better-auth/next-js';
import sql from '@/lib/db/index.js';

function resolveBaseUrl() {
  return (
    process.env.BETTER_AUTH_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.NODE_ENV !== 'production' ? 'http://localhost:3000' : undefined)
  );
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
  baseURL: resolveBaseUrl(),
  secret: process.env.BETTER_AUTH_SECRET,
  database: createPgCompatiblePool(sql),
  session: {
    expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
    updateAge: 24 * 60 * 60,     // refresh if older than 1 day
    cookieCache: { enabled: false },
  },
  advanced: {
    // Cookie name: horizons.session_token (dev) / __Secure-horizons.session_token (prod)
    cookiePrefix: 'horizons',
    useSecureCookies: process.env.NODE_ENV === 'production',
  },
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'researcher',
        required: false,
      },
      is_active: {
        type: 'boolean',
        defaultValue: true,
        required: false,
      },
    },
  },
});

export { toNextJsHandler };
export default auth;

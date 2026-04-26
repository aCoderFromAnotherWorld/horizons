export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const { migrate } = await import('./lib/db/migrate.js');
      await migrate();
    } catch (error) {
      const code = error?.code ? ` (${error.code})` : '';
      const details = error?.message ? ` ${error.message}` : '';
      throw new Error(
        `Database startup migration failed${code}. Check DATABASE_URL credentials and BETTER_AUTH_SECRET/BETTER_AUTH_URL configuration.${details}`
      );
    }
  }
}

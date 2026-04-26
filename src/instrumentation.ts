/**
 * Next.js Instrumentation Hook
 * Runs once at server startup — validates env vars and initialises Sentry.
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Validate env vars at startup (hard-fails in production on missing criticals)
  const { validateEnv } = await import('@/lib/env');
  validateEnv();

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config');
  }
}

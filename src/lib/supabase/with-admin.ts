/**
 * Helper: validate Supabase admin env vars at module load time in server contexts.
 * Provides a clear error message instead of a cryptic undefined reference crash.
 */
export function requireAdminEnv(): void {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is required');
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    throw new Error('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is required');
  }
}

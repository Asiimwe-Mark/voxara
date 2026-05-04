/**
 * Supabase Admin Client (service-role)
 *
 * Used ONLY in server-side code (Inngest functions, background services,
 * webhook handlers) where there is no HTTP request context.
 *
 * This module is a shared singleton — import it instead of calling
 * createClient() from @supabase/supabase-js with raw env vars each time.
 *
 * NEVER import this in client components or edge runtime routes.
 */
import { createClient } from '@supabase/supabase-js';

let _adminClient: ReturnType<typeof createClient> | null = null;

export function getAdminClient() {
  if (_adminClient) return _adminClient;

  const url   = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key   = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for admin operations'
    );
  }

  _adminClient = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return _adminClient;
}

/** Convenience alias */
export const supabaseAdmin = new Proxy({} as ReturnType<typeof createClient>, {
  get(_, prop) {
    return (getAdminClient() as Record<string | symbol, unknown>)[prop];
  },
});

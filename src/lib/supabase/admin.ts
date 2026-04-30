/**
 * Supabase Admin Client (service-role)
 *
 * Used ONLY in server-side code (Inngest functions, background services,
 * webhook handlers) where there is no HTTP request context.
 *
 * This module is a shared singleton — import the function and call it
 * wherever you need the admin client.
 *
 * NEVER import this in client components or edge runtime routes.
 */
import { createClient } from "@supabase/supabase-js";

let _adminClient: ReturnType<typeof createClient> | null = null;

export function getAdminClient() {
  if (_adminClient) return _adminClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for admin operations"
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

/**
 * Convenience function — call supabaseAdmin() to get the admin client.
 * Migrate existing code: supabaseAdmin().from(...) → supabaseAdmin().from(...)
 */
export function supabaseAdmin() {
  return getAdminClient();
}
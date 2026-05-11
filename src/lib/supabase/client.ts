import { createBrowserClient } from "@supabase/ssr";

export const createClient = () =>
  createBrowserClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL ?? (() => { throw new Error('NEXT_PUBLIC_SUPABASE_URL is required for NEXT_PUBLIC_SUPABASE_URL'); })()),
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? (() => { throw new Error('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is required for NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'); })()),
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? (() => { throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required for NEXT_PUBLIC_SUPABASE_ANON_KEY'); })())
  );
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const createClient = async () => {
  const cookieStore = await cookies();
  return createServerClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL ?? (() => { throw new Error('NEXT_PUBLIC_SUPABASE_URL is required for NEXT_PUBLIC_SUPABASE_URL'); })()),
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? (() => { throw new Error('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is required for NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'); })()),
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? (() => { throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required for NEXT_PUBLIC_SUPABASE_ANON_KEY'); })()),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
};
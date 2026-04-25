import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Atomically deduct credits using a DB-level RPC to prevent race conditions.
 * Returns true if deduction succeeded, false if insufficient credits.
 * Fires auto-top-up Inngest event if balance falls below threshold.
 */
export async function deductCredits(userId: string, amount: number = 1): Promise<boolean> {
  const supabase = await createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);;
  const { data, error } = await supabase.rpc('deduct_credits', {
    p_user_id: userId,
    p_credits: amount,
  });

  if (error) {
    console.error('deductCredits RPC error:', error);
    return false;
  }

  const success = data === true;

  if (success) {
    // Fire auto-top-up check in background (non-blocking)
    triggerAutoTopUpCheck(userId).catch((err) =>
      console.error('Auto top-up check failed silently:', err)
    );
  }

  return success;
}

/**
 * Check if user's balance is below their auto-top-up threshold, and if so,
 * fire the Inngest billing/auto-top-up event.
 */
async function triggerAutoTopUpCheck(userId: string): Promise<void> {
  const [{ data: settings }, { data: profile }] = await Promise.all([
    supabaseAdmin
      .from('auto_top_up_settings')
      .select('enabled, threshold')
      .eq('user_id', userId)
      .single(),
    supabaseAdmin.from('profiles').select('credits').eq('id', userId).single(),
  ]);

  if (!settings?.enabled || profile == null) return;
  if ((profile.credits ?? 0) >= settings.threshold) return;

  // Lazy-import Inngest client to avoid circular deps at module load
  const { inngest } = await import('@/inngest/client');
  await inngest.send({ name: 'billing/auto-top-up', data: { userId } });
}

export async function addCredits(userId: string, amount: number): Promise<void> {
  const supabase = await createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);;
  const { error } = await supabase.rpc('add_credits', { p_user_id: userId, p_credits: amount });
  if (error) throw new Error(`addCredits failed: ${error.message}`);
}

export async function getCredits(userId: string): Promise<number> {
  const supabase = await createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);;
  const { data, error } = await supabase
    .from('profiles')
    .select('credits')
    .eq('id', userId)
    .single();
  if (error || !data) return 0;
  return data.credits ?? 0;
}

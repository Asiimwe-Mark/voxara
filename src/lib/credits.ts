import logger from '@/lib/logger';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin as sb } from '@/lib/supabase/admin';
import { CREDITS_CONFIG } from '@/lib/constants';

/**
 * Atomically deduct credits using a DB-level RPC to prevent race conditions.
 * Returns true if deduction succeeded, false if insufficient credits.
 * Fires auto-top-up Inngest event if balance falls below threshold.
 */
export async function deductCredits(userId: string, amount: number = 1): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('deduct_credits', {
    p_user_id: userId,
    p_credits: amount,
  });

  if (error) {
    logger.error('deductCredits RPC error', { detail: error instanceof Error ? error.message : String(error) });
    return false;
  }

  const success = data === true;

  if (success) {
    // Fire auto-top-up check in background (non-blocking)
    triggerAutoTopUpCheck(userId).catch((err) =>
      logger.error('Auto top-up check failed silently', { detail: err instanceof Error ? err.message : String(err) })
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
    sb
      .from('auto_top_up_settings')
      .select('enabled, threshold')
      .eq('user_id', userId)
      .single(),
    sb.from('profiles').select('credits').eq('id', userId).single(),
  ]);

  if (!settings?.enabled || profile == null) return;
  if ((profile.credits ?? 0) >= (settings.threshold ?? 0)) return;

  // Lazy-import Inngest client to avoid circular deps at module load
  const { inngest } = await import('@/inngest/client');
  await inngest.send({ name: 'billing/auto-top-up', data: { userId } });
}

export async function addCredits(userId: string, amount: number): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.rpc('add_credits', { p_user_id: userId, p_credits: amount });
  if (error) throw new Error(`addCredits failed: ${error.message}`);
}

export async function getCredits(userId: string): Promise<number> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('credits')
    .eq('id', userId)
    .single();
  if (error || !data) return 0;
  return data.credits ?? 0;
}

/**
 * Award sharing credits to a user for sharing on social media.
 * Capped at CREDITS_CONFIG.MAX_SHARING_CREDITS_PER_MONTH to prevent farming.
 * Returns the number of credits actually awarded (0 if cap reached).
 */
export async function awardSharingCredits(
  userId: string,
  platform: keyof typeof CREDITS_CONFIG.SHARING_BONUS
): Promise<number> {
  const bonus = CREDITS_CONFIG.SHARING_BONUS[platform] ?? 1;
  const cap   = CREDITS_CONFIG.MAX_SHARING_CREDITS_PER_MONTH;

  // Check how many sharing credits this user earned this calendar month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data: existing } = await sb
    .from('credit_transactions')
    .select('amount')
    .eq('user_id', userId)
    .eq('reason', 'social_share')
    .gte('created_at', startOfMonth.toISOString());

  const usedThisMonth = (existing ?? []).reduce((sum, r) => sum + (r.amount ?? 0), 0);
  if (usedThisMonth >= cap) return 0;

  const toAward = Math.min(bonus, cap - usedThisMonth);

  // Award credits via RPC
  const { error: creditError } = await sb.rpc('add_credits', {
    p_user_id: userId,
    p_credits: toAward,
  });
  if (creditError) throw new Error(`awardSharingCredits RPC failed: ${creditError.message}`);

  // Log transaction for cap enforcement
  await sb.from('credit_transactions').insert({
    user_id: userId,
    amount: toAward,
    reason: 'social_share',
    metadata: { platform },
    created_at: new Date().toISOString(),
  });

  return toAward;
}

/**
 * Award referral credits when a new user signs up via a referral link.
 * The referrer gets REFERRAL_BONUS_REFERRER credits.
 * The new user gets REFERRAL_BONUS_NEW_USER extra credits on top of their free allotment.
 */
export async function awardReferralCredits(referrerId: string, newUserId: string): Promise<void> {

  await Promise.all([
    sb.rpc('add_credits', {
      p_user_id: referrerId,
      p_credits: CREDITS_CONFIG.REFERRAL_BONUS_REFERRER,
    }),
    sb.rpc('add_credits', {
      p_user_id: newUserId,
      p_credits: CREDITS_CONFIG.REFERRAL_BONUS_NEW_USER,
    }),
  ]);

  await sb.from('credit_transactions').insert([
    { user_id: referrerId, amount: CREDITS_CONFIG.REFERRAL_BONUS_REFERRER, reason: 'referral_given', metadata: { referred_user: newUserId }, created_at: new Date().toISOString() },
    { user_id: newUserId, amount: CREDITS_CONFIG.REFERRAL_BONUS_NEW_USER, reason: 'referral_received', metadata: { referred_by: referrerId }, created_at: new Date().toISOString() },
  ]);
}

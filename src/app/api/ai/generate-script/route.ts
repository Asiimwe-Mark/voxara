/**
 * POST /api/ai/generate-script
 *
 * Generates a video script via Gemini AI.
 *
 * Credit handling uses an idempotency journal (credit_transactions table):
 * 1. Insert a 'pending' transaction row before deducting
 * 2. Deduct the credit atomically
 * 3. On success → mark transaction 'completed'
 * 4. On failure → mark transaction 'refunded' and add credit back
 *
 * A background reconciler can find orphaned 'pending' rows older than
 * N minutes and refund them, protecting against mid-flight crashes.
 */

import logger from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { generateScript } from '@/features/video/services/script-generator';
import { deductCredits, addCredits } from '@/lib/credits';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: { topic?: string; tone?: string; duration?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { topic, tone, duration } = body;
  if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
    return NextResponse.json({ error: 'topic is required' }, { status: 400 });
  }

  // ── Step 1: record intent (idempotency journal) ──────────────────────────
  const { data: txRow, error: txError } = await supabaseAdmin
    .from('credit_transactions')
    .insert({
      user_id:     user.id,
      amount:      -1,
      operation:   'ai_script_generation',
      status:      'pending',
      description: `Script generation: "${topic.trim().slice(0, 80)}"`,
    })
    .select('id')
    .single();

  const txId = txRow?.id ?? null;

  if (txError) {
    // Non-fatal — we still proceed but lose the journal entry
    logger.warn('[generate-script] Failed to create credit_transactions row', {
      detail: txError.message,
    });
  }

  // ── Step 2: deduct credit atomically ────────────────────────────────────
  const ok = await deductCredits(user.id, 1);
  if (!ok) {
    // No credit deducted — clean up the pending row
    if (txId) {
      await supabaseAdmin
        .from('credit_transactions')
        .update({ status: 'cancelled' })
        .eq('id', txId)
        .catch(() => {});
    }
    return NextResponse.json(
      { error: 'Insufficient credits. Please upgrade your plan or purchase more credits.' },
      { status: 402 }
    );
  }

  // ── Step 3: call AI ──────────────────────────────────────────────────────
  try {
    const script = await generateScript(topic.trim(), { tone, duration });

    // Mark transaction completed
    if (txId) {
      await supabaseAdmin
        .from('credit_transactions')
        .update({ status: 'completed' })
        .eq('id', txId)
        .catch(() => {});
    }

    return NextResponse.json({ script });
  } catch (error) {
    // ── Step 4: refund on AI failure ────────────────────────────────────
    logger.error('Script generation failed:', { detail: error });

    await addCredits(user.id, 1).catch(() => {});

    if (txId) {
      await supabaseAdmin
        .from('credit_transactions')
        .update({ status: 'refunded' })
        .eq('id', txId)
        .catch(() => {});
    }

    return NextResponse.json(
      { error: 'Failed to generate script. Please try again.' },
      { status: 500 }
    );
  }
}

export { OPTIONS } from '@/lib/api/cors';

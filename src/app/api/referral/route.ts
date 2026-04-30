import { supabaseAdmin } from '@/lib/supabase/admin';
/**
 * GET  /api/referral  — Returns the current user's referral code and stats
 * POST /api/referral  — Processes a referral code during new user signup
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { awardReferralCredits } from "@/lib/credits";
import { CREDITS_CONFIG } from "@/lib/constants";


/** GET /api/referral — get referral code + stats for the current user */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Referral code is just the first 8 chars of the user UUID — simple, no extra table needed
  const referralCode = user.id.replace(/-/g, "").slice(0, 8).toUpperCase();
  const referralUrl = `${process.env.NEXT_PUBLIC_APP_URL}/signup?ref=${referralCode}`;

  // Count successful referrals
  const { data: referrals } = await supabaseAdmin
    .from("credit_transactions")
    .select("id, created_at")
    .eq("user_id", user.id)
    .eq("reason", "referral_given");

  // Sum credits earned from referrals
  const { data: earnings } = await supabaseAdmin
    .from("credit_transactions")
    .select("amount")
    .eq("user_id", user.id)
    .eq("reason", "referral_given");

  const totalEarned = (earnings ?? []).reduce((sum, r) => sum + (r.amount ?? 0), 0);

  return NextResponse.json({
    referralCode,
    referralUrl,
    totalReferrals: referrals?.length ?? 0,
    totalCreditsEarned: totalEarned,
    creditsPerReferral: CREDITS_CONFIG.REFERRAL_BONUS_REFERRER,
    message: `Share your link and earn ${CREDITS_CONFIG.REFERRAL_BONUS_REFERRER} credits for every person who signs up!`,
  });
}

/** POST /api/referral — called after a new user signs up with a ?ref= code */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user: newUser },
  } = await supabase.auth.getUser();
  if (!newUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { referralCode?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { referralCode } = body;
  if (!referralCode || referralCode.length !== 8) {
    return NextResponse.json({ error: "Invalid referral code" }, { status: 400 });
  }

  // Check this user hasn't already used a referral code
  const { data: alreadyUsed } = await supabaseAdmin
    .from("credit_transactions")
    .select("id")
    .eq("user_id", newUser.id)
    .eq("reason", "referral_received")
    .maybeSingle();

  if (alreadyUsed) {
    return NextResponse.json({ error: "Referral code already used" }, { status: 400 });
  }

  // Resolve the referral code back to a user UUID
  // Code is first 8 chars of UUID (no dashes), uppercase
  // We query all users and find the one whose stripped UUID starts with the code
  const { data: allProfiles } = await supabaseAdmin
    .from("profiles")
    .select("id");

  const referrer = (allProfiles ?? []).find(
    (p) => p.id.replace(/-/g, "").slice(0, 8).toUpperCase() === referralCode.toUpperCase()
  );

  if (!referrer) {
    return NextResponse.json({ error: "Referral code not found" }, { status: 404 });
  }

  // Don't allow self-referral
  if (referrer.id === newUser.id) {
    return NextResponse.json({ error: "Cannot use your own referral code" }, { status: 400 });
  }

  await awardReferralCredits(referrer.id, newUser.id);

  return NextResponse.json({
    success: true,
    message: `Referral applied! You received ${CREDITS_CONFIG.REFERRAL_BONUS_NEW_USER} bonus credit${CREDITS_CONFIG.REFERRAL_BONUS_NEW_USER > 1 ? "s" : ""}.`,
    creditsAwarded: CREDITS_CONFIG.REFERRAL_BONUS_NEW_USER,
  });
}

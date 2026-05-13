import logger from '@/lib/logger';
/**
 * GET /auth/callback
 *
 * Handles Supabase PKCE code exchange for:
 *   - Email/password confirm
 *   - Magic link sign-in
 *   - OAuth (Google, GitHub, etc.)
 *
 * After exchange, processes any pending referral code stored in
 * the URL hash / next param, then redirects to dashboard.
 *
 * Also sends welcome email for new users.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code  = searchParams.get("code");
  const next  = searchParams.get("next") ?? "/dashboard";
  const ref   = searchParams.get("ref"); // referral code from signup link

  // If no code, redirect to login (handles stale/invalid links gracefully)
  if (!code) {
    logger.warn("[auth/callback] No code present — redirecting to login");
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    logger.error("[auth/callback] Code exchange failed:", { detail: error.message });
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`
    );
  }

  // Process referral credit if user signed up via a referral link
  if (ref) {
    try {
      const refRes = await fetch(`${origin}/api/referral`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ referralCode: ref }),
      });
      if (!refRes.ok) {
        const text = await refRes.text();
        logger.warn("[auth/callback] Referral processing failed:", { detail: text });
      }
    } catch (refErr) {
      // Non-fatal — user still gets in
      logger.warn("[auth/callback] Referral fetch threw:", { detail: String(refErr) });
    }
  }

  // Send welcome email for new users (within 60 seconds of account creation)
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('created_at, full_name')
        .eq('id', user.id)
        .single();

      if (profile) {
        const userCreatedAt = new Date(user.created_at).getTime();
        const profileCreatedAt = new Date(profile.created_at).getTime();
        const isNewUser = Math.abs(userCreatedAt - profileCreatedAt) < 60000; // within 60 seconds

        if (isNewUser) {
          const welcomeRes = await fetch(`${origin}/api/emails/welcome`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: user.email,
              username: profile.full_name || user.email?.split('@')[0] || 'there',
            }),
          });
          if (!welcomeRes.ok) {
            logger.warn('[auth/callback] Welcome email failed to send');
          }
        }
      }
    }
  } catch (welcomeErr) {
    // Non-fatal — user still gets in
    logger.warn('[auth/callback] Welcome email fetch threw:', { detail: String(welcomeErr) });
  }

  // Ensure next is a relative path to prevent open-redirect attacks
  const safeNext = next.startsWith("/") ? next : "/dashboard";

  return NextResponse.redirect(`${origin}${safeNext}`);
}

import { supabaseAdmin } from '@/lib/supabase/admin';
import logger from '@/lib/logger';
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyOAuthState } from "@/lib/security";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  const supabase = await createClient();

  // Handle OAuth error from Instagram
  if (error) {
    logger.error("Instagram OAuth error", {error, errorDescription,});
    return NextResponse.redirect(
      new URL("/dashboard/settings?error=instagram_auth_failed", request.url)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/dashboard/settings?error=missing_params", request.url)
    );
  }

  // Verify signed state and extract userId
  const userId = await verifyOAuthState(state);
  if (!userId) {
    return NextResponse.redirect(
      new URL("/dashboard/settings?error=invalid_state", request.url)
    );
  }

  // Verify the userId matches the currently authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== userId) {
    return NextResponse.redirect(
      new URL("/dashboard/settings?error=unauthorized", request.url)
    );
  }

  // Exchange code for access token
  try {
    const tokenResponse = await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: (process.env.INSTAGRAM_CLIENT_ID ?? (() => { throw new Error('INSTAGRAM_CLIENT_ID is required for Instagram OAuth'); })()),
        client_secret: (process.env.INSTAGRAM_CLIENT_SECRET ?? (() => { throw new Error('INSTAGRAM_CLIENT_SECRET is required for Instagram OAuth'); })()),
        grant_type: "authorization_code",
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/instagram/callback`,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      logger.error("Instagram token exchange failed:", { detail: tokenData });
      return NextResponse.redirect(
        new URL("/dashboard/settings?error=token_exchange_failed", request.url)
      );
    }

    const { access_token, user_id } = tokenData;

    // Get user profile to fetch account name
    const profileResponse = await fetch(
      `https://graph.instagram.com/me?fields=id,username&access_token=${access_token}`
    );
    const profileData = await profileResponse.json();

    // Store in database using service role client
    const { error: dbError } = await supabaseAdmin.from("social_accounts").upsert(
      {
        user_id: userId,
        platform: "instagram",
        account_id: user_id.toString(),
        account_name: profileData.username || `Instagram User ${user_id}`,
        access_token,
        // Instagram tokens don't expire (long-lived), but we can set a far future date
        token_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,platform,account_id" }
    );

    if (dbError) {
      logger.error("Failed to store Instagram account:", { detail: dbError });
      return NextResponse.redirect(
        new URL("/dashboard/settings?error=database_error", request.url)
      );
    }

    return NextResponse.redirect(
      new URL("/dashboard/settings?success=instagram_connected", request.url)
    );
  } catch (error) {
    logger.error("Instagram callback error:", { detail: error });
    return NextResponse.redirect(
      new URL("/dashboard/settings?error=internal_error", request.url)
    );
  }
}

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

  if (error) {
    logger.error("TikTok OAuth error:", {error, errorDescription,});
    return NextResponse.redirect(
      new URL("/dashboard/settings?error=tiktok_auth_failed", request.url)
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

  try {
    // Exchange code for access token
    const tokenResponse = await fetch("https://open-api.tiktok.com/v2/oauth/token/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_key: (process.env.TIKTOK_CLIENT_KEY ?? (() => { throw new Error('TIKTOK_CLIENT_KEY is required for TikTok OAuth'); })()),
        client_secret: (process.env.TIKTOK_CLIENT_SECRET ?? (() => { throw new Error('TIKTOK_CLIENT_SECRET is required for TikTok OAuth'); })()),
        code,
        grant_type: "authorization_code",
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/tiktok/callback`,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error_code !== "0") {
      logger.error("TikTok token exchange failed:", { detail: tokenData });
      return NextResponse.redirect(
        new URL("/dashboard/settings?error=token_exchange_failed", request.url)
      );
    }

    const { access_token, refresh_token, expires_in, open_id, scope } = tokenData.data;

    // Get user info
    const userResponse = await fetch("https://open-api.tiktok.com/v2/user/info/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields: ["open_id", "display_name"] }),
    });

    const userData = await userResponse.json();
    const displayName = userData.data?.display_name || `TikTok User`;

    const expiresAt = expires_in
      ? new Date(Date.now() + expires_in * 1000).toISOString()
      : null;

    const { error: dbError } = await supabaseAdmin.from("social_accounts").upsert(
      {
        user_id: userId,
        platform: "tiktok",
        account_id: open_id,
        account_name: displayName,
        access_token,
        refresh_token,
        token_expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,platform,account_id" }
    );

    if (dbError) {
      logger.error("Failed to store TikTok account:", { detail: dbError });
      return NextResponse.redirect(
        new URL("/dashboard/settings?error=database_error", request.url)
      );
    }

    return NextResponse.redirect(
      new URL("/dashboard/settings?success=tiktok_connected", request.url)
    );
  } catch (error) {
    logger.error("TikTok callback error:", { detail: error });
    return NextResponse.redirect(
      new URL("/dashboard/settings?error=internal_error", request.url)
    );
  }
}

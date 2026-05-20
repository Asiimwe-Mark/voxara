import { supabaseAdmin } from '@/lib/supabase/admin';
import logger from '@/lib/logger';
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyOAuthState } from "@/lib/security";
import { google } from "googleapis";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const supabase = await createClient();

  if (error) {
    logger.error("YouTube OAuth error:", { detail: error });
    return NextResponse.redirect(
      new URL("/dashboard/settings?error=youtube_auth_failed", request.url)
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
    const oauth2Client = new google.auth.OAuth2(
      (process.env.YOUTUBE_CLIENT_ID ?? (() => { throw new Error('YOUTUBE_CLIENT_ID is required for YouTube OAuth'); })()),
      (process.env.YOUTUBE_CLIENT_SECRET ?? (() => { throw new Error('YOUTUBE_CLIENT_SECRET is required for YouTube OAuth'); })()),
      `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/youtube/callback`
    );

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get YouTube channel info
    const youtube = google.youtube({ version: "v3", auth: oauth2Client });
    const channelResponse = await youtube.channels.list({
      part: ["snippet"],
      mine: true,
    });

    const channel = channelResponse.data.items?.[0];
    const channelId = channel?.id;
    const channelTitle = channel?.snippet?.title || "YouTube Channel";

    if (!channelId) {
      throw new Error("No YouTube channel found for this account");
    }

    // Store tokens in Supabase
    const { error: dbError } = await supabaseAdmin.from("social_accounts").upsert(
      {
        user_id: userId,
        platform: "youtube",
        account_id: channelId,
        account_name: channelTitle,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: tokens.expiry_date
          ? new Date(tokens.expiry_date).toISOString()
          : null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,platform,account_id" }
    );

    if (dbError) {
      logger.error("Failed to store YouTube account:", { detail: dbError });
      return NextResponse.redirect(
        new URL("/dashboard/settings?error=database_error", request.url)
      );
    }

    return NextResponse.redirect(
      new URL("/dashboard/settings?success=youtube_connected", request.url)
    );
  } catch (error) {
    logger.error("YouTube callback error:", { detail: error });
    return NextResponse.redirect(
      new URL("/dashboard/settings?error=token_exchange_failed", request.url)
    );
  }
}

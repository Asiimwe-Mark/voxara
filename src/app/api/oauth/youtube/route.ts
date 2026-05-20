import logger from '@/lib/logger';
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { signOAuthState } from "@/lib/security";
import { google } from "googleapis";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clientId = process.env.YOUTUBE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/youtube/callback`;

  if (!clientId || !clientSecret) {
    logger.error("YouTube OAuth credentials are not configured");
    return NextResponse.json(
      { error: "YouTube integration is not configured" },
      { status: 500 }
    );
  }

  // Create OAuth2 client
  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );

  // YouTube upload scope
  const scopes = [
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/youtube.readonly",
    "openid",
    "profile",
    "email",
  ];

  // Generate signed state for CSRF protection and user identification
  const state = await signOAuthState(user.id);

  const authorizationUrl = oauth2Client.generateAuthUrl({
    access_type: "offline", // Required to get refresh token
    scope: scopes,
    state,
    prompt: "consent", // Force consent screen to ensure refresh token
  });

  return NextResponse.redirect(authorizationUrl);
}
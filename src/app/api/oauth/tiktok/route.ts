import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/tiktok/callback`;

  if (!clientKey) {
    console.error("TIKTOK_CLIENT_KEY is not set");
    return NextResponse.json(
      { error: "TikTok integration is not configured" },
      { status: 500 }
    );
  }

  // TikTok scopes for video upload and user info
  const scope = "user.info.basic,video.publish";
  
  // State parameter for CSRF protection and user identification
  const state = Buffer.from(JSON.stringify({
    userId: user.id,
    timestamp: Date.now(),
  })).toString("base64");

  const authorizationUrl = new URL("https://www.tiktok.com/v2/auth/authorize/");
  authorizationUrl.searchParams.set("client_key", clientKey);
  authorizationUrl.searchParams.set("redirect_uri", redirectUri);
  authorizationUrl.searchParams.set("scope", scope);
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("state", state);

  return NextResponse.redirect(authorizationUrl.toString());
}
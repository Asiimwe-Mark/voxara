import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clientId = process.env.INSTAGRAM_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/instagram/callback`;

  if (!clientId) {
    console.error("INSTAGRAM_CLIENT_ID is not set");
    return NextResponse.json(
      { error: "Instagram integration is not configured" },
      { status: 500 }
    );
  }

  // Instagram Basic Display scopes
  const scope = "user_profile,user_media";
  
  // State parameter to prevent CSRF and pass user ID
  const state = Buffer.from(JSON.stringify({
    userId: user.id,
    timestamp: Date.now(),
  })).toString("base64");

  const authorizationUrl = new URL("https://api.instagram.com/oauth/authorize");
  authorizationUrl.searchParams.set("client_id", clientId);
  authorizationUrl.searchParams.set("redirect_uri", redirectUri);
  authorizationUrl.searchParams.set("scope", scope);
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("state", state);

  return NextResponse.redirect(authorizationUrl.toString());
}
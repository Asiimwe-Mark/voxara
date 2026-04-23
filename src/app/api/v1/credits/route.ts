import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function validateApiKey(request: NextRequest): Promise<string | null> {
  const apiKey = request.headers.get("x-api-key");
  if (!apiKey) return null;

  const keyHash = crypto.createHash("sha256").update(apiKey).digest("hex");
  const { data } = await supabaseAdmin
    .from("api_keys")
    .select("user_id, status, expires_at")
    .eq("key_hash", keyHash)
    .single();

  if (!data || data.status !== "active") return null;
  if (data.expires_at && new Date(data.expires_at) < new Date()) return null;

  await supabaseAdmin
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("key_hash", keyHash);

  return data.user_id;
}

export async function GET(request: NextRequest) {
  const userId = await validateApiKey(request);
  if (!userId) {
    return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401 });
  }

  const { data: profile, error } = await supabaseAdmin
    .from("profiles")
    .select("credits, plan")
    .eq("id", userId)
    .single();

  if (error || !profile) {
    return NextResponse.json({ error: "User profile not found" }, { status: 404 });
  }

  return NextResponse.json({
    credits: profile.credits,
    plan: profile.plan,
  });
}
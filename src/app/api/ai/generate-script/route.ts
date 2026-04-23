import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateScript } from "@/features/video/services/script-generator";
import { deductCredits } from "@/lib/credits";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { topic, tone, duration } = body;
  if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
    return NextResponse.json({ error: "topic is required" }, { status: 400 });
  }

  // Atomically deduct 1 credit — returns false if balance is insufficient
  const ok = await deductCredits(user.id, 1);
  if (!ok) {
    return NextResponse.json(
      { error: "Insufficient credits. Please upgrade your plan or purchase more credits." },
      { status: 402 }
    );
  }

  try {
    const script = await generateScript(topic.trim(), { tone, duration });
    return NextResponse.json({ script });
  } catch (error) {
    // Attempt to refund the credit on AI failure so users aren't charged for errors
    const { addCredits } = await import("@/lib/credits");
    await addCredits(user.id, 1).catch(() => {});
    console.error("Script generation failed:", error);
    return NextResponse.json({ error: "Failed to generate script. Please try again." }, { status: 500 });
  }
}
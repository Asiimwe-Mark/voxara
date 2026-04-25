import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeVideoSEO } from "@/lib/ai/seo-optimizer";

export async function POST(request: NextRequest) {
  const supabase = await createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { title?: string; description?: string; script?: string; tags?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { title = "", description = "", script = "", tags = [] } = body;

  if (!title && !script) {
    return NextResponse.json({ error: "title or script is required" }, { status: 400 });
  }

  try {
    const analysis = await analyzeVideoSEO(title, description, script, tags);
    return NextResponse.json(analysis);
  } catch (error) {
    console.error("SEO analysis error:", error);
    return NextResponse.json({ error: "Failed to analyze SEO" }, { status: 500 });
  }
}

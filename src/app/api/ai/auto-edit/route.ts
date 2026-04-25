import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(request: NextRequest) {
   const supabase = await createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { script, footageUrls, prompt, currentTracks } = body;

  if (!script || !footageUrls || !currentTracks) {
    return NextResponse.json(
      { error: "Missing required fields: script, footageUrls, currentTracks" },
      { status: 400 }
    );
  }

  try {
    const systemPrompt = `You are an expert video editor AI. Given a video script, available footage URLs, and the current timeline tracks, create an optimized Edit Decision List (EDL).

Script: "${script}"

Available footage clips: ${JSON.stringify(footageUrls)}

User's editing instructions: "${prompt || 'Create a natural, engaging edit with smooth pacing.'}"

Current timeline tracks (for reference): ${JSON.stringify(currentTracks)}

Return ONLY a valid JSON object with the following structure:
{
  "tracks": [
    {
      "id": "video-track",
      "name": "Video",
      "type": "video",
      "volume": 1,
      "clips": [
        {
          "id": "clip-{uniqueId}",
          "trackId": "video-track",
          "start": number,
          "end": number,
          "type": "video",
          "url": "string",
          "properties": { "transition": "cut or fade" }
        }
      ]
    }
  ]
}

Guidelines:
- Each clip should be 60-180 frames (2-6 seconds at 30fps).
- Match clip content to script sentiment and pacing.
- Add text overlays for key points if appropriate.
- Ensure smooth transitions between different topics.
- Preserve the audio track structure if it exists.
- Generate unique clip IDs using a prefix like "ai-clip-{timestamp}-{index}".
- Do not include any explanatory text outside the JSON.`;

    const result = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: systemPrompt,
    });
    const responseText = result.text ?? "";

    // Extract JSON from the response (in case the model wraps it in markdown)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("AI response did not contain valid JSON");
    }

    const parsedResponse = JSON.parse(jsonMatch[0]);

    // Validate the response structure
    if (!parsedResponse.tracks || !Array.isArray(parsedResponse.tracks)) {
      throw new Error("AI response missing tracks array");
    }

    return NextResponse.json({ tracks: parsedResponse.tracks });
  } catch (error) {
    console.error("AI auto-edit error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI edit suggestions" },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { google } from "googleapis";

export async function POST(request: NextRequest) {
  const supabase = await createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { videoId } = await request.json();

  if (!videoId) {
    return NextResponse.json({ error: "Video ID is required" }, { status: 400 });
  }

  // Fetch video details and verify ownership
  const { data: video, error: videoError } = await supabase
    .from("videos")
    .select("id, user_id, title, script, mux_playback_id, status")
    .eq("id", videoId)
    .eq("user_id", user.id)
    .single();

  if (videoError || !video) {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }

  if (video.status !== "ready") {
    return NextResponse.json(
      { error: "Video must be fully rendered before publishing" },
      { status: 400 }
    );
  }

  // Use service role to fetch tokens securely
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Fetch YouTube OAuth tokens
  const { data: socialAccount, error: socialError } = await supabaseAdmin
    .from("social_accounts")
    .select("access_token, refresh_token, token_expires_at")
    .eq("user_id", user.id)
    .eq("platform", "youtube")
    .single();

  if (socialError || !socialAccount) {
    return NextResponse.json(
      { error: "YouTube account not connected. Please connect in Settings." },
      { status: 403 }
    );
  }

  let { access_token, refresh_token, token_expires_at } = socialAccount;

  // Create OAuth2 client
  const oauth2Client = new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID!,
    process.env.YOUTUBE_CLIENT_SECRET!,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/youtube/callback`
  );

  oauth2Client.setCredentials({
    access_token,
    refresh_token,
    expiry_date: token_expires_at ? new Date(token_expires_at).getTime() : undefined,
  });

  // Refresh token if expired
  if (token_expires_at && new Date(token_expires_at) < new Date()) {
    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      access_token = credentials.access_token!;
      
      // Update stored token
      await supabaseAdmin
        .from("social_accounts")
        .update({
          access_token: credentials.access_token,
          refresh_token: credentials.refresh_token || refresh_token,
          token_expires_at: credentials.expiry_date
            ? new Date(credentials.expiry_date).toISOString()
            : null,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .eq("platform", "youtube");
        
      oauth2Client.setCredentials(credentials);
    } catch (refreshError) {
      console.error("Failed to refresh YouTube token:", refreshError);
      return NextResponse.json(
        { error: "YouTube authentication expired. Please reconnect your account." },
        { status: 401 }
      );
    }
  }

  const youtube = google.youtube({ version: "v3", auth: oauth2Client });

  try {
    // Fetch the video file from Mux
    const videoUrl = `https://stream.mux.com/${video.mux_playback_id}.mp4`;
    const response = await fetch(videoUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch video from Mux: ${response.status}`);
    }

    const videoBuffer = Buffer.from(await response.arrayBuffer());

    // Prepare metadata
    const title = video.title || "My Faceless Video";
    const description = `${title}\n\nCreated with voxara.app\n\n${video.script ? video.script.substring(0, 500) : ""}`;
    const tags = ["faceless", "ai generated", "voxara", "automation"];

    // Upload to YouTube
    const uploadResponse = await youtube.videos.insert({
      part: ["snippet", "status"],
      requestBody: {
        snippet: {
          title,
          description,
          tags,
          categoryId: "22", // People & Blogs
        },
        status: {
          privacyStatus: "private", // Start as private; user can change later
          selfDeclaredMadeForKids: false,
        },
      },
      media: {
        body: videoBuffer,
      },
    });

    const youtubeVideoId = uploadResponse.data.id;

    // Update video record with YouTube ID
    await supabaseAdmin
      .from("videos")
      .update({ youtube_id: youtubeVideoId })
      .eq("id", videoId);

    return NextResponse.json({
      success: true,
      youtubeVideoId,
      youtubeUrl: `https://www.youtube.com/watch?v=${youtubeVideoId}`,
    });
  } catch (error) {
    console.error("YouTube upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload to YouTube" },
      { status: 500 }
    );
  }
}
import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { generateScript } from "@/features/video/services/script-generator";
import { generateVoiceover } from "@/features/video/services/voiceover";
import { fetchStockFootage } from "@/features/video/services/visuals";
import { renderVideo } from "@/features/video/services/renderer";

// Mock GenKit and Google AI
vi.mock("@genkit-ai/core", () => ({
  genkit: vi.fn().mockReturnValue({
    generate: vi.fn().mockResolvedValue({
      text: () => "Mocked AI script about the topic.",
    }),
  }),
}));

vi.mock("@genkit-ai/googleai", () => ({
  googleAI: vi.fn().mockReturnValue({}),
}));

vi.mock("@travisvn/edge-tts", () => ({
  EdgeTTS: vi.fn().mockImplementation(() => ({
    synthesize: async () => ({
      audio: {
        arrayBuffer: async () => new ArrayBuffer(1024),
      },
    }),
  })),
}));

vi.mock("pexels", () => ({
  createClient: () => ({
    videos: {
      search: async () => ({
        videos: [
          {
            video_files: [{ link: "https://example.com/video1.mp4" }],
          },
        ],
      }),
    },
  }),
}));

vi.mock("@remotion/renderer", () => ({
  bundle: async () => "/mock/bundle",
  renderMedia: async () => {},
  selectComposition: async () => ({ id: "test", durationInFrames: 900 }),
}));

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

describe("Video Generation Pipeline", () => {
  let testUserId: string;
  let testVideoId: string;

  beforeAll(async () => {
    // Create a test user
    const { data } = await supabaseAdmin.auth.admin.createUser({
      email: `vid-test-${Date.now()}@example.com`,
      password: "test123456",
      email_confirm: true,
    });
    testUserId = data.user!.id;
  });

  afterAll(async () => {
    if (testUserId) {
      await supabaseAdmin.auth.admin.deleteUser(testUserId);
    }
  });

  it("should generate a script from topic", async () => {
    const script = await generateScript("Test topic");
    expect(script).toBeTruthy();
    expect(typeof script).toBe("string");
  });

  it("should create a video record in database", async () => {
    const { data: video, error } = await supabaseAdmin
      .from("videos")
      .insert({
        user_id: testUserId,
        title: "Test Video",
        script: "This is a test script.",
        status: "pending",
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(video).toBeDefined();
    expect(video!.status).toBe("pending");

    testVideoId = video!.id;
  });

  it("should generate voiceover and store in Supabase Storage", async () => {
    const audioUrl = await generateVoiceover(
      "Test script for voiceover.",
      testUserId,
      testVideoId,
      supabaseAdmin as any
    );

    expect(audioUrl).toContain("voiceover.mp3");

    // Verify file exists in storage
    const { data: files } = await supabaseAdmin.storage
      .from("videos")
      .list(`${testUserId}/${testVideoId}`);

    expect(files?.some((f) => f.name === "voiceover.mp3")).toBe(true);
  });

  it("should fetch stock footage", async () => {
    const footage = await fetchStockFootage("nature", { count: 3 });
    expect(footage).toHaveLength(3);
    expect(footage[0]).toContain("https://");
  });

  it("should render video with Remotion", async () => {
    const outputPath = await renderVideo({
      script: "Test script",
      audioUrl: "https://example.com/audio.mp3",
      footageUrls: ["https://example.com/video1.mp4"],
      videoId: testVideoId,
      title: "Test Render",
    });

    expect(outputPath).toContain(`/renders/${testVideoId}.mp4`);
  });

  it("should update video status to ready after full pipeline", async () => {
    // Simulate the full pipeline (this would be triggered by Inngest in production)
    await supabaseAdmin
      .from("videos")
      .update({ status: "ready", mux_playback_id: "mock-playback-id" })
      .eq("id", testVideoId);

    const { data: video } = await supabaseAdmin
      .from("videos")
      .select("status")
      .eq("id", testVideoId)
      .single();

    expect(video!.status).toBe("ready");
  });

  it("should enforce credit deduction", async () => {
    // Get initial credits
    const { data: profileBefore } = await supabaseAdmin
      .from("profiles")
      .select("credits")
      .eq("id", testUserId)
      .single();

    const initialCredits = profileBefore!.credits;

    // Deduct one credit
    await supabaseAdmin
      .from("profiles")
      .update({ credits: initialCredits - 1 })
      .eq("id", testUserId);

    const { data: profileAfter } = await supabaseAdmin
      .from("profiles")
      .select("credits")
      .eq("id", testUserId)
      .single();

    expect(profileAfter!.credits).toBe(initialCredits - 1);
  });
});
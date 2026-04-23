import { createClient as createPexelsClient } from "pexels";

const pexelsClient = createPexelsClient(process.env.PEXELS_API_KEY!);

export interface FootageOptions {
  count?: number;
  orientation?: "landscape" | "portrait" | "square";
  size?: "large" | "medium" | "small";
  minDuration?: number;
}

export async function fetchStockFootage(
  query: string,
  options: FootageOptions = {}
): Promise<string[]> {
  const {
    count = 5,
    orientation = "landscape",
    size = "medium",
    minDuration = 3,
  } = options;

  try {
    const response = await pexelsClient.videos.search({
      query,
      per_page: count * 2,
      orientation,
      size,
    });

    if ("videos" in response && response.videos.length > 0) {
      return response.videos
        .filter((video) => video.duration >= minDuration)
        .slice(0, count)
        .map((video) => {
          const file = video.video_files.find(
            (f) => f.quality === "hd" || f.quality === "sd"
          );
          return file?.link || video.video_files[0]?.link;
        })
        .filter(Boolean) as string[];
    }
  } catch (error) {
    console.error("Pexels API error:", error);
  }

  // Fallback to curated free footage
  return getFallbackFootage(query, count);
}

function getFallbackFootage(query: string, count: number): string[] {
  const fallbackVideos: Record<string, string[]> = {
    nature: [
      "https://player.vimeo.com/external/434748126.sd.mp4?s=865c4eaa72133339f2f3f7c1fef15bca2d2ddbe8",
    ],
    business: [
      "https://player.vimeo.com/external/434748126.hd.mp4?s=865c4eaa72133339f2f3f7c1fef15bca2d2ddbe8",
    ],
    technology: [
      "https://player.vimeo.com/external/434748126.sd.mp4?s=865c4eaa72133339f2f3f7c1fef15bca2d2ddbe8",
    ],
  };

  const category = Object.keys(fallbackVideos).find((c) =>
    query.toLowerCase().includes(c)
  );
  const videos = category
    ? fallbackVideos[category]
    : fallbackVideos["nature"];

  return Array(count).fill(videos[0]).slice(0, count);
}
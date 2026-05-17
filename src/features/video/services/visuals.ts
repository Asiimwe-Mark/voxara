import logger from '@/lib/logger';
import { createClient as createPexelsClient } from "pexels";

function getPexelsClient() {
  if (!process.env.PEXELS_API_KEY) throw new Error("PEXELS_API_KEY is not set");
  return createPexelsClient(process.env.PEXELS_API_KEY);
}

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
    const response = await getPexelsClient().videos.search({
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
    logger.error("Pexels API error:", { detail: error });
  }

  // Fallback to curated free footage
  return getFallbackFootage(query, count);
}

function getFallbackFootage(query: string, count: number): string[] {
  // Curated Pexels video clips by category (public, free-to-use)
  const fallbackVideos: Record<string, string[]> = {
    nature: [
      "https://videos.pexels.com/video-files/857251/857251-hd_1920_1080_30fps.mp4",
      "https://videos.pexels.com/video-files/856974/856974-hd_1920_1080_30fps.mp4",
      "https://videos.pexels.com/video-files/855564/855564-hd_1920_1080_30fps.mp4",
    ],
    business: [
      "https://videos.pexels.com/video-files/3252007/3252007-hd_1920_1080_25fps.mp4",
      "https://videos.pexels.com/video-files/3209828/3209828-hd_1920_1080_25fps.mp4",
      "https://videos.pexels.com/video-files/3297379/3297379-hd_1920_1080_25fps.mp4",
    ],
    technology: [
      "https://videos.pexels.com/video-files/3129671/3129671-hd_1920_1080_30fps.mp4",
      "https://videos.pexels.com/video-files/3141208/3141208-hd_1920_1080_30fps.mp4",
      "https://videos.pexels.com/video-files/2022395/2022395-hd_1920_1080_30fps.mp4",
    ],
    food: [
      "https://videos.pexels.com/video-files/3296396/3296396-hd_1920_1080_25fps.mp4",
      "https://videos.pexels.com/video-files/3298577/3298577-hd_1920_1080_25fps.mp4",
    ],
    travel: [
      "https://videos.pexels.com/video-files/3571264/3571264-hd_1920_1080_30fps.mp4",
      "https://videos.pexels.com/video-files/2169880/2169880-hd_1920_1080_25fps.mp4",
    ],
    fitness: [
      "https://videos.pexels.com/video-files/4761437/4761437-hd_1920_1080_25fps.mp4",
      "https://videos.pexels.com/video-files/4754029/4754029-hd_1920_1080_25fps.mp4",
    ],
  };

  const queryLower = query.toLowerCase();
  const category = Object.keys(fallbackVideos).find((c) =>
    queryLower.includes(c)
  );
  const videos = category
    ? fallbackVideos[category]
    : fallbackVideos["nature"];

  // Cycle through available videos to fill the requested count
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(videos[i % videos.length]);
  }
  return result;
}
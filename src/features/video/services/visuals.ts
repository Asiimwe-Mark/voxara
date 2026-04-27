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

  // Fallback to curated free footage when Pexels fails or returns no results
  return getFallbackFootage(query, count);
}

/**
 * Fallback footage from Pixabay's free CDN.
 * Each category holds multiple distinct clips so repeated fallback calls
 * produce variety rather than the same clip looped.
 */
function getFallbackFootage(query: string, count: number): string[] {
  const fallbackVideos: Record<string, string[]> = {
    nature: [
      "https://cdn.pixabay.com/video/2016/01/06/1860-150955449_medium.mp4",
      "https://cdn.pixabay.com/video/2020/07/31/46206-449226860_medium.mp4",
      "https://cdn.pixabay.com/video/2019/04/08/23048-330246122_medium.mp4",
    ],
    business: [
      "https://cdn.pixabay.com/video/2017/08/07/11105-228640055_medium.mp4",
      "https://cdn.pixabay.com/video/2019/11/18/29004-374073518_medium.mp4",
      "https://cdn.pixabay.com/video/2020/03/17/33615-399860685_medium.mp4",
    ],
    technology: [
      "https://cdn.pixabay.com/video/2020/05/24/39765-424974708_medium.mp4",
      "https://cdn.pixabay.com/video/2018/01/21/14048-251892116_medium.mp4",
      "https://cdn.pixabay.com/video/2019/09/22/27220-361983734_medium.mp4",
    ],
    travel: [
      "https://cdn.pixabay.com/video/2021/03/23/69199-530330618_medium.mp4",
      "https://cdn.pixabay.com/video/2020/08/24/48133-453015064_medium.mp4",
    ],
    food: [
      "https://cdn.pixabay.com/video/2021/06/02/75757-559699843_medium.mp4",
      "https://cdn.pixabay.com/video/2017/06/14/9828-221860025_medium.mp4",
    ],
    fitness: [
      "https://cdn.pixabay.com/video/2021/04/17/70804-539374543_medium.mp4",
      "https://cdn.pixabay.com/video/2018/07/04/16944-277637093_medium.mp4",
    ],
  };

  const q = query.toLowerCase();
  const category = Object.keys(fallbackVideos).find((c) => q.includes(c));
  const pool = category ? fallbackVideos[category] : fallbackVideos["nature"];

  // Cycle through pool for variety when count > pool length
  return Array.from({ length: count }, (_, i) => pool[i % pool.length]);
}

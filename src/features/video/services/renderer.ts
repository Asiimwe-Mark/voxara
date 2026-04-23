import path from 'path';
import fs from 'fs/promises';

export interface RenderOptions {
  script: string;
  audioUrl: string;
  footageUrls: string[];
  videoId: string;
  title: string;
  subtitle?: boolean;
  watermark?: boolean;
}

export async function renderVideo(options: RenderOptions): Promise<string> {
  const { script, audioUrl, footageUrls, videoId, title, subtitle = true, watermark = false } = options;

  // Lazy-import Remotion renderer (heavy dependency — only loaded in background workers)
  const { bundle } = await import('@remotion/bundler');
  const { renderMedia, selectComposition } = await import('@remotion/renderer');

  const compositionPath = path.join(process.cwd(), 'remotion', 'index.ts');
  const outDir = path.join(process.cwd(), 'public', 'renders');

  // Ensure output directory exists
  await fs.mkdir(outDir, { recursive: true });

  const bundleLocation = await bundle({
    entryPoint: compositionPath,
    webpackOverride: (config) => config,
  });

  const inputProps = { script, audioUrl, footageUrls, title, subtitle, watermark };

  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: 'voxara',
    inputProps,
  });

  const outputLocation = path.join(outDir, `${videoId}.mp4`);

  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: 'h264',
    outputLocation,
    inputProps,
    onProgress: ({ progress }) => {
      console.log(`[Remotion] ${videoId}: ${Math.round(progress * 100)}%`);
    },
  });

  return `/renders/${videoId}.mp4`;
}

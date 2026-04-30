/**
 * Video Renderer
 *
 * DEPLOYMENT MODES:
 *   • Vercel (serverless) — Remotion rendering is unavailable because Chrome
 *     can't run in Vercel functions. Videos are rendered via @remotion/lambda
 *     (AWS Lambda) when REMOTION_LAMBDA_FUNCTION_NAME is set, otherwise the
 *     raw audio + footage URLs are stored and playback is handled client-side.
 *
 *   • Self-hosted / Docker — Full Remotion Node renderer runs in-process.
 *     Set RENDER_BACKEND=local in that environment.
 */

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

export interface RenderResult {
  url: string;
  type: 'local' | 'lambda' | 'passthrough';
}

const RENDER_BACKEND = process.env.RENDER_BACKEND ?? 'auto';

/**
 * Determine rendering backend:
 *  1. If REMOTION_LAMBDA_FUNCTION_NAME is set → use Lambda (Vercel-compatible)
 *  2. If RENDER_BACKEND=local → use local Remotion Node renderer (Docker/server)
 *  3. Otherwise → passthrough (store URLs, no video composition)
 */
async function detectBackend(): Promise<'lambda' | 'local' | 'passthrough'> {
  if (process.env.REMOTION_LAMBDA_FUNCTION_NAME) return 'lambda';
  if (RENDER_BACKEND === 'local') return 'local';
  return 'passthrough';
}

export async function renderVideo(options: RenderOptions): Promise<string> {
  const backend = await detectBackend();

  if (backend === 'lambda') {
    return renderWithLambda(options);
  }

  if (backend === 'local') {
    return renderWithLocalNode(options);
  }

  // Passthrough: no video composition, return the first footage URL
  // The video_url in DB will point to the raw footage + audio which the
  // player can render on the fly via MuxPlayer or a client-side player.
  return options.footageUrls[0] ?? options.audioUrl;
}

/**
 * Render using @remotion/lambda (AWS Lambda — runs on Vercel deployments)
 * Requires: REMOTION_LAMBDA_FUNCTION_NAME, AWS_REGION, AWS_ACCESS_KEY_ID,
 *           AWS_SECRET_ACCESS_KEY, REMOTION_SERVE_URL
 */
async function renderWithLambda(options: RenderOptions): Promise<string> {
  const { renderMediaOnLambda, speculateFunctionName } = await import('@remotion/lambda');

  const functionName =
    process.env.REMOTION_LAMBDA_FUNCTION_NAME ??
    speculateFunctionName({ memorySizeInMb: 2048, diskSizeInMb: 2048, timeoutInSeconds: 120 });

  const serveUrl = process.env.REMOTION_SERVE_URL;
  if (!serveUrl) throw new Error('REMOTION_SERVE_URL is required for Lambda rendering');

  const { renderId, bucketName } = await renderMediaOnLambda({
    region: (process.env.AWS_REGION ?? 'us-east-1') as Parameters<typeof renderMediaOnLambda>[0]['region'],
    functionName,
    serveUrl,
    composition: 'Voxara',
    inputProps: {
      script: options.script,
      audioUrl: options.audioUrl,
      footageUrls: options.footageUrls,
      title: options.title,
      subtitle: options.subtitle ?? true,
      watermark: options.watermark ?? false,
    },
    codec: 'h264',
    outName: `${options.videoId}.mp4`,
  });

  // Poll for completion
  const { getRenderProgress } = await import('@remotion/lambda');
  for (let i = 0; i < 60; i++) {
    const progress = await getRenderProgress({
      renderId,
      bucketName,
      functionName,
      region: (process.env.AWS_REGION ?? 'us-east-1') as Parameters<typeof getRenderProgress>[0]['region'],
    });

    if (progress.done && progress.outputFile) return progress.outputFile;
    if (progress.fatalErrorEncountered) {
      throw new Error(`Lambda render failed: ${progress.errors[0]?.message}`);
    }
    await new Promise((r) => setTimeout(r, 3000));
  }

  throw new Error('Lambda render timed out');
}

/**
 * Render using local Remotion Node renderer (self-hosted / Docker)
 */
async function renderWithLocalNode(options: RenderOptions): Promise<string> {
  const { script, audioUrl, footageUrls, videoId, title, subtitle = true, watermark = false } = options;

  const { bundle } = await import('@remotion/bundler');
  const { renderMedia, selectComposition } = await import('@remotion/renderer');

  const compositionPath = path.join(process.cwd(), 'remotion', 'index.ts');
  const outDir = path.join(process.cwd(), 'public', 'renders');

  await fs.mkdir(outDir, { recursive: true });

  const bundleLocation = await bundle({
    entryPoint: compositionPath,
    webpackOverride: (config) => config,
  });

  const inputProps = { script, audioUrl, footageUrls, title, subtitle, watermark };

  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: 'Voxara',
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
      if (process.env.NODE_ENV !== 'test') {
        if (process.env.NODE_ENV !== 'test') console.log(`[Remotion] ${videoId}: ${Math.round(progress * 100)}%`);
      }
    },
  });

  return `/renders/${videoId}.mp4`;
}

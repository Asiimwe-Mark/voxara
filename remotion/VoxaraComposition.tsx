import React from 'react'
import {
  AbsoluteFill,
  Audio,
  Composition,
  Sequence,
  Still,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Video,
} from 'remotion'
import { z } from 'zod'

// ── Schema ────────────────────────────────────────────────────────────────────

export const voxaraSchema = z.object({
  script: z.string(),
  audioUrl: z.string(),
  footageUrls: z.array(z.string()),
  title: z.string(),
  subtitle: z.boolean().optional().default(true),
  watermark: z.boolean().optional().default(false),
})

export type VoxaraProps = z.infer<typeof voxaraSchema>

// ── Sub-components ────────────────────────────────────────────────────────────

const Subtitles: React.FC<{ script: string }> = ({ script }) => {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const sentences = script.split(/(?<=[.!?])\s+/).filter(Boolean)
  if (sentences.length === 0) return null
  const framesPerSentence = Math.floor(durationInFrames / sentences.length)
  const currentIndex = Math.min(
    Math.floor(frame / framesPerSentence),
    sentences.length - 1
  )
  const opacity = interpolate(frame % framesPerSentence, [0, 8], [0, 1], {
    extrapolateRight: 'clamp',
  })

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 80,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        padding: '0 60px',
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(0,0,0,0.72)',
          color: '#fff',
          padding: '18px 36px',
          borderRadius: 12,
          fontSize: 30,
          fontWeight: 600,
          textAlign: 'center',
          lineHeight: 1.4,
          backdropFilter: 'blur(6px)',
          opacity,
          maxWidth: 900,
        }}
      >
        {sentences[currentIndex]}
      </div>
    </div>
  )
}

const Watermark: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      top: 20,
      right: 20,
      color: 'rgba(255,255,255,0.55)',
      fontSize: 15,
      fontWeight: 500,
      zIndex: 100,
      textShadow: '0 2px 4px rgba(0,0,0,0.6)',
      letterSpacing: '0.02em',
    }}
  >
    voxara.app
  </div>
)

// ── Main Composition ──────────────────────────────────────────────────────────

export const Voxara: React.FC<VoxaraProps> = ({
  script,
  audioUrl,
  footageUrls,
  subtitle = true,
  watermark = false,
}) => {
  const { fps, durationInFrames } = useVideoConfig()
  const clipsCount = Math.max(1, footageUrls.length)
  const framesPerClip = Math.ceil(durationInFrames / clipsCount)

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {/* Stock footage clips */}
      {footageUrls.map((url, i) => (
        <Sequence
          key={url + i}
          from={i * framesPerClip}
          durationInFrames={framesPerClip + 30}
        >
          <Video
            src={url}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </Sequence>
      ))}

      {/* Voiceover */}
      {audioUrl && <Audio src={audioUrl} />}

      {/* Overlays */}
      {subtitle && <Subtitles script={script} />}
      {watermark && <Watermark />}
    </AbsoluteFill>
  )
}

// ── Root (registers all compositions) ────────────────────────────────────────

export const RootComposition: React.FC = () => {
  return (
    <>
      <Composition
        id="Voxara"
        component={Voxara}
        durationInFrames={900} // 30s default; renderer overrides via calculateMetadata
        fps={30}
        width={1920}
        height={1080}
        schema={voxaraSchema}
        defaultProps={{
          script: 'Sample script text.',
          audioUrl: '',
          footageUrls: [],
          title: 'My Video',
          subtitle: true,
          watermark: false,
        }}
        calculateMetadata={({ props }) => {
          // Estimate duration from word count (~150 wpm)
          const words = props.script.split(/\s+/).length
          const seconds = Math.max(15, Math.ceil(words / 2.5))
          return { durationInFrames: seconds * 30 }
        }}
      />
    </>
  )
}

// Note: AvatarVideoComposition is imported separately but registered in the same root
// when needed - avatar videos are generated externally (HeyGen/D-ID) and don't
// go through Remotion rendering pipeline.

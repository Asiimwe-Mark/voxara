import { AbsoluteFill, Audio, Img, Sequence, useCurrentFrame, useVideoConfig, Video, interpolate, spring, Composition } from 'remotion'
import { z } from 'zod'

// Props schema for type safety
export const avatarVideoPropsSchema = z.object({
  // Mode: 'video' uses pre-rendered video, 'image' uses static image + audio
  mode: z.enum(['video', 'image']).default('video'),
  // Video URL (from HeyGen/D-ID/Synthesia)
  videoUrl: z.string().optional(),
  // Static image URL (fallback)
  imageUrl: z.string().optional(),
  // Audio URL for voiceover (used in image mode or if video has no audio)
  audioUrl: z.string(),
  // Script for subtitles
  script: z.string(),
  // Optional watermark
  watermark: z.boolean().default(true),
  // Title
  title: z.string().default('AI Avatar Video'),
})

type AvatarVideoProps = z.infer<typeof avatarVideoPropsSchema>

// Subtitles component that displays scrolling text at the bottom
const Subtitles: React.FC<{ script: string }> = ({ script }) => {
  const frame = useCurrentFrame()
  const { fps, durationInFrames } = useVideoConfig()

  // Split script into sentences
  const sentences = script.split(/(?<=[.!?])\s+/).filter((s) => s.length > 0)
  if (sentences.length === 0) return null

  const framesPerSentence = Math.floor(durationInFrames / sentences.length)
  const currentSentenceIndex = Math.min(
    Math.floor(frame / framesPerSentence),
    sentences.length - 1
  )
  const currentSentence = sentences[currentSentenceIndex]

  // Animate subtitle entrance
  const opacity = interpolate(frame % framesPerSentence, [0, 10], [0, 1], {
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
        zIndex: 10,
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '20px 40px',
          borderRadius: 12,
          fontSize: 32,
          fontWeight: 500,
          textAlign: 'center',
          maxWidth: '80%',
          backdropFilter: 'blur(4px)',
          opacity,
          lineHeight: 1.4,
        }}
      >
        {currentSentence}
      </div>
    </div>
  )
}

// Watermark component
const Watermark: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      top: 20,
      right: 20,
      color: 'rgba(255, 255, 255, 0.5)',
      fontSize: 16,
      fontWeight: 500,
      zIndex: 20,
      textShadow: '0 2px 4px rgba(0,0,0,0.5)',
    }}
  >
    voxara.app
  </div>
)

// Main component
const AvatarVideo: React.FC<AvatarVideoProps> = ({
  mode,
  videoUrl,
  imageUrl,
  audioUrl,
  script,
  watermark = true,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Calculate estimated duration based on script (approx 3 words per second)
  const wordCount = script.split(/\s+/).length
  const estimatedDurationSeconds = Math.max(wordCount / 3, 5)
  const estimatedDurationFrames = Math.floor(estimatedDurationSeconds * fps)

  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a0a' }}>
      {/* Audio track */}
      {audioUrl && <Audio src={audioUrl} />}

      {/* Video or Image content */}
      {mode === 'video' && videoUrl ? (
        <Video
          src={videoUrl}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      ) : mode === 'image' && imageUrl ? (
        <Img
          src={imageUrl}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      ) : (
        // Fallback gradient background if no media
        <AbsoluteFill
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        />
      )}

      {/* Subtitles overlay */}
      <Subtitles script={script} />

      {/* Watermark */}
      {watermark && <Watermark />}
    </AbsoluteFill>
  )
}

// Export the composition definition for Remotion
export const AvatarVideoComposition = () => {
  return (
    <Composition
      id="AvatarVideo"
      component={AvatarVideo}
      durationInFrames={900} // 30 seconds at 30fps (will be overridden by audio duration)
      fps={30}
      width={1920}
      height={1080}
      schema={avatarVideoPropsSchema}
      defaultProps={{
        mode: 'video',
        videoUrl: '',
        audioUrl: '',
        script: 'Your AI avatar will speak this script.',
        title: 'AI Avatar Video',
        watermark: true,
      }}
    />
  )
}

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Player, PlayerRef } from '@remotion/player'
import { RootComposition } from '@/remotion/FacelessVideoComposition'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Type,
  Image,
  Music,
  Volume2,
  Wand2,
  Download,
  Plus,
  Trash2,
  ZoomIn,
  ZoomOut,
  Loader2,
  X,
  Keyboard,
  GripVertical,
} from 'lucide-react'

// Types for timeline data
interface TimelineClip {
  id: string
  trackId: string
  start: number
  end: number
  type: 'video' | 'image' | 'text' | 'audio'
  url?: string
  content?: string
  properties: Record<string, unknown>
}

interface TimelineTrack {
  id: string
  name: string
  type: 'video' | 'audio' | 'text' | 'overlay'
  clips: TimelineClip[]
  muted?: boolean
  volume?: number
}

interface AdvancedTimelineEditorProps {
  videoId: string
}

export function AdvancedTimelineEditor({ videoId }: AdvancedTimelineEditorProps) {
  const playerRef = useRef<PlayerRef>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const [showKeyboardHints, setShowKeyboardHints] = useState(false)

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentFrame, setCurrentFrame] = useState(0)
  const [durationInFrames, setDurationInFrames] = useState(900)

  // Timeline data
  const [tracks, setTracks] = useState<TimelineTrack[]>([])
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [zoom, setZoom] = useState(1)

  // AI Assistant
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [isProcessingAI, setIsProcessingAI] = useState(false)

  // Video data
  const [script, setScript] = useState('')
  const [audioUrl, setAudioUrl] = useState('')
  const [footageUrls, setFootageUrls] = useState<string[]>([])

  // Drag and drop state
  const [isDraggingClip, setIsDraggingClip] = useState(false)
  const [draggedClipId, setDraggedClipId] = useState<string | null>(null)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragStartFrame, setDragStartFrame] = useState(0)

  // Load video data on mount
  useEffect(() => {
    loadVideoData()
  }, [videoId])

  async function loadVideoData() {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/videos/${videoId}`)
      const data = await response.json()

      setScript(data.script || '')
      setAudioUrl(data.audio_url || '')
      setFootageUrls(data.footage_urls || [])
      setDurationInFrames(data.duration_frames || 900)

      if (data.timeline) {
        setTracks(data.timeline)
      } else {
        initializeDefaultTracks(data)
      }
    } catch (error) {
      toast.error('Failed to load video data')
      process.env.NODE_ENV !== 'production' && console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  function initializeDefaultTracks(data: Record<string, unknown>) {
    const footageUrls = (data.footage_urls as string[] | undefined) || []
    const audioUrl = data.audio_url as string | undefined

    const defaultTracks: TimelineTrack[] = [
      {
        id: 'video-track',
        name: 'Video',
        type: 'video',
        volume: 1,
        clips: footageUrls.map((url: string, index: number) => ({
          id: `clip-${Date.now()}-${index}`,
          trackId: 'video-track',
          start: index * 180,
          end: (index + 1) * 180,
          type: 'video' as const,
          url,
          properties: {},
        })),
      },
      {
        id: 'audio-track',
        name: 'Audio',
        type: 'audio',
        volume: 1,
        clips: audioUrl
          ? [
              {
                id: `audio-${Date.now()}`,
                trackId: 'audio-track',
                start: 0,
                end: durationInFrames,
                type: 'audio' as const,
                url: audioUrl,
                properties: {},
              },
            ]
          : [],
      },
      {
        id: 'text-track',
        name: 'Text Overlays',
        type: 'text',
        clips: [],
      },
    ]
    setTracks(defaultTracks)
  }

  async function saveTimeline() {
    try {
      await fetch(`/api/videos/${videoId}/timeline`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tracks, durationInFrames }),
      })
      toast.success('Timeline saved')
    } catch {
      toast.error('Failed to save timeline')
    }
  }

  function togglePlayPause() {
    if (isPlaying) {
      playerRef.current?.pause()
    } else {
      playerRef.current?.play()
    }
    setIsPlaying(!isPlaying)
  }

  function handleSeek(frame: number) {
    playerRef.current?.seekTo(frame)
    setCurrentFrame(frame)
  }

  function addClip(trackId: string, clipData: Partial<TimelineClip>) {
    const newClip: TimelineClip = {
      id: `clip-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      trackId,
      start: currentFrame,
      end: currentFrame + 90,
      type: 'video',
      properties: {},
      ...clipData,
    }

    setTracks((prev) =>
      prev.map((track) =>
        track.id === trackId ? { ...track, clips: [...track.clips, newClip] } : track
      )
    )
  }

  function removeClip(clipId: string) {
    setTracks((prev) =>
      prev.map((track) => ({
        ...track,
        clips: track.clips.filter((c) => c.id !== clipId),
      }))
    )
    if (selectedClipId === clipId) setSelectedClipId(null)
  }

  function splitClip(clipId: string) {
    setTracks((prev) =>
      prev.map((track) => {
        const clipIndex = track.clips.findIndex((c) => c.id === clipId)
        if (clipIndex === -1) return track

        const clip = track.clips[clipIndex]
        if (currentFrame <= clip.start || currentFrame >= clip.end) return track

        const newClips = [...track.clips]
        newClips.splice(
          clipIndex,
          1,
          { ...clip, id: `${clip.id}-1`, end: currentFrame },
          { ...clip, id: `${clip.id}-2`, start: currentFrame }
        )

        return { ...track, clips: newClips }
      })
    )
  }

  function updateClipProperty(clipId: string, updates: Partial<TimelineClip>) {
    setTracks((prev) =>
      prev.map((track) => ({
        ...track,
        clips: track.clips.map((c) => (c.id === clipId ? { ...c, ...updates } : c)),
      }))
    )
  }

  async function handleAIAutoEdit() {
    setIsProcessingAI(true)
    try {
      const response = await fetch('/api/ai/auto-edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script,
          footageUrls:
            tracks.find((t) => t.type === 'video')?.clips.map((c) => c.url) || [],
          prompt: aiPrompt,
          currentTracks: tracks,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      setTracks(data.tracks)
      toast.success('AI auto-edit applied!')
      setShowAIAssistant(false)
      setAiPrompt('')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'AI edit failed')
    } finally {
      setIsProcessingAI(false)
    }
  }

  async function handleRender() {
    toast.promise(
      fetch(`/api/videos/${videoId}/render`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tracks, durationInFrames }),
      }),
      {
        loading: 'Rendering video...',
        success: 'Video render started!',
        error: 'Render failed',
      }
    )
  }

  function handleClipMouseDown(e: React.MouseEvent | React.TouchEvent, clipId: string) {
    // Prevent text selection during drag
    document.body.style.userSelect = 'none'
    
    const clip = tracks.flatMap((t) => t.clips).find((c) => c.id === clipId)
    if (!clip) return

    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX
    
    setIsDraggingClip(true)
    setDraggedClipId(clipId)
    setDragStartX(clientX)
    setDragStartFrame(clip.start)
  }

  function handleDragEnd() {
    document.body.style.userSelect = ''
    setIsDraggingClip(false)
    setDraggedClipId(null)
  }

  useEffect(() => {
    if (!isDraggingClip || !draggedClipId) return

    function handleMove(clientX: number) {
      const deltaX = clientX - dragStartX
      const frameDelta = Math.round(
        (deltaX / (timelineRef.current?.clientWidth || 1)) * durationInFrames * zoom
      )
      const newStart = Math.max(0, Math.min(durationInFrames - 90, dragStartFrame + frameDelta))

      setTracks((prev) =>
        prev.map((track) => ({
          ...track,
          clips: track.clips.map((c) => {
            if (c.id !== draggedClipId) return c
            const duration = c.end - c.start
            return { ...c, start: newStart, end: newStart + duration }
          }),
        }))
      )
    }

    function handleMouseMove(e: MouseEvent) {
      handleMove(e.clientX)
    }

    function handleTouchMove(e: TouchEvent) {
      if (e.touches[0]) handleMove(e.touches[0].clientX)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('mouseup', handleDragEnd)
    window.addEventListener('touchend', handleDragEnd)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('mouseup', handleDragEnd)
      window.removeEventListener('touchend', handleDragEnd)
      document.body.style.userSelect = ''
    }
  }, [isDraggingClip, draggedClipId, dragStartX, dragStartFrame, durationInFrames, zoom])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      switch (e.code) {
        case 'Space':
          e.preventDefault()
          togglePlayPause()
          break
        case 'KeyS':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            saveTimeline()
          }
          break
        case 'Delete':
        case 'Backspace':
          if (selectedClipId) removeClip(selectedClipId)
          break
        case 'KeyK':
          if (selectedClipId) splitClip(selectedClipId)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedClipId])

  const selectedClip = tracks.flatMap((t) => t.clips).find((c) => c.id === selectedClipId)

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-muted-foreground" />
        <span className="ml-3 text-sm text-muted-foreground">Loading editor...</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground select-none">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-3 px-3 sm:px-4 py-3 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <h2 className="text-base sm:text-lg font-semibold tracking-tight truncate">
            Timeline Editor
          </h2>
          <Badge variant="secondary" className="text-xs shrink-0">
            Draft
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg"
            onClick={() => setShowKeyboardHints(!showKeyboardHints)}
            aria-label="Toggle keyboard shortcuts"
            title="Keyboard shortcuts"
          >
            <Keyboard className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={saveTimeline}
            className="h-9 sm:h-10 rounded-lg text-xs sm:text-sm font-medium transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Save
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAIAssistant(true)}
            className="h-9 sm:h-10 rounded-lg text-xs sm:text-sm font-medium transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <Wand2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1.5" />
            <span className="hidden sm:inline">AI Assistant</span>
            <span className="sm:hidden">AI</span>
          </Button>
          <Button
            size="sm"
            onClick={handleRender}
            className="h-9 sm:h-10 rounded-lg text-xs sm:text-sm font-medium transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1.5" />
            <span className="hidden sm:inline">Render</span>
          </Button>
        </div>
      </header>

      {/* Keyboard Shortcuts Tooltip */}
      {showKeyboardHints && (
        <div className="px-3 sm:px-4 py-2 bg-muted/30 border-b border-border/50 text-[10px] sm:text-xs text-muted-foreground">
          <div className="flex flex-wrap gap-x-3 sm:gap-x-4 gap-y-1">
            <span><kbd className="px-1 sm:px-1.5 py-0.5 rounded bg-muted border border-border/50 font-mono">Space</kbd> Play/Pause</span>
            <span><kbd className="px-1 sm:px-1.5 py-0.5 rounded bg-muted border border-border/50 font-mono">Ctrl+S</kbd> Save</span>
            <span><kbd className="px-1 sm:px-1.5 py-0.5 rounded bg-muted border border-border/50 font-mono">Del</kbd> Delete clip</span>
            <span><kbd className="px-1 sm:px-1.5 py-0.5 rounded bg-muted border border-border/50 font-mono">K</kbd> Split clip</span>
          </div>
        </div>
      )}

      {/* Video Preview */}
      <div className="flex-1 flex items-center justify-center p-3 sm:p-4 bg-muted/20">
        <div className="w-full max-w-4xl aspect-video rounded-lg overflow-hidden bg-black shadow-lg relative">
          <Player
            ref={playerRef}
            component={RootComposition}
            inputProps={{
              script,
              audioUrl,
              footageUrls:
                tracks
                  .find((t) => t.type === 'video')
                  ?.clips.sort((a, b) => a.start - b.start)
                  .map((c) => c.url) || [],
              title: 'Preview',
            }}
            durationInFrames={durationInFrames}
            fps={30}
            compositionWidth={1920}
            compositionHeight={1080}
            controls={false}
            autoPlay={isPlaying}
            style={{ width: '100%', height: '100%' }}
          />
          {/* Playhead indicator overlay when playing */}
          {isPlaying && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-destructive/90 text-destructive-foreground text-[10px] font-medium animate-pulse">
                Playing
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Playback Controls */}
      <div className="border-t border-border/50 p-3 sm:p-4 bg-background">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              onClick={() => handleSeek(0)}
              aria-label="Seek to start"
            >
              <SkipBack className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button
              variant="default"
              size="icon"
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              onClick={togglePlayPause}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <Play className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              onClick={() => handleSeek(durationInFrames)}
              aria-label="Seek to end"
            >
              <SkipForward className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>

          <div className="flex-1 min-w-[100px] order-3 sm:order-none w-full sm:w-auto">
            <Slider
              value={[currentFrame]}
              max={durationInFrames}
              step={1}
              onValueChange={([v]) => handleSeek(v)}
              className="w-full"
            />
          </div>

          <span className="text-xs sm:text-sm font-mono tabular-nums min-w-[70px] sm:min-w-[80px] text-center">
            {Math.floor(currentFrame / 30)}s / {Math.floor(durationInFrames / 30)}s
          </span>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
              aria-label="Zoom out"
            >
              <ZoomOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
            <span className="text-xs sm:text-sm min-w-[40px] sm:min-w-[45px] text-center tabular-nums">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              onClick={() => setZoom((z) => Math.min(2, z + 0.25))}
              aria-label="Zoom in"
            >
              <ZoomIn className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>

        {/* Timeline Tracks - Touch-optimized */}
        <div
          className="space-y-1.5 overflow-x-auto overflow-y-visible pb-2 touch-pan-y"
          ref={timelineRef}
          role="region"
          aria-label="Timeline tracks"
          style={{ touchAction: 'pan-y' }}
        >
          {tracks.map((track) => (
            <div key={track.id} className="flex items-start gap-2 min-w-[600px] sm:min-w-0">
              {/* Track label */}
              <div className="w-20 sm:w-32 shrink-0 flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground py-1.5">
                {track.type === 'video' && <Image className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                {track.type === 'audio' && <Music className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                {track.type === 'text' && <Type className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                <span className="truncate">{track.name}</span>
                {track.type === 'audio' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 sm:h-8 sm:w-8 rounded touch-manipulation"
                    onClick={() =>
                      setTracks((prev) =>
                        prev.map((t) => (t.id === track.id ? { ...t, muted: !t.muted } : t))
                      )
                    }
                    aria-label={track.muted ? 'Unmute track' : 'Mute track'}
                  >
                    <Volume2
                      className={`h-3.5 w-3.5 ${track.muted ? 'text-destructive' : ''}`}
                    />
                  </Button>
                )}
              </div>

              {/* Track timeline */}
              <div className="flex-1 relative h-12 sm:h-14 bg-muted/30 rounded-lg overflow-hidden touch-none">
                {track.clips.map((clip) => (
                  <div
                    key={clip.id}
                    className={`absolute h-full rounded cursor-grab active:cursor-grabbing border transition-smooth ${
                      selectedClipId === clip.id
                        ? 'border-primary border-2 ring-2 ring-primary/20'
                        : 'border-border/50 hover:border-primary/50'
                    } ${isDraggingClip && draggedClipId === clip.id ? 'opacity-70' : ''}`}
                    style={{
                      left: `${(clip.start / durationInFrames) * 100}%`,
                      width: `${((clip.end - clip.start) / durationInFrames) * 100}%`,
                      backgroundColor:
                        track.type === 'video'
                          ? 'hsl(var(--primary) / 0.8)'
                          : track.type === 'audio'
                          ? 'hsl(var(--color-emerald-500) / 0.8)'
                          : 'hsl(var(--color-violet-500) / 0.8)',
                      touchAction: 'none',
                    }}
                    onClick={() => setSelectedClipId(clip.id)}
                    onMouseDown={(e) => handleClipMouseDown(e, clip.id)}
                    onTouchStart={(e) => handleClipMouseDown(e, clip.id)}
                    onDoubleClick={() => splitClip(clip.id)}
                    role="button"
                    tabIndex={0}
                    aria-label={`${clip.type} clip: ${clip.content?.substring(0, 20) || clip.id.slice(-4)}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setSelectedClipId(clip.id)
                      }
                    }}
                  >
                    {/* Drag handle indicator */}
                    <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <GripVertical className="h-3 w-3 text-white/60" />
                    </div>
                    
                    <div className="px-2 text-[10px] sm:text-xs truncate text-primary-foreground pointer-events-none">
                      {clip.type === 'text'
                        ? clip.content?.substring(0, 12) || 'Text'
                        : `${clip.type} ${clip.id.slice(-4)}`}
                    </div>
                    
                    {/* Touch-optimized resize handles */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-3 sm:w-4 cursor-ew-resize hover:bg-white/20 rounded-l flex items-center justify-center"
                      onMouseDown={(e) => {
                        e.stopPropagation()
                        // Implement resize logic here
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation()
                        // Implement resize logic here
                      }}
                      aria-label="Resize clip start"
                    >
                      <div className="h-6 w-0.5 bg-white/30 rounded-full" />
                    </div>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-3 sm:w-4 cursor-ew-resize hover:bg-white/20 rounded-r flex items-center justify-center"
                      onMouseDown={(e) => {
                        e.stopPropagation()
                        // Implement resize logic here
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation()
                        // Implement resize logic here
                      }}
                      aria-label="Resize clip end"
                    >
                      <div className="h-6 w-0.5 bg-white/30 rounded-full" />
                    </div>
                  </div>
                ))}
                
                {/* Playhead with pulse animation when playing */}
                <div
                  className={`absolute top-0 bottom-0 w-0.5 pointer-events-none z-10 transition-colors ${
                    isPlaying ? 'bg-destructive animate-pulse' : 'bg-destructive'
                  }`}
                  style={{ 
                    left: `${(currentFrame / durationInFrames) * 100}%`,
                    boxShadow: isPlaying ? '0 0 8px 2px hsl(var(--destructive) / 0.6)' : '0 0 4px hsl(var(--destructive))'
                  }}
                  aria-hidden="true"
                />
              </div>

              {/* Add clip button */}
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 h-9 w-9 sm:h-10 sm:w-10 rounded-lg transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary touch-manipulation"
                onClick={() => addClip(track.id, { type: track.type as any })}
                aria-label={`Add ${track.type} clip`}
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Properties Panel - Collapsible on mobile */}
      {selectedClip && (
        <div className="border-t border-border/50 p-3 sm:p-4 bg-muted/10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm sm:text-base font-medium tracking-tight">Clip Properties</h3>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg text-muted-foreground hover:text-destructive transition-smooth touch-manipulation"
                onClick={() => removeClip(selectedClip.id)}
                aria-label="Delete clip"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Start Frame</Label>
              <Input
                type="number"
                value={selectedClip.start}
                onChange={(e) => {
                  const newStart = parseInt(e.target.value) || 0
                  const duration = selectedClip.end - selectedClip.start
                  updateClipProperty(selectedClip.id, {
                    start: newStart,
                    end: newStart + duration,
                  })
                }}
                className="h-9 sm:h-10 rounded-lg text-xs sm:text-sm mt-1 focus-visible:ring-primary/30 touch-manipulation"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">End Frame</Label>
              <Input
                type="number"
                value={selectedClip.end}
                onChange={(e) => {
                  const newEnd = parseInt(e.target.value) || selectedClip.start + 30
                  updateClipProperty(selectedClip.id, {
                    end: Math.max(selectedClip.start + 1, newEnd),
                  })
                }}
                className="h-9 sm:h-10 rounded-lg text-xs sm:text-sm mt-1 focus-visible:ring-primary/30 touch-manipulation"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Duration</Label>
              <Input
                type="text"
                value={`${((selectedClip.end - selectedClip.start) / 30).toFixed(1)}s`}
                disabled
                className="h-9 sm:h-10 rounded-lg text-xs sm:text-sm mt-1 bg-muted/30"
              />
            </div>
            {selectedClip.type === 'text' && (
              <div className="col-span-1 sm:col-span-3">
                <Label className="text-xs text-muted-foreground">Text Content</Label>
                <Textarea
                  value={selectedClip.content || ''}
                  onChange={(e) =>
                    updateClipProperty(selectedClip.id, { content: e.target.value })
                  }
                  className="mt-1 min-h-[80px] rounded-lg text-sm focus-visible:ring-primary/30 touch-manipulation"
                  rows={2}
                  placeholder="Enter overlay text..."
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Assistant Dialog - Full screen on mobile */}
      <Dialog open={showAIAssistant} onOpenChange={setShowAIAssistant}>
        <DialogContent className="sm:max-w-[500px] max-h-[90dvh] overflow-y-auto p-0 bg-background border-border/50">
          <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 border-b border-border/50">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg sm:text-xl">AI Auto-Edit Assistant</DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg touch-manipulation"
                onClick={() => setShowAIAssistant(false)}
                aria-label="Close AI assistant"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
            <DialogDescription className="text-xs sm:text-sm mt-1">
              Describe how you want your video edited, and AI will automatically arrange clips, add transitions, and sync with the script.
            </DialogDescription>
          </DialogHeader>

          <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-4">
            <Textarea
              placeholder="e.g., 'Fast-paced montage for the first 10 seconds, then slow down for the explanation...'"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              rows={4}
              className="min-h-[100px] rounded-lg text-sm focus-visible:ring-primary/30 touch-manipulation"
            />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="sync-script" className="text-sm">
                  Sync with script narration
                </Label>
                <Switch id="sync-script" defaultChecked className="data-[state=checked]:bg-primary touch-manipulation" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-transitions" className="text-sm">
                  Add automatic transitions
                </Label>
                <Switch id="auto-transitions" defaultChecked className="data-[state=checked]:bg-primary touch-manipulation" />
              </div>
            </div>
          </div>

          <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-2 border-t border-border/50 flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => setShowAIAssistant(false)}
              className="h-10 sm:h-11 rounded-lg text-sm font-medium transition-smooth w-full sm:w-auto touch-manipulation"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAIAutoEdit}
              disabled={isProcessingAI}
              className="h-10 sm:h-11 rounded-lg text-sm font-medium transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary w-full sm:w-auto touch-manipulation"
            >
              {isProcessingAI ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4 sm:mr-1.5" />
                  <span className="hidden sm:inline">Apply AI Edit</span>
                  <span className="sm:hidden">Apply</span>
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
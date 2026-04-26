'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Player, PlayerRef } from '@remotion/player'
import { voxaraComposition } from '@/remotion/voxaraComposition'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  Scissors,
  Type,
  Image,
  Music,
  Volume2,
  Wand2,
  Layers,
  Clock,
  Download,
  Share2,
  Plus,
  Trash2,
  Copy,
  Move,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Loader2,
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

export function AdvancedTimelineEditor({
  videoId,
}: AdvancedTimelineEditorProps) {
  const playerRef = useRef<PlayerRef>(null)
  const timelineRef = useRef<HTMLDivElement>(null)

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentFrame, setCurrentFrame] = useState(0)
  const [durationInFrames, setDurationInFrames] = useState(900) // 30 seconds at 30fps

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

      // Initialize tracks if not present
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
    const defaultTracks: TimelineTrack[] = [
      {
        id: 'video-track',
        name: 'Video',
        type: 'video',
        volume: 1,
        clips: (data.footage_urls || []).map((url: string, index: number) => ({
          id: `clip-${Date.now()}-${index}`,
          trackId: 'video-track',
          start: index * 180, // 6 seconds per clip at 30fps
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
        clips: data.audio_url
          ? [
              {
                id: `audio-${Date.now()}`,
                trackId: 'audio-track',
                start: 0,
                end: durationInFrames,
                type: 'audio' as const,
                url: data.audio_url,
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

  // Save timeline to server
  async function saveTimeline() {
    try {
      await fetch(`/api/videos/${videoId}/timeline`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tracks, durationInFrames }),
      })
      toast.success('Timeline saved')
    } catch (error) {
      toast.error('Failed to save timeline')
    }
  }

  // Playback controls
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

  function handleFrameUpdate(frame: number) {
    setCurrentFrame(frame)
  }

  // Clip operations
  function addClip(trackId: string, clipData: Partial<TimelineClip>) {
    const newClip: TimelineClip = {
      id: `clip-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      trackId,
      start: currentFrame,
      end: currentFrame + 90, // 3 seconds default
      type: 'video',
      properties: {},
      ...clipData,
    }

    setTracks((prev) =>
      prev.map((track) =>
        track.id === trackId
          ? { ...track, clips: [...track.clips, newClip] }
          : track
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
        clips: track.clips.map((c) =>
          c.id === clipId ? { ...c, ...updates } : c
        ),
      }))
    )
  }

  // AI Auto-Edit
  async function handleAIAutoEdit() {
    setIsProcessingAI(true)
    try {
      const response = await fetch('/api/ai/auto-edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script,
          footageUrls:
            tracks.find((t) => t.type === 'video')?.clips.map((c) => c.url) ||
            [],
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

  // Render video
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

  // Drag and drop handlers for timeline clips
  function handleClipMouseDown(e: React.MouseEvent, clipId: string) {
    const clip = tracks.flatMap((t) => t.clips).find((c) => c.id === clipId)
    if (!clip) return

    setIsDraggingClip(true)
    setDraggedClipId(clipId)
    setDragStartX(e.clientX)
    setDragStartFrame(clip.start)
    e.preventDefault()
  }

  useEffect(() => {
    if (!isDraggingClip || !draggedClipId) return

    function handleMouseMove(e: MouseEvent) {
      const deltaX = e.clientX - dragStartX
      const frameDelta = Math.round(
        (deltaX / (timelineRef.current?.clientWidth || 1)) *
          durationInFrames *
          zoom
      )
      const newStart = Math.max(
        0,
        Math.min(durationInFrames - 90, dragStartFrame + frameDelta)
      )

      setTracks((prev) =>
        prev.map((track) => ({
          ...track,
          clips: track.clips.map((c) => {
            if (c.id !== draggedClipId) return c
            const duration = c.end - c.start
            return {
              ...c,
              start: newStart,
              end: newStart + duration,
            }
          }),
        }))
      )
    }

    function handleMouseUp() {
      setIsDraggingClip(false)
      setDraggedClipId(null)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [
    isDraggingClip,
    draggedClipId,
    dragStartX,
    dragStartFrame,
    durationInFrames,
    zoom,
  ])

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return

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
          if (selectedClipId) {
            removeClip(selectedClipId)
          }
          break
        case 'KeyK':
          if (selectedClipId) {
            splitClip(selectedClipId)
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedClipId])

  const selectedClip = tracks
    .flatMap((t) => t.clips)
    .find((c) => c.id === selectedClipId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">Timeline Editor</h2>
          <Badge variant="outline">Draft</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={saveTimeline}>
            Save
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAIAssistant(true)}
          >
            <Wand2 className="mr-2 h-4 w-4" />
            AI Assistant
          </Button>
          <Button size="sm" onClick={handleRender}>
            <Download className="mr-2 h-4 w-4" />
            Render
          </Button>
        </div>
      </div>

      {/* Video Preview */}
      <div className="flex-1 flex items-center justify-center p-4 bg-black">
        <div className="max-w-4xl w-full aspect-video rounded-lg overflow-hidden">
          <Player
            ref={playerRef}
            component={voxaraComposition}
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
            onFrameUpdate={({ frame }) => handleFrameUpdate(frame)}
          />
        </div>
      </div>

      {/* Playback Controls */}
      <div className="border-t border-slate-800 p-4">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="icon" onClick={() => handleSeek(0)}>
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button variant="default" size="icon" onClick={togglePlayPause}>
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleSeek(durationInFrames)}
          >
            <SkipForward className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <Slider
              value={[currentFrame]}
              max={durationInFrames}
              step={1}
              onValueChange={([v]) => handleSeek(v)}
            />
          </div>
          <span className="text-sm font-mono min-w-[100px]">
            {Math.floor(currentFrame / 30)}s /{' '}
            {Math.floor(durationInFrames / 30)}s
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm min-w-[50px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setZoom((z) => Math.min(2, z + 0.25))}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Timeline Tracks */}
        <div className="space-y-1 overflow-x-auto" ref={timelineRef}>
          {tracks.map((track) => (
            <div
              key={track.id}
              className="flex items-start gap-2 min-w-[800px]"
            >
              <div className="w-32 shrink-0 flex items-center gap-1 text-sm text-slate-400 py-2">
                {track.type === 'video' && <Image className="h-4 w-4" />}
                {track.type === 'audio' && <Music className="h-4 w-4" />}
                {track.type === 'text' && <Type className="h-4 w-4" />}
                <span className="truncate">{track.name}</span>
                {track.type === 'audio' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 ml-1"
                    onClick={() =>
                      setTracks((prev) =>
                        prev.map((t) =>
                          t.id === track.id ? { ...t, muted: !t.muted } : t
                        )
                      )
                    }
                  >
                    <Volume2
                      className={`h-3 w-3 ${track.muted ? 'text-red-500' : ''}`}
                    />
                  </Button>
                )}
              </div>
              <div className="flex-1 relative h-12 bg-slate-800 rounded">
                {/* Track clips */}
                {track.clips.map((clip) => (
                  <div
                    key={clip.id}
                    className={`absolute h-full rounded cursor-pointer border ${
                      selectedClipId === clip.id
                        ? 'border-primary border-2'
                        : 'border-slate-600 hover:border-slate-400'
                    } ${isDraggingClip && draggedClipId === clip.id ? 'opacity-70' : ''}`}
                    style={{
                      left: `${(clip.start / durationInFrames) * 100}%`,
                      width: `${((clip.end - clip.start) / durationInFrames) * 100}%`,
                      backgroundColor:
                        track.type === 'video'
                          ? '#3b82f6'
                          : track.type === 'audio'
                            ? '#10b981'
                            : '#8b5cf6',
                    }}
                    onClick={() => setSelectedClipId(clip.id)}
                    onMouseDown={(e) => handleClipMouseDown(e, clip.id)}
                    onDoubleClick={() => splitClip(clip.id)}
                  >
                    <div className="px-2 text-xs truncate text-white">
                      {clip.type === 'text'
                        ? clip.content?.substring(0, 15) || 'Text'
                        : `${clip.type} ${clip.id.slice(-4)}`}
                    </div>
                    {/* Resize handles */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/20"
                      onMouseDown={(e) => {
                        e.stopPropagation()
                        // Implement resize logic here
                      }}
                    />
                    <div
                      className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/20"
                      onMouseDown={(e) => {
                        e.stopPropagation()
                        // Implement resize logic here
                      }}
                    />
                  </div>
                ))}
                {/* Playhead */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none z-10"
                  style={{
                    left: `${(currentFrame / durationInFrames) * 100}%`,
                  }}
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={() => addClip(track.id, { type: track.type as any })}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Properties Panel */}
      {selectedClip && (
        <div className="border-t border-slate-800 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Clip Properties</h3>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeClip(selectedClip.id)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-slate-400">Start Frame</Label>
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
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-slate-400">End Frame</Label>
              <Input
                type="number"
                value={selectedClip.end}
                onChange={(e) => {
                  const newEnd =
                    parseInt(e.target.value) || selectedClip.start + 30
                  updateClipProperty(selectedClip.id, {
                    end: Math.max(selectedClip.start + 1, newEnd),
                  })
                }}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-slate-400">Duration</Label>
              <Input
                type="text"
                value={`${((selectedClip.end - selectedClip.start) / 30).toFixed(1)}s`}
                disabled
                className="mt-1"
              />
            </div>
            {selectedClip.type === 'text' && (
              <div className="col-span-3">
                <Label className="text-slate-400">Text Content</Label>
                <Textarea
                  value={selectedClip.content || ''}
                  onChange={(e) =>
                    updateClipProperty(selectedClip.id, {
                      content: e.target.value,
                    })
                  }
                  className="mt-1"
                  rows={2}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Assistant Dialog */}
      <Dialog open={showAIAssistant} onOpenChange={setShowAIAssistant}>
        <DialogContent className="bg-slate-900 text-white border-slate-800">
          <DialogHeader>
            <DialogTitle>AI Auto-Edit Assistant</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-slate-400">
              Describe how you want your video edited, and AI will automatically
              arrange clips, add transitions, and sync with the script.
            </p>
            <Textarea
              placeholder="e.g., 'Fast-paced montage for the first 10 seconds, then slow down for the explanation...'"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              rows={4}
              className="bg-slate-800 border-slate-700"
            />
            <div className="flex items-center gap-2">
              <Switch id="sync-script" defaultChecked />
              <Label htmlFor="sync-script" className="text-slate-300">
                Sync with script narration
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="auto-transitions" defaultChecked />
              <Label htmlFor="auto-transitions" className="text-slate-300">
                Add automatic transitions
              </Label>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowAIAssistant(false)}>
              Cancel
            </Button>
            <Button onClick={handleAIAutoEdit} disabled={isProcessingAI}>
              {isProcessingAI ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Apply AI Edit
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

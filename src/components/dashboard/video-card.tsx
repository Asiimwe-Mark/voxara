'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Video,
  Clock,
  CheckCircle2,
  XCircle,
  Download,
  Share2,
  Trash2,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import { IconYoutube, IconInstagram, IconTiktok } from '@/lib/icons'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'

interface VideoCardProps {
  video: {
    id: string
    title: string
    status: string
    mux_playback_id: string | null
    video_url: string | null
    youtube_id: string | null
    created_at: string
  }
}

const STATUS_CONFIG = {
  ready: {
    label: 'Ready',
    className: 'bg-emerald-500/90 text-white shadow-[0_0_12px_rgba(34,197,94,0.3)]',
    icon: CheckCircle2,
  },
  processing: {
    label: 'Processing',
    className: 'bg-amber-500/90 text-white animate-[glow-pulse_2s_ease-in-out_infinite]',
    icon: Loader2,
  },
  failed: {
    label: 'Failed',
    className: 'bg-red-500/90 text-white shadow-[0_0_12px_rgba(239,68,68,0.3)]',
    icon: XCircle,
  },
  pending: {
    label: 'Pending',
    className: 'bg-muted text-muted-foreground',
    icon: Clock,
  },
} as const

export function VideoCard({ video }: VideoCardProps) {
  const router = useRouter()
  const [isDownloading, setIsDownloading] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)

  const statusKey =
    (video.status as keyof typeof STATUS_CONFIG) in STATUS_CONFIG
      ? (video.status as keyof typeof STATUS_CONFIG)
      : 'pending'
  const cfg = STATUS_CONFIG[statusKey]
  const StatusIcon = cfg.icon

  const handleDownload = async () => {
    if (!video.video_url) {
      toast.error('Video URL not available')
      return
    }
    setIsDownloading(true)
    try {
      const res = await fetch(video.video_url)
      if (!res.ok) throw new Error('Failed to fetch video')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = Object.assign(document.createElement('a'), {
        href: url,
        download: `${video.title || 'video'}.mp4`,
      })
      document.body.appendChild(a)
      a.click()
      URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Download started')
    } catch {
      toast.error('Download failed')
    } finally {
      setIsDownloading(false)
    }
  }

  const handlePublish = async (platform: string) => {
    setIsPublishing(true)
    try {
      const res = await fetch(`/api/publish/${platform}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId: video.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to publish')
      toast.success(`Published to ${platform}!`)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Publish failed')
    } finally {
      setIsPublishing(false)
    }
  }

  const handleRetry = async () => {
    setIsRetrying(true)
    try {
      const res = await fetch('/api/videos/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId: video.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Retry failed')
      toast.success('Re-queued for rendering')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Retry failed')
    } finally {
      setIsRetrying(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/videos/${video.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      toast.success('Video deleted')
      router.refresh()
    } catch {
      toast.error('Failed to delete video')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card className="overflow-hidden rounded-2xl border border-border/50 bg-card group transition-all duration-200 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30 hover:scale-[1.02]">
      {/* Thumbnail / Player */}
      <div className="aspect-video relative overflow-hidden">
        {video.status === 'ready' && video.mux_playback_id ? (
          <video
            src={
              video.video_url ??
              `https://stream.mux.com/${video.mux_playback_id}/low.mp4`
            }
            poster={`https://image.mux.com/${video.mux_playback_id}/thumbnail.jpg?time=0&width=640`}
            className="w-full h-full object-cover"
            controls
            preload="metadata"
            aria-label={`Video player for ${video.title || 'Untitled'}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-950/50 to-indigo-950/50">
            {video.status === 'processing' ? (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-primary" />
                <span className="text-xs sm:text-sm">Generating...</span>
              </div>
            ) : (
              <Video className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/40" />
            )}
          </div>
        )}

        {/* Status badge overlay */}
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
          <Badge
            className={cn(
              'text-[10px] sm:text-xs px-2 py-0.5 border-0',
              cfg.className
            )}
          >
            <StatusIcon
              className={cn(
                'mr-1 h-3 w-3',
                video.status === 'processing' && 'animate-spin'
              )}
            />
            {cfg.label}
          </Badge>
        </div>

        {/* YouTube published badge */}
        {video.youtube_id && (
          <Badge className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-red-600 hover:bg-red-700 text-white text-[10px] sm:text-xs px-2 py-0.5 border-0">
            <IconYoutube className="mr-1 h-3 w-3" />
            <span className="hidden sm:inline">YouTube</span>
            <span className="sm:hidden">YT</span>
          </Badge>
        )}
      </div>

      {/* Title + date */}
      <CardHeader className="pb-1 pt-3 px-3 sm:px-4">
        <CardTitle
          className="text-sm sm:text-base font-semibold line-clamp-2 leading-snug tracking-tight"
          title={video.title}
        >
          {video.title || 'Untitled Video'}
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1 tabular-nums">
          {new Date(video.created_at).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
      </CardHeader>

      {/* Actions */}
      <CardFooter className="p-3 pt-0 px-3 sm:px-4 flex flex-col gap-3">
        {/* Social publish row */}
        {video.status === 'ready' && (
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg transition-all duration-200 hover:bg-red-500/10 hover:text-red-500"
              onClick={() => handlePublish('youtube')}
              disabled={!!video.youtube_id || isPublishing}
              aria-label="Publish to YouTube"
            >
              <IconYoutube className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg transition-all duration-200 hover:bg-black/10 hover:text-foreground dark:hover:bg-white/10"
              onClick={() => handlePublish('tiktok')}
              disabled={isPublishing}
              aria-label="Publish to TikTok"
            >
              <IconTiktok className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg transition-all duration-200 hover:bg-pink-500/10 hover:text-pink-500"
              onClick={() => handlePublish('instagram')}
              disabled={isPublishing}
              aria-label="Publish to Instagram"
            >
              <IconInstagram className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Primary actions row */}
        <div className="flex flex-wrap items-center gap-1.5">
          {video.status === 'ready' && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-lg transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                onClick={handleDownload}
                disabled={isDownloading}
                aria-label="Download video"
              >
                {isDownloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-lg transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    disabled={isPublishing}
                    aria-label="Publish video"
                  >
                    {isPublishing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Share2 className="h-4 w-4" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem
                    onClick={() => handlePublish('youtube')}
                    disabled={!!video.youtube_id}
                    className="cursor-pointer py-2 px-3"
                  >
                    <IconYoutube className="mr-2 h-4 w-4 text-red-500" />
                    {video.youtube_id
                      ? 'Published to YouTube'
                      : 'Publish to YouTube'}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handlePublish('tiktok')}
                    className="cursor-pointer py-2 px-3"
                  >
                    <IconTiktok className="mr-2 h-4 w-4" />
                    Publish to TikTok
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handlePublish('instagram')}
                    className="cursor-pointer py-2 px-3"
                  >
                    <IconInstagram className="mr-2 h-4 w-4 text-pink-500" />
                    Publish to Instagram
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}

          {video.status === 'failed' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              disabled={isRetrying}
              className="h-9 rounded-lg text-xs transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {isRetrying ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              )}
              Retry
            </Button>
          )}

          {/* Delete button */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-smooth ml-auto"
                aria-label="Delete video"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="sm:max-w-[425px]">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-lg">Delete video?</AlertDialogTitle>
                <AlertDialogDescription className="text-sm">
                  &quot;{video.title || 'This video'}&quot; will be permanently deleted
                  along with its Mux asset and audio files. This action cannot be
                  undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-3">
                <AlertDialogCancel className="h-10 sm:h-11 rounded-lg text-sm font-medium transition-smooth">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="h-10 sm:h-11 rounded-lg text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-destructive"
                >
                  {isDeleting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardFooter>
    </Card>
  )
}

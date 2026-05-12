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
  Music2,
  MoreHorizontal,
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
  DropdownMenuSeparator,
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
    className: 'bg-emerald-500 hover:bg-emerald-600 text-white',
    icon: CheckCircle2,
  },
  processing: {
    label: 'Processing',
    className: 'bg-amber-500 hover:bg-amber-600 text-white',
    icon: Loader2,
  },
  failed: {
    label: 'Failed',
    className: 'bg-red-500 hover:bg-red-600 text-white',
    icon: XCircle,
  },
  pending: {
    label: 'Pending',
    className: 'bg-slate-500 hover:bg-slate-600 text-white',
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
    <Card className="overflow-hidden transition-shadow hover:shadow-md group">
      {/* Thumbnail / Player */}
      <div className="aspect-video bg-slate-100 dark:bg-slate-900 relative">
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
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {video.status === 'processing' ? (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="text-xs">Generating…</span>
              </div>
            ) : (
              <Video className="h-8 w-8 text-slate-300" />
            )}
          </div>
        )}
        {/* Status badge overlay */}
        <div className="absolute top-2 right-2">
          <Badge className={`text-xs ${cfg.className}`}>
            <StatusIcon
              className={`mr-1 h-3 w-3 ${video.status === 'processing' ? 'animate-spin' : ''}`}
            />
            {cfg.label}
          </Badge>
        </div>
        {video.youtube_id && (
          <Badge className="absolute top-2 left-2 bg-red-600 text-white text-xs">
            <IconYoutube className="mr-1 h-3 w-3" /> YouTube
          </Badge>
        )}
      </div>

      {/* Title + date */}
      <CardHeader className="pb-1 pt-3">
        <CardTitle
          className="text-sm font-semibold line-clamp-2 leading-snug"
          title={video.title}
        >
          {video.title || 'Untitled Video'}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {new Date(video.created_at).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
      </CardHeader>

      {/* Actions */}
      <CardFooter className="p-3 pt-0 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {video.status === 'ready' && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleDownload}
                disabled={isDownloading}
                title="Download"
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
                    className="h-8 w-8"
                    disabled={isPublishing}
                    title="Publish"
                  >
                    {isPublishing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Share2 className="h-4 w-4" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem
                    onClick={() => handlePublish('youtube')}
                    disabled={!!video.youtube_id}
                  >
                    <IconYoutube className="mr-2 h-4 w-4 text-red-500" />
                    {video.youtube_id
                      ? 'Published to YouTube'
                      : 'Publish to YouTube'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handlePublish('tiktok')}>
                    <IconTiktok className="mr-2 h-4 w-4" />
                    Publish to TikTok
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handlePublish('instagram')}>
                    <IconInstagram className="mr-2 h-4 w-4 text-pink-500" />
                    Publish to Instagram
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
          {video.status === 'failed' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRetry}
              disabled={isRetrying}
              className="h-8 text-xs"
            >
              {isRetrying ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5 mr-1" />
              )}
              Retry
            </Button>
          )}
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete video?</AlertDialogTitle>
              <AlertDialogDescription>
                "{video.title || 'This video'}" will be permanently deleted
                along with its Mux asset and audio files. This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  )
}

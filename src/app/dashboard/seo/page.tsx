'use client'

import { useState, useEffect } from 'react'
import { Loader2, Search, Video, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { SEOOptimizer } from '@/components/seo/SEOOptimizer'
import { createClient } from '@/lib/supabase/client'

interface VideoItem {
  id: string
  title: string
  description: string | null
  tags: string[] | null
  status: string
  created_at: string
}

export default function SEOPage() {
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [selectedId, setSelectedId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchVideos() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error: fetchError } = await supabase
          .from('videos')
          .select('id, title, description, tags, status, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (fetchError) throw fetchError
        setVideos(data || [])
        if (data?.length) setSelectedId(data[0].id)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load videos')
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [])

  const selectedVideo = videos.find((v) => v.id === selectedId)

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-sm text-muted-foreground">Loading videos...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full max-w-6xl space-y-6 sm:space-y-8">
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 sm:p-5 text-sm text-destructive-foreground">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span><strong>Error:</strong> {error}</span>
          </div>
        </div>
      </div>
    )
  }

  if (!videos.length) {
    return (
      <div className="w-full max-w-6xl space-y-6 sm:space-y-8">
        <div>
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">SEO Optimizer</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
            Optimize your video titles, descriptions, and tags for better discoverability
          </p>
        </div>
        <Card className="card-glow rounded-2xl border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center px-4 py-10 text-center sm:px-6 sm:py-14">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted/50 sm:mb-5 sm:h-14 sm:w-14">
              <Search className="h-5 w-5 text-muted-foreground sm:h-7 sm:w-7" />
            </div>
            <h3 className="mb-1.5 text-base font-semibold tracking-tight sm:mb-2 sm:text-lg">
              No videos yet
            </h3>
            <p className="mb-5 max-w-xs text-xs leading-relaxed text-muted-foreground sm:mb-7 sm:text-sm">
              Create a video first to use the SEO optimizer.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-6xl space-y-5 sm:space-y-7">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">SEO Optimizer</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
            Optimize your video titles, descriptions, and tags for better discoverability
          </p>
        </div>
        <div className="w-full sm:w-72">
          <Label htmlFor="video-select" className="text-xs text-muted-foreground mb-1.5 block">
            Select video
          </Label>
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger id="video-select" className="h-10 sm:h-11 rounded-lg text-sm focus:ring-2 focus:ring-primary/30">
              <div className="flex items-center gap-2 min-w-0">
                <Video className="h-4 w-4 text-muted-foreground shrink-0" />
                <SelectValue placeholder="Choose a video" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {videos.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  <span className="truncate">{v.title}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* SEO Optimizer */}
      {selectedVideo && (
        <SEOOptimizer
          videoId={selectedVideo.id}
          initialTitle={selectedVideo.title}
          initialDescription={selectedVideo.description || ''}
          initialTags={selectedVideo.tags || []}
        />
      )}
    </div>
  )
}

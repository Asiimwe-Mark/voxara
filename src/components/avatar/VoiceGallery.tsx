'use client'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Mic, Play } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VoiceItem {
  id: string
  name: string
  status: string
  created_at: string
  [key: string]: unknown
}

function WaveformBars() {
  const heights = [12, 20, 16, 24, 14, 22, 18, 26, 12, 20, 16, 24]
  return (
    <div className="flex items-end gap-[3px] h-7">
      {heights.map((h, i) => (
        <div
          key={i}
          className="w-[3px] rounded-full bg-primary/30"
          style={{ height: `${h}px` }}
        />
      ))}
    </div>
  )
}

export function VoiceGallery({ voices }: { voices: VoiceItem[] }) {
  if (!voices.length) {
    return (
      <div className="empty-state border-2 border-dashed border-border/50 rounded-xl">
        <div className="empty-state-icon">
          <Mic className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        <p className="empty-state-title">No voices yet</p>
        <p className="empty-state-description">
          Record your first voice sample to clone it.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {voices.map((voice) => (
        <Card
          key={voice.id}
          className="rounded-2xl border border-border/50 bg-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all duration-200 hover:shadow-md hover:border-primary/30 group"
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Mic className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p
                className="text-sm sm:text-base font-medium truncate"
                title={voice.name}
              >
                {voice.name}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {new Date(voice.created_at).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Waveform visualization */}
            <WaveformBars />

            {/* Preview button */}
            <button className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors duration-200">
              <Play className="h-3.5 w-3.5 ml-0.5" />
            </button>

            <Badge
              variant={voice.status === 'ready' ? 'default' : 'secondary'}
              className={cn(
                'text-xs capitalize shrink-0',
                voice.status === 'ready' && 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
              )}
            >
              {voice.status}
            </Badge>
          </div>
        </Card>
      ))}
    </div>
  )
}

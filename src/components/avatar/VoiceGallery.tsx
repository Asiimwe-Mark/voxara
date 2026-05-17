'use client'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Mic } from 'lucide-react'

interface VoiceItem {
  id: string
  name: string
  status: string
  created_at: string
  [key: string]: unknown
}

export function VoiceGallery({ voices }: { voices: VoiceItem[] }) {
  if (!voices.length) {
    return (
      <div className="empty-state border-2 border-dashed border-border/50 rounded-xl">
        <div className="empty-state-icon">
          <Mic className="h-full w-full" />
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
          className="card-premium p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-smooth hover:shadow-md"
        >
          <div className="min-w-0 flex-1">
            <p 
              className="text-sm sm:text-base font-medium truncate" 
              title={voice.name}
            >
              {voice.name}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Created {new Date(voice.created_at).toLocaleDateString(undefined, { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </p>
          </div>
          <Badge
            variant={voice.status === 'ready' ? 'default' : 'secondary'}
            className="text-xs capitalize shrink-0"
          >
            {voice.status}
          </Badge>
        </Card>
      ))}
    </div>
  )
}
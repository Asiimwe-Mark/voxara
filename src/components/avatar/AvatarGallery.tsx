'use client'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Loader2, User } from 'lucide-react'

interface AvatarItem {
  id: string
  name: string
  status: string
  image_url: string | null
  [key: string]: unknown
}

export function AvatarGallery({ avatars }: { avatars: AvatarItem[] }) {
  if (!avatars.length) {
    return (
      <div className="empty-state border-2 border-dashed border-border/50 rounded-xl">
        <div className="empty-state-icon">
          <User className="h-full w-full" />
        </div>
        <p className="empty-state-title">No avatars yet</p>
        <p className="empty-state-description">
          Create your first AI avatar to get started.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
      {avatars.map((avatar) => (
        <Card 
          key={avatar.id} 
          className="card-premium overflow-hidden group transition-smooth hover:shadow-md"
        >
          <div className="aspect-square bg-muted/30 dark:bg-muted/10 flex items-center justify-center relative">
            {avatar.image_url ? (
              <img
                src={avatar.image_url}
                alt={avatar.name}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <User className="h-12 w-12 text-muted-foreground/50" />
            )}
          </div>
          <div className="p-3 sm:p-4">
            <p 
              className="text-sm sm:text-base font-medium truncate" 
              title={avatar.name}
            >
              {avatar.name}
            </p>
            <Badge
              variant={avatar.status === 'ready' ? 'default' : 'secondary'}
              className="mt-2 text-xs capitalize"
            >
              {avatar.status === 'processing' && (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              )}
              {avatar.status}
            </Badge>
          </div>
        </Card>
      ))}
    </div>
  )
}
'use client'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Loader2, User } from 'lucide-react'
import { cn } from '@/lib/utils'

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
          <User className="h-5 w-5 sm:h-6 sm:w-6" />
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
          className="overflow-hidden group rounded-2xl border border-border/50 bg-card transition-all duration-200 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30 hover:scale-[1.02]"
        >
          <div className="aspect-square bg-gradient-to-br from-violet-950/30 to-indigo-950/30 flex items-center justify-center relative overflow-hidden">
            {avatar.image_url ? (
              <img
                src={avatar.image_url}
                alt={avatar.name}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <User className="h-12 w-12 text-muted-foreground/40" />
            )}

            {/* Status indicator dot */}
            <div className="absolute bottom-2 right-2">
              <span className={cn(
                'relative flex h-2.5 w-2.5',
                avatar.status === 'ready' && 'text-emerald-500',
                avatar.status === 'processing' && 'text-amber-500'
              )}>
                {avatar.status === 'processing' && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                )}
                <span className={cn(
                  'relative inline-flex rounded-full h-2.5 w-2.5',
                  avatar.status === 'ready' ? 'bg-emerald-500' : 'bg-amber-500'
                )} />
              </span>
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <span className="text-white text-xs font-medium px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm">
                View Avatar
              </span>
            </div>
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
              className={cn(
                'mt-2 text-xs capitalize',
                avatar.status === 'ready' && 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
              )}
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

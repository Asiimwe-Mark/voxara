'use client';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Loader2, User } from 'lucide-react';

export function AvatarGallery({ avatars }: { avatars: any[] }) {
  if (!avatars.length) {
    return <Card className="p-8 text-center text-muted-foreground"><User className="h-8 w-8 mx-auto mb-2" />No avatars yet</Card>;
  }
  return (
    <div className="grid grid-cols-2 gap-3">
      {avatars.map((avatar) => (
        <Card key={avatar.id} className="overflow-hidden">
          <div className="aspect-square bg-slate-200 flex items-center justify-center">
            {avatar.image_url ? (
              <img src={avatar.image_url} alt={avatar.name} className="w-full h-full object-cover" />
            ) : (
              <User className="h-12 w-12 text-muted-foreground" />
            )}
          </div>
          <div className="p-3">
            <p className="font-medium truncate">{avatar.name}</p>
            <Badge variant={avatar.status === 'ready' ? 'default' : 'secondary'} className="mt-1">
              {avatar.status === 'processing' && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
              {avatar.status}
            </Badge>
          </div>
        </Card>
      ))}
    </div>
  );
}
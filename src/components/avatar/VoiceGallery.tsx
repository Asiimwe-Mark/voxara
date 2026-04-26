'use client';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Mic } from 'lucide-react';

export function VoiceGallery({ voices }: { voices: Array<Record<string, unknown>> }) {
  if (!voices.length) {
    return <Card className="p-8 text-center text-muted-foreground"><Mic className="h-8 w-8 mx-auto mb-2" />No voices yet</Card>;
  }
  return (
    <div className="space-y-2">
      {voices.map((voice) => (
        <Card key={voice.id} className="p-4 flex items-center justify-between">
          <div>
            <p className="font-medium">{voice.name}</p>
            <p className="text-xs text-muted-foreground">Created {new Date(voice.created_at).toLocaleDateString()}</p>
          </div>
          <Badge variant={voice.status === 'ready' ? 'default' : 'secondary'}>{voice.status}</Badge>
        </Card>
      ))}
    </div>
  );
}
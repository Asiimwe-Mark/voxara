'use client';

import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { Mic, Upload, Loader2, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export function VoiceCloner({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/mp3' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch {
      toast.error('Microphone access denied');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current?.stream.getTracks().forEach(t => t.stop());
    setIsRecording(false);
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;
    isPlaying ? audioRef.current.pause() : audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const uploadAudio = async (): Promise<string> => {
    if (!audioBlob) throw new Error('No audio recorded');
    const formData = new FormData();
    formData.append('file', audioBlob, 'sample.mp3');
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json();
    return data.url;
  };

  const handleCreate = async () => {
    if (!name) { toast.error('Please enter a name'); return; }
    if (!audioBlob) { toast.error('Please record a voice sample'); return; }
    setIsCreating(true);
    try {
      const audioUrl = await uploadAudio();
      const res = await fetch('/api/voice/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, audioUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Voice clone created!');
      setOpen(false);
      setName('');
      setAudioBlob(null);
      setAudioUrl(null);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Mic className="mr-2 h-4 w-4" />Clone Voice</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Clone Your Voice</DialogTitle>
          <DialogDescription>Record a 30‑second sample to create an AI voice clone.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Voice Name</Label>
            <Input placeholder="e.g., My Voice" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>Voice Sample</Label>
            <div className="border-2 border-dashed rounded-lg p-4 text-center">
              {!audioBlob ? (
                <>
                  <Mic className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <Button variant={isRecording ? 'destructive' : 'default'} onClick={isRecording ? stopRecording : startRecording}>
                    {isRecording ? 'Stop Recording' : 'Start Recording'}
                  </Button>
                </>
              ) : (
                <>
                  <audio ref={audioRef} src={audioUrl!} onEnded={() => setIsPlaying(false)} />
                  <Button variant="outline" onClick={togglePlayback}>
                    {isPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                    {isPlaying ? 'Pause' : 'Play Sample'}
                  </Button>
                  <Button variant="ghost" className="mt-2" onClick={() => { setAudioBlob(null); setAudioUrl(null); }}>
                    Record Again
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={isCreating}>
            {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Create Voice Clone
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
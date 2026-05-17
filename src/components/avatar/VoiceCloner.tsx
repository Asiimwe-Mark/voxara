'use client'

import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { Mic, Loader2, Play, Pause } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export function VoiceCloner({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks: BlobPart[] = []
      recorder.ondataavailable = (e) => chunks.push(e.data)
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/mp3' })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
      }
      recorder.start()
      mediaRecorderRef.current = recorder
      setIsRecording(true)
    } catch {
      toast.error('Microphone access denied')
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    mediaRecorderRef.current?.stream.getTracks().forEach(t => t.stop())
    setIsRecording(false)
  }

  const togglePlayback = () => {
    if (!audioRef.current) return
    isPlaying ? audioRef.current.pause() : audioRef.current.play()
    setIsPlaying(!isPlaying)
  }

  const uploadAudio = async (): Promise<string> => {
    if (!audioBlob) throw new Error('No audio recorded')
    const formData = new FormData()
    formData.append('file', audioBlob, 'sample.mp3')
    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    const data = await res.json()
    return data.url
  }

  const handleCreate = async () => {
    if (!name) { toast.error('Please enter a name'); return }
    if (!audioBlob) { toast.error('Please record a voice sample'); return }
    setIsCreating(true)
    try {
      const audioUrl = await uploadAudio()
      const res = await fetch('/api/voice/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, audioUrl }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Voice clone created!')
      setOpen(false)
      setName('')
      setAudioBlob(null)
      setAudioUrl(null)
      onSuccess?.()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-10 sm:h-11 rounded-xl text-sm font-medium transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          <Mic className="mr-2 h-4 w-4" />
          Clone Voice
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden max-h-[90dvh] flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-0 shrink-0">
          <DialogTitle className="text-xl">Clone Your Voice</DialogTitle>
          <DialogDescription className="text-sm">
            Record a 30‑second sample to create an AI voice clone.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Voice Name */}
          <div className="space-y-2">
            <Label htmlFor="voice-name" className="text-sm font-medium">
              Voice Name
            </Label>
            <Input
              id="voice-name"
              placeholder="e.g., My Voice"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 rounded-lg text-sm focus-visible:ring-primary/30"
            />
          </div>

          {/* Voice Sample Area */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Voice Sample</Label>
            <div className="relative border-2 border-dashed rounded-xl p-4 text-center transition-smooth bg-muted/30 hover:bg-muted/40 border-border/80">
              <audio ref={audioRef} src={audioUrl || ''} className="hidden" onEnded={() => setIsPlaying(false)} />

              {!audioBlob ? (
                <div className="py-4 flex flex-col items-center gap-3">
                  <div className="h-14 w-14 rounded-full bg-background/50 flex items-center justify-center">
                    <Mic className={`h-6 w-6 ${isRecording ? 'text-red-500 animate-pulse' : 'text-muted-foreground'}`} />
                  </div>
                  <Button
                    variant={isRecording ? 'destructive' : 'default'}
                    onClick={isRecording ? stopRecording : startRecording}
                    className="h-10 sm:h-11 rounded-xl w-full sm:w-auto min-w-[180px] transition-smooth"
                  >
                    {isRecording ? 'Stop Recording' : 'Start Recording'}
                  </Button>
                  {isRecording && (
                    <p className="text-xs text-red-500 animate-pulse">Recording in progress...</p>
                  )}
                </div>
              ) : (
                <div className="py-4 flex flex-col items-center gap-3">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <p className="text-sm font-medium">Sample Ready</p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={togglePlayback} 
                    className="h-10 sm:h-11 rounded-xl w-full sm:w-auto"
                  >
                    {isPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                    {isPlaying ? 'Pause' : 'Play Sample'}
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => { setAudioBlob(null); setAudioUrl(null); }} 
                    className="h-9 text-sm hover:bg-muted/50 transition-smooth"
                  >
                    Record Again
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 pb-6 pt-2 shrink-0 flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="h-10 sm:h-11 rounded-xl w-full sm:w-auto text-sm font-medium transition-smooth"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={isCreating || !name || !audioBlob}
            className="h-10 sm:h-11 rounded-xl w-full sm:w-auto text-sm font-medium transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50"
          >
            {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Voice Clone
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
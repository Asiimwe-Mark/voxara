'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  Loader2,
  Video,
  User,
  Wand2,
  Sparkles,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TopicForm, TopicFormValues } from '@/components/video/TopicForm'
import { ScriptEditor, ScriptFormValues } from '@/components/video/ScriptEditor'
import { ProgressTracker } from '@/components/video/ProgressTracker'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface Avatar {
  id: string
  name: string
  status: string
}
interface Voice {
  id: string
  name: string
  voice_id: string
  status: string
}

const STEPS = ['topic', 'script', 'generating'] as const
type Step = (typeof STEPS)[number]

export default function CreatePage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<Step>('topic')
  const [videoType, setVideoType] = useState<'faceless' | 'avatar'>('faceless')
  const [avatars, setAvatars] = useState<Avatar[]>([])
  const [voices, setVoices] = useState<Voice[]>([])
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null)
  const [selectedVoiceId, setSelectedVoiceId] = useState<string | null>(null)
  const [loadingOptions, setLoadingOptions] = useState(false)
  const [currentTopic, setCurrentTopic] = useState('')
  const [generatedScript, setGeneratedScript] = useState('')
  const [isGeneratingScript, setIsGeneratingScript] = useState(false)
  const [isCreatingVideo, setIsCreatingVideo] = useState(false)

  useEffect(() => {
    if (videoType !== 'avatar') return
    setLoadingOptions(true)
    Promise.all([fetch('/api/avatar/list'), fetch('/api/voice/list')])
      .then(async ([avatarsRes, voicesRes]) => {
        if (avatarsRes.ok) {
          const d = await avatarsRes.json()
          setAvatars(
            d.avatars?.filter((a: Avatar) => a.status === 'ready') ?? []
          )
        }
        if (voicesRes.ok) {
          const d = await voicesRes.json()
          setVoices(d.voices?.filter((v: Voice) => v.status === 'ready') ?? [])
        }
      })
      .catch(() => toast.error('Failed to load AI Studio options'))
      .finally(() => setLoadingOptions(false))
  }, [videoType])

  async function handleTopicSubmit(values: TopicFormValues) {
    setIsGeneratingScript(true)
    setCurrentTopic(values.topic)
    try {
      const response = await fetch('/api/ai/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: values.topic,
          tone: values.tone,
          duration: values.duration,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        if (response.status === 402) {
          toast.error('You have no credits left. Please purchase more.', {
            action: {
              label: 'Buy Credits',
              onClick: () => router.push('/dashboard/billing'),
            },
          })
          return
        }
        throw new Error(data.error || 'Failed to generate script')
      }
      setGeneratedScript(data.script)
      setStep('script')
      toast.success('Script generated!')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to generate script'
      )
    } finally {
      setIsGeneratingScript(false)
    }
  }

  async function handleScriptSubmit(values: ScriptFormValues) {
    if (videoType === 'avatar' && !selectedAvatarId) {
      toast.error('Please select an avatar')
      return
    }
    setIsCreatingVideo(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: video, error: insertError } = await supabase
        .from('videos')
        .insert({
          user_id: user.id,
          title: currentTopic,
          script: values.script,
          status: 'pending',
          avatar_id: videoType === 'avatar' ? selectedAvatarId : null,
          voice_id: videoType === 'avatar' ? selectedVoiceId : null,
        })
        .select('id')
        .single()

      if (insertError || !video)
        throw insertError ?? new Error('Failed to create video record')

      const renderRes = await fetch('/api/videos/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId: video.id }),
      })
      if (!renderRes.ok) {
        const renderData = await renderRes.json()
        throw new Error(renderData.error || 'Failed to start rendering')
      }

      setStep('generating')
      toast.success("Video is being created! We'll notify you when it's ready.")
      setTimeout(() => router.push('/dashboard'), 2500)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to start generation'
      )
      setIsCreatingVideo(false)
    }
  }

  return (
    <div className="min-h-screen w-full">
      {/* ── Page shell: centers content with safe side padding on every breakpoint ── */}
      <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-0 py-4 sm:py-6 space-y-4 sm:space-y-6">

        {/* ── Header ── */}
        <div className="flex items-start gap-3">
          {/* Back button: visible on script step to give mobile users a clear escape */}
          {step === 'script' && (
            <button
              onClick={() => { setStep('topic'); setGeneratedScript('') }}
              className="mt-0.5 shrink-0 flex items-center justify-center h-8 w-8 rounded-lg border border-border/60 bg-muted/20 hover:bg-muted/50 transition-colors"
              aria-label="Back to topic"
            >
              <ArrowLeft className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight truncate">
              Create New Video
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 leading-snug">
              {step === 'topic'
                ? 'Generate a faceless video or produce one with your AI avatar'
                : step === 'script'
                ? 'Review and edit your AI-generated script'
                : 'Sit tight while your video is being produced'}
            </p>
          </div>
        </div>

        {/* ── Progress tracker ── */}
        <ProgressTracker currentStep={step} />

        {/* ════════════════════════════════
            STEP 1 — Topic & video type
        ════════════════════════════════ */}
        {step === 'topic' && (
          <div className="space-y-4 sm:space-y-5">

            {/* Video Style card */}
            <Card className="card-premium overflow-hidden">
              <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-5 pb-3">
                <CardTitle className="text-sm sm:text-base font-semibold">
                  Video Style
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  How should your video be produced?
                </CardDescription>
              </CardHeader>

              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4 sm:space-y-5">
                {/* Type toggle — full-width columns on all sizes */}
                <RadioGroup
                  value={videoType}
                  onValueChange={(v) => setVideoType(v as 'faceless' | 'avatar')}
                  className="grid grid-cols-2 gap-2.5 sm:gap-3"
                >
                  {(
                    [
                      {
                        value: 'faceless',
                        icon: Video,
                        label: 'Faceless',
                        desc: 'Stock footage + voiceover',
                      },
                      {
                        value: 'avatar',
                        icon: User,
                        label: 'AI Avatar',
                        desc: 'Your digital presenter',
                      },
                    ] as const
                  ).map(({ value, icon: Icon, label, desc }) => (
                    <div key={value} className="relative">
                      <RadioGroupItem
                        value={value}
                        id={value}
                        className="sr-only"
                      />
                      <Label
                        htmlFor={value}
                        className={cn(
                          // Base: flex column, centered, smooth border
                          'relative flex flex-col items-center gap-2 rounded-xl border-2 p-3.5 sm:p-5 cursor-pointer select-none transition-all duration-200',
                          // Focus ring for keyboard nav
                          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                          videoType === value
                            ? 'border-primary bg-primary/5 shadow-sm'
                            : 'border-border/50 hover:border-primary/40 hover:bg-muted/30'
                        )}
                      >
                        {/* Selected checkmark — absolute so it doesn't displace content */}
                        {videoType === value && (
                          <CheckCircle2 className="absolute top-2.5 right-2.5 h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                        )}

                        <Icon
                          className={cn(
                            'h-5 w-5 sm:h-6 sm:w-6 shrink-0',
                            videoType === value
                              ? 'text-primary'
                              : 'text-muted-foreground'
                          )}
                        />
                        <div className="text-center min-w-0 w-full">
                          <p className="text-xs sm:text-sm font-medium leading-tight">
                            {label}
                          </p>
                          {/* desc hidden on very small screens to avoid wrapping */}
                          <p className="hidden xs:block text-[10px] sm:text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {desc}
                          </p>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                {/* Avatar / Voice selectors — animate in */}
                {videoType === 'avatar' && (
                  <div className="space-y-3.5 sm:space-y-4 border-t border-border/50 pt-4 sm:pt-5 animate-in fade-in slide-in-from-top-2 duration-200">

                    {/* Avatar Select */}
                    <div className="space-y-1.5">
                      <Label className="text-xs sm:text-sm font-medium">
                        Select Avatar
                      </Label>

                      {loadingOptions ? (
                        <div className="flex items-center gap-2.5 h-10 sm:h-11 px-3 border border-border/60 rounded-lg bg-muted/10 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                          <span className="text-xs sm:text-sm">Loading avatars…</span>
                        </div>
                      ) : avatars.length === 0 ? (
                        <div className="flex flex-wrap items-center gap-x-1 text-xs sm:text-sm text-muted-foreground">
                          <span>No ready avatars.</span>
                          <Link
                            href="/dashboard/ai-studio"
                            className="underline text-primary hover:text-primary/80 transition-colors whitespace-nowrap"
                          >
                            Create one in AI Studio →
                          </Link>
                        </div>
                      ) : (
                        <Select
                          value={selectedAvatarId ?? ''}
                          onValueChange={setSelectedAvatarId}
                        >
                          <SelectTrigger className="h-10 sm:h-11 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-primary/30">
                            <SelectValue placeholder="Choose an avatar" />
                          </SelectTrigger>
                          <SelectContent>
                            {avatars.map((a) => (
                              <SelectItem key={a.id} value={a.id}>
                                {a.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>

                    {/* Voice Select */}
                    <div className="space-y-1.5">
                      <Label className="text-xs sm:text-sm font-medium">
                        Voice{' '}
                        <span className="text-muted-foreground font-normal">
                          (optional)
                        </span>
                      </Label>

                      {voices.length === 0 ? (
                        <div className="flex flex-wrap items-center gap-x-1 text-xs sm:text-sm text-muted-foreground">
                          <span>No cloned voices.</span>
                          <Link
                            href="/dashboard/ai-studio"
                            className="underline text-primary hover:text-primary/80 transition-colors whitespace-nowrap"
                          >
                            Clone your voice →
                          </Link>
                        </div>
                      ) : (
                        <Select
                          value={selectedVoiceId ?? '__default__'}
                          onValueChange={(v) =>
                            setSelectedVoiceId(v === '__default__' ? null : v)
                          }
                        >
                          <SelectTrigger className="h-10 sm:h-11 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-primary/30">
                            <SelectValue placeholder="Use default AI voice" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__default__">
                              Default AI Voice
                            </SelectItem>
                            {voices.map((v) => (
                              <SelectItem key={v.id} value={v.voice_id}>
                                {v.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Topic Entry card */}
            <Card className="card-premium overflow-hidden">
              <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-5 pb-3">
                <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
                  <Wand2 className="h-4 w-4 shrink-0 text-primary" />
                  What's your video about?
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Enter a topic and our AI will write an engaging script instantly.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                <TopicForm
                  onSubmit={handleTopicSubmit}
                  isGenerating={isGeneratingScript}
                  defaultTopic={currentTopic}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* ════════════════════════════════
            STEP 2 — Script editor
        ════════════════════════════════ */}
        {step === 'script' && (
          <Card className="card-premium overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
            <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-5 pb-3">
              <CardTitle className="text-sm sm:text-base font-semibold">
                Review &amp; Edit Script
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Tweak the AI-generated script before we produce the video.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              <ScriptEditor
                initialScript={generatedScript}
                onSubmit={handleScriptSubmit}
                onRegenerate={() => {
                  setStep('topic')
                  setGeneratedScript('')
                }}
                isSubmitting={isCreatingVideo}
              />
            </CardContent>
          </Card>
        )}

        {/* ════════════════════════════════
            STEP 3 — Generating state
        ════════════════════════════════ */}
        {step === 'generating' && (
          <Card className="card-premium border-primary/30 bg-primary/5 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <CardContent className="flex flex-col items-center justify-center py-14 sm:py-20 px-6 text-center">
              {/* Animated icon ring */}
              <div className="relative mb-5 sm:mb-6">
                {/* Outer pulsing ring */}
                <span className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
                <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
                  <Sparkles className="h-7 w-7 sm:h-9 sm:w-9 text-primary animate-pulse" />
                </div>
              </div>

              <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-2 tracking-tight">
                Your video is being created!
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-xs leading-relaxed">
                We're generating the script, voiceover, and footage. This
                usually takes 2–5 minutes.
              </p>

              {/* Subtle progress dots */}
              <div className="flex items-center gap-1.5 mt-6">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>

              <p className="text-[10px] sm:text-xs text-muted-foreground/60 mt-4">
                Redirecting to dashboard…
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
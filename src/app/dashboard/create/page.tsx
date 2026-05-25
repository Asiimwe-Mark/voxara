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

const GENERATING_STAGES = [
  'Crafting your script...',
  'Generating voiceover...',
  'Assembling footage...',
]

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
  const [generatingStage, setGeneratingStage] = useState(0)

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

  // Cycle through generating stages
  useEffect(() => {
    if (step !== 'generating') return
    const interval = setInterval(() => {
      setGeneratingStage((prev) => (prev + 1) % GENERATING_STAGES.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [step])

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
    <div className="w-full">
      <div className="w-full px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">

        {/* ── Header ── */}
        <div className="flex items-start gap-3">
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
            <Card className="card-glow rounded-2xl overflow-hidden">
              <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-5 pb-3">
                <CardTitle className="text-sm sm:text-base font-semibold">
                  Video Style
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  How should your video be produced?
                </CardDescription>
              </CardHeader>

              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4 sm:space-y-5">
                <RadioGroup
                  value={videoType}
                  onValueChange={(v) => setVideoType(v as 'faceless' | 'avatar')}
                  className="grid grid-cols-2 gap-3 sm:gap-4"
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
                          'relative flex flex-col items-center gap-3 rounded-2xl border-2 p-5 sm:p-6 md:p-8 cursor-pointer select-none transition-all duration-200',
                          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                          videoType === value
                            ? 'border-primary shadow-lg shadow-primary/20 bg-gradient-to-b from-primary/5 to-transparent'
                            : 'border-border/50 hover:border-primary/40 hover:bg-muted/30'
                        )}
                      >
                        {videoType === value && (
                          <CheckCircle2 className="absolute top-3 right-3 h-4 w-4 text-primary" />
                        )}

                        {/* Abstract visual area */}
                        <div className={cn(
                          'h-12 w-12 sm:h-14 sm:w-14 rounded-xl flex items-center justify-center transition-all duration-200',
                          videoType === value
                            ? 'bg-primary/10'
                            : 'bg-muted/50'
                        )}>
                          <Icon
                            className={cn(
                              'h-6 w-6 sm:h-7 sm:w-7 transition-colors duration-200',
                              videoType === value ? 'text-primary' : 'text-muted-foreground'
                            )}
                          />
                        </div>

                        <div className="text-center min-w-0 w-full">
                          <p className="text-sm sm:text-base font-medium leading-tight">
                            {label}
                          </p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 line-clamp-1">
                            {desc}
                          </p>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                {/* Avatar / Voice selectors */}
                {videoType === 'avatar' && (
                  <div className="space-y-3.5 sm:space-y-4 border-t border-border/50 pt-4 sm:pt-5 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="space-y-1.5">
                      <Label className="text-xs sm:text-sm font-medium">
                        Select Avatar
                      </Label>

                      {loadingOptions ? (
                        <div className="flex items-center gap-2.5 h-10 sm:h-11 px-3 border border-border/60 rounded-lg bg-muted/10 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                          <span className="text-xs sm:text-sm">Loading avatars...</span>
                        </div>
                      ) : avatars.length === 0 ? (
                        <div className="flex flex-wrap items-center gap-x-1 text-xs sm:text-sm text-muted-foreground">
                          <span>No ready avatars.</span>
                          <Link
                            href="/dashboard/ai-studio"
                            className="underline text-primary hover:text-primary/80 transition-colors whitespace-nowrap"
                          >
                            Create one in AI Studio
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
                            Clone your voice
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
            <Card className="card-glow rounded-2xl overflow-hidden">
              <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-5 pb-3">
                <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
                  <Wand2 className="h-4 w-4 shrink-0 text-primary" />
                  What&apos;s your video about?
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
          <Card className="card-glow rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
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
          <div className="flex flex-col items-center justify-center py-14 sm:py-20 px-6 text-center rounded-2xl border border-primary/20 bg-[radial-gradient(ellipse_at_center,_hsl(258_84%_62%_/_0.1)_0%,_transparent_70%)] relative overflow-hidden">
            {/* Orbital rings */}
            <div className="relative mb-8">
              {/* Outer orbital ring */}
              <div className="absolute inset-0 -m-10 sm:-m-14">
                <div className="absolute inset-0 rounded-full border border-primary/10" />
                <div className="absolute inset-0 rounded-full border border-transparent border-t-primary/30 animate-[orbit_5s_linear_infinite]" />
              </div>

              {/* Middle orbital ring */}
              <div className="absolute inset-0 -m-5 sm:-m-8">
                <div className="absolute inset-0 rounded-full border border-primary/10" />
                <div className="absolute inset-0 rounded-full border border-transparent border-t-primary/40 animate-[orbit_3s_linear_infinite_reverse]" />
              </div>

              {/* Inner orbital ring */}
              <div className="absolute inset-0 -m-1">
                <div className="absolute inset-0 rounded-full border border-primary/15" />
                <div className="absolute inset-0 rounded-full border border-transparent border-t-primary/50 animate-[orbit_1.5s_linear_infinite]" />
              </div>

              {/* Center icon */}
              <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-primary/10 flex items-center justify-center ring-1 ring-primary/20 shadow-[0_0_40px_rgba(139,92,246,0.2)]">
                <Sparkles className="h-7 w-7 sm:h-9 sm:w-9 text-primary animate-[glow-pulse_2s_ease-in-out_infinite]" />
              </div>
            </div>

            <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-2 tracking-tight">
              Your video is being created!
            </h3>

            {/* Fading stage text */}
            <p
              key={generatingStage}
              className="text-xs sm:text-sm text-muted-foreground max-w-xs leading-relaxed animate-[fadeIn_400ms_ease-out]"
            >
              {GENERATING_STAGES[generatingStage]}
            </p>

            <p className="text-[10px] sm:text-xs text-muted-foreground/60 mt-6">
              Redirecting to dashboard...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

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

  // Only load avatar/voice options when user selects avatar mode
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

      // Insert video record directly via Supabase client
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

      // Trigger render via dedicated endpoint
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
    <div className="mx-auto w-full max-w-2xl space-y-4 sm:space-y-6 px-0">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
          Create New Video
        </h2>
        <p className="text-muted-foreground text-xs sm:text-sm mt-1 sm:mt-0.5">
          Generate a faceless video or produce one with your AI avatar
        </p>
      </div>

      <ProgressTracker currentStep={step} />

      {step === 'topic' && (
        <>
          {/* Video type selector */}
          <Card>
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-sm sm:text-base">
                Video Style
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                How should your video be produced?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={videoType}
                onValueChange={(v) => setVideoType(v as 'faceless' | 'avatar')}
                className="grid grid-cols-2 gap-2 sm:gap-3"
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
                  <div key={value}>
                    <RadioGroupItem
                      value={value}
                      id={value}
                      className="sr-only"
                    />
                    <Label
                      htmlFor={value}
                      className={cn(
                        'flex flex-col items-center gap-1.5 sm:gap-2 rounded-lg border-2 p-3 sm:p-4 cursor-pointer transition-all',
                        videoType === value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/40'
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-5 sm:h-6 w-5 sm:w-6',
                          videoType === value
                            ? 'text-primary'
                            : 'text-muted-foreground'
                        )}
                      />
                      <div className="text-center">
                        <p className="text-xs sm:text-sm font-medium">
                          {label}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {desc}
                        </p>
                      </div>
                      {videoType === value && (
                        <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                      )}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              {videoType === 'avatar' && (
                <div className="mt-3 sm:mt-5 space-y-3 sm:space-y-4 border-t pt-3 sm:pt-4">
                  <div>
                    <Label className="text-xs sm:text-sm font-medium">
                      Select Avatar
                    </Label>
                    {loadingOptions ? (
                      <div className="flex items-center gap-2 h-9 sm:h-10 px-3 border rounded-md mt-1.5 text-xs sm:text-sm text-muted-foreground">
                        <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />{' '}
                        <span className="hidden xs:inline">
                          Loading avatars…
                        </span>
                        <span className="xs:hidden">Loading…</span>
                      </div>
                    ) : avatars.length === 0 ? (
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1.5">
                        No ready avatars.{' '}
                        <Link
                          href="/dashboard/ai-studio"
                          className="underline text-primary text-xs sm:text-sm"
                        >
                          Create one in AI Studio →
                        </Link>
                      </p>
                    ) : (
                      <Select
                        value={selectedAvatarId ?? ''}
                        onValueChange={setSelectedAvatarId}
                      >
                        <SelectTrigger className="mt-1.5 text-xs sm:text-sm h-9 sm:h-10">
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
                  <div>
                    <Label className="text-xs sm:text-sm font-medium">
                      Voice{' '}
                      <span className="text-muted-foreground font-normal">
                        (optional)
                      </span>
                    </Label>
                    {voices.length === 0 ? (
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1.5">
                        No cloned voices.{' '}
                        <Link
                          href="/dashboard/ai-studio"
                          className="underline text-primary text-xs sm:text-sm"
                        >
                          Clone your voice →
                        </Link>
                      </p>
                    ) : (
                      <Select
                        value={selectedVoiceId ?? '__default__'}
                        onValueChange={(v) =>
                          setSelectedVoiceId(v === '__default__' ? null : v)
                        }
                      >
                        <SelectTrigger className="mt-1.5 text-xs sm:text-sm h-9 sm:h-10">
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

          {/* Topic entry */}
          <Card>
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <Wand2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                What's your video about?
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Enter a topic and our AI will write an engaging script
                instantly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TopicForm
                onSubmit={handleTopicSubmit}
                isGenerating={isGeneratingScript}
                defaultTopic={currentTopic}
              />
            </CardContent>
          </Card>
        </>
      )}

      {step === 'script' && (
        <Card>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-sm sm:text-base">
              Review & Edit Script
            </CardTitle>
            <CardDescription>
              Tweak the AI-generated script before we produce the video.
            </CardDescription>
          </CardHeader>
          <CardContent>
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

      {step === 'generating' && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex flex-col items-center py-16 text-center">
            <div className="relative mb-6">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-primary animate-pulse" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Your video is being created!
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              We're generating the script, voiceover, and footage. This usually
              takes 2–5 minutes.
            </p>
            <p className="text-xs text-muted-foreground mt-4">
              Redirecting to dashboard…
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

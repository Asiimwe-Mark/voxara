"use client"

import { useMemo, useCallback } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Wand2, Loader2, Sparkles, AlertCircle, Keyboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

const topicSchema = z.object({
  topic: z
    .string()
    .min(3, "Topic must be at least 3 characters")
    .max(200, "Topic too long"),
  tone: z.enum(["casual", "professional", "enthusiastic"]),
  duration: z.enum(["short", "medium", "long"]),
})

export type TopicFormValues = z.infer<typeof topicSchema>

interface TopicFormProps {
  onSubmit: (values: TopicFormValues) => Promise<void>
  isGenerating: boolean
  defaultTopic?: string
}

export function TopicForm({ onSubmit, isGenerating, defaultTopic = "" }: TopicFormProps) {
  const form = useForm<TopicFormValues>({
    resolver: zodResolver(topicSchema),
    defaultValues: { 
      topic: defaultTopic, 
      tone: "casual" as const, 
      duration: "medium" as const 
    },
    mode: "onChange", // Pro Tip: Real-time validation
  })

  // Pro Tip: Real-time character count with thresholds
  const topicValue = form.watch("topic")
  const charCount = topicValue.length
  const charThreshold = 200 * 0.85
  const isNearLimit = charCount > charThreshold

  // Pro Tip: Keyboard shortcuts handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    // Ctrl/Cmd + Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && !isGenerating && form.formState.isValid) {
      e.preventDefault()
      form.handleSubmit(onSubmit)()
    }
  }, [isGenerating, form, onSubmit])

  // Pro Tip: Example topics for inspiration
  const exampleTopics = useMemo(() => [
    "5 morning habits that changed my life",
    "How AI is transforming creative work in 2024",
    "The psychology behind viral short-form content",
  ], [])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
        {/* Topic Input */}
        <FormField
          control={form.control}
          name="topic"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <FormLabel className="text-sm font-medium flex items-center gap-2">
                  Video Topic
                  <Badge variant="outline" className="text-[10px] hidden sm:inline-flex">
                    <Keyboard className="h-3 w-3 mr-1" />
                    Ctrl+Enter to submit
                  </Badge>
                </FormLabel>
                <span className={`text-xs tabular-nums font-medium ${
                  isNearLimit ? "text-amber-500" : "text-muted-foreground"
                }`}>
                  {charCount} / 200
                </span>
              </div>
              <FormControl>
                <Input
                  placeholder="e.g., 5 morning habits that changed my life"
                  disabled={isGenerating}
                  onKeyDown={handleKeyDown}
                  className={`h-10 sm:h-11 rounded-lg text-sm focus-visible:ring-primary/30 ${
                    isNearLimit ? "ring-1 ring-amber-500/30" : ""
                  }`}
                  maxLength={200}
                  aria-describedby="topic-help topic-error"
                  {...field}
                />
              </FormControl>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <FormDescription id="topic-help" className="text-xs text-muted-foreground">
                  Be specific — the more detail, the better the script.
                </FormDescription>
                {isNearLimit && (
                  <Badge variant="outline" className="text-[10px] text-amber-600 dark:text-amber-400 border-amber-300/50">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Near limit
                  </Badge>
                )}
              </div>
              <FormMessage id="topic-error" className="text-xs" />
            </FormItem>
          )}
        />

        {/* Tone & Duration Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Tone Select */}
          <FormField
            control={form.control}
            name="tone"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-sm font-medium">Tone</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value} 
                  disabled={isGenerating}
                >
                  <FormControl>
                    <SelectTrigger className="h-10 sm:h-11 rounded-lg text-sm focus:ring-2 focus:ring-primary/30">
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription className="text-[10px] text-muted-foreground hidden sm:block">
                  Affects pacing, word choice, and energy
                </FormDescription>
              </FormItem>
            )}
          />

          {/* Duration Select */}
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-sm font-medium">Duration</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value} 
                  disabled={isGenerating}
                >
                  <FormControl>
                    <SelectTrigger className="h-10 sm:h-11 rounded-lg text-sm focus:ring-2 focus:ring-primary/30">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="short">Short (~30s)</SelectItem>
                    <SelectItem value="medium">Medium (~60s)</SelectItem>
                    <SelectItem value="long">Long (~90s)</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription className="text-[10px] text-muted-foreground hidden sm:block">
                  Approximate final video length
                </FormDescription>
              </FormItem>
            )}
          />
        </div>

        {/* Example Topics (Mobile-First) */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" />
            Need inspiration?
          </p>
          <div className="flex flex-wrap gap-2">
            {exampleTopics.map((example, i) => (
              <button
                key={i}
                type="button"
                onClick={() => form.setValue("topic", example, { shouldDirty: true, shouldValidate: true })}
                disabled={isGenerating}
                className="text-[10px] sm:text-xs px-2.5 py-1.5 rounded-lg bg-muted/50 hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed truncate max-w-[180px] sm:max-w-none"
                aria-label={`Use example: ${example}`}
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <Button 
          type="submit" 
          disabled={isGenerating || !form.formState.isValid}
          className="h-11 sm:h-12 w-full rounded-xl text-sm sm:text-base font-medium transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Script…
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              Generate Script
            </>
          )}
        </Button>

        {/* Keyboard Shortcuts Help (Desktop Only) */}
        <div className="hidden sm:flex items-center justify-center gap-4 pt-1 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border/50 font-mono">Ctrl</kbd>+
            <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border/50 font-mono">Enter</kbd>
            <span className="ml-1">Submit</span>
          </span>
        </div>
      </form>
    </Form>
  )
}
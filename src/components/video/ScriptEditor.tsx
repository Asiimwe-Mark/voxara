"use client"

import { useEffect, useCallback, useMemo } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { RefreshCw, Send, Loader2, Keyboard, AlertCircle, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const scriptSchema = z.object({
  script: z
    .string()
    .min(50, "Script must be at least 50 characters")
    .max(5000, "Script is too long"),
})

export type ScriptFormValues = z.infer<typeof scriptSchema>

interface ScriptEditorProps {
  initialScript: string
  onSubmit: (values: ScriptFormValues) => Promise<void>
  onRegenerate: () => void
  isSubmitting: boolean
}

export function ScriptEditor({
  initialScript,
  onSubmit,
  onRegenerate,
  isSubmitting,
}: ScriptEditorProps) {
  const form = useForm<ScriptFormValues>({
    resolver: zodResolver(scriptSchema),
    defaultValues: { script: initialScript },
    mode: "onChange", // Pro Tip: Real-time validation
  })

  // Sync if parent updates the script (e.g., after re-generation)
  useEffect(() => {
    form.setValue("script", initialScript, { shouldDirty: false, shouldValidate: false })
  }, [initialScript, form])

  // Pro Tip: Real-time character/word count with thresholds
  const scriptValue = form.watch("script")
  const charCount = scriptValue.length
  const wordCount = useMemo(() => {
    return scriptValue.trim() ? scriptValue.trim().split(/\s+/).length : 0
  }, [scriptValue])
  
  const charThreshold = 5000 * 0.9
  const isNearLimit = charCount > charThreshold
  const isOverLimit = charCount > 5000

  // Pro Tip: Keyboard shortcuts handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl/Cmd + Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && !isSubmitting && form.formState.isValid) {
      e.preventDefault()
      form.handleSubmit(onSubmit)()
    }
    // Escape to blur/focus management
    if (e.key === "Escape") {
      e.currentTarget.blur()
    }
  }, [isSubmitting, form, onSubmit])

  // Pro Tip: Copy script to clipboard
  const copyScript = useCallback(() => {
    if (!scriptValue.trim()) return
    navigator.clipboard.writeText(scriptValue).then(() => {
      toast.success("Script copied to clipboard")
    })
  }, [scriptValue])

  // Pro Tip: Clear form helper
  const clearScript = useCallback(() => {
    form.setValue("script", "", { shouldDirty: true, shouldValidate: true })
    toast.info("Script cleared")
  }, [form])

  function cn(arg0: string, arg1: string | boolean): string {
    if (typeof arg1 === "string" && arg1.trim().length > 0) {
      return `${arg0} ${arg1}`.trim()
    }

    return arg0
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
        <FormField
          control={form.control}
          name="script"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <FormLabel className="text-sm font-medium flex items-center gap-2">
                  Script
                  <Badge variant="outline" className="text-[10px] hidden sm:inline-flex">
                    <Keyboard className="h-3 w-3 mr-1" />
                    Ctrl+Enter to submit
                  </Badge>
                </FormLabel>
                <div className="flex items-center gap-2">
                  <span className={`text-xs tabular-nums font-medium ${
                    isOverLimit ? "text-destructive" : isNearLimit ? "text-amber-500" : "text-muted-foreground"
                  }`}>
                    {charCount.toLocaleString()} / 5,000
                  </span>
                  <button
                    type="button"
                    onClick={copyScript}
                    disabled={!scriptValue.trim()}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                    aria-label="Copy script to clipboard"
                  >
                    Copy
                  </button>
                  <button
                    type="button"
                    onClick={clearScript}
                    disabled={!scriptValue.trim() || isSubmitting}
                    className="text-xs text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                    aria-label="Clear script"
                  >
                    Clear
                  </button>
                </div>
              </div>
              
              <FormControl>
                <div className="relative">
                  <Textarea
                    rows={10}
                    className="min-h-[180px] sm:min-h-[220px] resize-y rounded-xl text-sm leading-relaxed font-mono focus-visible:ring-primary/30 pr-16"
                    placeholder="Your script will appear here… Edit freely, then click Create Video."
                    disabled={isSubmitting}
                    onKeyDown={handleKeyDown}
                    aria-describedby="script-help script-error"
                    {...field}
                  />
                  
                  {/* Word count badge */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-1.5 pointer-events-none">
                    <Badge variant="secondary" className="text-[10px] bg-muted/50">
                      {wordCount} words
                    </Badge>
                  </div>
                </div>
              </FormControl>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <FormDescription id="script-help" className="text-xs text-muted-foreground">
                  Pro tip: Use natural language — our AI handles pacing and emphasis.
                </FormDescription>
                {isNearLimit && !isOverLimit && (
                  <Badge variant="outline" className="text-[10px] text-amber-600 dark:text-amber-400 border-amber-300/50">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Near limit
                  </Badge>
                )}
              </div>
              <FormMessage id="script-error" className="text-xs" />
            </FormItem>
          )}
        />

        <Separator className="bg-border/50" />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onRegenerate}
            disabled={isSubmitting}
            className="h-10 sm:h-11 rounded-xl text-sm font-medium transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary flex-1 sm:flex-none w-full sm:w-auto disabled:opacity-50"
          >
            <RefreshCw className={cn("mr-2 h-4 w-4", isSubmitting && "animate-spin")} />
            Regenerate
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid || isOverLimit}
            className="h-10 sm:h-11 rounded-xl text-sm font-medium transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary flex-1 sm:flex-none w-full sm:w-auto disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Video…
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Create Video
              </>
            )}
          </Button>
        </div>

        {/* Keyboard Shortcuts Help */}
        <div className="hidden sm:flex items-center justify-center gap-4 pt-2 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border/50 font-mono">Ctrl</kbd>+
            <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border/50 font-mono">Enter</kbd>
            <span className="ml-1">Submit</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border/50 font-mono">Esc</kbd>
            <span className="ml-1">Blur editor</span>
          </span>
        </div>
      </form>
    </Form>
  )
}
"use client"

import { useState, useMemo, useCallback } from "react"
import { toast } from "sonner"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Search,
  TrendingUp,
  Lightbulb,
  Copy,
  Check,
  Sparkles,
  Target,
  Zap,
  Loader2,
  ArrowRight,
  Monitor,
  Smartphone,
} from "lucide-react"

interface SEOAnalysis {
  title: {
    current: string
    score: number
    suggestions: string[]
  }
  description: {
    current: string
    score: number
    suggestions: string[]
  }
  tags: {
    current: string[]
    score: number
    suggestions: string[]
  }
  keywords: {
    primary: string[]
    secondary: string[]
    longTail: string[]
  }
  overallScore: number
  competitorInsights?: string[]
}

interface SEOOptimizerProps {
  videoId: string
  initialTitle: string
  initialDescription?: string
  initialTags?: string[]
}

export function SEOOptimizer({
  videoId,
  initialTitle,
  initialDescription = "",
  initialTags = [],
}: SEOOptimizerProps) {
  const [analysis, setAnalysis] = useState<SEOAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop")
  
  // Local editable metadata
  const [title, setTitle] = useState(initialTitle)
  const [description, setDescription] = useState(initialDescription)
  const [tags, setTags] = useState(initialTags.join(", "))

  // Pro Tip: Platform-specific limits with real-time tracking
  const TITLE_LIMIT = 100
  const DESC_LIMIT = 5000
  const titleCount = title.length
  const descCount = description.length
  const titleOver = titleCount > TITLE_LIMIT
  const descOver = descCount > DESC_LIMIT

  // Pro Tip: Keyword matching to highlight already-used tags
  const currentTagsSet = useMemo(() => {
    return new Set(tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean))
  }, [tags])

  // Pro Tip: Derived validation state
  const canAnalyze = title.trim().length > 0
  const scoreColor = useCallback((score: number) => {
    if (score >= 80) return "text-emerald-500 dark:text-emerald-400"
    if (score >= 60) return "text-amber-500 dark:text-amber-400"
    return "text-destructive"
  }, [])

  const progressColor = useCallback((score: number) => {
    if (score >= 80) return "[&>div]:bg-emerald-500"
    if (score >= 60) return "[&>div]:bg-amber-500"
    return "[&>div]:bg-destructive"
  }, [])

  async function handleAnalyze() {
    setIsAnalyzing(true)
    try {
      const response = await fetch("/api/seo/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId,
          action: "analyze",
          title,
          description,
          tags: tags.split(",").map((t) => t.trim()),
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setAnalysis(data.analysis)
      toast.success("SEO analysis complete!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to analyze SEO")
    } finally {
      setIsAnalyzing(false)
    }
  }

  async function handleGenerate() {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/seo/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId, action: "generate" }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      setTitle(data.metadata.title)
      setDescription(data.metadata.description)
      setTags(data.metadata.tags.join(", "))
      toast.success("AI-optimized metadata applied!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate")
    } finally {
      setIsGenerating(false)
    }
  }

  // Pro Tip: Quick-apply handlers
  const applyTitle = useCallback((s: string) => {
    setTitle(s)
    toast.success("Title updated")
  }, [])

  const applyTags = useCallback((s: string[]) => {
    setTags(s.join(", "))
    toast.success("Tags updated")
  }, [])

  // Pro Tip: Bulk copy all metadata
  const copyAllMetadata = useCallback(() => {
    const text = `Title: ${title}\n\nDescription: ${description}\n\nTags: ${tags}`
    navigator.clipboard.writeText(text)
    toast.success("All metadata copied to clipboard")
  }, [title, description, tags])

  return (
    <Card className="card-premium w-full">
      <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2.5 text-lg sm:text-xl tracking-tight">
              <Search className="h-5 w-5 text-primary" />
              AI SEO Optimizer
            </CardTitle>
            <CardDescription className="text-sm sm:text-base mt-1.5">
              Optimize your video metadata for maximum discoverability
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={copyAllMetadata}
            disabled={!title && !description && !tags}
            className="h-9 sm:h-10 rounded-lg text-xs sm:text-sm font-medium transition-smooth w-full sm:w-auto"
          >
            <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy All
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-5 sm:space-y-6">
        {/* Editable Metadata Inputs (Always Visible) */}
        <div className="grid gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="seo-title" className="text-sm font-medium">Video Title</Label>
              <span className={`text-xs tabular-nums font-medium ${titleCount > TITLE_LIMIT * 0.9 ? "text-amber-500" : "text-muted-foreground"}`}>
                {titleCount}/{TITLE_LIMIT}
              </span>
            </div>
            <Input
              id="seo-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a compelling, keyword-rich title..."
              className={`h-10 sm:h-11 rounded-lg text-sm focus-visible:ring-primary/30 ${titleOver ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
              maxLength={TITLE_LIMIT}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="seo-desc" className="text-sm font-medium">Description</Label>
              <span className={`text-xs tabular-nums font-medium ${descCount > DESC_LIMIT * 0.9 ? "text-amber-500" : "text-muted-foreground"}`}>
                {descCount}/{DESC_LIMIT}
              </span>
            </div>
            <Textarea
              id="seo-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add timestamps, links, and keyword-rich context..."
              className="min-h-[100px] sm:min-h-[120px] rounded-lg text-sm resize-y focus-visible:ring-primary/30"
              maxLength={DESC_LIMIT}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seo-tags" className="text-sm font-medium">Tags (comma separated)</Label>
            <Input
              id="seo-tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., ai video, tutorial, viral shorts"
              className="h-10 sm:h-11 rounded-lg text-sm focus-visible:ring-primary/30"
            />
          </div>
        </div>

        <Separator />

        {!analysis ? (
          <div className="text-center py-8 sm:py-10">
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2 tracking-tight">
              Analyze Your SEO
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-5 max-w-sm mx-auto leading-relaxed">
              Get AI-powered recommendations to improve search ranking and visibility across platforms.
            </p>
            <Button 
              onClick={handleAnalyze} 
              disabled={isAnalyzing || !canAnalyze}
              className="h-11 sm:h-12 rounded-xl text-sm sm:text-base font-medium transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50"
            >
              {isAnalyzing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isAnalyzing ? "Analyzing..." : "Start Analysis"}
            </Button>
          </div>
        ) : (
          <>
            {/* Overall Score & Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-xl bg-muted/30 border border-border/50">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className={`text-3xl sm:text-5xl font-bold tabular-nums ${scoreColor(analysis.overallScore)}`}>
                  {analysis.overallScore}
                </div>
                <div className="min-w-0 flex-1 sm:flex-none">
                  <p className="text-sm sm:text-base font-semibold tracking-tight">Overall SEO Score</p>
                  <Progress value={analysis.overallScore} className={`h-2 mt-2 w-full sm:w-32 ${progressColor(analysis.overallScore)}`} />
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {analysis.overallScore >= 80 ? "Excellent! Ready to publish" : analysis.overallScore >= 60 ? "Good, can improve" : "Needs optimization"}
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={handleGenerate} 
                disabled={isGenerating}
                className="h-10 sm:h-11 rounded-lg text-xs sm:text-sm font-medium transition-smooth w-full sm:w-auto shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                {isGenerating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Generate Metadata
              </Button>
            </div>

            {/* Component Tabs */}
            <Tabs defaultValue="title" className="w-full">
              <TabsList className="grid w-full grid-cols-3 h-10 sm:h-11 rounded-lg">
                {["title", "description", "tags"].map((tab) => (
                  <TabsTrigger key={tab} value={tab} className="text-[11px] sm:text-sm capitalize data-[state=active]:bg-background gap-1 sm:gap-1.5">
                    <span className="truncate">{tab}</span>
                    <Badge variant="secondary" className="text-[9px] sm:text-[10px] h-3.5 sm:h-4 px-1 sm:px-1.5">
                      {(analysis as any)[tab].score}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="title" className="pt-4 space-y-3 focus:outline-none">
                <div>
                  <Label className="text-xs sm:text-sm font-medium">AI Suggested Titles</Label>
                  <div className="space-y-2 mt-3">
                    {analysis.title.suggestions.map((suggestion, i) => (
                      <div key={i} className="flex items-center justify-between gap-3 p-3 sm:p-3.5 bg-muted/30 rounded-lg border border-border/50 hover:bg-muted/50 transition-smooth">
                        <span className="text-sm sm:text-base leading-relaxed flex-1 break-words">
                          {suggestion}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Button variant="ghost" size="sm" className="h-8 w-8 sm:h-9 sm:w-9 rounded-md hover:bg-primary/10 hover:text-primary transition-smooth" onClick={() => applyTitle(suggestion)} aria-label="Apply title">
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 sm:h-9 sm:w-9 rounded-md transition-smooth" onClick={() => {
                            navigator.clipboard.writeText(suggestion)
                            setCopied(`title-${i}`)
                            toast.success("Copied!")
                            setTimeout(() => setCopied(null), 2000)
                          }} aria-label="Copy title">
                            {copied === `title-${i}` ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="description" className="pt-4 space-y-3 focus:outline-none">
                <div>
                  <Label className="text-xs sm:text-sm font-medium">Current Description</Label>
                  <Textarea value={analysis.description.current} readOnly className="mt-1.5 h-24 resize-none rounded-lg text-sm focus-visible:ring-primary/30 bg-muted/50 border-border/50" />
                </div>
                <div>
                  <Label className="flex items-center gap-2 text-xs sm:text-sm font-medium">
                    <Lightbulb className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500" />
                    Improvement Suggestions
                  </Label>
                  <ul className="mt-2 space-y-2">
                    {analysis.description.suggestions.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="tags" className="pt-4 space-y-3 focus:outline-none">
                <div>
                  <Label className="text-xs sm:text-sm font-medium">Current Tags</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {analysis.tags.current.map((tag, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs sm:text-sm font-medium">Recommended Tags</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {analysis.tags.suggestions.map((tag, i) => (
                      <Badge 
                        key={i} 
                        className={`text-xs border transition-colors cursor-pointer ${
                          currentTagsSet.has(tag.toLowerCase()) 
                            ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 line-through" 
                            : "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                        }`}
                        onClick={() => applyTags([...analysis.tags.suggestions.slice(0, i + 1)])}
                        aria-label={currentTagsSet.has(tag.toLowerCase()) ? "Already added" : "Click to add tag"}
                      >
                        {currentTagsSet.has(tag.toLowerCase()) ? "✓ " : "+ "}{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Keywords Section */}
            <div className="border-t border-border/50 pt-4">
              <Label className="flex items-center gap-2 mb-3 text-xs sm:text-sm font-medium tracking-tight">
                <Target className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                Keyword Opportunities
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {[
                  { key: "primary", label: "Primary" },
                  { key: "secondary", label: "Secondary" },
                  { key: "longTail", label: "Long-Tail" },
                ].map(({ key, label }) => (
                  <div key={key} className="space-y-2">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(analysis.keywords as any)[key].map((k: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs bg-muted/50 hover:bg-muted/80 transition-colors cursor-default">
                          {k}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Competitor Insights */}
            {analysis.competitorInsights && analysis.competitorInsights.length > 0 && (
              <div className="border-t border-border/50 pt-4">
                <Label className="flex items-center gap-2 mb-3 text-xs sm:text-sm font-medium tracking-tight">
                  <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500" />
                  Competitor Insights
                </Label>
                <ul className="space-y-2">
                  {analysis.competitorInsights.map((insight, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Live Preview (Pro Tip) */}
            <div className="border-t border-border/50 pt-4 mt-4">
              <div className="flex items-center justify-between mb-3">
                <Label className="flex items-center gap-2 text-xs sm:text-sm font-medium tracking-tight">
                  <Monitor className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Search Preview
                </Label>
                <div className="flex bg-muted/50 rounded-lg p-0.5">
                  <Button variant="ghost" size="sm" className={`h-8 sm:h-7 px-2.5 sm:px-2 text-xs rounded-md touch-manipulation ${previewMode === "desktop" ? "bg-background shadow-sm" : ""}`} onClick={() => setPreviewMode("desktop")}>
                    <Monitor className="h-3.5 w-3.5 mr-1" /> Desktop
                  </Button>
                  <Button variant="ghost" size="sm" className={`h-8 sm:h-7 px-2.5 sm:px-2 text-xs rounded-md touch-manipulation ${previewMode === "mobile" ? "bg-background shadow-sm" : ""}`} onClick={() => setPreviewMode("mobile")}>
                    <Smartphone className="h-3.5 w-3.5 mr-1" /> Mobile
                  </Button>
                </div>
              </div>
              <div className={`mx-auto rounded-xl border border-border/50 bg-white dark:bg-zinc-950 p-4 transition-all duration-300 ${previewMode === "mobile" ? "max-w-[320px]" : "max-w-2xl"}`}>
                <h3 className={`font-medium text-blue-800 dark:text-blue-400 hover:underline cursor-pointer truncate ${previewMode === "mobile" ? "text-sm" : "text-lg"}`}>
                  {title || "Your Video Title"}
                </h3>
                <p className={`text-green-700 dark:text-green-400 mt-0.5 truncate ${previewMode === "mobile" ? "text-xs" : "text-sm"}`}>
                  youtube.com/watch?v={videoId}
                </p>
                <p className={`text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-2 ${previewMode === "mobile" ? "text-xs" : "text-sm"}`}>
                  {description || "Your video description will appear here. Make sure to include relevant keywords and a call to action."}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {tags.split(",").slice(0, previewMode === "mobile" ? 2 : 4).map((t, i) => t.trim() ? (
                    <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">#{t.trim().replace(/\s+/g, "_")}</span>
                  ) : null)}
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
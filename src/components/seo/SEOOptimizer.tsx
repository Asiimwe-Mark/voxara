"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
} from "lucide-react";

interface SEOAnalysis {
  title: {
    current: string;
    score: number;
    suggestions: string[];
  };
  description: {
    current: string;
    score: number;
    suggestions: string[];
  };
  tags: {
    current: string[];
    score: number;
    suggestions: string[];
  };
  keywords: {
    primary: string[];
    secondary: string[];
    longTail: string[];
  };
  overallScore: number;
  competitorInsights?: string[];
}

interface SEOOptimizerProps {
  videoId: string;
  initialTitle: string;
  initialDescription?: string;
  initialTags?: string[];
}

export function SEOOptimizer({
  videoId,
  initialTitle,
  initialDescription = "",
  initialTags = [],
}: SEOOptimizerProps) {
  const [analysis, setAnalysis] = useState<SEOAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [tags, setTags] = useState(initialTags.join(", "));

  async function handleAnalyze() {
    setIsAnalyzing(true);
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
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setAnalysis(data.analysis);
      toast.success("SEO analysis complete!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to analyze SEO");
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function handleGenerate() {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/seo/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId, action: "generate" }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setTitle(data.metadata.title);
      setDescription(data.metadata.description);
      setTags(data.metadata.tags.join(", "));
      toast.success("AI-optimized metadata generated!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate");
    } finally {
      setIsGenerating(false);
    }
  }

  function getScoreColor(score: number): string {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  }

  function getScoreBg(score: number): string {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          AI SEO Optimizer
        </CardTitle>
        <CardDescription>
          Optimize your video title, description, and tags for maximum discoverability
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!analysis ? (
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">Analyze Your SEO</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get AI-powered recommendations to improve your video's search ranking
            </p>
            <Button onClick={handleAnalyze} disabled={isAnalyzing}>
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Start Analysis"
              )}
            </Button>
          </div>
        ) : (
          <>
            {/* Overall Score */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`text-3xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                  {analysis.overallScore}
                </div>
                <div>
                  <p className="font-medium">Overall SEO Score</p>
                  <p className="text-sm text-muted-foreground">
                    {analysis.overallScore >= 80
                      ? "Excellent!"
                      : analysis.overallScore >= 60
                      ? "Good, can improve"
                      : "Needs optimization"}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Generate Metadata
              </Button>
            </div>

            {/* Component Scores */}
            <Tabs defaultValue="title">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="title">
                  Title ({analysis.title.score})
                </TabsTrigger>
                <TabsTrigger value="description">
                  Description ({analysis.description.score})
                </TabsTrigger>
                <TabsTrigger value="tags">
                  Tags ({analysis.tags.score})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="title" className="space-y-3 pt-4">
                <div>
                  <Label>Current Title</Label>
                  <p className="p-3 bg-slate-100 dark:bg-slate-800 rounded text-sm">
                    {analysis.title.current}
                  </p>
                </div>
                <div>
                  <Label className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Suggested Titles
                  </Label>
                  <div className="space-y-2 mt-2">
                    {analysis.title.suggestions.map((suggestion, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-900 rounded"
                      >
                        <span className="text-sm">{suggestion}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(suggestion);
                            setCopied(`title-${i}`);
                            toast.success("Copied!");
                            setTimeout(() => setCopied(null), 2000);
                          }}
                        >
                          {copied === `title-${i}` ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="description" className="space-y-3 pt-4">
                <div>
                  <Label>Current Description</Label>
                  <Textarea
                    value={analysis.description.current}
                    readOnly
                    className="h-24 resize-none"
                  />
                </div>
                <div>
                  <Label>Improvement Suggestions</Label>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mt-2">
                    {analysis.description.suggestions.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="tags" className="space-y-3 pt-4">
                <div>
                  <Label>Current Tags</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {analysis.tags.current.map((tag, i) => (
                      <Badge key={i} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Recommended Tags</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {analysis.tags.suggestions.map((tag, i) => (
                      <Badge key={i} className="bg-green-500">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Keywords */}
            <div className="border-t pt-4">
              <Label className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4" />
                Keyword Opportunities
              </Label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs font-medium mb-1">Primary</p>
                  {analysis.keywords.primary.map((k, i) => (
                    <Badge key={i} variant="outline" className="mr-1 mb-1">
                      {k}
                    </Badge>
                  ))}
                </div>
                <div>
                  <p className="text-xs font-medium mb-1">Secondary</p>
                  {analysis.keywords.secondary.slice(0, 5).map((k, i) => (
                    <Badge key={i} variant="outline" className="mr-1 mb-1">
                      {k}
                    </Badge>
                  ))}
                </div>
                <div>
                  <p className="text-xs font-medium mb-1">Long-Tail</p>
                  {analysis.keywords.longTail.map((k, i) => (
                    <Badge key={i} variant="outline" className="mr-1 mb-1">
                      {k}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Competitor Insights */}
            {analysis.competitorInsights && analysis.competitorInsights.length > 0 && (
              <div className="border-t pt-4">
                <Label className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  Competitor Insights
                </Label>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {analysis.competitorInsights.map((insight, i) => (
                    <li key={i}>{insight}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
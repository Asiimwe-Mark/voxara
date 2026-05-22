"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Star, Download, ShoppingCart, Eye, Loader2, RefreshCw } from "lucide-react"

interface Template {
  id: string
  name: string
  description: string | null
  category: string | null
  price: number
  preview_url: string | null
  downloads: number
  rating: number | null
  creator?: { full_name: string; avatar_url: string | null }
}

interface Props {
  userId?: string
  userCredits?: number
  userPlan?: string
}

export function TemplateMarketplace({ userId }: Props) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [purchasingId, setPurchasingId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [sortBy, setSortBy] = useState<"popular" | "newest" | "price_low" | "price_high">("popular")
  const router = useRouter()

  // Video intersection observer for lazy play
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map())
  const observer = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    observer.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement
          if (entry.isIntersecting) {
            video.setAttribute("preload", "auto")
            video.play().catch(() => {})
          } else {
            video.pause()
            video.currentTime = 0
          }
        })
      },
      { threshold: 0.5, rootMargin: "50px" }
    )
    return () => observer.current?.disconnect()
  }, [])

  const loadTemplates = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        category: category === "all" ? "" : category,
        sort: sortBy,
        search,
      })
      const res = await fetch(`/api/marketplace/templates?${params}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setTemplates(data.templates ?? [])
    } catch {
      toast.error("Failed to load templates")
    } finally {
      setIsLoading(false)
    }
  }, [category, sortBy, search])

  useEffect(() => {
    loadTemplates()
  }, [loadTemplates])

  // Re-observe videos when templates change
  useEffect(() => {
    if (!observer.current) return
    videoRefs.current.forEach((vid) => observer.current!.observe(vid))
    return () => {
      videoRefs.current.forEach((vid) => observer.current!.unobserve(vid))
    }
  }, [templates])

  function handleVideoRef(id: string, el: HTMLVideoElement | null) {
    if (el) {
      videoRefs.current.set(id, el)
    } else {
      videoRefs.current.delete(id)
    }
  }

  async function handlePurchase(template: Template) {
    if (!userId) {
      router.push("/login")
      return
    }
    setPurchasingId(template.id)
    try {
      const res = await fetch("/api/marketplace/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: template.id }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Purchase failed")
        return
      }
      if (data.url) window.location.href = data.url
      else {
        toast.success("Template downloaded!")
        loadTemplates()
      }
    } catch {
      toast.error("Failed to process purchase")
    } finally {
      setPurchasingId(null)
    }
  }

  // Locale-aware price formatting
  const fmt = useCallback((cents: number) => {
    if (cents === 0) return "Free"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(cents / 100)
  }, [])

  // Reset filters helper
  const resetFilters = useCallback(() => {
    setSearch("")
    setCategory("all")
    setSortBy("popular")
  }, [])

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Sticky Filters */}
      <div className="sticky top-16 sm:top-20 z-20 -mx-3 sm:-mx-6 px-3 sm:px-6 py-3 sm:py-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/50">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search templates..."
              className="pl-10 h-10 sm:h-11 rounded-lg text-sm focus-visible:ring-primary/30"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadTemplates()}
              aria-label="Search templates"
            />
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:contents">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-10 sm:h-11 w-full sm:w-44 rounded-lg text-sm focus:ring-2 focus:ring-primary/30">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {["all", "educational", "marketing", "entertainment", "business", "social"].map((c) => (
                  <SelectItem key={c} value={c}>
                    {c === "all" ? "All Categories" : c.charAt(0).toUpperCase() + c.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="h-10 sm:h-11 w-full sm:w-48 rounded-lg text-sm focus:ring-2 focus:ring-primary/30">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price_low">Price: Low → High</SelectItem>
                <SelectItem value="price_high">Price: High → Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="card-glow rounded-2xl overflow-hidden">
              <Skeleton className="aspect-video w-full rounded-none" />
              <CardContent className="p-4 sm:p-5 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <div className="flex gap-4 pt-1">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </CardContent>
              <CardFooter className="p-4 sm:p-5 pt-0 border-t border-border/50 flex justify-between">
                <Skeleton className="h-5 w-14" />
                <Skeleton className="h-9 w-20 rounded-lg" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="empty-state border-2 border-dashed border-border/50 rounded-xl">
          <div className="empty-state-icon">
            <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <p className="empty-state-title">No templates found</p>
          <p className="empty-state-description">
            Try adjusting your search or filters to find what you're looking for.
          </p>
          {(search || category !== "all" || sortBy !== "popular") && (
            <Button
              variant="outline"
              onClick={resetFilters}
              className="mt-4 h-10 w-full rounded-lg text-sm font-medium sm:w-auto"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {templates.map((t) => (
            <Card
              key={t.id}
              className="card-glow rounded-2xl overflow-hidden group flex flex-col transition-smooth hover:shadow-md"
            >
              {/* Preview */}
              <div className="aspect-video bg-muted/30 dark:bg-muted/10 relative overflow-hidden flex-shrink-0">
                {t.preview_url ? (
                  <video
                    ref={(el) => handleVideoRef(t.id, el)}
                    src={t.preview_url}
                    className="w-full h-full object-cover transition-opacity duration-300 group-hover:scale-105"
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    aria-label={`Preview for ${t.name}`}
                    onError={(e) => {
                      // Fallback if video fails to load
                      const target = e.currentTarget
                      target.style.display = "none"
                      const placeholder = target.parentElement?.querySelector(".video-fallback")
                      if (placeholder) (placeholder as HTMLElement).style.display = "flex"
                    }}
                  />
                ) : null}
                
                {/* Fallback icon */}
                <div className="video-fallback absolute inset-0 hidden items-center justify-center bg-muted/20">
                  <Eye className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground/50" />
                </div>

                {t.category && (
                  <Badge className="absolute top-2 right-2 text-[10px] sm:text-xs px-1.5 py-0.5 capitalize shadow-sm">
                    {t.category}
                  </Badge>
                )}
                
                {/* Play overlay for touch devices */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <CardContent className="p-4 sm:p-5 flex-1">
                <h3 className="font-semibold text-sm sm:text-base truncate mb-1 tracking-tight" title={t.name}>
                  {t.name}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                  {t.description ?? "No description"}
                </p>
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                  {t.rating !== null && (
                    <span className="flex items-center gap-1 tabular-nums">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {t.rating.toFixed(1)}
                    </span>
                  )}
                  <span className="flex items-center gap-1 tabular-nums">
                    <Download className="h-3.5 w-3.5" />
                    {t.downloads.toLocaleString()}
                  </span>
                </div>
              </CardContent>

              {/* Footer */}
              <CardFooter className="p-4 sm:p-5 pt-0 flex items-center justify-between border-t border-border/50">
                <span className="text-base sm:text-lg font-bold tracking-tight tabular-nums">
                  {fmt(t.price)}
                </span>
                <Button
                  size="sm"
                  onClick={() => handlePurchase(t)}
                  disabled={purchasingId === t.id}
                  className="h-9 sm:h-10 rounded-lg text-xs sm:text-sm font-medium transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50"
                >
                  {purchasingId === t.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4 sm:mr-1.5" />
                      <span className="hidden sm:inline">{t.price === 0 ? "Download" : "Buy"}</span>
                      <span className="sm:hidden">{t.price === 0 ? "Get" : "Buy"}</span>
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
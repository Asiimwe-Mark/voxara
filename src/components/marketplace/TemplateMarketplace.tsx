"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Star, Download, ShoppingCart, Eye, Loader2 } from "lucide-react";

interface Template {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  price: number;
  preview_url: string | null;
  downloads: number;
  rating: number | null;
  creator?: { full_name: string; avatar_url: string | null };
}

interface Props {
  userId?: string;
  userCredits?: number;
  userPlan?: string;
}

export function TemplateMarketplace({ userId }: Props) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"popular" | "newest" | "price_low" | "price_high">("popular");
  const router = useRouter();

  const loadTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        category: category === "all" ? "" : category,
        sort: sortBy,
        search,
      });
      const res = await fetch(`/api/marketplace/templates?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTemplates(data.templates ?? []);
    } catch {
      toast.error("Failed to load templates");
    } finally {
      setIsLoading(false);
    }
  }, [category, sortBy, search]);

  useEffect(() => { loadTemplates(); }, [category, sortBy]);

  async function handlePurchase(template: Template) {
    if (!userId) { router.push("/login"); return; }
    setPurchasingId(template.id);
    try {
      const res = await fetch("/api/marketplace/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: template.id }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Purchase failed"); return; }
      if (data.url) window.location.href = data.url;
      else { toast.success("Template downloaded!"); loadTemplates(); }
    } catch {
      toast.error("Failed to process purchase");
    } finally {
      setPurchasingId(null);
    }
  }

  const fmt = (cents: number) => cents === 0 ? "Free" : `$${(cents / 100).toFixed(2)}`;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search templates..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadTemplates()}
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {["all","educational","marketing","entertainment","business","social"].map(c => (
              <SelectItem key={c} value={c}>{c === "all" ? "All Categories" : c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-full sm:w-48">
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

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-video w-full" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-1">No templates found</h3>
          <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {templates.map((t) => (
            <Card key={t.id} className="overflow-hidden group flex flex-col">
              <div className="aspect-video bg-slate-100 dark:bg-slate-800 relative overflow-hidden flex-shrink-0">
                {t.preview_url ? (
                  <video src={t.preview_url} className="w-full h-full object-cover" muted loop playsInline
                    onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
                    onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Eye className="h-8 w-8 text-slate-400" />
                  </div>
                )}
                {t.category && <Badge className="absolute top-2 right-2 capitalize">{t.category}</Badge>}
              </div>
              <CardContent className="p-4 flex-1">
                <h3 className="font-semibold truncate mb-1">{t.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{t.description ?? "No description"}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {t.rating !== null && (
                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />{t.rating.toFixed(1)}
                    </span>
                  )}
                  <span className="flex items-center gap-1"><Download className="h-3.5 w-3.5" />{t.downloads.toLocaleString()}</span>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex items-center justify-between border-t">
                <span className="text-lg font-bold">{fmt(t.price)}</span>
                <Button size="sm" onClick={() => handlePurchase(t)} disabled={purchasingId === t.id}>
                  {purchasingId === t.id
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <><ShoppingCart className="h-4 w-4 mr-1.5" />{t.price === 0 ? "Download" : "Buy"}</>}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

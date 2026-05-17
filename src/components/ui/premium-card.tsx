import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { forwardRef, useMemo } from "react"

interface PremiumCardProps extends React.HTMLAttributes<HTMLDivElement> {
  gradient?: boolean
  glow?: boolean
  /**
   * Optional: Control the intensity of the glow effect
   * @default "medium"
   */
  glowIntensity?: "low" | "medium" | "high"
  /**
   * Optional: Add a subtle border accent color
   */
  accentColor?: "blue" | "violet" | "emerald" | "amber" | "rose"
  children: React.ReactNode
}

export const PremiumCard = forwardRef<HTMLDivElement, PremiumCardProps>(
  (
    {
      className,
      gradient = false,
      glow = false,
      glowIntensity = "medium",
      accentColor = "blue",
      children,
      ...props
    },
    ref
  ) => {
    // Pro Tip: Memoized class calculations for performance
    const cardClasses = useMemo(() => {
      // Base classes
      const base = "relative overflow-hidden transition-all duration-300 ease-out"
      
      // Gradient background
      const gradientClass = gradient
        ? "bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"
        : ""
      
      // Glow effect with intensity levels
      const glowClass = glow
        ? cn(
            "shadow-lg hover:shadow-2xl transition-shadow duration-300",
            glowIntensity === "low" && "shadow-blue-500/5 hover:shadow-blue-500/10",
            glowIntensity === "medium" && "shadow-blue-500/10 hover:shadow-blue-500/20",
            glowIntensity === "high" && "shadow-blue-500/20 hover:shadow-blue-500/40"
          )
        : ""
      
      // Border with accent color option
      const borderClass = cn(
        "border transition-colors duration-300",
        accentColor === "blue" && "border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500",
        accentColor === "violet" && "border-slate-200 dark:border-slate-700 hover:border-violet-400 dark:hover:border-violet-500",
        accentColor === "emerald" && "border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500",
        accentColor === "amber" && "border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-500",
        accentColor === "rose" && "border-slate-200 dark:border-slate-700 hover:border-rose-400 dark:hover:border-rose-500"
      )
      
      return cn(base, gradientClass, glowClass, borderClass, className)
    }, [className, gradient, glow, glowIntensity, accentColor])

    // Pro Tip: Dynamic glow overlay with accent color
    const glowOverlay = useMemo(() => {
      if (!glow) return null
      
      const colorMap: Record<string, string> = {
        blue: "from-blue-500/5 via-purple-500/5 to-pink-500/5",
        violet: "from-violet-500/5 via-purple-500/5 to-fuchsia-500/5",
        emerald: "from-emerald-500/5 via-teal-500/5 to-cyan-500/5",
        amber: "from-amber-500/5 via-orange-500/5 to-yellow-500/5",
        rose: "from-rose-500/5 via-pink-500/5 to-red-500/5",
      }
      
      return (
        <div 
          className={cn(
            "absolute inset-0 bg-gradient-to-r pointer-events-none transition-opacity duration-300",
            colorMap[accentColor]
          )} 
          aria-hidden="true"
        />
      )
    }, [glow, accentColor])

    // Pro Tip: Responsive padding via CSS variable fallback
    const contentPadding = useMemo(() => {
      // Use CSS variable if defined, else fallback to responsive classes
      return "p-4 sm:p-5 md:p-6 lg:p-7"
    }, [])

    return (
      <Card
        ref={ref}
        className={cardClasses}
        role="region"
        aria-labelledby={props["aria-labelledby"] || undefined}
        {...props}
      >
        {glowOverlay}
        <CardContent className={cn("relative z-10", contentPadding)}>
          {children}
        </CardContent>
        
        {/* Pro Tip: Subtle focus ring for keyboard navigation */}
        <div className="absolute inset-0 rounded-xl ring-1 ring-transparent focus-within:ring-primary/30 pointer-events-none transition-colors duration-200" />
      </Card>
    )
  }
)

PremiumCard.displayName = "PremiumCard"
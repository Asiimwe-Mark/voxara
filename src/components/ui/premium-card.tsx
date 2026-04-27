import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { forwardRef } from "react"

interface PremiumCardProps extends React.HTMLAttributes<HTMLDivElement> {
  gradient?: boolean
  glow?: boolean
  children: React.ReactNode
}

export const PremiumCard = forwardRef<HTMLDivElement, PremiumCardProps>(
  ({ className, gradient = false, glow = false, children, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn(
          "relative overflow-hidden transition-all duration-300",
          gradient && "bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900",
          glow && "shadow-lg hover:shadow-2xl shadow-blue-500/10 hover:shadow-blue-500/20",
          "border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500",
          className
        )}
        {...props}
      >
        {glow && (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none" />
        )}
        <CardContent className="relative z-10 p-6">
          {children}
        </CardContent>
      </Card>
    )
  }
)

PremiumCard.displayName = "PremiumCard"

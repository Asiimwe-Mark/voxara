"use client"

import { CheckCircle2, FileText, Wand2, Clapperboard } from "lucide-react"
import { cn } from "@/lib/utils"

type Step = "topic" | "script" | "generating"

const STEPS: {
  id: Step
  label: string
  icon: React.ComponentType<{ className?: string }>
  description?: string
}[] = [
  { id: "topic", label: "Topic", icon: Wand2, description: "Enter your idea" },
  { id: "script", label: "Script", icon: FileText, description: "Review & edit" },
  { id: "generating", label: "Produce", icon: Clapperboard, description: "AI rendering" },
]

interface ProgressTrackerProps {
  currentStep: Step
  className?: string
}

export function ProgressTracker({ currentStep, className }: ProgressTrackerProps) {
  const currentIdx = STEPS.findIndex((s) => s.id === currentStep)

  return (
    <nav
      aria-label="Video creation progress"
      className={cn("w-full", className)}
      role="navigation"
    >
      <ol className="flex items-start gap-0">
        {STEPS.map((step, i) => {
          const isCompleted = i < currentIdx
          const isActive = i === currentIdx
          const Icon = step.icon

          return (
            <li
              key={step.id}
              className="flex items-center flex-1 last:flex-none group"
              aria-current={isActive ? "step" : undefined}
            >
              <div className="flex flex-col items-center gap-1.5 sm:gap-2 w-full">
                {/* Step Indicator */}
                <div
                  className={cn(
                    "h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ease-out touch-manipulation",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                    isCompleted && "bg-primary border-primary shadow-[0_0_16px_rgba(139,92,246,0.3)]",
                    isActive && "border-primary bg-primary/10 shadow-[0_0_20px_rgba(139,92,246,0.2)] ring-2 ring-primary/20",
                    !isCompleted && !isActive && "border-border/50 bg-muted/30"
                  )}
                  tabIndex={isActive ? 0 : -1}
                  aria-label={`${step.label} step ${isCompleted ? "completed" : isActive ? "in progress" : "upcoming"}`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
                  ) : (
                    <Icon
                      className={cn(
                        "h-4 w-4 sm:h-5 sm:w-5 transition-colors duration-200",
                        isActive ? "text-primary" : "text-muted-foreground/70"
                      )}
                    />
                  )}
                </div>

                {/* Step Label */}
                <div className="text-center min-w-0 px-1">
                  <span
                    className={cn(
                      "block text-[10px] sm:text-xs font-semibold tracking-tight transition-colors duration-200",
                      isActive ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground/80"
                    )}
                  >
                    {step.label}
                  </span>
                  {step.description && (
                    <span
                      className={cn(
                        "hidden sm:block text-[10px] text-muted-foreground/60 mt-0.5 truncate",
                        isActive && "text-muted-foreground"
                      )}
                    >
                      {step.description}
                    </span>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-2 mt-5 rounded-full transition-all duration-500 ease-out",
                    isCompleted
                      ? "bg-gradient-to-r from-primary to-primary shadow-[0_0_8px_rgba(139,92,246,0.3)]"
                      : "bg-border/50"
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

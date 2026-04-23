"use client";

import { CheckCircle2, FileText, Wand2, Clapperboard } from "lucide-react";
import { cn } from "@/lib/utils";

type Step = "topic" | "script" | "generating";

const STEPS: { id: Step; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "topic", label: "Topic", icon: Wand2 },
  { id: "script", label: "Script", icon: FileText },
  { id: "generating", label: "Produce", icon: Clapperboard },
];

export function ProgressTracker({ currentStep }: { currentStep: Step }) {
  const currentIdx = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <nav aria-label="Video creation steps">
      <ol className="flex items-center gap-0">
        {STEPS.map((step, i) => {
          const isCompleted = i < currentIdx;
          const isActive = i === currentIdx;
          const Icon = step.icon;

          return (
            <li key={step.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "h-9 w-9 rounded-full flex items-center justify-center border-2 transition-all",
                    isCompleted && "bg-primary border-primary",
                    isActive && "border-primary bg-primary/10",
                    !isCompleted && !isActive && "border-border bg-background"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                  ) : (
                    <Icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium",
                    isActive ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-2 mb-5 transition-colors",
                    i < currentIdx ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

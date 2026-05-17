import { Loader2 } from 'lucide-react'

export default function DashboardLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <div className="flex flex-col items-center gap-3 text-center">
        <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-muted-foreground" />
        <p className="text-sm sm:text-base font-medium text-muted-foreground">
          Loading your workspace…
        </p>
      </div>
    </div>
  )
}
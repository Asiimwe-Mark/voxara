'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Users, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

function createSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '')
}

interface WorkspaceSettingsProps {
  plan: string
}

export function WorkspaceSettings({ plan }: WorkspaceSettingsProps) {
  const [workspaceName, setWorkspaceName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [slugError, setSlugError] = useState<string | null>(null)
  const router = useRouter()

  // Pro Tip: Memoized slug + validation
  const workspaceSlug = useMemo(() => {
    const slug = createSlug(workspaceName)
    // Validate slug constraints
    if (slug.length < 3) {
      setSlugError('Slug must be at least 3 characters')
    } else if (slug.length > 50) {
      setSlugError('Slug must be less than 50 characters')
    } else if (!/^[a-z0-9-]+$/.test(slug)) {
      setSlugError('Slug can only contain lowercase letters, numbers, and hyphens')
    } else {
      setSlugError(null)
    }
    return slug
  }, [workspaceName])

  // Pro Tip: Derived validation state
  const canCreate = useMemo(() => {
    return (
      workspaceName.trim().length >= 3 &&
      plan === 'agency' &&
      workspaceSlug.length >= 3 &&
      workspaceSlug.length <= 50 &&
      !slugError
    )
  }, [workspaceName, plan, workspaceSlug, slugError])

  async function handleCreateWorkspace() {
    if (!canCreate) return
    setIsCreating(true)

    try {
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: workspaceName.trim() }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to create workspace')
      }

      toast.success('Workspace created successfully')
      router.push('/dashboard/team')
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Workspace creation failed'
      )
    } finally {
      setIsCreating(false)
    }
  }

  // Pro Tip: Handle Enter key submission
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && canCreate && !isCreating) {
      e.preventDefault()
      handleCreateWorkspace()
    }
  }, [canCreate, isCreating])

  // Pro Tip: Plan upgrade CTA
  const handleUpgrade = useCallback(() => {
    router.push('/pricing?plan=agency')
  }, [router])

  return (
    <Card className="card-glow rounded-2xl max-w-2xl mx-auto">
      <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
        <CardTitle className="flex items-center gap-2.5 text-lg sm:text-xl tracking-tight border-l-2 border-primary pl-3">
          <Users className="h-5 w-5 text-primary" />
          Workspace
        </CardTitle>
        <CardDescription className="text-sm sm:text-base mt-1.5">
          Create and manage your team workspace for shared projects and collaboration.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-5 sm:space-y-6">
        {plan !== 'agency' ? (
          // Pro Tip: Upgrade CTA with clear value prop
          <div className="rounded-xl border border-border/50 bg-muted/30 p-4 sm:p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Team workspaces require Agency plan</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Upgrade to unlock shared projects, team member invites, centralized billing, and collaborative editing.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleUpgrade}
                className="h-10 sm:h-11 rounded-lg text-sm font-medium transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary w-full sm:w-auto"
              >
                Upgrade to Agency
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push('/pricing')}
                className="h-10 rounded-lg text-sm font-medium transition-smooth w-full sm:w-auto"
              >
                View Plans
              </Button>
            </div>
            <div className="pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground">
                Already on Agency?{' '}
                <button 
                  onClick={() => router.refresh()}
                  className="text-primary hover:underline font-medium"
                >
                  Refresh plan status
                </button>
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Workspace Name Input */}
            <div className="space-y-2">
              <Label htmlFor="workspace-name" className="text-sm font-medium">
                Workspace name
              </Label>
              <Input
                id="workspace-name"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Acme Creative Studio"
                className="h-10 sm:h-11 rounded-lg text-sm focus-visible:ring-primary/30"
                maxLength={50}
                aria-describedby="name-help slug-preview"
                disabled={isCreating}
              />
              <p id="name-help" className="text-xs text-muted-foreground">
                Use a descriptive name for your team workspace.
              </p>
            </div>

            {/* Slug Preview with Validation */}
            <div id="slug-preview" className="rounded-xl border border-border/50 bg-muted/30 px-4 py-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    Workspace slug preview:
                  </span>
                  <span className={`font-mono text-xs sm:text-sm ${slugError ? 'text-destructive' : 'text-foreground'}`}>
                    {workspaceSlug || 'your-workspace-name'}
                  </span>
                </div>
                {workspaceSlug && (
                  <Badge 
                    variant={slugError ? 'outline' : 'secondary'}
                    className={`text-[10px] ${
                      slugError 
                        ? 'text-destructive border-destructive/30' 
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    }`}
                  >
                    {slugError ? (
                      <>
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {slugError}
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Valid
                      </>
                    )}
                  </Badge>
                )}
              </div>
            </div>

            {/* Create Button + Helper Text */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-1">
              <Button
                onClick={handleCreateWorkspace}
                disabled={!canCreate || isCreating}
                className="h-10 sm:h-11 rounded-lg text-sm font-medium transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 w-full sm:w-auto"
              >
                {isCreating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Create workspace
              </Button>
              <p className="text-xs text-muted-foreground leading-relaxed">
                After creation, return to the Team page to invite members and manage access.
              </p>
            </div>

            {/* Next Steps Preview */}
            <Separator className="my-4 bg-border/50" />
            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Next steps after creation
              </p>
              <ul className="space-y-2 text-sm">
                {[
                  'Invite team members via email',
                  'Set member roles and permissions',
                  'Share projects and assets',
                  'Manage centralized billing',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-muted-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
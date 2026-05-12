'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Users } from 'lucide-react'
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
  const router = useRouter()

  const workspaceSlug = useMemo(
    () => createSlug(workspaceName),
    [workspaceName]
  )
  const canCreate = workspaceName.trim().length >= 3 && plan === 'agency'

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
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Workspace creation failed'
      )
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Workspace
        </CardTitle>
        <CardDescription>
          Create and manage your team workspace for shared projects and
          collaboration.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {plan !== 'agency' ? (
          <div className="rounded-2xl border border-border bg-background p-5 text-sm text-muted-foreground">
            Team workspaces are available on the Agency plan. Upgrade to Agency
            to create a shared workspace and invite collaborators.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Workspace name</Label>
              <Input
                value={workspaceName}
                onChange={(event) => setWorkspaceName(event.target.value)}
                placeholder="Acme Creative Studio"
              />
            </div>
            <div className="rounded-2xl border border-border bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:bg-slate-950 dark:text-slate-300">
              Workspace slug preview:{' '}
              <span className="font-medium text-foreground">
                {workspaceSlug || 'your-workspace-name'}
              </span>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                onClick={handleCreateWorkspace}
                disabled={!canCreate || isCreating}
              >
                {isCreating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Create workspace
              </Button>
              <p className="text-xs text-muted-foreground">
                After creation, return to the Team page to invite members and
                manage access.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

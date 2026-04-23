'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Key, Copy, Plus, Trash2, Loader2, Clock, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface ApiKey {
  id: string
  name: string
  preview: string // fixed: was key_preview
  status: string
  last_used_at: string | null
  created_at: string
  expires_at: string | null
}

export function ApiKeyManager({ userId }: { userId: string }) {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newKeyName, setNewKeyName] = useState('')
  const [newRawKey, setNewRawKey] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    loadKeys()
  }, [])

  async function loadKeys() {
    setIsLoading(true)
    try {
      const res = await fetch('/api/keys')
      const data = await res.json()
      setKeys(data.keys ?? [])
    } catch {
      toast.error('Failed to load API keys')
    } finally {
      setIsLoading(false)
    }
  }

  async function createKey() {
    if (!newKeyName.trim()) {
      toast.error('Key name is required')
      return
    }
    setIsCreating(true)
    try {
      const res = await fetch('/api/keys', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setNewRawKey(data.rawKey)
      setNewKeyName('')
      setDialogOpen(false)
      await loadKeys()
      toast.success('API key created — copy it now!')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create key'
      )
    } finally {
      setIsCreating(false)
    }
  }

  async function revokeKey(keyId: string) {
    try {
      const res = await fetch(`/api/keys/${keyId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to revoke')
      await loadKeys()
      toast.success('API key revoked')
    } catch {
      toast.error('Failed to revoke API key')
    }
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text).then(() => toast.success('Copied!'))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" /> API Keys
        </CardTitle>
        <CardDescription>
          Programmatic access to the voxara API. Keys are hashed — copy on
          creation.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* One-time key reveal */}
        {newRawKey && (
          <div className="rounded-lg border-2 border-amber-300 bg-amber-50 dark:bg-amber-950/40 p-4 space-y-3">
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                Save this key now — it will not be shown again.
              </p>
            </div>
            <div className="flex gap-2">
              <Input
                value={newRawKey}
                readOnly
                className="font-mono text-xs bg-white dark:bg-slate-900"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copy(newRawKey)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNewRawKey(null)}
              className="text-amber-700"
            >
              ✓ I've saved my key
            </Button>
          </div>
        )}

        {/* Create key dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" /> New API Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create API Key</DialogTitle>
              <DialogDescription>
                Name this key so you know what it's for.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-2">
              <Label>Key Name</Label>
              <Input
                placeholder="e.g., Production, n8n Workflow"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && createKey()}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={createKey}
                disabled={isCreating || !newKeyName.trim()}
              >
                {isCreating && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}{' '}
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Keys list */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : keys.length === 0 ? (
          <div className="text-center py-10 text-sm text-muted-foreground">
            No API keys yet. Create one above to get started.
          </div>
        ) : (
          <div className="divide-y rounded-lg border overflow-hidden">
            {keys.map((k) => (
              <div
                key={k.id}
                className="flex items-center justify-between px-4 py-3 bg-background hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
              >
                <div className="min-w-0 mr-4">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{k.name}</p>
                    <Badge
                      variant={k.status === 'active' ? 'outline' : 'secondary'}
                      className="text-xs shrink-0"
                    >
                      {k.status}
                    </Badge>
                  </div>
                  <p className="text-xs font-mono text-muted-foreground mt-0.5">
                    {k.preview}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Created {new Date(k.created_at).toLocaleDateString()}
                    {k.last_used_at &&
                      ` · Last used ${new Date(k.last_used_at).toLocaleDateString()}`}
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Revoke API Key?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Any integrations using "{k.name}" will stop working
                        immediately.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => revokeKey(k.id)}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Revoke Key
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

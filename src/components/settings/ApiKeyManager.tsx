'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { toast } from 'sonner'
import { Key, Copy, Plus, Trash2, Loader2,Search, Clock, Shield, AlertTriangle, Eye, EyeOff } from 'lucide-react'
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
import { Separator } from '@/components/ui/separator'

interface ApiKey {
  id: string
  name: string
  preview: string
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
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')

  // Pro Tip: Filter keys by search query
  const filteredKeys = useMemo(() => {
    if (!searchQuery.trim()) return keys
    const query = searchQuery.toLowerCase()
    return keys.filter(
      (k) =>
        k.name.toLowerCase().includes(query) ||
        k.preview.toLowerCase().includes(query) ||
        k.status.toLowerCase().includes(query)
    )
  }, [keys, searchQuery])

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
      const res = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName.trim() }),
      })
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

  // Pro Tip: Toggle key visibility with animation
  const toggleKeyVisibility = useCallback((keyId: string) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev)
      if (next.has(keyId)) next.delete(keyId)
      else next.add(keyId)
      return next
    })
  }, [])

  // Pro Tip: Copy with feedback + analytics
  const copy = useCallback((text: string, label = 'Copied!') => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(label)
      // Optional: track copy event for analytics
      // analytics.track('api_key_copied', { label })
    })
  }, [])

  // Pro Tip: Bulk copy all active keys
  const copyAllActiveKeys = useCallback(() => {
    const activeKeys = keys.filter((k) => k.status === 'active')
    if (activeKeys.length === 0) {
      toast.info('No active keys to copy')
      return
    }
    const text = activeKeys.map((k) => `${k.name}: ${k.preview}`).join('\n')
    copy(text, 'All active keys copied!')
  }, [keys, copy])

  // Pro Tip: Validate key name in real-time
  const isKeyNameValid = useMemo(() => {
    const name = newKeyName.trim()
    return name.length >= 3 && name.length <= 50 && /^[a-zA-Z0-9\s\-_]+$/.test(name)
  }, [newKeyName])

  return (
    <Card className="card-glow rounded-2xl max-w-4xl mx-auto">
      <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2.5 text-lg sm:text-xl tracking-tight border-l-2 border-primary pl-3">
              <Key className="h-5 w-5 text-primary" />
              API Keys
            </CardTitle>
            <CardDescription className="text-sm sm:text-base mt-1.5">
              Programmatic access to the Voxara API. Keys are hashed — copy on creation.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyAllActiveKeys}
              disabled={keys.filter((k) => k.status === 'active').length === 0}
              className="h-9 sm:h-10 rounded-lg text-xs sm:text-sm font-medium transition-smooth w-full sm:w-auto"
            >
              <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy Active
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="sm" 
                  className="h-9 sm:h-10 rounded-lg text-xs sm:text-sm font-medium transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary w-full sm:w-auto"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New API Key
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
                <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 border-b border-border/50">
                  <DialogTitle className="text-lg">Create API Key</DialogTitle>
                  <DialogDescription className="text-sm mt-1">
                    Name this key so you know what it's for.
                  </DialogDescription>
                </DialogHeader>
                <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="key-name" className="text-sm font-medium">Key Name</Label>
                    <Input
                      id="key-name"
                      placeholder="e.g., Production, n8n Workflow"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && isKeyNameValid && createKey()}
                      className={`h-10 sm:h-11 rounded-lg text-sm focus-visible:ring-primary/30 ${
                        newKeyName && !isKeyNameValid ? 'border-destructive focus-visible:ring-destructive/30' : ''
                      }`}
                      aria-describedby="key-name-desc key-name-error"
                    />
                    <p id="key-name-desc" className="text-xs text-muted-foreground">
                      Use a descriptive name to identify this key's purpose.
                    </p>
                    {newKeyName && !isKeyNameValid && (
                      <p id="key-name-error" className="text-xs text-destructive flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Name must be 3-50 characters, letters/numbers/spaces/hyphens/underscores only
                      </p>
                    )}
                  </div>
                </div>
                <DialogFooter className="px-4 sm:px-6 pb-4 sm:pb-6 pt-2 flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    className="h-10 sm:h-11 rounded-lg text-sm font-medium transition-smooth w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={createKey}
                    disabled={isCreating || !isKeyNameValid}
                    className="h-10 sm:h-11 rounded-lg text-sm font-medium transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 w-full sm:w-auto"
                  >
                    {isCreating && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-5 sm:space-y-6">
        {/* Search & Filter */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search keys..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 sm:h-11 rounded-lg text-sm focus-visible:ring-primary/30"
            aria-label="Search API keys"
          />
        </div>

        {/* One-time key reveal */}
        {newRawKey && (
          <div className="rounded-xl border-2 border-amber-300/50 dark:border-amber-700/50 bg-amber-50/50 dark:bg-amber-950/20 p-4 sm:p-5 space-y-3">
            <div className="flex items-start gap-2.5">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 leading-relaxed">
                Save this key now — it will not be shown again.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <Input
                value={newRawKey}
                readOnly
                className="font-mono text-xs sm:text-sm bg-background/60 focus-visible:ring-amber-500/30 rounded-lg h-10 sm:h-11"
                aria-label="New API key (copy immediately)"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copy(newRawKey)}
                className="h-10 sm:h-11 w-10 sm:w-11 rounded-lg transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
                aria-label="Copy API key to clipboard"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNewRawKey(null)}
              className="text-amber-700 dark:text-amber-300 hover:bg-amber-100/50 dark:hover:bg-amber-900/20 h-9 rounded-lg text-xs sm:text-sm transition-smooth"
            >
              ✓ I've saved my key
            </Button>
          </div>
        )}

        {/* Keys list */}
        {isLoading ? (
          <div className="flex items-center justify-center py-10 sm:py-12">
            <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-muted-foreground" />
            <span className="ml-3 text-sm text-muted-foreground">Loading keys...</span>
          </div>
        ) : filteredKeys.length === 0 ? (
          <div className="empty-state border-2 border-dashed border-border/50 rounded-xl">
            <div className="empty-state-icon">
              <Key className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <p className="empty-state-title">
              {searchQuery ? 'No keys match your search' : 'No API keys yet'}
            </p>
            <p className="empty-state-description">
              {searchQuery 
                ? 'Try adjusting your search terms' 
                : 'Create your first API key to enable programmatic access to Voxara.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/50 rounded-xl border border-border/50 overflow-hidden">
            {filteredKeys.map((k) => {
              const isVisible = visibleKeys.has(k.id)
              return (
                <div
                  key={k.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 py-3.5 bg-background hover:bg-muted/30 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium truncate" title={k.name}>
                        {k.name}
                      </p>
                      <Badge
                        variant={k.status === 'active' ? 'secondary' : 'outline'}
                        className={`text-[10px] sm:text-xs shrink-0 ${
                          k.status === 'active' 
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                            : 'bg-muted/50 text-muted-foreground'
                        }`}
                      >
                        {k.status}
                      </Badge>
                      {k.expires_at && (
                        <Badge variant="outline" className="text-[10px] sm:text-xs shrink-0">
                          Expires {new Date(k.expires_at).toLocaleDateString()}
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <p className="text-xs font-mono text-muted-foreground tabular-nums break-all">
                        {isVisible ? k.preview : '••••••••••••••••'}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-md hover:bg-muted/50 transition-smooth"
                        onClick={() => toggleKeyVisibility(k.id)}
                        aria-label={isVisible ? 'Hide key' : 'Show key'}
                      >
                        {isVisible ? (
                          <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                        ) : (
                          <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-md hover:bg-muted/50 transition-smooth"
                        onClick={() => copy(k.preview, 'Key preview copied!')}
                        aria-label="Copy key preview"
                      >
                        <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5 flex flex-wrap items-center gap-1.5">
                      <Clock className="h-3 w-3 shrink-0" />
                      <span className="tabular-nums">
                        Created {new Date(k.created_at).toLocaleDateString(undefined, { 
                          year: 'numeric', month: 'short', day: 'numeric' 
                        })}
                      </span>
                      {k.last_used_at && (
                        <>
                          <span className="hidden sm:inline">·</span>
                          <span className="tabular-nums">
                            Last used {new Date(k.last_used_at).toLocaleDateString(undefined, {
                              year: 'numeric', month: 'short', day: 'numeric'
                            })}
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-destructive shrink-0"
                        aria-label={`Revoke API key: ${k.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
                      <AlertDialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 border-b border-border/50">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                          </div>
                          <div>
                            <AlertDialogTitle className="text-lg">Revoke API Key?</AlertDialogTitle>
                            <AlertDialogDescription className="text-sm mt-1">
                              Any integrations using <strong className="text-foreground">{k.name}</strong> will stop working immediately. This action cannot be undone.
                            </AlertDialogDescription>
                          </div>
                        </div>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="px-4 sm:px-6 pb-4 sm:pb-6 pt-3 flex-col sm:flex-row gap-3">
                        <AlertDialogCancel className="h-10 sm:h-11 rounded-lg text-sm font-medium transition-smooth w-full sm:w-auto">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => revokeKey(k.id)}
                          className="h-10 sm:h-11 rounded-lg text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-destructive w-full sm:w-auto"
                        >
                          Revoke Key
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
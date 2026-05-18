"use client"

import { useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { AlertTriangle, Loader2, LogOut, Trash2, Shield, Key } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase/client"

export function DangerZone({ userId }: { userId: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [showAdvancedWarning, setShowAdvancedWarning] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Pro Tip: Real-time validation with visual feedback
  const isConfirmValid = useMemo(() => confirmText === "DELETE", [confirmText])
  const confirmColor = useMemo(() => {
    if (!confirmText) return "text-muted-foreground"
    return isConfirmValid ? "text-emerald-500" : "text-destructive"
  }, [confirmText, isConfirmValid])

  async function handleDeleteAccount() {
    if (!isConfirmValid) {
      toast.error('Please type DELETE to confirm')
      return
    }
    setIsDeleting(true)
    try {
      // Call the delete_user_account RPC (must be defined in DB as SECURITY DEFINER)
      const { error } = await supabase.rpc("delete_user_account")
      if (error) throw error
      await supabase.auth.signOut()
      toast.success("Account deleted successfully")
      router.push("/")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete account. Please contact support.")
    } finally {
      setIsDeleting(false)
      setDialogOpen(false)
      setConfirmText("")
    }
  }

  async function handleSignOutAllDevices() {
    try {
      const { error } = await supabase.auth.signOut({ scope: "global" })
      if (error) throw error
      toast.success("Signed out from all devices")
      router.push("/login")
    } catch {
      toast.error("Failed to sign out from all devices")
    }
  }

  // Pro Tip: Copy user ID for support/debugging
  const copyUserId = useCallback(() => {
    navigator.clipboard.writeText(userId).then(() => {
      toast.success("User ID copied to clipboard")
    })
  }, [userId])

  return (
    <Card className="card-premium border-destructive/30 bg-destructive/5 dark:bg-destructive/10">
      <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-destructive/10 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-destructive" />
          </div>
          <div>
            <CardTitle className="text-lg sm:text-xl font-bold tracking-tight text-destructive">
              Danger Zone
            </CardTitle>
            <CardDescription className="text-sm sm:text-base mt-1.5 text-muted-foreground">
              Irreversible actions — proceed with extreme care.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-5 sm:space-y-6">
        {/* User ID Reference */}
        <div className="p-3 sm:p-4 rounded-xl bg-muted/30 border border-border/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Your User ID</p>
              <p className="text-xs sm:text-sm font-mono text-foreground truncate" title={userId}>
                {userId}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyUserId}
              className="h-8 sm:h-9 rounded-lg text-xs font-medium transition-smooth"
            >
              <Key className="mr-1.5 h-3.5 w-3.5" />
              Copy ID
            </Button>
          </div>
        </div>

        {/* Sign out all devices */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-xl border border-border/50 bg-background">
          <div className="min-w-0">
            <p className="text-sm font-medium">Sign Out All Devices</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              Invalidates all active sessions across every device. You'll need to log in again everywhere.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOutAllDevices}
            className="h-9 sm:h-10 rounded-lg text-xs sm:text-sm font-medium transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary w-full sm:w-auto touch-manipulation"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out All
          </Button>
        </div>

        <Separator className="bg-border/50" />

        {/* Delete account */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-xl border border-destructive/30 bg-destructive/5 dark:bg-destructive/10">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-destructive">Delete Account</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              Permanently deletes your account, videos, credits, API keys, and all associated data.
            </p>
          </div>
          <Dialog 
            open={dialogOpen} 
            onOpenChange={(open) => {
              setDialogOpen(open)
              if (!open) {
                setConfirmText("")
                setShowAdvancedWarning(false)
              }
            }}
          >
            <DialogTrigger asChild>
              <Button 
                variant="destructive" 
                size="sm"
                className="h-9 sm:h-10 rounded-lg text-xs sm:text-sm font-medium transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-destructive w-full sm:w-auto"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
              <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 border-b border-border/50">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <DialogTitle className="text-lg text-destructive">Delete your account?</DialogTitle>
                    <DialogDescription className="text-sm mt-1 leading-relaxed">
                      This permanently removes all your videos, credits, API keys, and billing data.
                      <strong className="block mt-2 text-foreground">This cannot be undone.</strong>
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-4">
                {/* Advanced Warning Toggle */}
                <button
                  type="button"
                  onClick={() => setShowAdvancedWarning(!showAdvancedWarning)}
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full text-left"
                >
                  <Shield className={`h-3.5 w-3.5 transition-transform ${showAdvancedWarning ? 'rotate-180' : ''}`} />
                  Show advanced warning details
                </button>
                
                {showAdvancedWarning && (
                  <div className="p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/50 text-xs text-amber-800 dark:text-amber-300 space-y-2">
                    <p className="font-medium">What will be deleted:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>All videos and associated Mux assets</li>
                      <li>API keys and OAuth connections</li>
                      <li>Credit balance and billing history</li>
                      <li>Profile data and preferences</li>
                      <li>Analytics and engagement data</li>
                    </ul>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-delete" className="text-sm font-medium">
                    Type <span className="font-mono font-bold bg-muted px-1.5 py-0.5 rounded">DELETE</span> to confirm
                  </Label>
                  <Input
                    id="confirm-delete"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                    placeholder="DELETE"
                    className={`font-mono h-10 sm:h-11 rounded-lg text-sm focus-visible:ring-destructive/30 ${
                      confirmText && !isConfirmValid ? 'border-destructive' : ''
                    }`}
                    autoComplete="off"
                    autoCapitalize="characters"
                    aria-describedby="confirm-help"
                  />
                  <p id="confirm-help" className={`text-xs mt-1 ${confirmColor} font-medium`}>
                    {confirmText && !isConfirmValid 
                      ? "Type exactly: DELETE" 
                      : isConfirmValid 
                        ? "✓ Confirmation matches" 
                        : "This action cannot be undone"}
                  </p>
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
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || !isConfirmValid}
                  className="h-10 sm:h-11 rounded-lg text-sm font-medium transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-destructive disabled:opacity-50 w-full sm:w-auto"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete My Account
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}
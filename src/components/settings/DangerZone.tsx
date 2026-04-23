"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertTriangle, Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";

export function DangerZone({ userId }: { userId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleDeleteAccount() {
    if (confirmText !== "DELETE") {
      toast.error('Please type DELETE to confirm');
      return;
    }
    setIsDeleting(true);
    try {
      // Call the delete_user_account RPC (must be defined in DB as SECURITY DEFINER)
      const { error } = await supabase.rpc("delete_user_account");
      if (error) throw error;
      await supabase.auth.signOut();
      toast.success("Account deleted");
      router.push("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete account. Please contact support.");
    } finally {
      setIsDeleting(false);
      setDialogOpen(false);
    }
  }

  async function handleSignOutAllDevices() {
    const { error } = await supabase.auth.signOut({ scope: "global" });
    if (error) { toast.error("Failed to sign out"); return; }
    toast.success("Signed out from all devices");
    router.push("/login");
  }

  return (
    <Card className="border-red-200 dark:border-red-900/60">
      <CardHeader>
        <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Danger Zone
        </CardTitle>
        <CardDescription>Irreversible actions — proceed with care.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">

        {/* Sign out all devices */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <p className="text-sm font-medium">Sign Out All Devices</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Invalidates all active sessions across every device.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleSignOutAllDevices}>
            <LogOut className="mr-2 h-4 w-4" /> Sign Out All
          </Button>
        </div>

        <Separator />

        {/* Delete account */}
        <div className="flex items-center justify-between rounded-lg border border-red-200 dark:border-red-900/60 p-4">
          <div>
            <p className="text-sm font-semibold text-red-600 dark:text-red-400">Delete Account</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Permanently deletes your account, videos, credits, and all data.
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setConfirmText(""); }}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm">Delete Account</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-destructive">Delete your account?</DialogTitle>
                <DialogDescription>
                  This permanently removes all your videos, credits, API keys, and billing data.
                  <strong className="block mt-2 text-foreground">This cannot be undone.</strong>
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 py-2">
                <Label>
                  Type <span className="font-mono font-bold bg-slate-100 dark:bg-slate-800 px-1 rounded">DELETE</span> to confirm
                </Label>
                <Input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="font-mono"
                  autoComplete="off"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || confirmText !== "DELETE"}
                >
                  {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Delete My Account
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}

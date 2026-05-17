import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react"

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(`/login?redirect=/invite/${token}`)

  const { data: invite } = await supabase
    .from("organization_invites")
    .select("id, organization_id, email, role, accepted_at, expires_at, organizations(name)")
    .eq("token", token)
    .maybeSingle()

  // Invite not found
  if (!invite) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 bg-background">
        <Card className="card-premium w-full max-w-[95vw] sm:max-w-md">
          <CardHeader className="text-center pt-6 sm:pt-8 px-6">
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-3">
              <XCircle className="h-6 w-6 sm:h-7 sm:w-7 text-destructive" />
            </div>
            <CardTitle className="text-xl sm:text-2xl">Invalid Invitation</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              This invitation link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center pb-6 px-6">
            <Button 
              asChild 
              variant="outline" 
              className="h-11 sm:h-12 rounded-xl text-sm font-medium transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Already accepted
  if (invite.accepted_at) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 bg-background">
        <Card className="card-premium w-full max-w-[95vw] sm:max-w-md">
          <CardHeader className="text-center pt-6 sm:pt-8 px-6">
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <CardTitle className="text-xl sm:text-2xl">Already Accepted</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              You have already joined this workspace.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center pb-6 px-6">
            <Button 
              asChild 
              className="h-11 sm:h-12 rounded-xl text-sm font-medium transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Expired
  if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 bg-background">
        <Card className="card-premium w-full max-w-[95vw] sm:max-w-md">
          <CardHeader className="text-center pt-6 sm:pt-8 px-6">
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
              <Clock className="h-6 w-6 sm:h-7 sm:w-7 text-muted-foreground" />
            </div>
            <CardTitle className="text-xl sm:text-2xl">Invitation Expired</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              This invitation has expired. Ask your team admin to send a new one.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center pb-6 px-6">
            <Button 
              asChild 
              variant="outline" 
              className="h-11 sm:h-12 rounded-xl text-sm font-medium transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Email mismatch
  const i = invite!
  if (i.email && i.email !== user.email) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 bg-background">
        <Card className="card-premium w-full max-w-[95vw] sm:max-w-md">
          <CardHeader className="text-center pt-6 sm:pt-8 px-6">
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-3">
              <XCircle className="h-6 w-6 sm:h-7 sm:w-7 text-destructive" />
            </div>
            <CardTitle className="text-xl sm:text-2xl">Wrong Account</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              This invitation was sent to{" "}
              <strong className="text-foreground">{i.email}</strong>. You are signed in as{" "}
              <strong className="text-foreground">{user.email}</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-2">
            <p className="text-xs sm:text-sm text-muted-foreground text-center">
              Please sign in with the correct email address to accept this invitation.
            </p>
          </CardContent>
          <CardFooter className="justify-center gap-2 flex-col sm:flex-row pb-6 px-6">
            <Button 
              asChild 
              variant="outline" 
              className="h-11 sm:h-12 w-full sm:w-auto rounded-xl text-sm font-medium transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <Link href="/login">Sign in with correct email</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const orgName = (invite.organizations as any)?.name ?? "the workspace"

  async function acceptInvite() {
    "use server"
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    // Idempotent insert — ignore if already a member
    const inv = invite!
    await supabase.from("organization_members").upsert(
      { organization_id: inv.organization_id, user_id: user.id, role: inv.role },
      { onConflict: "organization_id,user_id" }
    )
    await supabase
      .from("organization_invites")
      .update({ accepted_at: new Date().toISOString() })
      .eq("id", inv.id)

    redirect("/dashboard/team")
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 bg-background">
      <Card className="card-premium w-full max-w-[95vw] sm:max-w-md">
        <CardHeader className="text-center pt-6 sm:pt-8 px-6">
          <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Users className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
          </div>
          <CardTitle className="text-xl sm:text-2xl">Join {orgName}</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            You&apos;ve been invited to join as{" "}
            <strong className="capitalize text-foreground">{invite!.role}</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-4">
          <form action={acceptInvite}>
            <Button 
              type="submit" 
              className="w-full h-11 sm:h-12 rounded-xl text-sm font-medium transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.98]"
              size="lg"
            >
              Accept Invitation
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center pb-6 px-6">
          <Button 
            asChild 
            variant="ghost" 
            size="sm"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Link href="/dashboard">Decline — go to Dashboard</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
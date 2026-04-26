import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CheckCircle2, XCircle, Clock } from "lucide-react";

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect(`/login?redirect=/invite/${token}`);

  const { data: invite } = await supabase
    .from("organization_invites")
    .select("id, organization_id, email, role, accepted_at, expires_at, organizations(name)")
    .eq("token", token)
    .maybeSingle();

  // Invite not found
  if (!invite) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-2" />
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>This invitation link is invalid or has expired.</CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button asChild variant="outline"><Link href="/dashboard">Go to Dashboard</Link></Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Already accepted
  if (invite.accepted_at) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <CardTitle>Already Accepted</CardTitle>
            <CardDescription>You have already joined this workspace.</CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button asChild><Link href="/dashboard">Go to Dashboard</Link></Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Expired
  if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <CardTitle>Invitation Expired</CardTitle>
            <CardDescription>This invitation has expired. Ask your team admin to send a new one.</CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button asChild variant="outline"><Link href="/dashboard">Go to Dashboard</Link></Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Email mismatch
  if (invite.email && invite.email !== user.email) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-2" />
            <CardTitle>Wrong Account</CardTitle>
            <CardDescription>
              This invitation was sent to <strong>{invite.email}</strong>. You are signed in as <strong>{user.email}</strong>.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center gap-2 flex-col sm:flex-row">
            <Button asChild variant="outline"><Link href="/login">Sign in with correct email</Link></Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const orgName = (invite.organizations as any)?.name ?? "the workspace";

  async function acceptInvite() {
    "use server";
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    // Idempotent insert — ignore if already a member
    await supabase.from("organization_members").upsert(
      { organization_id: invite.organization_id, user_id: user.id, role: invite.role },
      { onConflict: "organization_id,user_id" }
    );
    await supabase
      .from("organization_invites")
      .update({ accepted_at: new Date().toISOString() })
      .eq("id", invite.id);

    redirect("/dashboard/team");
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Users className="h-7 w-7 text-primary" />
          </div>
          <CardTitle>Join {orgName}</CardTitle>
          <CardDescription>
            You&apos;ve been invited to join as <strong className="capitalize">{invite.role}</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={acceptInvite}>
            <Button type="submit" className="w-full" size="lg">
              Accept Invitation
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard">Decline — go to Dashboard</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { TeamSettings } from '@/components/team/TeamSettings'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Lock } from 'lucide-react'

export default async function TeamPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: membership }, { data: profile }] = await Promise.all([
    supabase
      .from('organization_members')
      .select('organization_id, role')
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase.from('profiles').select('plan').eq('id', user.id).single(),
  ])

  // Team workspace is Agency-only
  if (profile?.plan !== 'agency') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Team</h2>
          <p className="text-muted-foreground">
            Collaborate with your team on video creation
          </p>
        </div>
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-4">
              <Lock className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Team workspaces require Agency plan
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">
              Upgrade to Agency to invite team members, share credits, and
              collaborate on videos.
            </p>
            <Button asChild>
              <Link href="/pricing">Upgrade to Agency</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Agency user with no org yet — show create org prompt
  if (!membership) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Team</h2>
          <p className="text-muted-foreground">
            Collaborate with your team on video creation
          </p>
        </div>
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Users className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Create your team workspace
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">
              Set up a workspace to invite collaborators and manage your team.
            </p>
            <Button asChild>
              <Link href="/dashboard/settings?tab=workspace">
                Set Up in Settings
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Team</h2>
        <p className="text-muted-foreground">
          Manage members and permissions for your workspace
        </p>
      </div>
      <TeamSettings organizationId={membership.organization_id} />
    </div>
  )
}

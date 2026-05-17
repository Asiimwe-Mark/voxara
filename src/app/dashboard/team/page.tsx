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
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Team</h2>
          <p className="mt-1.5 text-sm sm:text-base text-muted-foreground">
            Collaborate with your team on video creation
          </p>
        </div>

        {/* Locked State Card */}
        <Card className="card-premium border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 px-6 text-center">
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-muted flex items-center justify-center mb-4 sm:mb-5">
              <Lock className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2 tracking-tight">
              Team workspaces require Agency plan
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
              Upgrade to Agency to invite team members, share credits, and
              collaborate on videos.
            </p>
            <Button asChild className="h-11 sm:h-12 rounded-xl text-sm font-medium transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
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
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Team</h2>
          <p className="mt-1.5 text-sm sm:text-base text-muted-foreground">
            Collaborate with your team on video creation
          </p>
        </div>

        {/* Create Org Prompt Card */}
        <Card className="card-premium p-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 px-6 text-center">
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 sm:mb-5">
              <Users className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2 tracking-tight">
              Create your team workspace
            </h3>
            <p className="text-sm text-muted-foreground  mb-6 leading-relaxed">
              Set up a workspace to invite collaborators and manage your team.
            </p>
            <Button asChild className="h-11 sm:h-12 rounded-xl text-sm font-medium transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
              <Link href="/dashboard/settings?tab=workspace">
                Set Up in Settings
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Agency user with org — render TeamSettings
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Team</h2>
        <p className="mt-1.5 text-sm sm:text-base text-muted-foreground">
          Manage members and permissions for your workspace
        </p>
      </div>

      {/* Team Settings Component */}
      <TeamSettings organizationId={membership.organization_id} />
    </div>
  )
}
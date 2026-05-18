import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { TeamSettings } from '@/components/team/TeamSettings'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Lock, ArrowRight } from 'lucide-react'

// ── Shared page header ─────────────────────────────────────────────────────
function PageHeader({ description }: { description: string }) {
  return (
    <div className="pb-1">
      <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Team</h2>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
        {description}
      </p>
    </div>
  )
}

// ── Shared empty-state card ────────────────────────────────────────────────
interface StateCardProps {
  icon: React.ReactNode
  iconBg: string
  title: string
  description: string
  cta: string
  href: string
}

function StateCard({ icon, iconBg, title, description, cta, href }: StateCardProps) {
  return (
    <Card className="card-premium border-dashed">
      <CardContent className="flex flex-col items-center justify-center px-6 py-14 text-center sm:py-20">
        {/* Icon */}
        <div
          className={`mb-5 flex h-14 w-14 items-center justify-center rounded-full sm:h-16 sm:w-16 ${iconBg}`}
        >
          {icon}
        </div>

        {/* Copy */}
        <h3 className="mb-2 text-base font-semibold tracking-tight sm:text-lg">
          {title}
        </h3>
        <p className="mb-7 max-w-xs text-xs leading-relaxed text-muted-foreground sm:text-sm">
          {description}
        </p>

        {/* CTA */}
        <Button
          asChild
          className="group h-10 rounded-xl px-5 text-sm font-medium shadow-sm transition-all hover:scale-[1.015] active:scale-[0.985] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:h-11"
        >
          <Link href={href}>
            {cta}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────
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

  // ── Not on Agency plan ──────────────────────────────────────────────────
  if (profile?.plan !== 'agency') {
    return (
      <div className="w-full max-w-4xl space-y-5 sm:space-y-6">
        <PageHeader description="Collaborate with your team on video creation" />
        <StateCard
          iconBg="bg-muted"
          icon={<Lock className="h-6 w-6 text-muted-foreground sm:h-7 sm:w-7" />}
          title="Team workspaces require the Agency plan"
          description="Upgrade to Agency to invite team members, share credits, and collaborate on videos."
          cta="Upgrade to Agency"
          href="/pricing"
        />
      </div>
    )
  }

  // ── Agency user, no org yet ─────────────────────────────────────────────
  if (!membership) {
    return (
      <div className="w-full max-w-4xl space-y-5 sm:space-y-6">
        <PageHeader description="Collaborate with your team on video creation" />
        <StateCard
          iconBg="bg-primary/10"
          icon={<Users className="h-6 w-6 text-primary sm:h-7 sm:w-7" />}
          title="Create your team workspace"
          description="Set up a workspace to invite collaborators and manage your team."
          cta="Set Up in Settings"
          href="/dashboard/settings?tab=workspace"
        />
      </div>
    )
  }

  // ── Agency user with org — full team settings ───────────────────────────
  return (
    <div className="w-full max-w-4xl space-y-5 sm:space-y-6">
      <PageHeader description="Manage members and permissions for your workspace" />
      <TeamSettings organizationId={membership.organization_id} />
    </div>
  )
}
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProfileSettings } from '@/components/settings/ProfileSettings'
import { ConnectedAccounts } from '@/components/settings/ConnectedAccounts'
import { ApiKeyManager } from '@/components/settings/ApiKeyManager'
import { DangerZone } from '@/components/settings/DangerZone'
import { WorkspaceSettings } from '@/components/settings/WorkspaceSettings'

export const metadata = {
  title: 'Settings',
}

// Tabs config — single source of truth for label, value, and optional styling
const TABS = [
  { value: 'profile',   label: 'Profile'    },
  { value: 'workspace', label: 'Workspace'  },
  { value: 'accounts',  label: 'Social'     },
  { value: 'api',       label: 'API Keys'   },
  { value: 'danger',    label: 'Danger', danger: true },
] as const

type TabValue = (typeof TABS)[number]['value']

interface SettingsPageProps {
  searchParams: { tab?: string }
}

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [{ data: profile }, { data: socialAccounts }] = await Promise.all([
    supabase
      .from('profiles')
      .select('full_name, email, avatar_url, credits, plan')
      .eq('id', user.id)
      .single(),
    supabase
      .from('social_accounts')
      .select('id, platform, account_name')
      .eq('user_id', user.id),
  ])

  const voxaraUser = { id: user.id, email: user.email ?? '' }

  const voxaraProfile = profile ?? {
    full_name:  null,
    avatar_url: null,
    credits:    0,
    plan:       'free',
  }

  const validTabs = TABS.map((t) => t.value) as TabValue[]
  const activeTab: TabValue =
    validTabs.includes(searchParams.tab as TabValue)
      ? (searchParams.tab as TabValue)
      : 'profile'

  return (
    <div className="w-full max-w-3xl space-y-5 sm:space-y-7">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="pb-1">
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
          Settings
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
          Manage your account, integrations, and preferences
        </p>
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────────── */}
      <Tabs defaultValue={activeTab} className="space-y-5 sm:space-y-6">

        {/* Tab bar
            – Mobile  (< sm): 2-col grid so labels never truncate
            – Desktop (≥ sm): single row, all 5 tabs visible           */}
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-xl bg-muted/30 p-1 sm:grid-cols-5 sm:gap-0">
          {TABS.map(({ value, label, danger }) => (
            <TabsTrigger
              key={value}
              value={value}
              className={[
                'h-9 rounded-lg text-xs font-medium transition-all',
                'data-[state=active]:bg-background data-[state=active]:shadow-sm',
                danger
                  ? 'text-destructive/70 data-[state=active]:bg-destructive/10 data-[state=active]:text-destructive'
                  : 'data-[state=active]:text-foreground',
              ].join(' ')}
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Tab contents */}
        <TabsContent value="profile" className="space-y-0 focus:outline-none">
          <ProfileSettings user={voxaraUser} profile={voxaraProfile} />
        </TabsContent>

        <TabsContent value="workspace" className="space-y-0 focus:outline-none">
          <WorkspaceSettings plan={voxaraProfile.plan ?? 'free'} />
        </TabsContent>

        <TabsContent value="accounts" className="space-y-0 focus:outline-none">
          <ConnectedAccounts
            userId={user.id}
            initialAccounts={socialAccounts ?? []}
          />
        </TabsContent>

        <TabsContent value="api" className="space-y-0 focus:outline-none">
          <ApiKeyManager userId={user.id} />
        </TabsContent>

        <TabsContent value="danger" className="space-y-0 focus:outline-none">
          <DangerZone userId={user.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
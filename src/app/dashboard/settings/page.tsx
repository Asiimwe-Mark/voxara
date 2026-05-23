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

const TABS: readonly { value: string; label: string; danger?: boolean }[] = [
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
    <div className="w-full max-w-3xl space-y-5 sm:space-y-7 overflow-x-hidden">

      {/* Header */}
      <div className="pb-1">
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
          Settings
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
          Manage your account, integrations, and preferences
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue={activeTab} className="space-y-5 sm:space-y-6">

        {/* Horizontal scrollable tab strip */}
        <TabsList className="flex h-auto w-full gap-1 rounded-none border-b border-border bg-transparent p-0 overflow-x-auto scrollbar-none">
          {TABS.map(({ value, label, danger }) => (
            <TabsTrigger
              key={value}
              value={value}
              className={[
                'relative h-10 shrink-0 rounded-none border-b-2 border-transparent px-4 text-sm font-medium transition-all',
                'data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none',
                'hover:text-foreground',
                danger
                  ? 'text-destructive/60 hover:text-destructive data-[state=active]:border-destructive data-[state=active]:text-destructive'
                  : 'text-muted-foreground',
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

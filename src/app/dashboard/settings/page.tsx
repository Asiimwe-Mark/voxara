import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProfileSettings } from '@/components/settings/ProfileSettings'
import { ConnectedAccounts } from '@/components/settings/ConnectedAccounts'
import { ApiKeyManager } from '@/components/settings/ApiKeyManager'
import { DangerZone } from '@/components/settings/DangerZone'
import { WorkspaceSettings } from '@/components/settings/WorkspaceSettings'

export const metadata = { title: 'Settings' }

interface SettingsPageProps {
  searchParams: { tab?: string }
}

export default async function SettingsPage({
  searchParams,
}: SettingsPageProps) {
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

  // Cast to expected types
  const voxaraUser = {
    id: user.id,
    email: user.email ?? '',
  }

  const voxaraProfile = profile ?? {
    full_name: null,
    avatar_url: null,
    credits: 0,
    plan: 'free',
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground text-sm mt-0.5">
          Manage your account, integrations, and preferences
        </p>
      </div>

      <Tabs
        defaultValue={
          searchParams.tab === 'workspace' ? 'workspace' : 'profile'
        }
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="workspace">Workspace</TabsTrigger>
          <TabsTrigger value="accounts">Social</TabsTrigger>
          <TabsTrigger value="api">API Keys</TabsTrigger>
          <TabsTrigger
            value="danger"
            className="text-destructive data-[state=active]:text-destructive"
          >
            Danger
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileSettings user={voxaraUser} profile={voxaraProfile} />
        </TabsContent>

        <TabsContent value="workspace">
          <WorkspaceSettings plan={voxaraProfile.plan ?? 'free'} />
        </TabsContent>

        <TabsContent value="accounts">
          <ConnectedAccounts
            userId={user.id}
            initialAccounts={socialAccounts ?? []}
          />
        </TabsContent>

        <TabsContent value="api">
          <ApiKeyManager userId={user.id} />
        </TabsContent>

        <TabsContent value="danger">
          <DangerZone userId={user.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

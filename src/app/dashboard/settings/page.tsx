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

  // Determine active tab from URL, default to 'profile'
  const activeTab = searchParams.tab === 'workspace' ? 'workspace' : 'profile'

  return (
    <div className="w-full max-w-3xl space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Settings
        </h2>
        <p className="mt-1.5 text-sm sm:text-base text-muted-foreground">
          Manage your account, integrations, and preferences
        </p>
      </div>

      {/* Tabs Navigation */}
      <Tabs defaultValue={activeTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 w-full h-auto sm:h-11 p-1 bg-muted/30 rounded-xl">
          <TabsTrigger 
            value="profile" 
            className="text-xs sm:text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg h-9 sm:h-10"
          >
            Profile
          </TabsTrigger>
          <TabsTrigger 
            value="workspace" 
            className="text-xs sm:text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg h-9 sm:h-10"
          >
            Workspace
          </TabsTrigger>
          <TabsTrigger 
            value="accounts" 
            className="text-xs sm:text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg h-9 sm:h-10"
          >
            Social
          </TabsTrigger>
          <TabsTrigger 
            value="api" 
            className="text-xs sm:text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg h-9 sm:h-10"
          >
            API Keys
          </TabsTrigger>
          <TabsTrigger
            value="danger"
            className="text-xs sm:text-sm font-medium text-destructive data-[state=active]:bg-destructive/10 data-[state=active]:text-destructive rounded-lg h-9 sm:h-10"
          >
            Danger
          </TabsTrigger>
        </TabsList>

        {/* Tab Contents */}
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
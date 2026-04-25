import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProfileSettings } from '@/components/settings/ProfileSettings'
import { ConnectedAccounts } from '@/components/settings/ConnectedAccounts'
import { ApiKeyManager } from '@/components/settings/ApiKeyManager'
import { DangerZone } from '@/components/settings/DangerZone'

export const metadata = { title: 'Settings' }

export default async function SettingsPage() {
  const supabase = await createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
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

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground text-sm mt-0.5">
          Manage your account, integrations, and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
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
          <ProfileSettings user={user} profile={profile} />
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

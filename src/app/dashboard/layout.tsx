import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { SidebarProvider } from '@/components/ui/sidebar'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('credits, plan, full_name, avatar_url')
    .eq('id', user.id)
    .single()

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        {/* Sidebar - handles mobile drawer/desktop sidebar via SidebarProvider context */}
        <DashboardSidebar />

        {/* Main Content Wrapper */}
        <div className="flex flex-1 flex-col min-w-0 min-h-0 overflow-hidden">
          <DashboardHeader
            user={{
              name: profile?.full_name || user.email?.split('@')[0] || 'User',
              email: user.email!,
              credits: profile?.credits ?? 3,
              plan: profile?.plan ?? 'free',
              avatarUrl: profile?.avatar_url,
            }}
          />
          <main className="flex-1 min-h-0 overflow-y-auto bg-gradient-to-b from-background via-background to-slate-50/50 dark:to-slate-950/50">
            <div className="w-full h-full p-4 sm:p-6 lg:p-8">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
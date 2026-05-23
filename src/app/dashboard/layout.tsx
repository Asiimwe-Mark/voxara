import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { SidebarProvider } from '@/components/ui/sidebar'
import { DashboardPageTransition } from '@/components/dashboard/page-transition'

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
      {/* Changed h-screen → h-dvh to match Sidebar's internal h-dvh */}
      <div className="flex h-dvh w-full overflow-hidden bg-background">
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
          <main className="flex-1 min-h-0 overflow-y-auto bg-[radial-gradient(ellipse_at_top,_hsl(258_84%_62%_/_0.04)_0%,_transparent_60%)] bg-background">
            <DashboardPageTransition>
              <div className="w-full h-full p-4 sm:p-6 lg:p-8">{children}</div>
            </DashboardPageTransition>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

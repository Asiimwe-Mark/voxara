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
    .select('credits, plan, full_name')
    .eq('id', user.id)
    .single()

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden w-full bg-background">
        <DashboardSidebar />
        <div className="flex flex-1 flex-col overflow-hidden min-w-0">
          <DashboardHeader
            user={{
              name: profile?.full_name || user.email?.split('@')[0] || 'User',
              email: user.email!,
              credits: profile?.credits ?? 3,
              plan: profile?.plan ?? 'free',
            }}
          />
          <main className="flex-1 overflow-y-auto bg-gradient-to-b from-background via-background to-slate-50/50 dark:to-slate-950/50">
            <div className="w-full">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

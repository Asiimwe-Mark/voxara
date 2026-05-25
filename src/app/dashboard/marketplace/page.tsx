import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TemplateMarketplace } from "@/components/marketplace/TemplateMarketplace"

export default async function MarketplacePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("credits, plan")
    .eq("id", user.id)
    .single()

  return (
    <div className="w-full space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Template Marketplace
        </h2>
        <p className="mt-1.5 text-sm sm:text-base text-muted-foreground">
          Browse and purchase professionally crafted video templates
        </p>
      </div>

      {/* Marketplace Component */}
      <TemplateMarketplace
        userId={user.id}
        userCredits={profile?.credits ?? 0}
        userPlan={profile?.plan ?? "free"}
      />
    </div>
  )
}
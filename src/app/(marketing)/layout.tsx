'use client'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col marketing-page">
      <main className="flex-1">{children}</main>
    </div>
  )
}
import type { Metadata, Viewport } from 'next'
import { Inter, Instrument_Serif } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/theme-provider'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-instrument-serif',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  colorScheme: 'light dark',
}

export const metadata: Metadata = {
  title: {
    default: 'voxara – Create Viral AI Videos Without a Camera',
    template: '%s | voxara',
  },
  description:
    'Turn any topic into a polished video in minutes. AI script, voiceover, avatars, and one-click publishing — all in one platform.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  ),
  openGraph: {
    title: 'voxara – AI-Powered Video Creator',
    description: 'Create and publish viral videos with AI.',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'voxara',
    description: 'Create viral videos with AI',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${instrumentSerif.variable}`}
      data-scroll-behavior="smooth"
    >
      <body
        className={`${inter.className} bg-background text-foreground antialiased min-h-screen overflow-x-hidden`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster
            position="bottom-right"
            expand={true}
            richColors
            toastOptions={{
              duration: 4000,
              classNames: {
                toast: 'rounded-2xl border shadow-xl',
                success: 'border-emerald-500/30 bg-emerald-950/90 text-emerald-100',
                error: 'border-red-500/30 bg-red-950/90 text-red-100',
                warning: 'border-amber-500/30 bg-amber-950/90 text-amber-100',
                info: 'border-primary/30 bg-primary/10 text-foreground',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}

import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Share_Tech, Share_Tech_Mono } from 'next/font/google'
import { AuthProvider } from '@/lib/auth-context'
import { ScrollToTop } from '@/components/scroll-to-top'
import { ViewSourceButton } from '@/components/view-source-button'
import './globals.css'

const shareTech = Share_Tech({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-share-tech',
})
const shareTechMono = Share_Tech_Mono({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-share-tech-mono',
})

export const metadata: Metadata = {
  title: 'Perfectory Voice — AI Text to Voice Generator',
  description:
    'Convert text to natural voice in Bangla, English and Hindi. Advanced, gradient-powered text-to-speech studio.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#ffffff',
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${shareTech.variable} ${shareTechMono.variable} bg-background`}>
      <body className="font-sans antialiased">
        <ScrollToTop />
        <ViewSourceButton />
        <AuthProvider>{children}</AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'Crumbs - Expense & Income Tracker',
  description: 'Track expenses, incomes, and split with friends easily.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <Script src="https://accounts.google.com/gsi/client" strategy="beforeInteractive" />
      </head>
      <body className={`${outfit.variable} font-sans antialiased min-h-screen flex flex-col bg-background text-foreground`}>
        <div className="fixed inset-0 z-[-1] bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="fixed inset-0 z-[-1] flex items-center justify-center">
          <div className="w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-primary/20 rounded-full blur-[120px] opacity-50" />
        </div>
        {children}
        <Toaster />
      </body>
    </html>
  )
}

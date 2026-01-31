import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import SessionManager from '@/components/SessionManager'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Goal Tracker',
  description: 'Track your goals and achieve your dreams',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionManager />
        {children}
      </body>
    </html>
  )
}

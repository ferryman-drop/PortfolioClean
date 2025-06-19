import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Crypto Portfolio Manager',
  description: 'Advanced crypto portfolio management with automatic rebalancing and analytics',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        {children}
      </body>
    </html>
  )
} 
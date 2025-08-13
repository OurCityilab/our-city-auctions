import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Wayne County Auction Game',
  description: 'Educational real estate auction simulation for Wayne County foreclosure properties',
  keywords: 'real estate, auction, education, Wayne County, foreclosure, property investment',
  authors: [{ name: 'Wayne County Auction Simulation' }],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1e40af',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
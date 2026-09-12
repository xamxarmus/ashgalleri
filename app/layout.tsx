import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ashgalleri.com | Butik Korean Cotton Premium',
  description: 'Koleksi fabrik Korean Cotton berkualiti tinggi dan eksklusif.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ms">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
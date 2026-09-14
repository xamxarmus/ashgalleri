import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
// Kita import sistem Toast di sini
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

// MAGIS SEO & WHATSAPP PREVIEW 🖼️✨
export const metadata: Metadata = {
  title: 'Ash Galleri | Koleksi Premium Cotton',
  description: 'Tingkatkan keanggunan gaya anda dengan fabrik berkualiti tinggi dari Ash Galleri. Moden, selesa, dan eksklusif.',
  openGraph: {
    title: 'Ash Galleri | Koleksi Premium Cotton',
    description: 'Tingkatkan keanggunan gaya anda dengan fabrik berkualiti tinggi dari Ash Galleri.',
    url: 'https://ashgalleri.com',
    siteName: 'Ash Galleri',
    images: [
      {
        url: 'https://ashgalleri.com/hero-bg.jpg', // Gambar ini akan muncul di WhatsApp!
        width: 1200,
        height: 630,
        alt: 'Ash Galleri Premium Cotton',
      }
    ],
    locale: 'ms_MY',
    type: 'website',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ms" className="scroll-smooth">
      <body className={inter.className}>
        {children}
        {/* TOASTER AKAN MUNCUL DI TENGAH ATAS SKRIN */}
        <Toaster 
          position="top-center" 
          toastOptions={{
            style: {
              background: '#3B0764',
              color: '#fff',
              borderRadius: '12px',
              fontWeight: 'bold',
              fontSize: '14px'
            },
            success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
          }} 
        />
      </body>
    </html>
  )
}
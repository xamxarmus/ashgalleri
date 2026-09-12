import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { MessageCircle } from 'lucide-react'

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
  // AWAK PERLU TUKAR NOMBOR DI BAWAH KEPADA NOMBOR WHATSAPP AWAK (Mula dengan 60)
  const whatsappNumber = "60179504385"; 
  const whatsappMessage = "Hai Ash Galleri! Saya nak tanya sikit tentang kain cotton di butik ni. 🌸";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <html lang="ms" className="scroll-smooth">
      <body className={inter.className}>
        {children}
        
        {/* Butang WhatsApp Terapung (Floating Button) */}
        <a 
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:scale-110 hover:shadow-xl transition-all duration-300 z-50 flex items-center justify-center animate-bounce group"
          title="Hubungi kami di WhatsApp"
        >
          <MessageCircle size={28} />
          {/* Teks kecil yang keluar bila pelanggan halakan mouse */}
          <span className="absolute right-16 bg-white text-[#3D3A37] text-xs font-bold px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-md w-max pointer-events-none">
            Chat dengan kami! 👋
          </span>
        </a>
      </body>
    </html>
  )
}
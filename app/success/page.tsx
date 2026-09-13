'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle2, ShoppingBag, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function SuccessPage() {
  
  // Magis untuk kosongkan troli selepas bayaran berjaya 🧹
  useEffect(() => {
    async function clearCart() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.from('cart').delete().eq('user_id', session.user.id);
      }
    }
    clearCart();
  }, []);

  return (
    <div className="min-h-screen bg-[#FCFAFF] flex flex-col items-center justify-center p-5 text-[#2E1065] font-sans">
      <div className="bg-white p-10 md:p-16 rounded-3xl border border-[#E9D5FF] shadow-xl text-center max-w-lg w-full transform transition-all hover:scale-105 duration-500">
        
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-[#C084FC] rounded-full blur-xl opacity-50 animate-pulse"></div>
            <CheckCircle2 size={80} className="text-[#A855F7] relative z-10" />
          </div>
        </div>
        
        <h1 className="text-4xl font-serif font-bold text-[#3B0764] mb-4">Pembayaran Berjaya! 🎉</h1>
        
        <p className="text-[#6B21A8] mb-8 text-lg font-medium">
          Yay! 🥳 Terima kasih kerana membeli-belah di Ash Galleri. Pesanan eksklusif anda sedang diproses dan kami akan siapkannya secepat mungkin. 🚚✨
        </p>
        
        <div className="flex flex-col gap-4">
          <Link href="/profile" className="w-full bg-[#C084FC] text-white py-4 rounded-xl text-base font-bold hover:bg-[#A855F7] transition-all flex items-center justify-center gap-2 shadow-lg">
            <ShoppingBag size={20}/> Semak Status Pesanan
          </Link>
          <Link href="/" className="w-full bg-[#F3E8FF] text-[#6B21A8] py-4 rounded-xl text-base font-bold hover:bg-[#E9D5FF] transition-all flex items-center justify-center gap-2 shadow-sm">
            Kembali ke Butik <ArrowRight size={20}/>
          </Link>
        </div>
      </div>
    </div>
  );
}
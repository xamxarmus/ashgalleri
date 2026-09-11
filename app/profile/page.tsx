'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, User, ShoppingBag, LogOut, Save, Trash2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [cartTotal, setCartTotal] = useState(0);

  // Senarai Pilihan Gambar Avatar "Natural & Estetik"
  const presetAvatars = [
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=150&q=80', // Gambar Daun/Nature
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
  ];

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login'); // Kalau belum login, halau ke page login
      return;
    }
    setUser(session.user);

    // 1. Dapatkan Profil
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
    if (profile) {
      setFullName(profile.full_name || '');
      setAvatarUrl(profile.avatar_url || presetAvatars[0]);
    } else {
      setAvatarUrl(presetAvatars[0]);
    }

    // 2. Dapatkan Senarai Troli
    const { data: cartData } = await supabase
      .from('cart')
      .select('*, product:products(*)')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
    
    if (cartData) {
      setCartItems(cartData);
      const total = cartData.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
      setCartTotal(total);
    }

    setLoading(false);
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      full_name: fullName,
      avatar_url: avatarUrl,
    });

    if (error) alert('Ralat simpan profil: ' + error.message);
    else alert('Profil berjaya dikemas kini! 🌸');
    setLoading(false);
  }

  async function removeFromCart(cartId: string) {
    await supabase.from('cart').delete().eq('id', cartId);
    loadData(); // Muat semula troli selepas buang barang
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/');
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] text-[#6B705C] animate-pulse font-serif text-xl">Menyiapkan bilik persalinan... 🌸</div>;

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#3D3A37] font-sans pb-20">
      <header className="bg-white border-b border-[#E8E1D9] px-5 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[#8F9489] hover:text-[#5B4636] transition-colors text-sm font-semibold">
            <ArrowLeft size={18} /> Kembali ke Butik
          </Link>
          <h1 className="text-xl font-serif font-bold text-[#2F3E46] tracking-wide">Profil Pelanggan</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-8 flex flex-col md:flex-row gap-8">
        
        {/* Bahagian Profil Kiri (Maklumat & Avatar) */}
        <div className="w-full md:w-1/3">
          <div className="bg-white p-6 rounded-2xl border border-[#E8E1D9] shadow-sm sticky top-24">
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <img src={avatarUrl || presetAvatars[0]} alt="Avatar" className="w-28 h-28 rounded-full object-cover border-4 border-[#F7F2EC] shadow-md mb-4" />
                <div className="absolute bottom-3 right-0 bg-[#6B705C] text-white rounded-full p-1 border-2 border-white">
                  <CheckCircle2 size={16} />
                </div>
              </div>
              <h2 className="font-serif text-xl font-bold text-[#2F3E46]">{fullName || 'Pelanggan VIP'}</h2>
              <p className="text-xs text-[#8F9489] mt-1">{user?.email}</p>
            </div>

            <form onSubmit={saveProfile} className="space-y-5 border-t border-[#E8E1D9] pt-5">
              <div>
                <label className="block text-xs font-semibold text-[#5B4636] mb-1">Nama Panggilan</label>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full px-4 py-2.5 border border-[#E8E1D9] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#DDBEA9] bg-[#FDFBF7]" placeholder="Cth: Cik Mawar"/>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-[#5B4636] mb-2">Pilih Identiti (Avatar Natural)</label>
                <div className="flex gap-3 flex-wrap justify-center bg-[#F7F2EC] p-3 rounded-xl border border-[#E8E1D9]">
                  {presetAvatars.map((url, idx) => (
                    <img 
                      key={idx} 
                      src={url} 
                      onClick={() => setAvatarUrl(url)}
                      className={`w-12 h-12 rounded-full cursor-pointer object-cover transition-all duration-300 ${avatarUrl === url ? 'ring-4 ring-[#6B705C] scale-110 shadow-md' : 'ring-2 ring-transparent hover:scale-105 opacity-80 hover:opacity-100'}`}
                      alt={`Pilihan Avatar ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-[#DDBEA9] text-[#5B4636] py-3 rounded-xl text-sm font-bold hover:bg-[#cbb09d] transition-all flex items-center justify-center gap-2 shadow-sm">
                <Save size={16}/> Simpan Profil
              </button>
            </form>

            <button onClick={handleLogout} className="w-full mt-4 bg-white border border-red-200 text-red-500 py-3 rounded-xl text-sm font-bold hover:bg-red-50 transition-all flex items-center justify-center gap-2">
              <LogOut size={16}/> Log Keluar
            </button>
          </div>
        </div>

        {/* Bahagian Troli Kanan */}
        <div className="w-full md:w-2/3">
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#E8E1D9] shadow-sm">
            <h2 className="text-2xl font-serif font-bold mb-6 flex items-center gap-3 text-[#2F3E46]">
              <ShoppingBag size={24} className="text-[#6B705C]"/> Troli Saya
            </h2>
            
            {cartItems.length === 0 ? (
              <div className="text-center py-16 bg-[#FDFBF7] rounded-2xl border-2 border-dashed border-[#E8E1D9]">
                <ShoppingBag size={48} className="mx-auto text-[#DDBEA9] mb-4 opacity-50"/>
                <p className="text-base font-medium text-[#5B4636]">Troli anda masih kosong, sedihnya! 🥺</p>
                <p className="text-xs text-[#8F9489] mt-2 mb-6">Jom cuci mata dan pilih kain yang cantik-cantik.</p>
                <Link href="/#koleksi" className="inline-flex items-center gap-2 bg-[#6B705C] text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-[#585C4B] transition-all shadow-sm">
                  Mula Membeli-belah
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-4 border border-[#E8E1D9] rounded-2xl hover:shadow-md transition-shadow bg-[#FDFBF7]">
                    <div className="flex items-center gap-5">
                      <img src={item.product?.image_url || 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=150&q=80'} className="w-20 h-20 rounded-xl object-cover bg-white shadow-sm border border-[#EAE3DA]" />
                      <div>
                        <h4 className="font-bold text-base text-[#2F3E46] mb-1">{item.product?.name}</h4>
                        <p className="text-xs text-[#8F9489] bg-white px-2 py-1 rounded-md inline-block border border-[#E8E1D9]">RM {Number(item.product?.price).toFixed(2)} / meter</p>
                        <p className="text-xs font-semibold text-[#5B4636] mt-2">Kuantiti: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <p className="font-bold text-lg text-[#2F3E46]">RM {(item.product?.price * item.quantity).toFixed(2)}</p>
                      <button onClick={() => removeFromCart(item.id)} className="text-xs text-red-500 hover:text-white bg-red-50 hover:bg-red-500 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 font-semibold">
                        <Trash2 size={14}/> Buang
                      </button>
                    </div>
                  </div>
                ))}
                
                <div className="border-t-2 border-[#E8E1D9] pt-6 mt-6">
                  <div className="flex items-center justify-between mb-6 bg-[#F7F2EC] p-4 rounded-xl">
                    <h3 className="font-serif font-bold text-xl text-[#2F3E46]">Jumlah Perlu Dibayar</h3>
                    <h3 className="font-bold text-2xl text-[#6B705C]">RM {cartTotal.toFixed(2)}</h3>
                  </div>
                  
                  <button className="w-full bg-[#6B705C] text-white py-4 rounded-xl text-base font-bold hover:bg-[#585C4B] transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl">
                    <ShoppingBag size={20}/> Teruskan Pembayaran (Stripe)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
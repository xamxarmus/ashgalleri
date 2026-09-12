'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, ShoppingBag, LogOut, Save, Trash2, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [cartTotal, setCartTotal] = useState(0);

  // IDENTITI HAIWAN YANG COMEL (Kucing, Anjing, Musang, Panda, Burung Hantu)
  const presetAvatars = [
    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1516934024742-b461fba47600?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?auto=format&fit=crop&w=150&q=80', 
    'https://images.unsplash.com/photo-1540324155974-7523202daa3f?auto=format&fit=crop&w=150&q=80',
  ];

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return router.push('/login');
    setUser(session.user);

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
    if (profile) { setFullName(profile.full_name || ''); setAvatarUrl(profile.avatar_url || presetAvatars[0]); }

    const { data: cartData } = await supabase.from('cart').select('*, product:products(*)').eq('user_id', session.user.id).order('created_at', { ascending: false });
    if (cartData) {
      setCartItems(cartData);
      setCartTotal(cartData.reduce((acc, item) => acc + (item.product.price * item.quantity), 0));
    }
    setLoading(false);
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    const { error } = await supabase.from('profiles').upsert({ id: user.id, full_name: fullName, avatar_url: avatarUrl });
    if (!error) alert('Profil berjaya dikemas kini! 🌸');
    setLoading(false);
  }

  async function removeFromCart(cartId: string) { await supabase.from('cart').delete().eq('id', cartId); loadData(); }
  async function handleLogout() { await supabase.auth.signOut(); router.push('/'); }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FCFAFF] text-[#6B21A8] animate-pulse">Menyiapkan bilik persalinan... 🌸</div>;

  return (
    <div className="min-h-screen bg-[#FCFAFF] text-[#2E1065] font-sans pb-20">
      <header className="bg-white border-b border-[#E9D5FF] px-5 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[#9333EA] hover:text-[#6B21A8] transition-colors text-sm font-semibold">
            <ArrowLeft size={18} /> Kembali ke Butik
          </Link>
          <h1 className="text-xl font-serif font-bold text-[#3B0764] tracking-wide">Profil Pelanggan</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-8 flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3">
          <div className="bg-white p-6 rounded-2xl border border-[#E9D5FF] shadow-sm sticky top-24">
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <img src={avatarUrl || presetAvatars[0]} className="w-28 h-28 rounded-full object-cover border-4 border-[#F3E8FF] shadow-md mb-4" />
                <div className="absolute bottom-3 right-0 bg-[#C084FC] text-white rounded-full p-1 border-2 border-white"><CheckCircle2 size={16} /></div>
              </div>
              <h2 className="font-serif text-xl font-bold text-[#3B0764]">{fullName || 'Pelanggan VIP'}</h2>
              <p className="text-xs text-[#9333EA] mt-1">{user?.email}</p>
            </div>

            <form onSubmit={saveProfile} className="space-y-5 border-t border-[#E9D5FF] pt-5">
              <div>
                <label className="block text-xs font-semibold text-[#6B21A8] mb-1">Nama Panggilan</label>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full px-4 py-2.5 border border-[#E9D5FF] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C084FC] bg-[#FCFAFF]" placeholder="Cth: Cik Mawar"/>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6B21A8] mb-2">Pilih Identiti (Haiwan Comel)</label>
                <div className="flex gap-3 flex-wrap justify-center bg-[#F3E8FF] p-3 rounded-xl border border-[#E9D5FF]">
                  {presetAvatars.map((url, idx) => (
                    <img key={idx} src={url} onClick={() => setAvatarUrl(url)} className={`w-12 h-12 rounded-full cursor-pointer object-cover transition-all duration-300 ${avatarUrl === url ? 'ring-4 ring-[#C084FC] scale-110 shadow-md' : 'ring-2 ring-transparent opacity-80 hover:opacity-100'}`} alt={`Haiwan ${idx + 1}`} />
                  ))}
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-[#E9D5FF] text-[#6B21A8] py-3 rounded-xl text-sm font-bold hover:bg-[#D8B4E2] transition-all flex items-center justify-center gap-2 shadow-sm">
                <Save size={16}/> Simpan Profil
              </button>
            </form>
            <button onClick={handleLogout} className="w-full mt-4 bg-white border border-red-200 text-red-500 py-3 rounded-xl text-sm font-bold hover:bg-red-50 transition-all flex items-center justify-center gap-2">
              <LogOut size={16}/> Log Keluar
            </button>
          </div>
        </div>

        <div className="w-full md:w-2/3">
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#E9D5FF] shadow-sm">
            <h2 className="text-2xl font-serif font-bold mb-6 flex items-center gap-3 text-[#3B0764]"><ShoppingBag size={24} className="text-[#C084FC]"/> Troli Saya</h2>
            {cartItems.length === 0 ? (
              <div className="text-center py-16 bg-[#FCFAFF] rounded-2xl border-2 border-dashed border-[#E9D5FF]">
                <ShoppingBag size={48} className="mx-auto text-[#E9D5FF] mb-4 opacity-50"/>
                <p className="text-base font-medium text-[#6B21A8]">Troli anda masih kosong, sedihnya! 🥺</p>
                <Link href="/#koleksi" className="inline-flex mt-4 items-center gap-2 bg-[#C084FC] text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-[#A855F7] transition-all shadow-sm">Mula Membeli-belah</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-4 border border-[#E9D5FF] rounded-2xl bg-[#FCFAFF] hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-5">
                      <img src={item.product?.image_url} className="w-20 h-20 rounded-xl object-cover bg-white border border-[#E9D5FF] shadow-sm" />
                      <div>
                        <h4 className="font-bold text-base text-[#3B0764] mb-1">{item.product?.name}</h4>
                        <p className="text-xs text-[#9333EA] bg-white px-2 py-1 rounded-md inline-block border border-[#E9D5FF]">RM {Number(item.product?.price).toFixed(2)} / meter</p>
                        <p className="text-xs font-semibold text-[#6B21A8] mt-2">Kuantiti: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <p className="font-bold text-lg text-[#3B0764]">RM {(item.product?.price * item.quantity).toFixed(2)}</p>
                      <button onClick={() => removeFromCart(item.id)} className="text-xs text-red-500 hover:text-white bg-red-50 hover:bg-red-500 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 font-semibold"><Trash2 size={14}/> Buang</button>
                    </div>
                  </div>
                ))}
                <div className="border-t-2 border-[#E9D5FF] pt-6 mt-6">
                  <div className="flex items-center justify-between mb-6 bg-[#F3E8FF] p-4 rounded-xl">
                    <h3 className="font-serif font-bold text-xl text-[#3B0764]">Jumlah Perlu Dibayar</h3>
                    <h3 className="font-bold text-2xl text-[#C084FC]">RM {cartTotal.toFixed(2)}</h3>
                  </div>
                  <button onClick={() => router.push('/checkout')} className="w-full bg-[#C084FC] text-white py-4 rounded-xl text-base font-bold hover:bg-[#A855F7] transition-all flex items-center justify-center gap-2 shadow-lg">
                    Proses Pembayaran (Checkout) <ArrowRight size={20}/>
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
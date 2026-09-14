'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trash2, ShoppingBag, Package, CheckCircle2, Clock, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]); // Menyimpan sejarah pesanan
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
      return;
    }
    setUser(session.user);

    // 1. Tarik Data Troli
    const { data: cartData } = await supabase
      .from('cart')
      .select('*, product:products(*)')
      .eq('user_id', session.user.id);
    
    if (cartData) setCartItems(cartData);

    // 2. Tarik Data Sejarah Pesanan (Rekod Pembelian)
    const { data: orderData } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false }); // Susun yang terbaru di atas
    
    if (orderData) setOrders(orderData);

    setLoading(false);
  }

  async function removeFromCart(id: string) {
    setLoading(true);
    const { error } = await supabase.from('cart').delete().eq('id', id);
    if (!error) {
      setCartItems(cartItems.filter(item => item.id !== id));
      toast.success('Barang dikeluarkan dari troli. 🗑️');
    } else {
      toast.error('Ralat: ' + error.message);
    }
    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    toast.success('Berjaya log keluar. Jumpa lagi! 👋');
    router.push('/');
  }

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FCFAFF]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C084FC]"></div></div>;

  return (
    <div className="min-h-screen bg-[#FCFAFF] text-[#2E1065] font-sans pb-20">
      
      <header className="bg-white border-b border-[#E9D5FF] px-5 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-[#9333EA] hover:text-[#6B21A8] transition-colors"><ArrowLeft size={20} /></Link>
            <h1 className="text-xl font-serif font-bold text-[#3B0764]">Profil & Troli Saya</h1>
          </div>
          <button onClick={handleLogout} className="text-sm font-bold text-red-500 hover:text-red-700 flex items-center gap-2 bg-red-50 px-4 py-2 rounded-full transition-colors">
            <LogOut size={16} /> Log Keluar
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-8 space-y-8">
        
        {/* BAHAGIAN 1: TROLI MEMBELI-BELAH SAKU */}
        <section className="bg-white p-6 md:p-8 rounded-3xl border border-[#E9D5FF] shadow-sm">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-[#3B0764]">
            <ShoppingBag size={24} className="text-[#C084FC]"/> Troli Membeli-belah
          </h2>
          
          {cartItems.length === 0 ? (
            <div className="text-center py-10 bg-[#F3E8FF] rounded-2xl border border-[#E9D5FF]">
              <p className="text-[#6B21A8] font-medium mb-4">Troli anda masih kosong. 🌸</p>
              <Link href="/" className="inline-block bg-[#C084FC] text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-[#A855F7] transition-all shadow-sm">Mula Membeli-belah</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border border-[#E9D5FF] rounded-2xl bg-[#FCFAFF]">
                  <div className="flex items-center gap-4">
                    <img src={item.product?.image_url} alt={item.product?.name} className="w-16 h-16 object-cover rounded-xl border border-[#E9D5FF]" />
                    <div>
                      <h3 className="font-bold text-[#3B0764]">{item.product?.name}</h3>
                      <p className="text-sm text-[#9333EA]">RM {item.product?.price.toFixed(2)} x {item.quantity}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-[#A855F7]">RM {(item.product?.price * item.quantity).toFixed(2)}</span>
                    <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 bg-red-50 p-2 rounded-lg transition-colors"><Trash2 size={18}/></button>
                  </div>
                </div>
              ))}
              <div className="pt-6 mt-4 border-t border-[#E9D5FF] flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <p className="text-sm text-[#9333EA] font-semibold">Jumlah Keseluruhan:</p>
                  <p className="text-3xl font-bold text-[#3B0764]">RM {cartTotal.toFixed(2)}</p>
                </div>
                <Link href="/checkout" className="w-full sm:w-auto bg-[#3B0764] text-white px-8 py-3.5 rounded-xl text-base font-bold hover:bg-[#6B21A8] transition-all text-center shadow-md">
                  Teruskan ke Pembayaran
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* BAHAGIAN 2: REKOD PESANAN BERJAYA (BARU) 📦✨ */}
        <section className="bg-white p-6 md:p-8 rounded-3xl border border-[#E9D5FF] shadow-sm">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-[#3B0764]">
            <Package size={24} className="text-[#C084FC]"/> Rekod Pesanan Saya
          </h2>
          
          {orders.length === 0 ? (
            <div className="text-center py-8 bg-[#FCFAFF] rounded-2xl border border-[#E9D5FF]">
              <p className="text-[#9333EA] text-sm">Belum ada sejarah pembelian direkodkan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {orders.map((order) => (
                <div key={order.id} className="p-5 border-2 border-[#E9D5FF] rounded-2xl bg-[#FCFAFF] hover:shadow-md transition-all">
                  
                  <div className="flex justify-between items-start mb-4 border-b border-[#E9D5FF] pb-4">
                    <div>
                      <p className="text-xs font-bold text-[#9333EA] mb-1.5">{new Date(order.created_at).toLocaleDateString('ms-MY')}</p>
                      
                      {/* LENCANA STATUS PINTAR */}
                      {order.status === 'Selesai' ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md text-[11px] font-bold border border-emerald-200">
                          <CheckCircle2 size={12}/> Pembayaran Berjaya & Siap Dihantar
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2.5 py-1 rounded-md text-[11px] font-bold border border-amber-200">
                          <Clock size={12}/> Sedang Diproses
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-lg text-[#C084FC]">RM {Number(order.total_amount).toFixed(2)}</span>
                  </div>
                  
                  {/* SENARAI BARANG YANG DIBELI */}
                  <div>
                    <p className="text-xs font-bold text-[#6B21A8] mb-2">Barang Dibeli:</p>
                    <div className="space-y-1.5">
                      {order.cart_items?.map((item: any, idx: number) => (
                        <p key={idx} className="text-sm font-semibold text-[#3B0764] flex items-center gap-2 bg-white px-2 py-1.5 rounded-lg border border-[#E9D5FF]">
                          <span className="w-1.5 h-1.5 bg-[#C084FC] rounded-full"></span> 
                          {item.product?.name} <span className="text-[#9333EA] ml-auto">Kuantiti: {item.quantity}</span>
                        </p>
                      ))}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
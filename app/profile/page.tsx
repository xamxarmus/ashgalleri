'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trash2, ShoppingBag, Package, CheckCircle2, Clock, LogOut, ChevronDown, ChevronUp, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';

// SENARAI AVATAR HAIWAN COMEL 🐾
const ANIMAL_AVATARS = ['🐱', '🐶', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🦉', '🦋', '🐧'];

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // STATE UNTUK EDIT PROFIL 🎨
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState('🐱');
  const [savingProfile, setSavingProfile] = useState(false);

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
    
    // Tetapkan nilai awal profil jika ada
    setNickname(session.user.user_metadata?.nickname || '');
    setAvatar(session.user.user_metadata?.avatar || '🐱');

    const { data: cartData } = await supabase
      .from('cart')
      .select('*, product:products(*)')
      .eq('user_id', session.user.id);
    if (cartData) setCartItems(cartData);

    const { data: orderData } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
    if (orderData) setOrders(orderData);

    setLoading(false);
  }

  // FUNGSI SIMPAN PROFIL 💾
  async function handleSaveProfile() {
    setSavingProfile(true);
    const { data, error } = await supabase.auth.updateUser({
      data: { nickname: nickname, avatar: avatar }
    });

    if (error) {
      toast.error('Gagal kemas kini profil: ' + error.message);
    } else {
      toast.success('Profil berjaya dikemas kini! 🐾✨');
      setUser(data.user);
      setIsEditingProfile(false);
    }
    setSavingProfile(false);
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

  const toggleOrderDetails = (orderId: string) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(orderId);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FCFAFF]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C084FC]"></div></div>;

  return (
    <div className="min-h-screen bg-[#FCFAFF] text-[#2E1065] font-sans pb-20">
      
      <header className="bg-white border-b border-[#E9D5FF] px-5 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-[#9333EA] hover:text-[#6B21A8] transition-colors"><ArrowLeft size={20} /></Link>
            <h1 className="text-xl font-serif font-bold text-[#3B0764]">Profil & Troli</h1>
          </div>
          <button onClick={handleLogout} className="text-sm font-bold text-red-500 hover:text-red-700 flex items-center gap-2 bg-red-50 px-4 py-2 rounded-full transition-colors">
            <LogOut size={16} /> Log Keluar
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 py-8 space-y-6">
        
        {/* BAHAGIAN PROFIL & AVATAR HAIWAN 🐾 */}
        <section className="bg-white p-6 rounded-3xl border border-[#E9D5FF] shadow-sm relative">
          
          {isEditingProfile ? (
            <div className="space-y-5 animate-in fade-in duration-300">
              <h3 className="font-bold text-lg text-[#3B0764]">Edit Profil Saya 🎨</h3>
              
              <div>
                <label className="text-xs font-bold text-[#6B21A8] block mb-2">1. Pilih Avatar Haiwan Anda:</label>
                <div className="flex flex-wrap gap-2">
                  {ANIMAL_AVATARS.map((emoji) => (
                    <button 
                      key={emoji} 
                      onClick={() => setAvatar(emoji)}
                      className={`text-3xl p-2.5 rounded-2xl transition-all ${
                        avatar === emoji 
                        ? 'bg-[#F3E8FF] border-2 border-[#C084FC] scale-110 shadow-sm' 
                        : 'border-2 border-transparent hover:bg-gray-50'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#6B21A8] block mb-2">2. Nama Panggilan (Nickname):</label>
                <input 
                  type="text" 
                  value={nickname} 
                  onChange={e => setNickname(e.target.value)} 
                  placeholder="Cth: Cikgu Bunga"
                  className="w-full md:w-1/2 px-4 py-3 border border-[#E9D5FF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C084FC] text-[#3B0764] font-semibold" 
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={handleSaveProfile} 
                  disabled={savingProfile}
                  className="bg-[#C084FC] hover:bg-[#A855F7] text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm disabled:opacity-50"
                >
                  {savingProfile ? 'Menyimpan...' : 'Simpan Profil'}
                </button>
                <button 
                  onClick={() => setIsEditingProfile(false)} 
                  className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-6 py-2.5 rounded-xl text-sm font-bold transition-all"
                >
                  Batal
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
              <button 
                onClick={() => setIsEditingProfile(true)}
                className="absolute top-6 right-6 text-[#9333EA] hover:text-[#A855F7] bg-[#F3E8FF] p-2 rounded-full transition-colors"
                title="Edit Profil"
              >
                <Edit2 size={18} />
              </button>

              <div className="text-6xl bg-gradient-to-br from-[#F3E8FF] to-[#E9D5FF] w-24 h-24 rounded-full flex items-center justify-center border-4 border-white shadow-md">
                {user?.user_metadata?.avatar || '🐱'}
              </div>
              <div className="mt-2 sm:mt-1">
                <h2 className="text-2xl font-bold text-[#3B0764] mb-1">
                  {user?.user_metadata?.nickname || 'Selamat Datang!'}
                </h2>
                <p className="text-[#6B21A8] font-medium text-sm bg-[#FCFAFF] px-3 py-1 rounded-lg border border-[#E9D5FF] inline-block mt-1">
                  {user?.email}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* TROLI MEMBELI-BELAH */}
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

        {/* REKOD PESANAN SAYA (GAYA JALUR BARIS KEMAS) 📦✨ */}
        <section className="bg-white p-6 md:p-8 rounded-3xl border border-[#E9D5FF] shadow-sm">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-[#3B0764]">
            <Package size={24} className="text-[#C084FC]"/> Rekod Pesanan Saya
          </h2>
          
          {orders.length === 0 ? (
            <div className="text-center py-8 bg-[#FCFAFF] rounded-2xl border border-[#E9D5FF]">
              <p className="text-[#9333EA] text-sm">Belum ada sejarah pembelian direkodkan.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="border border-[#E9D5FF] rounded-2xl bg-white overflow-hidden transition-all shadow-sm hover:shadow-md">
                  
                  {/* BAHAGIAN ATAS BARIS (SENTIASA NAMPAK & BOLEH KLIK) */}
                  <div 
                    onClick={() => toggleOrderDetails(order.id)}
                    className="p-4 md:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-[#F9F5FF] transition-colors"
                  >
                    <div className="flex items-center gap-4 md:gap-8">
                      <div>
                        <p className="text-xs font-bold text-[#9333EA] mb-1">Tarikh</p>
                        <p className="text-sm font-semibold text-[#3B0764]">{new Date(order.created_at).toLocaleDateString('ms-MY')}</p>
                      </div>
                      
                      <div className="hidden md:block">
                        <p className="text-xs font-bold text-[#9333EA] mb-1">Status</p>
                        {order.status === 'Selesai' ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md text-[11px] font-bold">
                            <CheckCircle2 size={12}/> Siap Dihantar
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2.5 py-1 rounded-md text-[11px] font-bold">
                            <Clock size={12}/> Diproses
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                      <div className="md:hidden">
                        {order.status === 'Selesai' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 text-[11px] font-bold"><CheckCircle2 size={12}/> Siap Dihantar</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-600 text-[11px] font-bold"><Clock size={12}/> Diproses</span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-lg text-[#C084FC]">RM {Number(order.total_amount).toFixed(2)}</span>
                        <div className="text-[#9333EA] bg-[#F3E8FF] p-1.5 rounded-full">
                          {expandedOrderId === order.id ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* BAHAGIAN PERINCIAN (AKAN KELUAR BILA DIKLIK) */}
                  {expandedOrderId === order.id && (
                    <div className="p-4 md:px-6 border-t border-[#E9D5FF] bg-[#FCFAFF] animate-in fade-in slide-in-from-top-2 duration-200">
                      <p className="text-xs font-bold text-[#6B21A8] mb-3">Perincian Pesanan:</p>
                      <div className="space-y-2">
                        {order.cart_items?.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-xl border border-[#E9D5FF]">
                            <p className="text-sm font-semibold text-[#3B0764] flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-[#C084FC] rounded-full"></span> 
                              {item.product?.name}
                            </p>
                            <span className="text-sm font-bold text-[#9333EA] bg-[#F3E8FF] px-3 py-1 rounded-lg">x {item.quantity}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-[#E9D5FF] grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] font-bold text-[#9333EA] uppercase">Alamat Penghantaran</p>
                          <p className="text-sm text-[#3B0764] mt-1 font-medium leading-tight">{order.shipping_address}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-[#9333EA] uppercase">Nombor Telefon</p>
                          <p className="text-sm text-[#3B0764] mt-1 font-bold">{order.customer_phone}</p>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
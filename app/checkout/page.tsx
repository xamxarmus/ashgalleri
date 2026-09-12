'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, MapPin, Phone, CreditCard, Truck } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [userId, setUserId] = useState('');

  // Borang Alamat
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [postcode, setPostcode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Kelantan');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
      return;
    }
    setUserId(session.user.id);

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
    if (profile) setFullName(profile.full_name || '');

    const { data: cartData } = await supabase
      .from('cart')
      .select('*, product:products(*)')
      .eq('user_id', session.user.id);
    
    if (cartData && cartData.length > 0) {
      setCartItems(cartData);
      const total = cartData.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
      setCartTotal(total);
    } else {
      router.push('/profile');
    }
    setLoading(false);
  }

  // FUNGSI BARU: Simpan alamat ke database sebelum pergi ke Stripe!
  async function handleProceedToPayment(e: React.FormEvent) {
    e.preventDefault();
    setIsCheckingOut(true);

    const fullShippingAddress = `${address}, ${postcode} ${city}, ${state}`;

    // 1. Simpan rekod pesanan (beserta alamat) ke dalam tabel 'orders'
    const { error: orderError } = await supabase.from('orders').insert([{
      user_id: userId,
      customer_name: fullName,
      customer_phone: phone,
      shipping_address: fullShippingAddress,
      cart_items: cartItems,
      total_amount: cartTotal
    }]);

    if (orderError) {
      alert('Ralat menyimpan pesanan: ' + orderError.message);
      setIsCheckingOut(false);
      return;
    }

    // 2. Jika selamat disimpan, baru pergi ke bank (Stripe)
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cartItems }),
      });

      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url; 
      } else {
        alert('Ralat Stripe: ' + data.error);
        setIsCheckingOut(false);
      }
    } catch (error) {
      alert('Ralat menyambung ke bank.');
      setIsCheckingOut(false);
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] animate-pulse">Menyediakan borang pesanan... 🌸</div>;

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#3D3A37] font-sans pb-20">
      <header className="bg-white border-b border-[#E8E1D9] px-5 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Link href="/profile" className="text-[#8F9489] hover:text-[#5B4636] transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-serif font-bold text-[#2F3E46]">Maklumat Penghantaran</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 py-8 flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-2/3">
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#E8E1D9] shadow-sm">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-[#2F3E46]">
              <Truck size={20} className="text-[#6B705C]"/> Ke mana kami perlu hantar?
            </h2>
            
            <form id="checkout-form" onSubmit={handleProceedToPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#5B4636] mb-1">Nama Penuh Penerima</label>
                <input required type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full px-4 py-3 border border-[#E8E1D9] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#DDBEA9]" placeholder="Cth: Siti Aminah"/>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-[#5B4636] mb-1 flex items-center gap-1"><Phone size={14}/> Nombor Telefon (WhatsApp)</label>
                <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-3 border border-[#E8E1D9] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#DDBEA9]" placeholder="Cth: 0123456789"/>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5B4636] mb-1 flex items-center gap-1"><MapPin size={14}/> Alamat Lengkap (Rumah/Pejabat)</label>
                <textarea required value={address} onChange={e => setAddress(e.target.value)} rows={3} className="w-full px-4 py-3 border border-[#E8E1D9] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#DDBEA9]" placeholder="Cth: No 12, Jalan Bunga Raya, Taman Impian"/>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#5B4636] mb-1">Poskod</label>
                  <input required type="text" value={postcode} onChange={e => setPostcode(e.target.value)} className="w-full px-4 py-3 border border-[#E8E1D9] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#DDBEA9]" placeholder="Cth: 17000"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5B4636] mb-1">Bandar</label>
                  <input required type="text" value={city} onChange={e => setCity(e.target.value)} className="w-full px-4 py-3 border border-[#E8E1D9] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#DDBEA9]" placeholder="Cth: Pasir Mas"/>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5B4636] mb-1">Negeri</label>
                <select required value={state} onChange={e => setState(e.target.value)} className="w-full px-4 py-3 border border-[#E8E1D9] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#DDBEA9] bg-white cursor-pointer">
                  <option value="Kelantan">Kelantan</option>
                  <option value="Terengganu">Terengganu</option>
                  <option value="Pahang">Pahang</option>
                  <option value="Johor">Johor</option>
                  <option value="Melaka">Melaka</option>
                  <option value="Negeri Sembilan">Negeri Sembilan</option>
                  <option value="Selangor">Selangor</option>
                  <option value="Kuala Lumpur">Kuala Lumpur</option>
                  <option value="Putrajaya">Putrajaya</option>
                  <option value="Perak">Perak</option>
                  <option value="Pulau Pinang">Pulau Pinang</option>
                  <option value="Kedah">Kedah</option>
                  <option value="Perlis">Perlis</option>
                  <option value="Sabah">Sabah</option>
                  <option value="Sarawak">Sarawak</option>
                </select>
              </div>
            </form>
          </div>
        </div>

        <div className="w-full md:w-1/3">
          <div className="bg-[#F7F2EC] p-6 rounded-2xl border border-[#E8E1D9] shadow-sm sticky top-24">
            <h3 className="font-serif font-bold text-lg text-[#2F3E46] mb-4">Ringkasan Pesanan</h3>
            
            <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {cartItems.map(item => (
                <div key={item.id} className="flex items-center gap-3">
                  <img src={item.product?.image_url} className="w-12 h-12 rounded-lg object-cover border border-[#EAE3DA]" />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-[#2F3E46] line-clamp-1">{item.product?.name}</p>
                    <p className="text-[10px] text-[#8F9489]">Kuantiti: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-bold text-[#5B4636]">RM {(item.product?.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-[#E8E1D9] pt-4 mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#8F9489]">Subtotal</span>
                <span className="font-semibold text-[#2F3E46]">RM {cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 mt-2 border-t border-[#E8E1D9]">
                <span className="font-bold text-[#2F3E46]">Jumlah</span>
                <span className="font-bold text-xl text-[#6B705C]">RM {cartTotal.toFixed(2)}</span>
              </div>
            </div>

            <button 
              form="checkout-form"
              type="submit"
              disabled={isCheckingOut}
              className="w-full bg-[#6B705C] text-white py-4 rounded-xl text-sm font-bold hover:bg-[#585C4B] transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              <CreditCard size={18}/> {isCheckingOut ? 'Menyambung ke Bank...' : 'Bayar Sekarang (Stripe)'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
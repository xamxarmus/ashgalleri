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

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [postcode, setPostcode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Kelantan');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return router.push('/login');
    setUserId(session.user.id);
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
    if (profile) setFullName(profile.full_name || '');

    const { data: cartData } = await supabase.from('cart').select('*, product:products(*)').eq('user_id', session.user.id);
    if (cartData && cartData.length > 0) {
      setCartItems(cartData);
      setCartTotal(cartData.reduce((acc, item) => acc + (item.product.price * item.quantity), 0));
    } else {
      router.push('/profile');
    }
    setLoading(false);
  }

  async function handleProceedToPayment(e: React.FormEvent) {
    e.preventDefault(); setIsCheckingOut(true);
    const fullShippingAddress = `${address}, ${postcode} ${city}, ${state}`;
    
    const { error: orderError } = await supabase.from('orders').insert([{ user_id: userId, customer_name: fullName, customer_phone: phone, shipping_address: fullShippingAddress, cart_items: cartItems, total_amount: cartTotal }]);
    if (orderError) { alert('Ralat pesanan: ' + orderError.message); setIsCheckingOut(false); return; }

    try {
      const response = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: cartItems }) });
      const data = await response.json();
      if (data.url) window.location.href = data.url; 
      else { alert('Ralat Stripe: ' + data.error); setIsCheckingOut(false); }
    } catch (error) { alert('Ralat menyambung ke bank.'); setIsCheckingOut(false); }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FCFAFF] animate-pulse">Menyediakan borang pesanan... 🌸</div>;

  return (
    <div className="min-h-screen bg-[#FCFAFF] text-[#2E1065] font-sans pb-20">
      <header className="bg-white border-b border-[#E9D5FF] px-5 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Link href="/profile" className="text-[#9333EA] hover:text-[#6B21A8]"><ArrowLeft size={20} /></Link>
          <h1 className="text-xl font-serif font-bold text-[#3B0764]">Maklumat Penghantaran</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 py-8 flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-2/3">
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#E9D5FF] shadow-sm">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-[#3B0764]"><Truck size={20} className="text-[#C084FC]"/> Ke mana kami perlu hantar?</h2>
            <form id="checkout-form" onSubmit={handleProceedToPayment} className="space-y-4">
              <div><label className="block text-xs font-semibold text-[#6B21A8] mb-1">Nama Penuh Penerima</label><input required type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full px-4 py-3 border border-[#E9D5FF] rounded-xl text-sm focus:ring-[#C084FC] outline-none focus:ring-2"/></div>
              <div><label className="block text-xs font-semibold text-[#6B21A8] mb-1 flex items-center gap-1"><Phone size={14}/> Nombor Telefon</label><input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-3 border border-[#E9D5FF] rounded-xl text-sm focus:ring-[#C084FC] outline-none focus:ring-2"/></div>
              <div><label className="block text-xs font-semibold text-[#6B21A8] mb-1 flex items-center gap-1"><MapPin size={14}/> Alamat Lengkap</label><textarea required value={address} onChange={e => setAddress(e.target.value)} rows={3} className="w-full px-4 py-3 border border-[#E9D5FF] rounded-xl text-sm focus:ring-[#C084FC] outline-none focus:ring-2"/></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold text-[#6B21A8] mb-1">Poskod</label><input required type="text" value={postcode} onChange={e => setPostcode(e.target.value)} className="w-full px-4 py-3 border border-[#E9D5FF] rounded-xl text-sm focus:ring-[#C084FC] outline-none focus:ring-2"/></div>
                <div><label className="block text-xs font-semibold text-[#6B21A8] mb-1">Bandar</label><input required type="text" value={city} onChange={e => setCity(e.target.value)} className="w-full px-4 py-3 border border-[#E9D5FF] rounded-xl text-sm focus:ring-[#C084FC] outline-none focus:ring-2"/></div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6B21A8] mb-1">Negeri</label>
                <select required value={state} onChange={e => setState(e.target.value)} className="w-full px-4 py-3 border border-[#E9D5FF] rounded-xl text-sm focus:ring-[#C084FC] outline-none focus:ring-2 bg-white">
                  <option value="Kelantan">Kelantan</option><option value="Terengganu">Terengganu</option><option value="Kuala Lumpur">Kuala Lumpur</option>
                  {/* Pilihan negeri disingkatkan untuk ruang */}
                </select>
              </div>
            </form>
          </div>
        </div>

        <div className="w-full md:w-1/3">
          <div className="bg-[#F3E8FF] p-6 rounded-2xl border border-[#E9D5FF] shadow-sm sticky top-24">
            <h3 className="font-serif font-bold text-lg text-[#3B0764] mb-4">Ringkasan Pesanan</h3>
            <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2">
              {cartItems.map(item => (
                <div key={item.id} className="flex items-center gap-3">
                  <img src={item.product?.image_url} className="w-12 h-12 rounded-lg object-cover border border-[#E9D5FF]" />
                  <div className="flex-1"><p className="text-xs font-bold text-[#3B0764] line-clamp-1">{item.product?.name}</p><p className="text-[10px] text-[#9333EA]">Kuantiti: {item.quantity}</p></div>
                  <p className="text-sm font-bold text-[#6B21A8]">RM {(item.product?.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-[#E9D5FF] pt-4 mb-6 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-[#9333EA]">Subtotal</span><span className="font-semibold text-[#3B0764]">RM {cartTotal.toFixed(2)}</span></div>
              <div className="flex justify-between items-center pt-2 mt-2 border-t border-[#E9D5FF]">
                <span className="font-bold text-[#3B0764]">Jumlah</span><span className="font-bold text-xl text-[#C084FC]">RM {cartTotal.toFixed(2)}</span>
              </div>
            </div>
            <button form="checkout-form" type="submit" disabled={isCheckingOut} className="w-full bg-[#C084FC] text-white py-4 rounded-xl text-sm font-bold hover:bg-[#A855F7] transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50">
              <CreditCard size={18}/> {isCheckingOut ? 'Menyambung...' : 'Bayar Sekarang'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
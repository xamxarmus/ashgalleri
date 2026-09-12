'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ShoppingBag, User, ArrowRight, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
    fetchProducts();
  }, []);

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
  }

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (data) setProducts(data);
    setLoading(false);
  }

  async function handleAddToCart(product: any) {
    if (!user) {
      alert('Sila log masuk dahulu untuk membeli-belah! 🌸');
      router.push('/login');
      return;
    }

    setAddingToCart(product.id);
    
    const { data: existingCart } = await supabase
      .from('cart')
      .select('*')
      .eq('user_id', user.id)
      .eq('product_id', product.id)
      .single();

    if (existingCart) {
      await supabase
        .from('cart')
        .update({ quantity: existingCart.quantity + 1 })
        .eq('id', existingCart.id);
    } else {
      await supabase
        .from('cart')
        .insert([{
          user_id: user.id,
          product_id: product.id,
          quantity: 1
        }]);
    }

    setAddingToCart(null);
    alert(`${product.name} berjaya dimasukkan ke troli! 🛍️`);
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#3D3A37] font-sans scroll-smooth">
      {/* NAVBAR DENGAN LOGO BARU */}
      <header className="bg-white border-b border-[#E8E1D9] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            {/* INI KOD LOGO AWAK */}
            <img src="/logo.png" alt="Logo Ash Galleri" className="h-10 w-auto object-contain drop-shadow-sm group-hover:scale-105 transition-transform" />
            <span className="font-serif font-bold text-xl text-[#2F3E46] hidden sm:block tracking-wide">Ash Galleri</span>
          </Link>
          
          <div className="flex items-center gap-4 md:gap-6">
            <Link href="#koleksi" className="text-sm font-semibold text-[#5B4636] hover:text-[#DDBEA9] transition-colors hidden md:block">Koleksi Terkini</Link>
            {user ? (
              <Link href="/profile" className="flex items-center gap-2 bg-[#F7F2EC] hover:bg-[#EAE0D5] text-[#5B4636] px-4 py-2 rounded-full text-sm font-bold transition-all border border-[#E8E1D9]">
                <ShoppingBag size={16} /> <span className="hidden sm:inline">Troli & Profil</span>
              </Link>
            ) : (
              <Link href="/login" className="flex items-center gap-2 bg-[#6B705C] hover:bg-[#585C4B] text-white px-5 py-2 rounded-full text-sm font-bold transition-all shadow-sm">
                <User size={16} /> Log Masuk
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative bg-[#EAE0D5] overflow-hidden">
        <div className="absolute inset-0 bg-black/5 z-0"></div>
        <div className="max-w-6xl mx-auto px-5 py-20 md:py-32 relative z-10 flex flex-col items-center text-center">
          <span className="bg-white/80 backdrop-blur-sm text-[#5B4636] text-xs font-bold px-4 py-1.5 rounded-full mb-6 tracking-widest uppercase">Koleksi Eksklusif</span>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-[#2F3E46] mb-6 leading-tight">
            Sentuhan Premium <br className="hidden md:block"/> Fabrik Cotton Terbaik.
          </h1>
          <p className="text-base md:text-lg text-[#5B4636] mb-10 max-w-2xl font-medium">
            Tingkatkan keanggunan gaya anda dengan koleksi fabrik berkualiti tinggi dari Ash Galleri. Moden, selesa, dan eksklusif.
          </p>
          <Link href="#koleksi" className="bg-[#6B705C] text-white px-8 py-4 rounded-full font-bold hover:bg-[#585C4B] transition-all shadow-lg hover:shadow-xl flex items-center gap-2 hover:-translate-y-1">
            Mula Membeli-belah <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* PRODUCT SECTION */}
      <section id="koleksi" className="max-w-6xl mx-auto px-5 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif font-bold text-[#2F3E46] mb-3">Koleksi Terkini</h2>
          <p className="text-[#8F9489]">Pilihan fabrik cotton paling popular bulan ini.</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B705C]"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#E8E1D9]">
            <p className="text-[#8F9489]">Koleksi sedang dikemas kini. Sila kembali sebentar lagi! 🌸</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl border border-[#E8E1D9] overflow-hidden group hover:shadow-xl transition-all duration-300">
                <div className="relative aspect-[4/5] overflow-hidden bg-[#F7F2EC]">
                  <img 
                    src={product.image_url || 'https://via.placeholder.com/400'} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1 text-[10px] font-bold text-[#5B4636]">
                    <Star size={10} className="fill-[#DDBEA9] text-[#DDBEA9]"/> Premium
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-[#2F3E46] text-lg mb-1 truncate">{product.name}</h3>
                  <p className="text-[#8F9489] text-xs mb-3 line-clamp-2 min-h-[2rem]">{product.description}</p>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#E8E1D9]">
                    <span className="font-bold text-xl text-[#6B705C]">RM {Number(product.price).toFixed(2)}</span>
                    <button 
                      onClick={() => handleAddToCart(product)}
                      disabled={addingToCart === product.id}
                      className="bg-[#F7F2EC] hover:bg-[#DDBEA9] text-[#5B4636] p-2.5 rounded-xl transition-colors disabled:opacity-50"
                      title="Tambah ke Troli"
                    >
                      <ShoppingBag size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-[#E8E1D9] py-10 mt-10">
        <div className="max-w-6xl mx-auto px-5 text-center flex flex-col items-center">
          {/* LOGO DI KAKI WEBSITE */}
          <img src="/logo.png" alt="Logo Ash Galleri" className="h-14 w-auto mb-4 hover:scale-110 transition-transform duration-300" />
          <p className="text-sm font-semibold text-[#8F9489]">© 2026 Ash Galleri. Hak Cipta Terpelihara.</p>
          <p className="text-xs text-[#A5A58D] mt-2">Dikuasakan dengan rekaan eksklusif.</p>
        </div>
      </footer>
    </div>
  );
}
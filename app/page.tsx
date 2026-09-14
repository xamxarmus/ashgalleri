'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ShoppingBag, User, ArrowRight, Star, MapPin, Clock, Shield, SlidersHorizontal, ZoomIn, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
// KITA IMPORT TOAST DI SINI! 🔔
import toast from 'react-hot-toast';

export default function HomePage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  const [sortBy, setSortBy] = useState('latest');
  const [zoomedProduct, setZoomedProduct] = useState<any>(null);

  useEffect(() => {
    checkUser();
    fetchProducts();
  }, []);

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
  }

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('*');
    if (data) setProducts(data);
    setLoading(false);
  }

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  async function handleAddToCart(product: any) {
    if (!user) {
      // MAGIS TOAST (RALAT) 🔴
      toast.error('Sila log masuk dahulu untuk membeli-belah! 🌸');
      router.push('/login');
      return;
    }
    setAddingToCart(product.id);
    const { data: existingCart } = await supabase.from('cart').select('*').eq('user_id', user.id).eq('product_id', product.id).single();
    if (existingCart) {
      await supabase.from('cart').update({ quantity: existingCart.quantity + 1 }).eq('id', existingCart.id);
    } else {
      await supabase.from('cart').insert([{ user_id: user.id, product_id: product.id, quantity: 1 }]);
    }
    setAddingToCart(null);
    
    // MAGIS TOAST (BERJAYA) 🟢
    toast.success(`${product.name} berjaya dimasukkan ke troli! 🛍️`);
  }

  return (
    <div className="min-h-screen bg-[#FCFAFF] text-[#2E1065] font-sans scroll-smooth">
      {zoomedProduct && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 transition-all opacity-100" onClick={() => setZoomedProduct(null)}>
          <button onClick={() => setZoomedProduct(null)} className="absolute top-6 right-6 text-white hover:text-[#C084FC] bg-white/10 p-2 rounded-full transition-colors z-50">
            <X size={28} />
          </button>
          
          <div className="w-full max-w-5xl h-[85vh] flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" onClick={e => e.stopPropagation()}>
            <img src={zoomedProduct.image_url} alt={zoomedProduct.name} className="w-full h-full object-contain shrink-0 snap-center rounded-lg" />
            {zoomedProduct.image_url_2 && (
              <img src={zoomedProduct.image_url_2} alt={zoomedProduct.name + " 2"} className="w-full h-full object-contain shrink-0 snap-center rounded-lg" />
            )}
          </div>
          
          {zoomedProduct.image_url_2 && (
            <div className="absolute bottom-8 left-0 right-0 text-center pointer-events-none">
              <span className="bg-black/50 text-white/90 text-sm px-4 py-2 rounded-full backdrop-blur-md animate-pulse">
                Leret untuk gambar seterusnya 👉
              </span>
            </div>
          )}
        </div>
      )}

      <header className="bg-white border-b border-[#E9D5FF] sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center group">
            <span className="font-serif font-bold text-2xl text-[#3B0764] tracking-wide group-hover:text-[#A855F7] transition-colors">Ash Galleri</span>
          </Link>
          <div className="flex items-center gap-4 md:gap-6">
            <Link href="#koleksi" className="text-sm font-semibold text-[#6B21A8] hover:text-[#C084FC] transition-colors hidden md:block">Koleksi Terkini</Link>
            {user?.email === 'ashgalleri@gmail.com' && (
              <Link href="/admin" className="flex items-center gap-1 text-sm font-bold text-white bg-[#3B0764] hover:bg-[#6B21A8] px-4 py-2 rounded-full transition-all shadow-md hover:shadow-lg">
                <Shield size={16} /> <span className="hidden sm:inline">Bilik Admin</span>
              </Link>
            )}
            {user ? (
              <Link href="/profile" className="flex items-center gap-2 bg-[#F3E8FF] hover:bg-[#E9D5FF] text-[#6B21A8] px-4 py-2 rounded-full text-sm font-bold transition-all border border-[#E9D5FF]">
                <ShoppingBag size={16} /> <span className="hidden sm:inline">Troli & Profil</span>
              </Link>
            ) : (
              <Link href="/login" className="flex items-center gap-2 bg-[#C084FC] hover:bg-[#A855F7] text-white px-5 py-2 rounded-full text-sm font-bold transition-all shadow-sm">
                <User size={16} /> Log Masuk
              </Link>
            )}
          </div>
        </div>
      </header>

      <section className="relative min-h-[85vh] flex flex-col justify-end bg-[#3B0764]">
        <div className="absolute inset-0 z-0">
          <img src="/hero-bg.jpg" alt="Latar Belakang Koleksi Ash Galleri" className="w-full h-full object-cover opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
        </div>
        <div className="max-w-6xl mx-auto w-full px-5 py-16 relative z-10">
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-4 leading-tight drop-shadow-lg">
            New Arrivals. <br/>Koleksi Premium.
          </h1>
          <p className="text-base md:text-xl text-gray-200 mb-8 max-w-xl font-medium drop-shadow-md">
            Tingkatkan keanggunan gaya anda dengan fabrik berkualiti tinggi dari Ash Galleri. Moden, selesa, dan eksklusif.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="#koleksi" className="bg-white text-[#3B0764] px-8 py-3.5 rounded-full text-sm md:text-base font-bold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl uppercase tracking-wider">
              Beli Sekarang
            </Link>
            <Link href="#koleksi" className="bg-transparent border border-white text-white px-8 py-3.5 rounded-full text-sm md:text-base font-bold hover:bg-white/20 transition-all shadow-lg uppercase tracking-wider">
              Lihat Koleksi
            </Link>
          </div>
        </div>
      </section>

      <section id="koleksi" className="max-w-6xl mx-auto px-5 py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 border-b border-[#E9D5FF] pb-6 gap-4">
          <div className="text-left">
            <h2 className="text-3xl font-serif font-bold text-[#3B0764] mb-2">Koleksi Terkini</h2>
            <p className="text-[#9333EA]">Pilihan fabrik cotton paling popular bulan ini.</p>
          </div>
          
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-[#E9D5FF] shadow-sm w-max">
            <SlidersHorizontal size={18} className="text-[#C084FC]" />
            <select 
              value={sortBy} 
              onChange={e => setSortBy(e.target.value)}
              className="bg-transparent text-[#6B21A8] text-sm font-semibold focus:outline-none cursor-pointer pr-4"
            >
              <option value="latest">Terbaharu</option>
              <option value="price-asc">Harga: Rendah ke Tinggi</option>
              <option value="price-desc">Harga: Tinggi ke Rendah</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C084FC]"></div></div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#E9D5FF]"><p className="text-[#9333EA]">Koleksi sedang dikemas kini. 🌸</p></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {sortedProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl border border-[#E9D5FF] overflow-hidden group hover:shadow-xl transition-all duration-300 relative flex flex-col">
                
                <div className="relative aspect-[4/5] bg-[#F3E8FF] overflow-hidden group/slider cursor-pointer">
                  <div className="flex overflow-x-auto snap-x snap-mandatory w-full h-full scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <img src={product.image_url || 'https://via.placeholder.com/400'} alt={product.name} className="w-full h-full object-cover shrink-0 snap-center transition-transform duration-500 group-hover:scale-105" />
                    {product.image_url_2 && (
                      <img src={product.image_url_2} alt={product.name + ' 2'} className="w-full h-full object-cover shrink-0 snap-center transition-transform duration-500 group-hover:scale-105" />
                    )}
                  </div>

                  <div className="absolute top-3 left-3 bg-white/90 px-2 py-1 rounded-md flex items-center gap-1 text-[10px] font-bold text-[#6B21A8] z-10 pointer-events-none">
                    <Star size={10} className="fill-[#D946EF] text-[#D946EF]"/> Premium
                  </div>

                  <button 
                    onClick={(e) => { e.stopPropagation(); setZoomedProduct(product); }}
                    className="absolute top-3 right-3 bg-white/90 p-2 rounded-full text-[#6B21A8] hover:text-[#A855F7] hover:bg-white shadow-sm z-20 transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                    title="Besarkan Gambar"
                  >
                    <ZoomIn size={16} />
                  </button>

                  {product.image_url_2 && (
                    <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/90 shadow-sm"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-white/40 shadow-sm"></div>
                    </div>
                  )}
                  {product.image_url_2 && (
                    <div className="absolute top-1/2 right-2 bg-black/30 text-white rounded-full p-1 opacity-0 group-hover/slider:opacity-100 transition-opacity z-10 pointer-events-none">
                      <ArrowRight size={14}/>
                    </div>
                  )}
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-[#3B0764] text-lg mb-1 line-clamp-1" title={product.name}>{product.name}</h3>
                  <p className="text-[#9333EA] text-xs mb-3 line-clamp-2 min-h-[2rem] flex-1" title={product.description}>{product.description}</p>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#E9D5FF]">
                    <span className="font-bold text-xl text-[#A855F7]">RM {Number(product.price).toFixed(2)}</span>
                    <button onClick={() => handleAddToCart(product)} disabled={addingToCart === product.id} className="bg-[#F3E8FF] hover:bg-[#E9D5FF] text-[#6B21A8] p-2.5 rounded-xl transition-colors disabled:opacity-50 z-20 relative shadow-sm">
                      <ShoppingBag size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="max-w-6xl mx-auto px-5 pb-16">
        <div className="bg-[#F3E8FF] p-8 md:p-10 rounded-3xl border border-[#E9D5FF] flex flex-col md:flex-row gap-8 justify-between items-center shadow-sm">
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-serif font-bold text-[#3B0764] mb-3">Kunjungi Butik Kami</h3>
            <p className="text-[#6B21A8] mb-5 text-sm md:text-base max-w-md">Singgah ke butik fizikal kami untuk melihat dan merasai sendiri kualiti fabrik secara dekat.</p>
            <a href="https://maps.google.com/?q=459X+VXC+Wakaf+Bharu,+Kelantan" target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-4 bg-white p-4 rounded-2xl shadow-sm border border-[#E9D5FF] hover:border-[#C084FC] hover:shadow-md transition-all group cursor-pointer text-left">
              <MapPin className="text-[#C084FC] shrink-0 mt-1 group-hover:text-[#A855F7] transition-colors" size={28} />
              <div>
                <p className="text-[#6B21A8] font-bold text-base group-hover:text-[#3B0764] transition-colors">Ash Galleri</p>
                <p className="text-[#9333EA] text-sm mt-0.5">459X+VXC Wakaf Bharu, Kelantan</p>
                <p className="text-[#C084FC] text-xs font-semibold mt-2 flex items-center gap-1 group-hover:underline">Buka di Google Maps <ArrowRight size={12}/></p>
              </div>
            </a>
          </div>
          <div className="flex-1 bg-white p-6 md:p-8 rounded-2xl border border-[#E9D5FF] shadow-sm w-full md:w-auto">
            <h4 className="font-bold text-[#3B0764] text-lg flex items-center gap-2 mb-4 justify-center md:justify-start"><Clock className="text-[#C084FC]" size={20} /> Waktu Operasi</h4>
            <ul className="space-y-3 text-sm md:text-base text-[#6B21A8]">
              <li className="flex justify-between border-b border-[#E9D5FF] pb-2"><span>Sabtu - Khamis</span><span className="font-semibold text-[#A855F7]">10:00 Pagi - 6:00 Petang</span></li>
              <li className="flex justify-between text-red-500 font-semibold pt-1"><span>Jumaat</span><span>Tutup </span></li>
            </ul>
          </div>
        </div>
      </section>

      <footer className="bg-white border-t border-[#E9D5FF] py-10">
        <div className="max-w-6xl mx-auto px-5 text-center flex flex-col items-center">
          <span className="font-serif font-bold text-3xl text-[#3B0764] mb-4 tracking-wider">Ash Galleri</span>
          <p className="text-sm font-semibold text-[#9333EA]">© 2026 Ash Galleri. Hak Cipta Terpelihara.</p>
          <p className="text-xs text-[#D8B4E2] mt-2">Dikuasakan dengan rekaan eksklusif.</p>
        </div>
      </footer>
    </div>
  );
}
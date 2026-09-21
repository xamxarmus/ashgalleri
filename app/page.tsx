'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ShoppingBag, User, ArrowRight, Star, MapPin, Clock, Shield, SlidersHorizontal, ZoomIn, X, Info, Quote } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function HomePage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('latest');
  const [zoomedProduct, setZoomedProduct] = useState<any>(null);

  // STATE BARU UNTUK REVIEW
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    checkUser();
    fetchProducts();
    fetchReviews(); // Panggil ulasan
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

  // FUNGSI TARIK REVIEW DARI SUPABASE
  async function fetchReviews() {
    const { data } = await supabase.from('customer_reviews').select('*').order('created_at', { ascending: false });
    if (data) setReviews(data);
  }

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  async function handleAddToCart(product: any) {
    if (!user) {
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
    toast.success(`${product.name} berjaya dimasukkan ke troli! 🛍️`);
  }

  return (
    <div className="min-h-screen bg-[#FCFAFF] text-[#2E1065] font-sans scroll-smooth overflow-x-hidden">
      
      {/* ========================================================= */}
      {/* CSS KHAS UNTUK ANIMASI RUNNING TEXT (MARQUEE) 🏃‍♂️💨 */}
      {/* ========================================================= */}
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-50% - 1rem)); } 
        }
        .animate-scroll {
          display: flex;
          width: max-content;
          animation: scroll 30s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* TETINGKAP PERINCIAN PENUH PRODUK (QUICK VIEW MODAL) 🔍✨ */}
      {zoomedProduct && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 transition-all" onClick={() => setZoomedProduct(null)}>
          <div className="bg-white w-full max-w-5xl max-h-[95vh] rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl relative animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <button onClick={() => setZoomedProduct(null)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 bg-gray-100 hover:bg-red-50 p-2.5 rounded-full transition-colors z-50 shadow-sm"><X size={20} /></button>

            <div className="w-full md:w-1/2 h-[40vh] md:h-auto bg-[#F3E8FF] relative flex overflow-x-auto snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <img src={zoomedProduct.image_url || 'https://via.placeholder.com/400'} alt={zoomedProduct.name} className="w-full h-full object-cover shrink-0 snap-center" />
              {zoomedProduct.image_url_2 && (
                <img src={zoomedProduct.image_url_2} alt={zoomedProduct.name + " 2"} className="w-full h-full object-cover shrink-0 snap-center" />
              )}
              {zoomedProduct.image_url_2 && (
                <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none">
                  <span className="bg-black/60 text-white/95 text-xs font-semibold px-4 py-2 rounded-full backdrop-blur-md animate-pulse shadow-md">Leret untuk gambar seterusnya 👉</span>
                </div>
              )}
            </div>

            <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col overflow-y-auto bg-white">
              <div className="mb-3">
                <span className="bg-[#F3E8FF] text-[#9333EA] text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center w-max gap-1">
                  <Star size={12} className="fill-[#D946EF] text-[#D946EF]"/> Koleksi Premium
                </span>
              </div>
              <h2 className="text-3xl font-serif font-bold text-[#3B0764] mb-2 leading-tight">{zoomedProduct.name}</h2>
              <p className="text-3xl font-bold text-[#A855F7] mb-6">RM {Number(zoomedProduct.price).toFixed(2)}</p>
              
              <div className="mb-8 flex-1 bg-[#FCFAFF] p-5 rounded-2xl border border-[#E9D5FF]">
                <h3 className="font-bold text-[#6B21A8] mb-3 border-b border-[#E9D5FF] pb-2 flex items-center gap-2"><Info size={18}/> Perincian Produk:</h3>
                <p className="text-[#3B0764] text-sm md:text-base leading-relaxed whitespace-pre-wrap font-medium">
                  {zoomedProduct.description || 'Tiada penerangan disediakan untuk koleksi ini.'}
                </p>
                <div className="mt-6 pt-4 border-t border-[#E9D5FF] flex items-center justify-between">
                  <p className="text-sm font-bold text-[#9333EA]">Status Stok:</p>
                  <p className="text-sm font-bold bg-[#E9D5FF] text-[#6B21A8] px-3 py-1 rounded-lg">Tinggal {zoomedProduct.stock || 0} unit</p>
                </div>
              </div>

              <button 
                onClick={() => { handleAddToCart(zoomedProduct); setZoomedProduct(null); }} 
                disabled={addingToCart === zoomedProduct.id} 
                className="w-full bg-[#3B0764] hover:bg-[#6B21A8] text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <ShoppingBag size={24} /> {addingToCart === zoomedProduct.id ? 'Memasukkan...' : 'Masukkan ke Troli Saku'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER UTAMA */}
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

      {/* HERO SECTION */}
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

      {/* KOLEKSI PRODUK */}
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
              <div 
                key={product.id} 
                onClick={() => setZoomedProduct(product)} 
                className="bg-white rounded-2xl border border-[#E9D5FF] overflow-hidden group hover:shadow-xl transition-all duration-300 relative flex flex-col cursor-pointer"
              >
                <div className="relative aspect-[4/5] bg-[#F3E8FF] overflow-hidden group/slider">
                  <div className="flex overflow-x-auto snap-x snap-mandatory w-full h-full scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <img src={product.image_url || 'https://via.placeholder.com/400'} alt={product.name} className="w-full h-full object-cover shrink-0 snap-center transition-transform duration-500 group-hover:scale-105" />
                    {product.image_url_2 && (
                      <img src={product.image_url_2} alt={product.name + ' 2'} className="w-full h-full object-cover shrink-0 snap-center transition-transform duration-500 group-hover:scale-105" />
                    )}
                  </div>
                  <div className="absolute top-3 left-3 bg-white/90 px-2 py-1 rounded-md flex items-center gap-1 text-[10px] font-bold text-[#6B21A8] z-10 pointer-events-none shadow-sm">
                    <Star size={10} className="fill-[#D946EF] text-[#D946EF]"/> Premium
                  </div>
                  <div className="absolute top-3 right-3 bg-white/90 p-2 rounded-full text-[#6B21A8] shadow-sm z-20 transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 flex items-center gap-1 text-xs font-bold">
                    <Info size={14} /> Lihat Detail
                  </div>
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
                  <h3 className="font-bold text-[#3B0764] text-lg mb-1 line-clamp-1">{product.name}</h3>
                  <p className="text-[#9333EA] text-xs mb-3 line-clamp-2 min-h-[2rem] flex-1">{product.description}</p>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#E9D5FF]">
                    <span className="font-bold text-xl text-[#A855F7]">RM {Number(product.price).toFixed(2)}</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }} 
                      disabled={addingToCart === product.id} 
                      className="bg-[#F3E8FF] hover:bg-[#E9D5FF] text-[#6B21A8] p-2.5 rounded-xl transition-colors disabled:opacity-50 z-20 relative shadow-sm"
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

      {/* ========================================================= */}
      {/* SEKSYEN BARU: RUNNING TEXT CUSTOMER REVIEW 💬🏃‍♂️ */}
      {/* ========================================================= */}
      {reviews.length > 0 && (
        <section className="py-12 bg-white border-y border-[#E9D5FF] overflow-hidden relative">
          <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-white to-transparent z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-white to-transparent z-10"></div>
          
          <div className="max-w-6xl mx-auto px-5 mb-8 text-center">
            <h2 className="text-2xl font-serif font-bold text-[#3B0764]">Apa Kata Pelanggan Kami?</h2>
            <p className="text-[#9333EA] text-sm mt-1">Jadilah salah seorang pelanggan kami yang gembira!</p>
          </div>

          <div className="flex gap-6 animate-scroll pl-6 hover:cursor-grab active:cursor-grabbing">
            {/* Gandakan array review supaya running text sentiasa bersambung cantik tanpa putus */}
            {[...reviews, ...reviews, ...reviews].map((r, i) => (
              <div key={i} className="w-[300px] shrink-0 bg-[#FCFAFF] p-6 rounded-2xl border border-[#E9D5FF] shadow-sm hover:shadow-md transition-shadow">
                <Quote className="text-[#E9D5FF] mb-3" size={28}/>
                <p className="text-[#3B0764] text-sm font-medium italic mb-4 line-clamp-4">"{r.review_text}"</p>
                <div className="flex items-center gap-3 border-t border-[#E9D5FF] pt-4">
                  <div className="w-10 h-10 bg-[#F3E8FF] rounded-full flex items-center justify-center text-[#9333EA] font-bold text-lg">
                    {r.customer_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[#3B0764] font-bold text-sm">{r.customer_name}</p>
                    <p className="text-xs text-[#A855F7] tracking-widest">{'⭐'.repeat(r.rating)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* LOKASI BUTIK */}
      <section className="max-w-6xl mx-auto px-5 py-16">
        <div className="bg-[#F3E8FF] p-8 md:p-10 rounded-3xl border border-[#E9D5FF] flex flex-col md:flex-row gap-8 justify-between items-center shadow-sm">
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-serif font-bold text-[#3B0764] mb-3">Kunjungi Butik Kami</h3>
            <p className="text-[#6B21A8] mb-5 text-sm md:text-base max-w-md">Singgah ke butik fizikal kami untuk melihat dan merasai sendiri kualiti fabrik secara dekat.</p>
            
            <a href="https://maps.google.com/?q=6°07'11.1%22N+102°11'59.2%22E" target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-4 bg-white p-4 rounded-2xl shadow-sm border border-[#E9D5FF] hover:border-[#C084FC] hover:shadow-md transition-all group cursor-pointer text-left">
              <MapPin className="text-[#C084FC] shrink-0 mt-1 group-hover:text-[#A855F7] transition-colors" size={28} />
              <div>
                <p className="text-[#6B21A8] font-bold text-base group-hover:text-[#3B0764] transition-colors">Ash Galleri</p>
                <p className="text-[#9333EA] text-sm mt-0.5">Wakaf Bharu, Kelantan <br/><span className="text-[11px] font-mono text-[#C084FC]">(6°07'11.1"N 102°11'59.2"E)</span></p>
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

      {/* FOOTER */}
      <footer className="bg-white border-t border-[#E9D5FF] py-10">
        <div className="max-w-6xl mx-auto px-5 text-center flex flex-col items-center">
          <span className="font-serif font-bold text-3xl text-[#3B0764] mb-4 tracking-wider">Ash Galleri</span>
          
          <div className="flex gap-4 mb-4">
            <Link href="/policies" className="text-sm font-semibold text-[#6B21A8] hover:text-[#A855F7] transition-colors underline-offset-4 hover:underline">Polisi Pemulangan</Link>
            <span className="text-[#E9D5FF]">|</span>
            <Link href="/policies" className="text-sm font-semibold text-[#6B21A8] hover:text-[#A855F7] transition-colors underline-offset-4 hover:underline">Terma & Syarat</Link>
          </div>

          <p className="text-sm font-semibold text-[#9333EA]">© 2026 Ash Galleri. Hak Cipta Terpelihara.</p>
          <p className="text-xs text-[#D8B4E2] mt-2">Dikuasakan dengan rekaan eksklusif.</p>
        </div>
      </footer>
    </div>
  );
}
'use client';

import React, { useEffect, useState } from 'react';
import { ShoppingBag, Sparkles, CheckCircle2, ArrowRight, Heart, User, CreditCard, LogOut, Settings, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  stock: number;
}

export default function AshGalleriStore() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // State untuk Sorting & Pagination (Standard Zalora!)
  const [sortOrder, setSortOrder] = useState<string>('terbaru');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    async function loadProducts() {
      try {
        const { data, error } = await supabase.from('products').select('*');
        if (!error && data) setProducts(data);
      } catch (err) {
        console.error('Ralat:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Fungsi Masukkan Barang Ke Troli
  const handleAddToCart = async (productId: string) => {
    if (!user) {
      alert('Sila log masuk dahulu untuk masukkan barang ke troli. 🌸');
      router.push('/login');
      return;
    }

    const { error } = await supabase.from('cart').insert({
      user_id: user.id,
      product_id: productId,
      quantity: 1
    });

    if (error) {
      alert('Alamak, ada ralat: ' + error.message);
    } else {
      alert('🛒 Berjaya ditambah ke troli anda!');
    }
  };

  // Logik Menyusun Harga (Sorting)
  const sortedProducts = [...products].sort((a, b) => {
    if (sortOrder === 'rendah_tinggi') return a.price - b.price;
    if (sortOrder === 'tinggi_rendah') return b.price - a.price;
    return 0; // 'terbaru'
  });

  // Logik Muka Surat (Pagination)
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#3D3A37] font-sans antialiased selection:bg-[#EAE0D5]">
      <div className="bg-[#6B705C] text-[#FDFBF7] px-4 py-2 text-center text-xs md:text-sm font-medium tracking-wide flex items-center justify-center gap-2">
        <Sparkles size={14} className="animate-pulse" />
        <span>PROMOSI KHAS KOREAN COTTON: Percuma Penghantaran Sempena Pembukaan Butik!</span>
      </div>

      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#FDFBF7]/90 border-b border-[#E8E1D9] px-5 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex flex-col">
            <h1 className="text-2xl md:text-3xl font-serif tracking-widest text-[#2F3E46] uppercase font-semibold">Ash Galleri</h1>
            <span className="text-[10px] tracking-widest uppercase text-[#A5A58D]">Korean Cotton Boutique</span>
          </Link>

          <div className="flex items-center gap-3">
            {user?.email === 'ashgalleri@gmail.com' && (
              <Link href="/admin" className="hidden sm:flex items-center gap-1 bg-[#2F3E46] hover:bg-[#1f292e] text-white px-3 py-2 rounded-full text-xs font-semibold transition-all">
                <Settings size={14} /> Bilik Admin
              </Link>
            )}

            <Link href="/profile" className="flex items-center gap-2 bg-[#DDBEA9]/40 hover:bg-[#DDBEA9]/60 px-4 py-2 rounded-full border border-[#DDBEA9] transition-all text-xs font-semibold text-[#5B4636]">
              <ShoppingBag size={16} />
              <span className="hidden sm:inline">Troli</span>
            </Link>
            
            {user ? (
              <div className="flex items-center gap-2">
                <Link href="/profile" className="flex items-center justify-center p-2.5 rounded-full bg-[#EAE0D5] hover:bg-[#DDBEA9] text-[#5B4636] transition-all shadow-sm">
                  <User size={18} />
                </Link>
                <button onClick={handleLogout} className="p-2.5 rounded-full text-[#A5A58D] hover:bg-red-50 hover:text-red-500 transition-all">
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link href="/login" className="flex items-center justify-center p-2.5 rounded-full bg-[#EAE0D5] hover:bg-[#DDBEA9] text-[#5B4636] transition-all shadow-sm">
                <User size={18} />
              </Link>
            )}
          </div>
        </div>
      </header>

      <section className="relative px-5 py-8 md:py-16 max-w-6xl mx-auto">
        <div className="bg-gradient-to-br from-[#F7F2EC] via-[#F3ECE5] to-[#EAE0D5] rounded-3xl p-6 md:p-12 border border-[#E0D5C7] shadow-sm flex flex-col md:flex-row items-center gap-8">
          <div className="w-full md:w-1/2 space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B7B7A4]/20 border border-[#B7B7A4]/40 text-[#5F634F] text-xs font-semibold">
              <Sparkles size={12} /> Koleksi Korea Cotton Asli Gred Premium
            </div>
            <h2 className="text-3xl md:text-5xl font-serif leading-tight text-[#2F3E46]">Sentuhan Lembut, Anggun &amp; Eksklusif.</h2>
            <p className="text-sm md:text-base text-[#6B705C] leading-relaxed">
              Membawakan kehangatan butik Korean Cotton terus ke genggaman anda. Pilihan fabrik berkualiti tinggi dengan tekstur sejuk, motif flora lembut, dan tona warna pastel yang memikat.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <a href="#koleksi" className="inline-flex items-center justify-center gap-2 bg-[#6B705C] hover:bg-[#585C4B] text-white px-6 py-3.5 rounded-full font-medium shadow-sm transition-all text-sm tracking-wide">
                Lihat Koleksi Kain <ArrowRight size={16} />
              </a>
            </div>
          </div>
          <div className="w-full md:w-1/2">
            <div className="relative rounded-2xl overflow-hidden shadow-lg aspect-[16/9] md:aspect-[4/3] bg-[#E8E1D9] border-2 border-white">
              <img src="https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=1000&q=80" alt="Showcase" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section id="koleksi" className="px-5 py-10 max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-1/4">
          <div className="sticky top-24 bg-white p-5 rounded-2xl border border-[#E8E1D9] shadow-sm">
            <h3 className="text-lg font-serif text-[#2F3E46] mb-4 border-b border-[#E8E1D9] pb-3">Kategori Butik</h3>
            <ul className="space-y-3 text-sm text-[#6B705C]">
              <li className="font-semibold text-[#5B4636] flex items-center gap-2 bg-[#F7F2EC] p-2 rounded-lg cursor-pointer">
                <CheckCircle2 size={16} className="text-[#6B705C]" /> Semua Produk (All)
              </li>
              <li className="hover:text-[#5B4636] cursor-pointer p-2 transition-colors">Kain Kosong (Plain)</li>
              <li className="hover:text-[#5B4636] cursor-pointer p-2 transition-colors">Corak Bunga (Floral)</li>
              <li className="hover:text-[#5B4636] cursor-pointer p-2 transition-colors">Corak Abstrak</li>
            </ul>
          </div>
        </aside>

        <div className="w-full md:w-3/4">
          <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
            <div>
              <h3 className="text-2xl font-serif text-[#2F3E46]">Semua Produk</h3>
              <p className="text-xs text-[#7F836F] mt-1">Menunjukkan {currentItems.length} daripada {products.length} item.</p>
            </div>
            
            {/* Butang Sort Harga */}
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-[#A5A58D]" />
              <select 
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="bg-white border border-[#E8E1D9] text-[#5B4636] text-sm rounded-lg focus:ring-[#DDBEA9] focus:border-[#DDBEA9] block p-2 outline-none shadow-sm cursor-pointer"
              >
                <option value="terbaru">Terbaru & Popular</option>
                <option value="rendah_tinggi">Harga: Rendah ke Tinggi</option>
                <option value="tinggi_rendah">Harga: Tinggi ke Rendah</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16 text-sm text-[#A5A58D] animate-pulse">Memuatkan koleksi fabrik...</div>
          ) : products.length === 0 ? (
             <div className="text-center py-16 bg-[#F7F2EC] rounded-2xl border border-[#E8E1D9]">
              <p className="text-sm text-[#7F836F]">Belum ada produk dimasukkan ke katalog butik.</p>
            </div>
          ) : (
            <>
              {/* Grid Produk */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                {currentItems.map((item) => (
                  <div key={item.id} className="group bg-white rounded-2xl p-3 border border-[#EAE3DA] shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                    <div>
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-[#F3ECE5] mb-3">
                        <img 
                          src={item.image_url || 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=600&q=80'} 
                          alt={item.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=600&q=80' }}
                        />
                        <button className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 backdrop-blur-sm text-[#5B4636] hover:text-rose-500 transition-colors">
                          <Heart size={14} />
                        </button>
                      </div>
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-[#6B705C] bg-[#B7B7A4]/20 px-2 py-0.5 rounded-md inline-block mb-1">
                        Korea Cotton
                      </span>
                      <h4 className="font-medium text-sm text-[#2F3E46] line-clamp-1">{item.name}</h4>
                      <p className="text-xs text-[#8F9489] line-clamp-2 mt-1">{item.description}</p>
                      <div className="mt-2">
                        <span className="text-[10px] text-[#A5A58D] block">Harga / meter</span>
                        <span className="text-base font-semibold text-[#5B4636]">RM {Number(item.price).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-[#F2ECE4] grid grid-cols-2 gap-2">
                      <button onClick={() => handleAddToCart(item.id)} className="bg-[#EAE0D5] hover:bg-[#DDBEA9] text-[#5B4636] text-[11px] py-2 rounded-xl flex items-center justify-center gap-1 shadow-sm transition-all font-semibold">
                        <ShoppingBag size={14} /> Cart
                      </button>
                      <button onClick={() => alert('Sistem Stripe akan diaktifkan di Fasa Akhir! 💳')} className="bg-[#6B705C] hover:bg-[#585C4B] text-white text-[11px] py-2 rounded-xl flex items-center justify-center gap-1 shadow-sm transition-all font-semibold">
                        <CreditCard size={14} /> Pay Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sistem Pagination (Muka Surat) */}
              {totalPages > 1 && (
                <div className="mt-10 flex justify-center items-center gap-4">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-full bg-white border border-[#E8E1D9] text-[#5B4636] hover:bg-[#FDFBF7] disabled:opacity-50 transition-all shadow-sm"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="text-sm font-semibold text-[#2F3E46]">Muka surat {currentPage} dari {totalPages}</span>
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-full bg-white border border-[#E8E1D9] text-[#5B4636] hover:bg-[#FDFBF7] disabled:opacity-50 transition-all shadow-sm"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <footer className="mt-16 border-t border-[#E8E1D9] bg-[#F7F2EC] py-10 px-5 text-center text-xs text-[#8F9489] space-y-2">
        <p className="font-serif tracking-widest uppercase text-sm text-[#2F3E46] font-medium">Ash Galleri</p>
        <p>© 2026 Ash Galleri • Korean Cotton Boutique. Hak Cipta Terpelihara.</p>
      </footer>
    </div>
  );
}
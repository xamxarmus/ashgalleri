'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Trash2, ArrowLeft, Package, Edit2, X, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  
  // STATE UNTUK BORANG TAMBAH PRODUK BARU
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState(''); 
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [confirmCompleteId, setConfirmCompleteId] = useState<string | null>(null);

  // ==========================================
  // STATE BARU KHAS UNTUK FUNGSI EDIT PRODUK ✏️
  // ==========================================
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    checkAdmin();
    fetchProducts();
    fetchOrders();
  }, []);

  async function checkAdmin() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.email === 'ashgalleri@gmail.com') setIsAdmin(true);
    else router.push('/'); 
  }

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (data) setProducts(data);
  }

  async function fetchOrders() {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (data) setOrders(data.filter((order) => order.status !== 'Selesai'));
  }

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault(); 
    let finalImageUrl = '';

    if (imageFile) {
      const fileName = `${Math.random()}.${imageFile.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, imageFile);
      if (!uploadError) {
        const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
        finalImageUrl = data.publicUrl;
      }
    }

    const { error } = await supabase.from('products').insert([{ 
      name, 
      description, 
      price: parseFloat(price), 
      stock: parseInt(stock) || 0,
      image_url: finalImageUrl 
    }]);
    
    if (!error) { 
      setName(''); setDescription(''); setPrice(''); setStock(''); setImageFile(null); 
      fetchProducts(); toast.success('Produk berjaya ditambah! 🎉'); 
    }
  }

  async function handleDelete(product: any) {
    if (window.confirm('Adakah anda pasti mahu memadam produk ini?')) {
      if (product.image_url) {
        const fileName = product.image_url.substring(product.image_url.lastIndexOf('/') + 1);
        await supabase.storage.from('product-images').remove([fileName]);
      }
      await supabase.from('cart').delete().eq('product_id', product.id);
      await supabase.from('products').delete().eq('id', product.id);
      fetchProducts(); toast.success('Produk telah dipadam! 🗑️');
    }
  }

  async function handleCompleteOrder(orderId: string) {
    if (confirmCompleteId === orderId) {
      await supabase.from('orders').update({ status: 'Selesai' }).eq('id', orderId);
      setOrders(prev => prev.filter(order => order.id !== orderId));
      toast.success('Pesanan Selesai! 📦');
      setConfirmCompleteId(null);
    } else {
      setConfirmCompleteId(orderId);
      setTimeout(() => setConfirmCompleteId(null), 4000);
    }
  }

  // ==========================================
  // FUNGSI BARU: BUKA MODAL & SIMPAN EDIT 💾
  // ==========================================
  function openEditModal(product: any) {
    setEditingProduct(product);
    setEditName(product.name);
    setEditDescription(product.description || '');
    setEditPrice(product.price.toString());
    setEditStock(product.stock?.toString() || '0');
    setEditImageFile(null); // Reset file input
  }

  async function handleUpdateProduct(e: React.FormEvent) {
    e.preventDefault();
    setIsUpdating(true);
    let finalImageUrl = editingProduct.image_url;

    // Jika admin muat naik gambar baru masa edit
    if (editImageFile) {
      const fileName = `${Math.random()}.${editImageFile.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, editImageFile);
      if (!uploadError) {
        const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
        finalImageUrl = data.publicUrl;
      }
    }

    const { error } = await supabase.from('products')
      .update({ 
        name: editName, 
        description: editDescription, 
        price: parseFloat(editPrice), 
        stock: parseInt(editStock) || 0,
        image_url: finalImageUrl 
      })
      .eq('id', editingProduct.id);
    
    if (!error) { 
      setEditingProduct(null);
      fetchProducts(); 
      toast.success('Produk berjaya dikemas kini! ✏️✨'); 
    } else {
      toast.error('Ralat: ' + error.message);
    }
    setIsUpdating(false);
  }

  if (!isAdmin) return <div className="min-h-screen flex items-center justify-center bg-[#FCFAFF]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C084FC]"></div></div>;

  return (
    <div className="min-h-screen bg-[#FCFAFF] text-[#2E1065] font-sans pb-20">
      
      {/* ========================================== */}
      {/* TETINGKAP TIMBUL (MODAL) UNTUK EDIT 🎨 */}
      {/* ========================================== */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 md:p-8 shadow-2xl relative border border-[#E9D5FF]">
            <button onClick={() => setEditingProduct(null)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 bg-gray-100 p-2 rounded-full transition-colors"><X size={20}/></button>
            <h2 className="text-xl font-bold text-[#3B0764] mb-6 flex items-center gap-2"><Edit2 className="text-[#C084FC]"/> Kemas Kini Produk</h2>
            
            <form onSubmit={handleUpdateProduct} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#6B21A8] block mb-1">Nama Produk</label>
                <input required type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full border border-[#E9D5FF] p-3 rounded-xl focus:ring-2 focus:ring-[#C084FC] outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#6B21A8] block mb-1">Harga (RM)</label>
                  <input required type="number" step="0.01" value={editPrice} onChange={e => setEditPrice(e.target.value)} className="w-full border border-[#E9D5FF] p-3 rounded-xl focus:ring-2 focus:ring-[#C084FC] outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#6B21A8] block mb-1">Jumlah Stok</label>
                  <input required type="number" value={editStock} onChange={e => setEditStock(e.target.value)} className="w-full border border-[#E9D5FF] p-3 rounded-xl focus:ring-2 focus:ring-[#C084FC] outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-[#6B21A8] block mb-1">Penerangan / Detail Kain</label>
                <textarea required value={editDescription} onChange={e => setEditDescription(e.target.value)} className="w-full border border-[#E9D5FF] p-3 rounded-xl focus:ring-2 focus:ring-[#C084FC] outline-none h-24" />
              </div>
              <div>
                <label className="text-xs font-bold text-[#6B21A8] block mb-1">Tukar Gambar Baru (Pilihan)</label>
                <input type="file" accept="image/*" onChange={e => {if (e.target.files) setEditImageFile(e.target.files[0])}} className="w-full border border-[#E9D5FF] p-2 rounded-xl text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-[#F3E8FF] file:text-[#9333EA] hover:file:bg-[#E9D5FF] cursor-pointer" />
              </div>
              
              <div className="pt-4 flex gap-3">
                <button type="submit" disabled={isUpdating} className="flex-1 bg-[#C084FC] hover:bg-[#A855F7] text-white py-3 rounded-xl font-bold shadow-md transition-all disabled:opacity-50">
                  {isUpdating ? 'Menyimpan...' : 'Simpan Kemas Kini'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HEADER ADMIN */}
      <header className="bg-white border-b border-[#E9D5FF] px-5 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Link href="/" className="text-[#9333EA] hover:text-[#6B21A8] transition-colors"><ArrowLeft size={20} /></Link>
          <h1 className="text-xl font-serif font-bold text-[#3B0764]">Bilik Pejabat Admin</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-8 space-y-8">
        
        {/* PESANAN AKTIF */}
        <section className="bg-white p-6 md:p-8 rounded-3xl border border-[#E9D5FF] shadow-sm">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-[#3B0764]"><Package className="text-[#C084FC]"/> Senarai Pesanan Aktif</h2>
          
          {orders.length === 0 ? (
            <div className="text-center py-8 bg-[#F3E8FF] rounded-2xl border border-[#E9D5FF]">
              <p className="text-[#6B21A8] font-medium">Tiada pesanan baru buat masa ini. 🌸</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {orders.map(order => (
                <div key={order.id} className="border-2 border-[#E9D5FF] p-5 rounded-2xl flex flex-col gap-3 bg-[#FCFAFF] hover:shadow-md transition-all">
                  <div className="flex justify-between border-b border-[#E9D5FF] pb-3">
                    <div>
                      <p className="font-bold text-[#3B0764]">{order.customer_name}</p>
                      <p className="text-xs font-bold text-[#9333EA] mt-1">{new Date(order.created_at).toLocaleDateString('ms-MY')}</p>
                    </div>
                    <p className="font-bold text-xl text-[#A855F7]">RM {Number(order.total_amount).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#6B21A8]"><span className="text-[#C084FC]">📞</span> {order.customer_phone}</p>
                    <p className="text-sm font-semibold text-[#6B21A8] mt-1"><span className="text-[#C084FC]">📍</span> {order.shipping_address}</p>
                  </div>
                  
                  <div className="mt-2 p-3 bg-white border border-[#E9D5FF] rounded-xl">
                    <p className="text-[11px] font-bold text-[#9333EA] uppercase mb-2">Barang Dipesan:</p>
                    {order.cart_items.map((item: any, i: number) => (
                      <p key={i} className="text-sm font-bold text-[#3B0764]">- {item.product?.name} <span className="text-[#A855F7]">(x{item.quantity})</span></p>
                    ))}
                  </div>

                  <button 
                    onClick={() => handleCompleteOrder(order.id)}
                    className={`mt-2 w-full py-3 rounded-xl font-bold text-white transition-all shadow-sm ${confirmCompleteId === order.id ? 'bg-red-500 animate-pulse hover:bg-red-600' : 'bg-[#3B0764] hover:bg-[#6B21A8]'}`}
                  >
                    {confirmCompleteId === order.id ? 'Sahkan Hantar / Selesai?' : 'Tandakan Selesai'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* TAMBAH PRODUK & INVENTORI */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <section className="bg-white p-6 md:p-8 rounded-3xl border border-[#E9D5FF] shadow-sm h-fit">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-[#3B0764]">Tambah Produk Baru</h2>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <input required type="text" placeholder="Nama Kain / Koleksi" value={name} onChange={e => setName(e.target.value)} className="w-full border border-[#E9D5FF] p-3 rounded-xl focus:ring-2 focus:ring-[#C084FC] outline-none" />
              
              <div className="flex gap-3">
                <input required type="number" step="0.01" placeholder="Harga (RM)" value={price} onChange={e => setPrice(e.target.value)} className="w-1/2 border border-[#E9D5FF] p-3 rounded-xl focus:ring-2 focus:ring-[#C084FC] outline-none" />
                <input required type="number" placeholder="Stok" value={stock} onChange={e => setStock(e.target.value)} className="w-1/2 border border-[#E9D5FF] p-3 rounded-xl focus:ring-2 focus:ring-[#C084FC] outline-none" />
              </div>
              
              <textarea required placeholder="Penerangan Ringkas (Cth: Bidang 45, Sejuk)" value={description} onChange={e => setDescription(e.target.value)} className="w-full border border-[#E9D5FF] p-3 rounded-xl focus:ring-2 focus:ring-[#C084FC] outline-none h-24" />
              
              <div className="border border-[#E9D5FF] p-3 rounded-xl bg-[#FCFAFF]">
                <label className="text-xs font-bold text-[#6B21A8] block mb-2">Muat Naik Gambar Produk</label>
                <input required type="file" accept="image/*" onChange={e => {if (e.target.files) setImageFile(e.target.files[0])}} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-[#F3E8FF] file:text-[#9333EA] hover:file:bg-[#E9D5FF] cursor-pointer" />
              </div>

              <button type="submit" className="w-full bg-[#C084FC] hover:bg-[#A855F7] text-white py-3.5 rounded-xl font-bold shadow-md transition-all mt-2">
                Simpan & Terbitkan
              </button>
            </form>
          </section>

          <section className="lg:col-span-2 bg-white p-6 md:p-8 rounded-3xl border border-[#E9D5FF] shadow-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-[#3B0764]">Inventori Kedai Semasa</h2>
            
            {products.length === 0 ? (
              <p className="text-[#9333EA] text-center py-5 bg-[#FCFAFF] rounded-xl border border-[#E9D5FF]">Belum ada produk di dalam kedai.</p>
            ) : (
              <div className="space-y-4">
                {products.map(p => (
                  <div key={p.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center border border-[#E9D5FF] p-4 rounded-2xl bg-white hover:shadow-md transition-all gap-4">
                    <div className="flex items-center gap-4 w-full">
                      <div className="w-16 h-16 shrink-0 bg-[#F3E8FF] rounded-xl overflow-hidden border border-[#E9D5FF] flex items-center justify-center">
                        {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" /> : <ImageIcon className="text-[#C084FC]"/>}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-[#3B0764] text-lg leading-tight">{p.name}</p>
                        <p className="text-sm font-semibold text-[#6B21A8] mt-1">
                          <span className="text-[#A855F7]">RM {Number(p.price).toFixed(2)}</span> <span className="text-[#E9D5FF] px-1">|</span> Stok: {p.stock || 0}
                        </p>
                      </div>
                    </div>
                    
                    {/* BUTANG EDIT DAN PADAM */}
                    <div className="flex gap-2 w-full sm:w-auto justify-end border-t sm:border-0 border-[#E9D5FF] pt-3 sm:pt-0">
                      <button onClick={() => openEditModal(p)} className="flex items-center justify-center gap-2 bg-[#F3E8FF] hover:bg-[#E9D5FF] text-[#6B21A8] px-4 py-2 sm:p-3 rounded-xl transition-colors font-bold text-sm sm:text-base">
                        <Edit2 size={18} className="shrink-0"/> <span className="sm:hidden">Edit</span>
                      </button>
                      <button onClick={() => handleDelete(p)} className="flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-500 px-4 py-2 sm:p-3 rounded-xl transition-colors font-bold text-sm sm:text-base">
                        <Trash2 size={18} className="shrink-0"/> <span className="sm:hidden">Padam</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  );
}
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Trash2, Plus, ArrowLeft, Package, Upload, ClipboardList, MapPin, Phone } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageFile2, setImageFile2] = useState<File | null>(null); // State untuk gambar kedua

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
    if (data) setOrders(data);
    setLoading(false);
  }

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    let finalImageUrl = '';
    let finalImageUrl2 = '';

    // Muat naik gambar 1
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, imageFile);
      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(fileName);
        finalImageUrl = publicUrlData.publicUrl;
      }
    }

    // Muat naik gambar 2 (Jika ada)
    if (imageFile2) {
      const fileExt2 = imageFile2.name.split('.').pop();
      const fileName2 = `${Math.random()}.${fileExt2}`;
      const { error: uploadError2 } = await supabase.storage.from('product-images').upload(fileName2, imageFile2);
      if (!uploadError2) {
        const { data: publicUrlData2 } = supabase.storage.from('product-images').getPublicUrl(fileName2);
        finalImageUrl2 = publicUrlData2.publicUrl;
      }
    }

    // Simpan ke database
    const { error } = await supabase.from('products').insert([{ 
      name, 
      description, 
      price: parseFloat(price), 
      image_url: finalImageUrl,
      image_url_2: finalImageUrl2, // Data gambar kedua
      stock: parseInt(stock) 
    }]);

    if (!error) { 
      setName(''); setDescription(''); setPrice(''); setStock(''); setImageFile(null); setImageFile2(null); 
      fetchProducts(); 
      alert('Produk berjaya ditambah! 🎉'); 
    } else {
      alert('Ralat: ' + error.message);
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (window.confirm('Betul ke nak padam produk ni?')) {
      await supabase.from('cart').delete().eq('product_id', id);
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (!error) { alert('Produk berjaya dipadam! 🗑️'); fetchProducts(); }
    }
  }

  if (!isAdmin) return <div className="min-h-screen flex items-center justify-center bg-[#FCFAFF] text-[#6B21A8]">Memeriksa kelayakan... 🕵️‍♂️</div>;

  return (
    <div className="min-h-screen bg-[#FCFAFF] text-[#2E1065] font-sans pb-20">
      <header className="bg-white border-b border-[#E9D5FF] px-5 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-[#9333EA] hover:text-[#6B21A8] transition-colors"><ArrowLeft size={20} /></Link>
            <h1 className="text-xl font-serif font-bold text-[#3B0764]">Bilik Pejabat Admin</h1>
          </div>
          <span className="bg-[#C084FC] text-white text-xs px-3 py-1 rounded-full shadow-sm">Bos Besar</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-8 space-y-8">
        <div className="bg-white p-6 rounded-2xl border border-[#E9D5FF] shadow-sm">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#3B0764]"><ClipboardList size={20} className="text-[#C084FC]"/> Senarai Pesanan Pelanggan</h2>
          {orders.length === 0 ? (
            <p className="text-sm text-[#9333EA] text-center py-4">Belum ada pesanan direkodkan.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {orders.map(order => (
                <div key={order.id} className="p-4 border-2 border-[#E9D5FF] rounded-xl bg-[#FCFAFF]">
                  <div className="flex justify-between items-start mb-3 border-b border-[#E9D5FF] pb-3">
                    <div>
                      <h3 className="font-bold text-[#3B0764]">{order.customer_name}</h3>
                      <p className="text-xs text-[#9333EA] mt-1">{new Date(order.created_at).toLocaleDateString('ms-MY')} | <span className="text-amber-500 font-semibold">{order.status}</span></p>
                    </div>
                    <span className="font-bold text-lg text-[#C084FC]">RM {order.total_amount}</span>
                  </div>
                  <div className="space-y-2 mb-3">
                    <p className="text-sm flex items-start gap-2"><MapPin size={16} className="text-[#9333EA] shrink-0 mt-0.5"/> <span className="text-[#6B21A8]">{order.shipping_address}</span></p>
                    <p className="text-sm flex items-center gap-2"><Phone size={16} className="text-[#9333EA]"/> <span className="text-[#6B21A8]">{order.customer_phone}</span></p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-[#E9D5FF]">
                    <p className="text-xs font-bold text-[#9333EA] mb-2">Barang Dipesan:</p>
                    {order.cart_items.map((item: any, idx: number) => (
                      <p key={idx} className="text-sm text-[#3B0764]">📦 {item.product.name} (x{item.quantity})</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3">
            <div className="bg-white p-6 rounded-2xl border border-[#E9D5FF] shadow-sm">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#3B0764]"><Plus size={18} className="text-[#C084FC]"/> Tambah Produk Baru</h2>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div><label className="block text-xs font-semibold text-[#6B21A8] mb-1">Nama Kain</label><input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border border-[#E9D5FF] rounded-xl text-sm focus:ring-[#C084FC] focus:outline-none focus:ring-2" /></div>
                <div><label className="block text-xs font-semibold text-[#6B21A8] mb-1">Penerangan</label><textarea required value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 border border-[#E9D5FF] rounded-xl text-sm focus:ring-[#C084FC] focus:outline-none focus:ring-2" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-semibold text-[#6B21A8] mb-1">Harga (RM)</label><input required type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="w-full px-3 py-2 border border-[#E9D5FF] rounded-xl text-sm focus:ring-[#C084FC] focus:outline-none focus:ring-2" /></div>
                  <div><label className="block text-xs font-semibold text-[#6B21A8] mb-1">Stok</label><input required type="number" value={stock} onChange={e => setStock(e.target.value)} className="w-full px-3 py-2 border border-[#E9D5FF] rounded-xl text-sm focus:ring-[#C084FC] focus:outline-none focus:ring-2" /></div>
                </div>
                
                {/* Bahagian Gambar 1 */}
                <div><label className="block text-xs font-semibold text-[#6B21A8] mb-1"><Upload size={14} className="inline"/> Gambar 1 (Utama)</label><input required type="file" accept="image/*" onChange={e => {if (e.target.files) setImageFile(e.target.files[0])}} className="w-full text-xs border border-[#E9D5FF] p-2 rounded-lg" /></div>
                
                {/* Bahagian Gambar 2 */}
                <div><label className="block text-xs font-semibold text-[#6B21A8] mb-1"><Upload size={14} className="inline"/> Gambar 2 (Pilihan)</label><input type="file" accept="image/*" onChange={e => {if (e.target.files) setImageFile2(e.target.files[0])}} className="w-full text-xs border border-[#E9D5FF] p-2 rounded-lg" /></div>

                <button type="submit" disabled={loading} className="w-full bg-[#C084FC] text-white py-3 rounded-xl text-sm font-bold mt-2 hover:bg-[#A855F7] transition-all">Simpan ke Butik</button>
              </form>
            </div>
          </div>

          <div className="w-full md:w-2/3">
            <div className="bg-white p-6 rounded-2xl border border-[#E9D5FF] shadow-sm">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#3B0764]"><Package size={18} className="text-[#C084FC]"/> Inventori Kedai Semasa</h2>
              <div className="space-y-3">
                {products.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3 border border-[#E9D5FF] rounded-xl hover:bg-[#FCFAFF] transition-colors">
                    <div className="flex items-center gap-4">
                      {/* Papar gambar pertama sahaja di admin */}
                      <img src={p.image_url} className="w-14 h-14 rounded-lg object-cover bg-white border border-[#E9D5FF]" />
                      <div><h4 className="font-semibold text-sm text-[#3B0764]">{p.name}</h4><p className="text-xs text-[#9333EA]">RM {Number(p.price).toFixed(2)} | Stok: {p.stock}m {p.image_url_2 && " | (2 Gambar)"}</p></div>
                    </div>
                    <button onClick={() => handleDelete(p.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
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

  useEffect(() => {
    checkAdmin();
    fetchProducts();
    fetchOrders();
  }, []);

  async function checkAdmin() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.email === 'ashgalleri@gmail.com') {
      setIsAdmin(true);
    } else {
      router.push('/'); 
    }
  }

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (data) setProducts(data);
  }

  // FUNGSI BARU: Tarik rekod pesanan dari Supabase
  async function fetchOrders() {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (data) setOrders(data);
    setLoading(false);
  }

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    let finalImageUrl = '';

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;
      const { error: uploadError } = await supabase.storage.from('product-images').upload(filePath, imageFile);

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(filePath);
        finalImageUrl = publicUrlData.publicUrl;
      }
    }

    const { error } = await supabase.from('products').insert([{ name, description, price: parseFloat(price), image_url: finalImageUrl, stock: parseInt(stock) }]);

    if (!error) {
      setName(''); setDescription(''); setPrice(''); setStock(''); setImageFile(null);
      fetchProducts();
      alert('Produk berjaya ditambah! 🎉');
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (window.confirm('Betul ke nak padam produk ni?')) {
      await supabase.from('cart').delete().eq('product_id', id);
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (!error) {
        alert('Produk berjaya dipadam! 🗑️');
        fetchProducts(); 
      }
    }
  }

  if (!isAdmin) return <div className="min-h-screen flex items-center justify-center">Memeriksa kelayakan...</div>;

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#3D3A37] font-sans">
      <header className="bg-white border-b border-[#E8E1D9] px-5 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-[#8F9489] hover:text-[#5B4636] transition-colors"><ArrowLeft size={20} /></Link>
            <h1 className="text-xl font-serif font-bold text-[#2F3E46]">Bilik Pejabat Admin</h1>
          </div>
          <span className="bg-[#6B705C] text-white text-xs px-3 py-1 rounded-full shadow-sm">Bos Besar</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-8 space-y-8">
        
        {/* PAPAN BARU: Senarai Pesanan Pelanggan */}
        <div className="bg-white p-6 rounded-2xl border border-[#E8E1D9] shadow-sm">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#2F3E46]"><ClipboardList size={20}/> Senarai Pesanan Pelanggan</h2>
          {orders.length === 0 ? (
            <p className="text-sm text-[#A5A58D] text-center py-4">Belum ada pesanan direkodkan.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {orders.map(order => (
                <div key={order.id} className="p-4 border-2 border-[#E8E1D9] rounded-xl bg-[#FDFBF7]">
                  <div className="flex justify-between items-start mb-3 border-b border-[#E8E1D9] pb-3">
                    <div>
                      <h3 className="font-bold text-[#2F3E46]">{order.customer_name}</h3>
                      <p className="text-xs text-[#8F9489] mt-1">{new Date(order.created_at).toLocaleDateString('ms-MY')} | <span className="text-amber-600 font-semibold">{order.status}</span></p>
                    </div>
                    <span className="font-bold text-lg text-[#6B705C]">RM {order.total_amount}</span>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <p className="text-sm flex items-start gap-2"><MapPin size={16} className="text-[#8F9489] shrink-0 mt-0.5"/> <span className="text-[#5B4636]">{order.shipping_address}</span></p>
                    <p className="text-sm flex items-center gap-2"><Phone size={16} className="text-[#8F9489]"/> <span className="text-[#5B4636]">{order.customer_phone}</span></p>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-[#E8E1D9]">
                    <p className="text-xs font-bold text-[#8F9489] mb-2">Barang Dipesan:</p>
                    {order.cart_items.map((item: any, idx: number) => (
                      <p key={idx} className="text-sm text-[#2F3E46]">📦 {item.product.name} (x{item.quantity})</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Papan Inventori Asal */}
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3">
            <div className="bg-white p-6 rounded-2xl border border-[#E8E1D9] shadow-sm">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Plus size={18}/> Tambah Produk Baru</h2>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div><label className="block text-xs font-semibold mb-1">Nama Kain</label><input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm" /></div>
                <div><label className="block text-xs font-semibold mb-1">Penerangan</label><textarea required value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-semibold mb-1">Harga (RM)</label><input required type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm" /></div>
                  <div><label className="block text-xs font-semibold mb-1">Stok</label><input required type="number" value={stock} onChange={e => setStock(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm" /></div>
                </div>
                <div><label className="block text-xs font-semibold mb-1"><Upload size={14} className="inline"/> Muat Naik Gambar</label><input type="file" accept="image/*" onChange={e => {if (e.target.files) setImageFile(e.target.files[0])}} className="w-full text-xs" /></div>
                <button type="submit" disabled={loading} className="w-full bg-[#6B705C] text-white py-3 rounded-xl text-sm font-bold mt-2">Simpan ke Butik</button>
              </form>
            </div>
          </div>

          <div className="w-full md:w-2/3">
            <div className="bg-white p-6 rounded-2xl border border-[#E8E1D9] shadow-sm">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Package size={18}/> Inventori Kedai Semasa</h2>
              <div className="space-y-3">
                {products.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3 border rounded-xl">
                    <div className="flex items-center gap-4">
                      <img src={p.image_url} className="w-14 h-14 rounded-lg object-cover" />
                      <div><h4 className="font-semibold text-sm">{p.name}</h4><p className="text-xs">RM {Number(p.price).toFixed(2)} | Stok: {p.stock}m</p></div>
                    </div>
                    <button onClick={() => handleDelete(p.id)} className="p-2 text-red-400"><Trash2 size={18}/></button>
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
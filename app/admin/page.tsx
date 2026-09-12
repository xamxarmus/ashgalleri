'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Trash2, Plus, ArrowLeft, Package, Upload } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // State untuk borang
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    checkAdmin();
    fetchProducts();
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
    setLoading(false);
  }

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    let finalImageUrl = '';

    // Proses muat naik gambar ke Supabase Storage
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('product-images')
        .upload(filePath, imageFile);

      if (uploadError) {
        alert('Ralat muat naik gambar: ' + uploadError.message);
        setLoading(false);
        return;
      }

      // Dapatkan pautan (URL) awam untuk gambar
      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      finalImageUrl = publicUrlData.publicUrl;
    }

    // Masukkan data produk ke dalam database
    const { error } = await supabase.from('products').insert([
      {
        name,
        description,
        price: parseFloat(price),
        image_url: finalImageUrl,
        stock: parseInt(stock)
      }
    ]);

    if (!error) {
      setName('');
      setDescription('');
      setPrice('');
      setStock('');
      setImageFile(null);
      const fileInput = document.getElementById('image-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      fetchProducts();
      alert('Produk dan gambar berjaya ditambah ke butik! 🎉');
    } else {
      alert('Ralat: ' + error.message);
    }
    setLoading(false);
  }

  // FUNGSI DELETE YANG BAHARU DAN SELAMAT
  async function handleDelete(id: string) {
    if (window.confirm('Betul ke nak padam produk ni dari kedai?')) {
      // 1. Buang dari troli pelanggan dulu supaya sistem tak kunci
      await supabase.from('cart').delete().eq('product_id', id);
      
      // 2. Selepas selamat dikeluarkan dari troli, baru padam dari kedai
      const { error } = await supabase.from('products').delete().eq('id', id);
      
      if (error) {
        alert('Ralat padam produk: ' + error.message);
      } else {
        alert('Produk berjaya dipadam! 🗑️');
        fetchProducts(); // Refresh senarai
      }
    }
  }

  if (!isAdmin) return <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">Memeriksa kelayakan... 🕵️‍♂️</div>;

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#3D3A37] font-sans">
      <header className="bg-white border-b border-[#E8E1D9] px-5 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-[#8F9489] hover:text-[#5B4636] transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-serif font-bold text-[#2F3E46]">Bilik Pejabat Admin</h1>
          </div>
          <span className="bg-[#6B705C] text-white text-xs px-3 py-1 rounded-full shadow-sm">Bos Besar</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-8 flex flex-col md:flex-row gap-8">
        {/* Borang Tambah Produk */}
        <div className="w-full md:w-1/3">
          <div className="bg-white p-6 rounded-2xl border border-[#E8E1D9] shadow-sm sticky top-24">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#2F3E46]"><Plus size={18}/> Tambah Produk Baru</h2>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#5B4636] mb-1">Nama Kain</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border border-[#E8E1D9] rounded-xl text-sm focus:outline-none focus:ring-[#DDBEA9] focus:border-[#DDBEA9]" placeholder="Cth: Cotton Eksklusif"/>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#5B4636] mb-1">Penerangan</label>
                <textarea required value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 border border-[#E8E1D9] rounded-xl text-sm focus:outline-none focus:ring-[#DDBEA9] focus:border-[#DDBEA9]" placeholder="Cth: Kain sejuk, bidang 45"/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#5B4636] mb-1">Harga (RM)</label>
                  <input required type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="w-full px-3 py-2 border border-[#E8E1D9] rounded-xl text-sm focus:outline-none focus:ring-[#DDBEA9]" placeholder="45.00"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5B4636] mb-1">Stok (Meter)</label>
                  <input required type="number" value={stock} onChange={e => setStock(e.target.value)} className="w-full px-3 py-2 border border-[#E8E1D9] rounded-xl text-sm focus:outline-none focus:ring-[#DDBEA9]" placeholder="50"/>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-[#5B4636] mb-1 flex items-center gap-1"><Upload size={14}/> Muat Naik Gambar</label>
                <input 
                  id="image-upload"
                  type="file" 
                  accept="image/*"
                  onChange={e => {
                    if (e.target.files && e.target.files.length > 0) {
                      setImageFile(e.target.files[0]);
                    }
                  }} 
                  className="w-full px-3 py-2 border border-[#E8E1D9] rounded-xl text-sm focus:outline-none focus:ring-[#DDBEA9] bg-[#FDFBF7] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#EAE0D5] file:text-[#5B4636] hover:file:bg-[#DDBEA9] cursor-pointer" 
                />
              </div>

              <button type="submit" disabled={loading} className="w-full bg-[#6B705C] text-white py-3 rounded-xl text-sm font-bold hover:bg-[#585C4B] transition-all disabled:opacity-50 shadow-sm mt-2">
                {loading ? 'Sila tunggu...' : 'Simpan ke Butik'}
              </button>
            </form>
          </div>
        </div>

        {/* Senarai Produk Semasa */}
        <div className="w-full md:w-2/3">
          <div className="bg-white p-6 rounded-2xl border border-[#E8E1D9] shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#2F3E46]"><Package size={18}/> Inventori Kedai Semasa</h2>
            {loading ? <p className="text-sm text-[#A5A58D] animate-pulse">Memuatkan stok...</p> : (
              <div className="space-y-3">
                {products.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3 border border-[#E8E1D9] rounded-xl hover:bg-[#FDFBF7] transition-colors">
                    <div className="flex items-center gap-4">
                      <img src={p.image_url || 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=150&q=80'} alt={p.name} className="w-14 h-14 rounded-lg object-cover bg-[#EAE0D5]" />
                      <div>
                        <h4 className="font-semibold text-sm text-[#2F3E46]">{p.name}</h4>
                        <p className="text-xs text-[#8F9489] mt-0.5">RM {Number(p.price).toFixed(2)} &nbsp;|&nbsp; Stok: {p.stock}m</p>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(p.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Padam Produk">
                      <Trash2 size={18}/>
                    </button>
                  </div>
                ))}
                {products.length === 0 && <p className="text-sm text-[#A5A58D] text-center py-6">Belum ada produk di dalam sistem.</p>}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
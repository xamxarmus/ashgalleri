'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Fungsi untuk tukar muka surat
import { ArrowLeft, Lock, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage('Ralat: E-mel atau kata laluan salah.');
      else {
        setMessage('Berjaya log masuk! Membawa anda ke butik... 🌸');
        setTimeout(() => router.push('/'), 1500); // Redirect ke muka depan
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setMessage('Ralat: ' + error.message);
      else {
        setMessage('Pendaftaran berjaya! Membawa anda ke butik... 🎉');
        setTimeout(() => router.push('/'), 1500); // Redirect ke muka depan
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-[#EAE0D5]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 text-sm text-[#6B705C] hover:text-[#5B4636] mb-6 transition-colors">
          <ArrowLeft size={16} /> Kembali ke Butik
        </Link>
        <h2 className="text-center text-3xl font-serif font-semibold tracking-widest text-[#2F3E46] uppercase">
          Ash Galleri
        </h2>
        <p className="mt-2 text-center text-sm text-[#8F9489]">
          {isLogin ? 'Log masuk ke akaun anda' : 'Daftar akaun baharu pelanggan'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-[#E8E1D9] sm:rounded-3xl sm:px-10">
          <form className="space-y-6" onSubmit={handleAuth}>
            <div>
              <label className="block text-sm font-medium text-[#5B4636]">Alamat E-mel</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={16} className="text-[#A5A58D]" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 px-3 py-3 border border-[#E8E1D9] rounded-xl shadow-sm placeholder-[#A5A58D] text-black font-bold focus:outline-none focus:ring-[#DDBEA9] focus:border-[#DDBEA9] sm:text-sm bg-white"
                  placeholder="anda@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#5B4636]">Kata Laluan</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={16} className="text-[#A5A58D]" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 px-3 py-3 border border-[#E8E1D9] rounded-xl shadow-sm placeholder-[#A5A58D] text-black font-bold focus:outline-none focus:ring-[#DDBEA9] focus:border-[#DDBEA9] sm:text-sm bg-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {message && (
              <div className={`p-3 rounded-xl text-sm text-center font-medium ${message.includes('Ralat') ? 'bg-red-50 text-red-600' : 'bg-[#EAE0D5] text-[#5B4636]'}`}>
                {message}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-[#6B705C] hover:bg-[#585C4B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6B705C] transition-all disabled:opacity-50"
              >
                {loading ? 'Sila tunggu...' : (isLogin ? 'Log Masuk' : 'Daftar Akaun')}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setMessage('');
              }}
              className="text-sm font-medium text-[#8F9489] hover:text-[#5B4636] transition-colors"
            >
              {isLogin ? 'Belum ada akaun? Daftar di sini' : 'Sudah ada akaun? Log masuk sini'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
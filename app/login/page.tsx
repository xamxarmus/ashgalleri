'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Logik Supabase akan diletakkan di sini nanti
    alert("Sistem pengesahan (Auth) sedang dibina! 🌸");
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
          Log masuk untuk menguruskan profil atau tetapan admin
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-[#E8E1D9] sm:rounded-3xl sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin}>
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
                  className="appearance-none block w-full pl-10 px-3 py-2.5 border border-[#E8E1D9] rounded-xl shadow-sm placeholder-[#A5A58D] focus:outline-none focus:ring-[#DDBEA9] focus:border-[#DDBEA9] sm:text-sm bg-[#FDFBF7]"
                  placeholder="admin@ashgalleri.com"
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
                  className="appearance-none block w-full pl-10 px-3 py-2.5 border border-[#E8E1D9] rounded-xl shadow-sm placeholder-[#A5A58D] focus:outline-none focus:ring-[#DDBEA9] focus:border-[#DDBEA9] sm:text-sm bg-[#FDFBF7]"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-[#6B705C] hover:bg-[#585C4B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6B705C] transition-all"
              >
                Log Masuk Laman Utama
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
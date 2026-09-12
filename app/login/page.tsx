'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
// Tambah ikon Eye dan EyeOff di sini
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  
  // State baru untuk kawal mata kata laluan
  const [showPassword, setShowPassword] = useState(false);

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
      else router.push('/profile');
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) alert(error.message);
      else {
        alert('Pendaftaran berjaya! Sila log masuk.');
        setIsLogin(true);
      }
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#FCFAFF] text-[#2E1065] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center items-center text-[#9333EA] hover:text-[#6B21A8] mb-6 transition-colors">
          <ArrowLeft size={18} className="mr-2" /> Kembali ke Butik
        </Link>
        <h2 className="text-center text-3xl font-serif font-bold text-[#3B0764]">
          {isLogin ? 'Log Masuk' : 'Daftar Akaun Baru'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-[#E9D5FF] sm:rounded-3xl sm:px-10">
          <form className="space-y-6" onSubmit={handleAuth}>
            <div>
              <label className="block text-sm font-semibold text-[#6B21A8]">Emel</label>
              <div className="mt-1 relative flex items-center">
                <Mail className="absolute left-3 text-[#C084FC]" size={18} />
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="appearance-none block w-full pl-10 pr-3 py-2.5 border border-[#E9D5FF] rounded-xl shadow-sm placeholder-[#D8B4E2] focus:outline-none focus:ring-[#C084FC] focus:border-[#C084FC] sm:text-sm bg-[#FCFAFF]" placeholder="emel@anda.com" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#6B21A8]">Kata Laluan</label>
              <div className="mt-1 relative flex items-center">
                <Lock className="absolute left-3 text-[#C084FC]" size={18} />
                {/* Tukar jenis input berdasarkan butang mata */}
                <input required type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} className="appearance-none block w-full pl-10 pr-10 py-2.5 border border-[#E9D5FF] rounded-xl shadow-sm placeholder-[#D8B4E2] focus:outline-none focus:ring-[#C084FC] focus:border-[#C084FC] sm:text-sm bg-[#FCFAFF]" placeholder="••••••••" />
                
                {/* Butang untuk klik mata */}
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 text-[#C084FC] hover:text-[#9333EA] transition-colors focus:outline-none">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#C084FC] hover:bg-[#A855F7] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C084FC] transition-all disabled:opacity-50">
                {loading ? 'Memproses...' : (isLogin ? 'Log Masuk' : 'Daftar Sekarang')}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#E9D5FF]"></div></div>
              <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-[#9333EA]">Atau</span></div>
            </div>
            <div className="mt-6 text-center">
              <button onClick={() => setIsLogin(!isLogin)} className="text-sm font-bold text-[#A855F7] hover:text-[#3B0764] transition-colors">
                {isLogin ? 'Belum ada akaun? Daftar di sini' : 'Sudah ada akaun? Log masuk'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
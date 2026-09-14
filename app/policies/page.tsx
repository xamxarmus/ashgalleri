import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function PoliciesPage() {
  return (
    <div className="min-h-screen bg-[#FCFAFF] text-[#2E1065] font-sans pb-20">
      <header className="bg-white border-b border-[#E9D5FF] px-5 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Link href="/" className="text-[#9333EA] hover:text-[#6B21A8] transition-colors"><ArrowLeft size={20} /></Link>
          <h1 className="text-xl font-serif font-bold text-[#3B0764]">Polisi & Terma</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-12">
        <div className="bg-white p-8 md:p-10 rounded-3xl border border-[#E9D5FF] shadow-sm space-y-8">
          <div className="flex items-center gap-3 border-b border-[#E9D5FF] pb-4">
            <ShieldCheck size={32} className="text-[#C084FC]" />
            <h2 className="text-2xl font-bold text-[#3B0764]">Polisi Butik Ash Galleri</h2>
          </div>

          <section>
            <h3 className="font-bold text-lg text-[#6B21A8] mb-3">1. Polisi Pemulangan (Refund & Return Policy)</h3>
            <p className="text-[#9333EA] text-sm leading-relaxed mb-3">
              Kami di Ash Galleri sentiasa mementingkan kualiti. Pemulangan atau pertukaran barang hanya dibenarkan dalam masa <strong>7 hari</strong> selepas barang diterima, tertakluk kepada syarat berikut:
            </p>
            <ul className="list-disc pl-5 text-[#9333EA] text-sm space-y-2">
              <li>Barang diterima dalam keadaan rosak (koyak/kotor) dari pihak kami.</li>
              <li>Kain belum dipotong, dibasuh, atau diubah suai.</li>
              <li>Kos penghantaran pemulangan adalah di bawah tanggungjawab pelanggan kecuali ralat dari pihak kami.</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-lg text-[#6B21A8] mb-3">2. Polisi Penghantaran (Shipping Policy)</h3>
            <p className="text-[#9333EA] text-sm leading-relaxed">
              Pesanan anda akan diproses dan dihantar dalam masa <strong>1-3 hari bekerja</strong> selepas pembayaran disahkan. Nombor penjejakan (tracking number) akan dikemas kini dan boleh disemak melalui profil anda atau akan dihantar melalui WhatsApp.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-lg text-[#6B21A8] mb-3">3. Privasi & Keselamatan Data</h3>
            <p className="text-[#9333EA] text-sm leading-relaxed">
              Maklumat peribadi anda seperti nama, alamat, dan nombor telefon adalah sulit dan hanya digunakan untuk tujuan penghantaran. Segala transaksi pembayaran diproses melalui sistem keselamatan tahap tinggi (Stripe) dan kami tidak menyimpan maklumat kad bank anda.
            </p>
          </section>

          <div className="bg-[#F3E8FF] p-5 rounded-xl border border-[#E9D5FF] text-center mt-8">
            <p className="text-sm font-semibold text-[#6B21A8]">Sebarang pertanyaan, hubungi kami di WhatsApp: <span className="font-bold">016-9009331</span></p>
          </div>
        </div>
      </main>
    </div>
  );
}
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function SuspendedPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function checkStatus() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: userData } = await supabase
        .from('users')
        .select('subscription_status, subscription_end_date')
        .eq('id', user.id)
        .single();

      setProfile(userData);
      setLoading(false);
    }

    checkStatus();
  }, [router, supabase]);

  if (loading) {
    return <div className="flex items-center justify-center" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)' }}>Loading...</div>;
  }

  const status = profile?.subscription_status;

  return (
    <div className="flex items-center justify-center" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', padding: 'var(--spacing-md)' }}>
      <div className="card" style={{ maxWidth: '500px', width: '100%', textAlign: 'center', padding: 'var(--spacing-xl)' }}>

        {status === 'Pending Payment' || status === 'Expired' || (profile?.subscription_end_date && new Date(profile.subscription_end_date) < new Date()) ? (
          <>
            <h1 className="h2" style={{ color: 'var(--text-primary)', marginBottom: 'var(--spacing-md)' }}>Masa Aktif Belum Dimulai / Habis</h1>
            <p className="text-body" style={{ marginBottom: 'var(--spacing-md)', color: 'var(--text-secondary)' }}>
              Untuk mulai menggunakan atau memperpanjang akses ZEntry, silakan lakukan pembelian paket langganan melalui toko resmi Shopee kami.
            </p>
            <div style={{ backgroundColor: '#fff5f5', padding: 'var(--spacing-md)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-lg)', border: '1px solid #fed7d7' }}>
              <p style={{ fontWeight: 600, marginBottom: '8px', color: '#e53e3e' }}>Cara Aktivasi:</p>
              <ol style={{ textAlign: 'left', paddingLeft: '20px', color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
                <li style={{ marginBottom: '4px' }}>Beli Paket Langganan di <strong>Store Shopee ZEntry</strong>.</li>
                <li style={{ marginBottom: '4px' }}>Chat Admin ZEntry di Shopee dan infokan Email akun ini.</li>
                <li>Admin akan memverifikasi order dan mengaktifkan akun Anda.</li>
              </ol>
            </div>

            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
              <a href="https://shopee.co.id/product/50831595/55113834525/" target="_blank" rel="noopener noreferrer">
                <button className="btn btn-primary" style={{ width: '100%', backgroundColor: '#ee4d2d', borderColor: '#ee4d2d' }}>
                  Beli Langganan di Shopee
                </button>
              </a>
            </div>
            <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => window.location.reload()}>
              Saya Sudah Beli (Refresh Status)
            </button>
          </>
        ) : profile?.subscription_status === 'Pending Approval' ? (
          <>
            <h1 className="h2" style={{ color: '#F59E0B', marginBottom: 'var(--spacing-md)' }}>Menunggu Aktivasi</h1>
            <p className="text-body" style={{ marginBottom: 'var(--spacing-xl)' }}>
              Pendaftaran Anda berhasil! Namun, akun Anda masih berstatus <strong>Pending</strong>. Silakan hubungi Admin atau Developer untuk mengaktifkan akun Anda agar dapat mengakses sistem.
            </p>
            <button className="btn btn-outline" style={{ width: '100%', marginBottom: '16px' }} onClick={() => window.location.reload()}>
              Refresh Status
            </button>
          </>
        ) : (
          <>
            <h1 className="h2" style={{ color: 'red', marginBottom: 'var(--spacing-md)' }}>Akses Ditangguhkan</h1>
            <p className="text-body" style={{ marginBottom: 'var(--spacing-xl)' }}>
              Akun Anda telah ditangguhkan oleh Administrator. Silakan hubungi tim dukungan ZEntry.
            </p>
          </>
        )}

        <div style={{ marginTop: 'var(--spacing-xl)' }}>
          <Link href="/">
            <button className="btn btn-secondary" style={{ width: '100%' }}>Kembali ke Halaman Utama</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

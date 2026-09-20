"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

import Footer from "@/components/Footer";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (authError) throw authError;

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Gagal mengirim link reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)' }}>
      <main className="flex items-center justify-center" style={{ flex: 1, padding: 'var(--spacing-md)' }}>
        <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
          <div style={{ marginBottom: 'var(--spacing-xl)', display: 'flex', justifyContent: 'center' }}>
            <Image src="/zentry-logo.png" alt="ZEntry Logo" width={120} height={120} priority style={{ objectFit: 'contain' }} />
          </div>
          
          <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
            <h1 className="h2" style={{ marginBottom: 'var(--spacing-sm)' }}>Lupa Password</h1>
            <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
              Masukkan email Anda untuk mereset password.
            </p>
          </div>

          {error && (
            <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '4px', marginBottom: '16px', fontSize: '14px' }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '10px', borderRadius: '4px', marginBottom: '16px', fontSize: '14px' }}>
              Link reset password telah dikirim ke email Anda. Silakan cek inbox atau folder spam.
            </div>
          )}
          
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <div className="input-group" style={{ textAlign: 'left' }}>
              <label className="input-label">Email</label>
              <input type="email" name="email" required className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ marginTop: 'var(--spacing-md)' }}>
              {loading ? "Memproses..." : "Kirim Link Reset"}
            </button>
          </form>

          <p className="text-small" style={{ marginTop: 'var(--spacing-xl)' }}>
            <Link href="/login" style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}>Kembali ke Halaman Login</Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

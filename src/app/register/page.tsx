"use client";
import './register.css';

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SignatureCanvas from 'react-signature-canvas';
import { createClient } from "@/lib/supabase/client";
import { Mail, Lock, Eye, EyeOff, UserPlus, Zap, ShieldCheck, BarChart3, Cloud, User, Users, Briefcase, ChevronDown, Check } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const sigCanvas = useRef<SignatureCanvas>(null);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'Sales',
    supervisor_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [leaders, setLeaders] = useState<{id: string, full_name: string}[]>([]);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showLeaderDropdown, setShowLeaderDropdown] = useState(false);

  useEffect(() => {
    const fetchLeaders = async () => {
      const { data } = await supabase.from('users').select('id, full_name').eq('role', 'Leader');
      if (data) setLeaders(data);
    };
    fetchLeaders();
  }, []);

  const needsSignature = formData.role === 'Sales' || formData.role === 'Leader';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Validasi Tanda Tangan
      if (needsSignature && sigCanvas.current?.isEmpty()) {
        throw new Error("Tanda Tangan wajib diisi untuk role Sales dan Leader.");
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: formData.role,
            ...(formData.role === 'Sales' && formData.supervisor_id ? { supervisor_id: formData.supervisor_id } : {})
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Pendaftaran gagal. Email mungkin sudah terdaftar atau sistem menolak registrasi Anda.");

      // Update email to public.users table just in case the database trigger doesn't do it
      if (authData.user) {
        await supabase.from('users').update({ email: formData.email, subscription_status: 'Pending Approval' }).eq('id', authData.user.id);
      }

      // 3. Simpan Tanda Tangan jika ada (Simpan langsung Base64 ke database agar lebih aman dan cepat)
      if (authData.user && needsSignature && sigCanvas.current) {
        const signatureBase64 = sigCanvas.current.toDataURL(); // Ini berupa "data:image/png;base64,..."
        
        const { error: dbError } = await supabase.from('signatures').insert({
          user_id: authData.user.id,
          signature_url: signatureBase64 // Kita simpan data Base64-nya secara utuh
        });

        if (dbError) {
          throw new Error("Gagal menyimpan tanda tangan ke database: " + dbError.message);
        }
      }

      alert("Registrasi Berhasil! Akun Anda harus diaktivasi oleh Developer sebelum dapat digunakan.");
      
      router.push('/suspended');

    } catch (err: any) {
      console.error("REGISTER ERROR:", err);
      let errorMsg = "Terjadi kesalahan saat registrasi.";
      
      try {
        // Coba ekstrak error Supabase (AuthError biasanya punya .message, .status, .name)
        if (err?.message) {
          errorMsg = `${err.name ? err.name + ': ' : ''}${err.message} ${err.status ? '(Status: ' + err.status + ')' : ''}`;
        } else {
          errorMsg = JSON.stringify(err, Object.getOwnPropertyNames(err));
        }
      } catch(e) {
        errorMsg = String(err);
      }

      const cleanMsg = errorMsg.replace(/\s+/g, '');
      if (cleanMsg === '{}' || cleanMsg === '""' || cleanMsg === "''") {
        errorMsg = "Sistem menolak registrasi tanpa pesan error yang jelas (Bisa karena email sudah ada atau trigger database gagal).";
      }

      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "Gagal login dengan Google");
    }
  };

  return (
    <div className="login-page-container">
      <main className="login-main">
        <div className="split-layout">
          
          {/* ================= HERO SECTION (LEFT) ================= */}
          <div className="hero-section">
            <div className="hero-brand">
              <div className="logo-badge">
                <Image src="/zentry-logo.png" width={140} height={35} alt="ZEntry Logo" style={{ objectFit: 'contain' }} />
              </div>
            </div>
            
            <h1 className="hero-headline">
              Bergabung dengan <br />
              <span className="highlight-blue">ZEntry Network</span>
            </h1>
            
            <p className="hero-subheadline">
              Daftarkan diri Anda untuk mulai mengelola data pelanggan dan operasional sales dengan sistem terpadu.
            </p>

            <div className="feature-grid">
              <div className="feature-item float-delay-1">
                <div className="feature-icon"><Zap size={20} /></div>
                <div>
                  <h4 className="feature-title">Performa Tinggi</h4>
                  <p className="feature-desc">Akses data instan tanpa delay.</p>
                </div>
              </div>
              <div className="feature-item float-delay-2">
                <div className="feature-icon"><ShieldCheck size={20} /></div>
                <div>
                  <h4 className="feature-title">Keamanan Ganda</h4>
                  <p className="feature-desc">Enkripsi data standar enterprise.</p>
                </div>
              </div>
            </div>
          </div>

          {/* ================= REGISTER CARD (RIGHT) ================= */}
          <div className="login-card-wrapper" style={{ maxHeight: '90vh', overflowY: 'auto', borderRadius: '24px', paddingRight: '10px' }}>
            <div className="login-card glassmorphism-card">
              
              <div className="card-header">
                  <div className="card-logo-box">
                    <Image src="/zentry-logo.png" width={140} height={35} alt="ZEntry Logo" />
                  </div>
                  <h2 className="card-brand-name">ZentryX</h2>
              </div>

              <h3 className="card-title">Buat Akun Baru</h3>
              <p className="card-subtitle">Lengkapi data diri Anda di bawah ini</p>

              {error && (
                <div className="error-banner">
                  <span className="error-dot" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleRegister} className="login-form">
                
                <div className="form-group">
                  <label className="form-label">Nama Lengkap</label>
                  <div className="input-container">
                    <User size={20} className="input-icon" />
                    <input type="text" name="fullName" required className="form-input" placeholder="Masukkan nama lengkap" value={formData.fullName} onChange={handleChange} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Institusi</label>
                  <div className="input-container">
                    <Mail size={20} className="input-icon" />
                    <input type="email" name="email" required className="form-input" placeholder="sales_name@zentry.com" value={formData.email} onChange={handleChange} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="input-container">
                    <Lock size={20} className="input-icon" />
                    <input type={showPassword ? "text" : "password"} name="password" required className="form-input" placeholder="••••••••" value={formData.password} onChange={handleChange} />
                    <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Jabatan</label>
                  <div className="input-container" style={{ paddingRight: '14px', cursor: 'pointer', position: 'relative' }} onClick={() => setShowRoleDropdown(!showRoleDropdown)}>
                    <Briefcase size={20} className="input-icon" />
                    <div className="form-input" style={{ display: 'flex', alignItems: 'center', backgroundColor: 'transparent', userSelect: 'none' }}>
                      {formData.role || 'Pilih Jabatan'}
                    </div>
                    <ChevronDown size={20} color="#94A3B8" style={{ transition: 'transform 0.2s', transform: showRoleDropdown ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                    
                    {showRoleDropdown && (
                      <div className="custom-dropdown-menu animate-fade-in" style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', zIndex: 50, overflow: 'hidden', padding: '8px' }}>
                        {['Sales', 'Leader', 'Manager'].map(roleOption => (
                          <div 
                            key={roleOption}
                            onClick={(e) => { e.stopPropagation(); setFormData({...formData, role: roleOption}); setShowRoleDropdown(false); if(roleOption !== 'Sales') setFormData({...formData, role: roleOption, supervisor_id: ''}); }}
                            style={{ padding: '12px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: formData.role === roleOption ? '#F0F9FF' : 'transparent', color: formData.role === roleOption ? '#0284C7' : '#334155', fontWeight: formData.role === roleOption ? 600 : 500, transition: 'all 0.15s ease' }}
                            onMouseEnter={(e) => { if(formData.role !== roleOption) e.currentTarget.style.backgroundColor = '#F8FAFC'; }}
                            onMouseLeave={(e) => { if(formData.role !== roleOption) e.currentTarget.style.backgroundColor = 'transparent'; }}
                          >
                            {roleOption}
                            {formData.role === roleOption && <Check size={18} color="#0284C7" />}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {showRoleDropdown && <div style={{position: 'fixed', inset: 0, zIndex: 40}} onClick={() => setShowRoleDropdown(false)} />}
                </div>

                {formData.role === 'Sales' && (
                  <div className="form-group">
                    <label className="form-label">Supervisor / Leader</label>
                    <div className="input-container" style={{ paddingRight: '14px', cursor: 'pointer', position: 'relative' }} onClick={() => setShowLeaderDropdown(!showLeaderDropdown)}>
                      <Users size={20} className="input-icon" />
                      <div className="form-input" style={{ display: 'flex', alignItems: 'center', backgroundColor: 'transparent', userSelect: 'none', color: formData.supervisor_id ? '#0F172A' : '#94A3B8' }}>
                        {formData.supervisor_id ? (leaders.find(l => l.id === formData.supervisor_id)?.full_name || '-- Pilih Leader --') : '-- Pilih Leader --'}
                      </div>
                      <ChevronDown size={20} color="#94A3B8" style={{ transition: 'transform 0.2s', transform: showLeaderDropdown ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                      
                      {showLeaderDropdown && (
                        <div className="custom-dropdown-menu animate-fade-in" style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', zIndex: 50, overflow: 'auto', maxHeight: '200px', padding: '8px' }}>
                          {leaders.length === 0 ? (
                            <div style={{ padding: '12px 16px', color: '#94A3B8', fontSize: '13px', textAlign: 'center' }}>Tidak ada leader tersedia</div>
                          ) : (
                            leaders.map(leaderOption => (
                              <div 
                                key={leaderOption.id}
                                onClick={(e) => { e.stopPropagation(); setFormData({...formData, supervisor_id: leaderOption.id}); setShowLeaderDropdown(false); }}
                                style={{ padding: '12px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: formData.supervisor_id === leaderOption.id ? '#F0F9FF' : 'transparent', color: formData.supervisor_id === leaderOption.id ? '#0284C7' : '#334155', fontWeight: formData.supervisor_id === leaderOption.id ? 600 : 500, transition: 'all 0.15s ease' }}
                                onMouseEnter={(e) => { if(formData.supervisor_id !== leaderOption.id) e.currentTarget.style.backgroundColor = '#F8FAFC'; }}
                                onMouseLeave={(e) => { if(formData.supervisor_id !== leaderOption.id) e.currentTarget.style.backgroundColor = 'transparent'; }}
                              >
                                {leaderOption.full_name}
                                {formData.supervisor_id === leaderOption.id && <Check size={18} color="#0284C7" />}
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                    {showLeaderDropdown && <div style={{position: 'fixed', inset: 0, zIndex: 40}} onClick={() => setShowLeaderDropdown(false)} />}
                    {leaders.length === 0 && <span style={{ color: '#DC2626', fontSize: '12px', marginTop: '4px', display: 'block' }}>Belum ada Leader yang terdaftar.</span>}
                  </div>
                )}

                {needsSignature && (
                  <div className="form-group" style={{ marginTop: '8px' }}>
                    <label className="form-label">Tanda Tangan Digital (Wajib)</label>
                    <p style={{ fontSize: '11px', color: '#64748B', marginBottom: '8px' }}>Digunakan untuk generate form otomatis</p>
                    <div style={{ border: '1.5px dashed #CBD5E1', borderRadius: '12px', backgroundColor: '#F8FAFC', overflow: 'hidden' }}>
                      <SignatureCanvas 
                        ref={sigCanvas}
                        canvasProps={{
                          className: 'signature-canvas',
                          style: { width: '100%', height: '120px', cursor: 'crosshair', touchAction: 'none' }
                        }} 
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                      <button type="button" onClick={() => sigCanvas.current?.clear()} style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>
                        Bersihkan Tanda Tangan
                      </button>
                    </div>
                  </div>
                )}

                <button type="submit" disabled={loading} className="submit-btn" style={{ marginTop: '12px' }}>
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.3" />
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                      </svg>
                      Memproses...
                    </span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <UserPlus size={20} />
                      Daftar Akun ZEntry
                    </span>
                  )}
                </button>

                
              </form>

              <div className="card-footer" style={{ marginTop: '24px' }}>
                <p className="footer-register-text">
                  Sudah punya akun? <Link href="/login"><span className="register-link">Login di sini</span></Link>
                </p>
                <div className="copyright-box">
                  <p>© 2026 ZEntryX. All rights reserved.</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

      
    </div>
  );
}




import re

with open('style.txt', 'r', encoding='utf-8') as f:
    style_content = f.read()

with open('src/app/register/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add lucide imports
if 'lucide-react' not in content:
    content = content.replace('import { createClient } from "@/lib/supabase/client";',
    'import { createClient } from "@/lib/supabase/client";\nimport { Mail, Lock, Eye, EyeOff, UserPlus, Zap, ShieldCheck, BarChart3, Cloud, User, Users, Briefcase } from "lucide-react";')

# Build new return block
new_return = '''return (
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
                    <input type="text" name="fullName" required className="form-input" value={formData.fullName} onChange={handleChange} placeholder="Masukkan nama lengkap" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Institusi</label>
                  <div className="input-container">
                    <Mail size={20} className="input-icon" />
                    <input type="email" name="email" required className="form-input" value={formData.email} onChange={handleChange} placeholder="email@zentry.com" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="input-container">
                    <Lock size={20} className="input-icon" />
                    <input type={showPassword ? "text" : "password"} name="password" required className="form-input password-input" value={formData.password} onChange={handleChange} placeholder="Buat password" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="toggle-pwd-btn">
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Jabatan</label>
                  <div className="input-container" style={{ paddingRight: '14px' }}>
                    <Briefcase size={20} className="input-icon" />
                    <select name="role" required className="form-input" value={formData.role} onChange={handleChange} style={{ appearance: 'none', backgroundColor: 'transparent', cursor: 'pointer' }}>
                      <option value="Sales">Sales</option>
                      <option value="Leader">Leader</option>
                      <option value="Manager">Manager</option>
                    </select>
                  </div>
                </div>

                {formData.role === 'Sales' && (
                  <div className="form-group">
                    <label className="form-label">Supervisor / Leader</label>
                    <div className="input-container" style={{ paddingRight: '14px' }}>
                      <Users size={20} className="input-icon" />
                      <select name="supervisor_id" required className="form-input" value={formData.supervisor_id} onChange={handleChange} style={{ appearance: 'none', backgroundColor: 'transparent', cursor: 'pointer' }}>
                        <option value="">-- Pilih Leader --</option>
                        {leaders.map(leader => (
                          <option key={leader.id} value={leader.id}>{leader.full_name}</option>
                        ))}
                      </select>
                    </div>
                    {leaders.length === 0 && <span style={{ color: '#DC2626', fontSize: '12px', marginTop: '4px' }}>Belum ada Leader yang terdaftar.</span>}
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
                    <span className="btn-content"><span className="spinner" /> <span>Memproses...</span></span>
                  ) : (
                    <span className="btn-content"><UserPlus size={20} className="btn-icon" /> <span>Daftar Akun</span></span>
                  )}
                </button>

                <div className="divider">
                  <span className="divider-line" />
                  <span className="divider-text">atau</span>
                  <span className="divider-line" />
                </div>

                <button type="button" onClick={handleGoogleLogin} disabled={loading} className="google-btn">
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Daftar dengan Google</span>
                </button>

              </form>

              <div className="card-footer" style={{ marginTop: '24px' }}>
                <p className="footer-register-text">
                  Sudah punya akun? <Link href="/login" className="register-link">Login di sini</Link>
                </p>
                <div className="copyright-box">
                  <p>© 2026 ZEntryX. All rights reserved.</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

      <style jsx>{\n''' + style_content.replace('</style>', '').strip() + '''\n      }</style>
    </div>
  );'''

# Replace the return block
content = re.sub(r'return \(\s*<div className="flex items-center justify-center".*?\);\s*\}', new_return + '\n}', content, flags=re.DOTALL)

with open('src/app/register/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Register page updated.")

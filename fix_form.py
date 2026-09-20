import re

file_path = 'src/app/register/page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# I will replace everything inside <form onSubmit={handleRegister} className="login-form"> ... </form>
form_start_str = '<form onSubmit={handleRegister} className="login-form">'
form_end_str = '</form>'

form_start = content.find(form_start_str)
form_end = content.find(form_end_str, form_start)

new_form = '''<form onSubmit={handleRegister} className="login-form">
                
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

                <p className="login-link">
                  Sudah punya akun? <Link href="/login">Masuk di sini</Link>
                </p>
              </form>'''

content = content[:form_start] + new_form + content[form_end + 7:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Reconstructed form completely.")

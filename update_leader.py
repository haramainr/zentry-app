import re

file_path = 'src/app/register/page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

leader_new = '''<div className="input-container" style={{ paddingRight: '14px', cursor: 'pointer', position: 'relative' }} onClick={() => setShowLeaderDropdown(!showLeaderDropdown)}>
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
                      {/* Add an invisible overlay to close dropdown when clicking outside */}
                      {showLeaderDropdown && <div style={{position: 'fixed', inset: 0, zIndex: 40}} onClick={() => setShowLeaderDropdown(false)} />}'''

# Regex to match the entire input-container containing the select tag for supervisor_id
pattern = re.compile(r'<div className="input-container"[^>]*>.*?<select name="supervisor_id".*?</select>\s*</div>', re.DOTALL)
content = pattern.sub(leader_new, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Replaced Leader dropdown using regex.")

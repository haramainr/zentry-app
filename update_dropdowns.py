import re

file_path = 'src/app/register/page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add ChevronDown and Check to imports
import_old = 'import { Mail, Lock, Eye, EyeOff, UserPlus, Zap, ShieldCheck, BarChart3, Cloud, User, Users, Briefcase } from "lucide-react";'
import_new = 'import { Mail, Lock, Eye, EyeOff, UserPlus, Zap, ShieldCheck, BarChart3, Cloud, User, Users, Briefcase, ChevronDown, Check } from "lucide-react";'
content = content.replace(import_old, import_new)

# 2. Add state variables for dropdowns
state_old = '''const [needsSignature, setNeedsSignature] = useState(true);'''
state_new = '''const [needsSignature, setNeedsSignature] = useState(true);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showLeaderDropdown, setShowLeaderDropdown] = useState(false);'''
content = content.replace(state_old, state_new)

# 3. Replace Role dropdown
role_old = '''<div className="input-container" style={{ paddingRight: '14px' }}>
                      <Briefcase size={20} className="input-icon" />
                      <select name="role" required className="form-input" value={formData.role} onChange={handleChange} style={{ appearance: 'none', backgroundColor: 'transparent', cursor: 'pointer' }}>
                        <option value="Sales">Sales</option>
                        <option value="Leader">Leader</option>
                        <option value="Manager">Manager</option>
                      </select>
                    </div>'''

role_new = '''<div className="input-container" style={{ paddingRight: '14px', cursor: 'pointer', position: 'relative' }} onClick={() => setShowRoleDropdown(!showRoleDropdown)}>
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
                              onClick={(e) => { e.stopPropagation(); setFormData({...formData, role: roleOption}); setShowRoleDropdown(false); if(roleOption !== 'Sales') setFormData(prev => ({...prev, supervisor_id: ''})); }}
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
                    {/* Add an invisible overlay to close dropdown when clicking outside */}
                    {showRoleDropdown && <div style={{position: 'fixed', inset: 0, zIndex: 40}} onClick={() => setShowRoleDropdown(false)} />}'''
content = content.replace(role_old, role_new)

# 4. Replace Leader dropdown
leader_old = '''<div className="input-container" style={{ paddingRight: '14px' }}>
                        <Users size={20} className="input-icon" />
                        <select name="supervisor_id" required className="form-input" value={formData.supervisor_id} onChange={handleChange} style={{ appearance: 'none', backgroundColor: 'transparent', cursor: 'pointer' }}>
                          <option value="">-- Pilih Leader --</option>
                          {leaders.map(leader => (
                            <option key={leader.id} value={leader.id}>{leader.full_name}</option>
                          ))}
                        </select>
                      </div>'''

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
content = content.replace(leader_old, leader_new)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Replaced native select with custom UI dropdowns.")

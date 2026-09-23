"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { UserCog, Edit, Trash2, Search, Save, X, Shield, Users, Plus, Upload } from "lucide-react";
import { createPortal } from "react-dom";
import { useRef } from "react";

export default function UserManagementPage() {
  const supabase = createClient();
  
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  
  // NEW STATES
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSigModal, setShowSigModal] = useState(false);
  const [selectedUserForSig, setSelectedUserForSig] = useState<any>(null);
  const [createForm, setCreateForm] = useState({ fullName: "", email: "", password: "", role: "Sales", supervisorId: "" });
  const [creating, setCreating] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sigBase64, setSigBase64] = useState<string | null>(null);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CREATE_USER", payload: createForm })
      });
      const data = await res.json();
      if (data.success) {
        setShowCreateModal(false);
        setCreateForm({ fullName: "", email: "", password: "", role: "Sales", supervisorId: "" });
        fetchUsers();
      } else {
        alert(data.error || "Gagal membuat user");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  const handleSigUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) setSigBase64(ev.target.result.toString());
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const saveSignature = async () => {
    if (!sigBase64 || !selectedUserForSig) return;
    setCreating(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "UPLOAD_SIGNATURE", payload: { userId: selectedUserForSig.id, base64: sigBase64 } })
      });
      const data = await res.json();
      if (data.success) {
        setShowSigModal(false);
        setSigBase64(null);
        // refresh
        alert("Tanda tangan berhasil disimpan!");
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  
  // Modal state
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
      role: '',
      supervisor_id: '',
      subscription_status: '',
      subscription_end_date: ''
    });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (data) setUsers(data);
    setLoading(false);
  };

  const handleDelete = async (user: any) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus akun ${user.full_name} secara permanen? Data ini tidak dapat dipulihkan.`)) return;
    
    setLoading(true);
    const { error } = await supabase.from('users').delete().eq('id', user.id);
    
    if (error) {
      alert("Gagal menghapus akun: " + error.message);
    } else {
      alert("Akun berhasil dihapus!");
      fetchUsers();
    }
    setLoading(false);
  };

  const handleEditClick = (user: any) => {
    setEditingUser(user);
    setEditForm({
        role: user.role,
        supervisor_id: user.supervisor_id || '',
        subscription_status: user.subscription_status || 'Active',
        subscription_end_date: user.subscription_end_date ? new Date(user.subscription_end_date).toISOString().split('T')[0] : ''
      });
  };

  const handleSave = async () => {
    if (!editingUser) return;
    setSaving(true);
    
    const payload: any = {
      role: editForm.role,
      supervisor_id: editForm.supervisor_id === '' ? null : editForm.supervisor_id,
      subscription_status: editForm.subscription_status
    };

    if (editForm.subscription_status === 'Active') {
        if (editForm.subscription_end_date) {
          payload.subscription_end_date = new Date(editForm.subscription_end_date).toISOString();
        } else {
          const expiry = new Date();
          expiry.setDate(expiry.getDate() + 30);
          payload.subscription_end_date = expiry.toISOString();
        }
      }

    const { error } = await supabase
      .from('users')
      .update(payload)
      .eq('id', editingUser.id);

    if (error) {
      alert("Gagal memperbarui pengguna: " + error.message);
    } else {
      alert("Pengguna berhasil diperbarui!");
      setEditingUser(null);
      fetchUsers();
    }
    
    setSaving(false);
  };

  const filteredUsers = users.filter(u => 
    (u.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.role || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // List of possible supervisors (Leaders)
  const leaders = users.filter(u => u.role === 'Leader');

  return (
    <div className="animate-fade-in" style={{ padding: 'var(--spacing-xl)', flex: 1 }}>
      <header style={{ marginBottom: 'var(--spacing-xl)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="h2" style={{ color: '#F8FAFC' }}>User Management</h1>
          <p style={{ color: '#94A3B8' }}>Atur peran, keanggotaan tim, dan status akun seluruh platform.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder="Cari nama pengguna..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ 
                  padding: '10px 10px 10px 38px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#1E293B', color: 'white', outline: 'none'
                }}
              />
            </div>
            <button 
              onClick={() => setShowCreateModal(true)}
              style={{ padding: '10px 16px', borderRadius: '8px', backgroundColor: '#3B82F6', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}
            >
              <Plus size={18} /> Tambah Akun
            </button>
          </div>
      </header>

      <div style={{ backgroundColor: '#1E293B', borderRadius: '12px', border: '1px solid #334155', overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>Memuat data pengguna...</div>
        ) : (
          <div className="table-responsive">

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#F8FAFC' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155', backgroundColor: '#0F172A' }}>
                <th style={{ padding: '16px', color: '#94A3B8', fontWeight: 500 }}>Nama Lengkap</th>
                <th style={{ padding: '16px', color: '#94A3B8', fontWeight: 500 }}>Role</th>
                <th style={{ padding: '16px', color: '#94A3B8', fontWeight: 500 }}>Tim (Supervisor)</th>
                <th style={{ padding: '16px', color: '#94A3B8', fontWeight: 500 }}>Status</th>
                <th style={{ padding: '16px', color: '#94A3B8', fontWeight: 500, textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#94A3B8' }}>
                    Tidak ada pengguna yang ditemukan.
                  </td>
                </tr>
              ) : filteredUsers.map(user => {
                const supervisor = users.find(u => u.id === user.supervisor_id);
                return (
                  <tr key={user.id} style={{ borderBottom: '1px solid #334155' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 500 }}>{user.full_name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{user.email || '(Email tidak tersimpan di database)'}</div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ 
                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600,
                        backgroundColor: user.role === 'Developer' ? 'rgba(139, 92, 246, 0.2)' : user.role === 'Manager' ? 'rgba(239, 68, 68, 0.2)' : user.role === 'Leader' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                        color: user.role === 'Developer' ? '#C4B5FD' : user.role === 'Manager' ? '#FCA5A5' : user.role === 'Leader' ? '#FCD34D' : '#93C5FD'
                      }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: '16px', color: '#CBD5E1' }}>
                      {supervisor ? supervisor.full_name : <span style={{ color: '#64748B' }}>-</span>}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ 
                        display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem',
                        color: user.subscription_status === 'Active' ? '#34D399' : '#F87171' 
                      }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: user.subscription_status === 'Active' ? '#34D399' : '#F87171' }}></div>
                        {user.subscription_status || 'Active'}
                        
                        {/* Countdown for active users */}
                        {user.subscription_status === 'Active' && user.subscription_end_date && user.role !== 'Developer' && user.role !== 'Admin' && (
                          <span style={{ fontSize: '0.75rem', color: '#94A3B8', marginLeft: '4px' }}>
                            {(() => {
                              const end = new Date(user.subscription_end_date);
                              const diff = end.getTime() - new Date().getTime();
                              if (diff <= 0) return '(Berakhir)';
                              
                              const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                              const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                              
                              if (days > 0) return `(${days}hr ${hours}j)`;
                              return `(${hours} jam lagi)`;
                            })()}
                          </span>
                        )}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        <button 
                          onClick={() => handleEditClick(user)}
                          style={{ 
                            background: 'none', border: 'none', cursor: 'pointer', color: '#60A5FA',
                            display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px',
                            borderRadius: '6px', backgroundColor: 'rgba(59, 130, 246, 0.1)'
                          }}
                        >
                          <Edit size={16} /> Edit
                        </button>
                        <button 
                          onClick={() => { setSelectedUserForSig(user); setShowSigModal(true); }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#10B981', display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '6px', backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
                        >
                          <Upload size={16} /> Upload TTD
                        </button>
                        <button 
                          onClick={() => handleDelete(user)}
                          style={{ 
                            background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444',
                            display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px',
                            borderRadius: '6px', backgroundColor: 'rgba(239, 68, 68, 0.1)'
                          }}
                        >
                          <Trash2 size={16} /> Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="animate-fade-in" style={{ 
            backgroundColor: '#1E293B', width: '100%', maxWidth: '450px', 
            borderRadius: '12px', border: '1px solid #334155', overflow: 'hidden'
          }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserCog size={20} color="#60A5FA" /> Edit Pengguna
              </h3>
              <button onClick={() => setEditingUser(null)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: '#94A3B8' }}>Nama Pengguna</p>
                <div style={{ padding: '10px 14px', backgroundColor: '#0F172A', borderRadius: '6px', color: '#F8FAFC', border: '1px solid #334155' }}>
                  {editingUser.full_name}
                </div>
              </div>

              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: '#94A3B8' }}>Role (Jabatan)</p>
                <select 
                  value={editForm.role}
                  onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                  style={{ width: '100%', padding: '10px 14px', backgroundColor: '#0F172A', color: 'white', borderRadius: '6px', border: '1px solid #334155', outline: 'none' }}
                >
                  <option value="Sales">Sales</option>
                  <option value="Leader">Leader</option>
                  <option value="Manager">Manager</option>
                  <option value="Developer">Developer</option>
                </select>

                
                {editForm.subscription_status === 'Active' && (
                  <div style={{ marginTop: '16px' }}>
                    <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: '#94A3B8' }}>Tanggal Berakhir Lisensi</p>
                    <input 
                      type="date" 
                      value={editForm.subscription_end_date}
                      onChange={(e) => setEditForm({...editForm, subscription_end_date: e.target.value})}
                      style={{ width: '100%', padding: '10px 14px', backgroundColor: '#0F172A', color: 'white', borderRadius: '6px', border: '1px solid #334155', outline: 'none', colorScheme: 'dark' }}
                    />
                  </div>
                )}


              </div>

              {editForm.role === 'Sales' && (
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: '#94A3B8' }}>Tim (Supervisor)</p>
                  <select 
                    value={editForm.supervisor_id}
                    onChange={(e) => setEditForm({...editForm, supervisor_id: e.target.value})}
                    style={{ width: '100%', padding: '10px 14px', backgroundColor: '#0F172A', color: 'white', borderRadius: '6px', border: '1px solid #334155', outline: 'none' }}
                  >
                    <option value="">Tanpa Tim (Kosong)</option>
                    {leaders.map(l => (
                      <option key={l.id} value={l.id}>{l.full_name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: '#94A3B8' }}>Status Akun</p>
                <select 
                  value={editForm.subscription_status}
                  onChange={(e) => setEditForm({...editForm, subscription_status: e.target.value})}
                  style={{ width: '100%', padding: '10px 14px', backgroundColor: '#0F172A', color: 'white', borderRadius: '6px', border: '1px solid #334155', outline: 'none' }}
                >
                  <option value="Active">Active</option>
                  <option value="Pending Approval">Pending Approval (Menunggu Aktivasi)</option>
                  <option value="Pending Payment">Pending Payment</option>
                  <option value="Suspended">Suspended (Ditangguhkan)</option>
                </select>
              </div>
            </div>

            <div style={{ padding: '20px', borderTop: '1px solid #334155', display: 'flex', justifyContent: 'flex-end', gap: '12px', backgroundColor: '#0F172A' }}>
              <button 
                onClick={() => setEditingUser(null)}
                style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: 'transparent', color: '#F8FAFC', cursor: 'pointer' }}
              >
                Batal
              </button>
              <button 
                onClick={handleSave}
                disabled={saving}
                style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#3B82F6', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', opacity: saving ? 0.7 : 1 }}
              >
                <Save size={16} /> {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </div>
      )}
    
      {/* Create Modal */}
      {showCreateModal && typeof document !== 'undefined' ? createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="animate-fade-in" style={{ backgroundColor: '#1E293B', width: '100%', maxWidth: '400px', borderRadius: '12px', border: '1px solid #334155', overflow: 'hidden' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: '#F8FAFC' }}>Buat Akun Baru</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateUser} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: '#94A3B8' }}>Nama Lengkap</p>
                <input required type="text" value={createForm.fullName} onChange={e => setCreateForm({...createForm, fullName: e.target.value})} style={{ width: '100%', padding: '10px 14px', backgroundColor: '#0F172A', color: 'white', borderRadius: '6px', border: '1px solid #334155', outline: 'none' }} />
              </div>
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: '#94A3B8' }}>Email</p>
                <input required type="email" value={createForm.email} onChange={e => setCreateForm({...createForm, email: e.target.value})} style={{ width: '100%', padding: '10px 14px', backgroundColor: '#0F172A', color: 'white', borderRadius: '6px', border: '1px solid #334155', outline: 'none' }} />
              </div>
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: '#94A3B8' }}>Password</p>
                <input required type="text" minLength={6} value={createForm.password} onChange={e => setCreateForm({...createForm, password: e.target.value})} style={{ width: '100%', padding: '10px 14px', backgroundColor: '#0F172A', color: 'white', borderRadius: '6px', border: '1px solid #334155', outline: 'none' }} />
              </div>
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: '#94A3B8' }}>Role / Jabatan</p>
                <select value={createForm.role} onChange={e => setCreateForm({...createForm, role: e.target.value})} style={{ width: '100%', padding: '10px 14px', backgroundColor: '#0F172A', color: 'white', borderRadius: '6px', border: '1px solid #334155', outline: 'none' }}>
                  <option value="Sales">Sales</option>
                  <option value="Leader">Leader</option>
                  <option value="Manager">Manager</option>
                  <option value="Developer">Developer</option>
                </select>
              </div>
              {createForm.role === 'Sales' && (
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: '#94A3B8' }}>Pilih Atasan (Leader)</p>
                  <select value={createForm.supervisorId} onChange={e => setCreateForm({...createForm, supervisorId: e.target.value})} style={{ width: '100%', padding: '10px 14px', backgroundColor: '#0F172A', color: 'white', borderRadius: '6px', border: '1px solid #334155', outline: 'none' }}>
                    <option value="">-- Pilih Leader --</option>
                    {leaders.map(l => <option key={l.id} value={l.id}>{l.full_name}</option>)}
                  </select>
                </div>
              )}
              <button type="submit" disabled={creating} style={{ padding: '10px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#3B82F6', color: 'white', cursor: 'pointer', fontWeight: 600, marginTop: '8px' }}>
                {creating ? 'Menyimpan...' : 'Buat Akun'}
              </button>
            </form>
          </div>
        </div>, document.body) : null}

      {/* Signature Modal */}
      {showSigModal && typeof document !== 'undefined' ? createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="animate-fade-in" style={{ backgroundColor: '#1E293B', width: '100%', maxWidth: '400px', borderRadius: '12px', border: '1px solid #334155', overflow: 'hidden', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#F8FAFC' }}>Tanda Tangan: {selectedUserForSig?.full_name}</h3>
              <button onClick={() => { setShowSigModal(false); setSigBase64(null); }} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: '#94A3B8' }}>Upload gambar tanda tangan berlatar transparan (.png/.jpeg).</p>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleSigUpload} style={{ display: 'none' }} />
            <div onClick={() => fileInputRef.current?.click()} style={{ border: '2px dashed #334155', borderRadius: '8px', padding: '24px', textAlign: 'center', cursor: 'pointer', marginBottom: '16px', backgroundColor: '#0F172A' }}>
              {sigBase64 ? <img src={sigBase64} alt="Preview" style={{ maxHeight: '100px', margin: '0 auto' }} /> : <div style={{ color: '#64748B' }}>Klik untuk memilih gambar</div>}
            </div>
            <button onClick={saveSignature} disabled={!sigBase64 || creating} style={{ width: '100%', padding: '10px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#3B82F6', color: 'white', cursor: 'pointer', fontWeight: 600 }}>
              {creating ? 'Menyimpan...' : 'Simpan Tanda Tangan'}
            </button>
          </div>
        </div>, document.body) : null}

    </div>
  );
}

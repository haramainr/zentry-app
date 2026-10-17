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
  
  // State khusus Akun Sales TL
  const [createMode, setCreateMode] = useState<'TL_SALES' | 'STANDARD'>('TL_SALES');
  const [tlSalesForm, setTlSalesForm] = useState({
    tlFullName: "",
    salesEmail: "",
    salesPassword: "",
    salesFullName: ""
  });
  const [tlSigBase64, setTlSigBase64] = useState<string | null>(null);
  const tlSigFileInputRef = useRef<HTMLInputElement>(null);

  const handleTlSigUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setTlSigBase64(ev.target.result.toString());
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateTlSalesUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tlSigBase64) {
      if (!confirm("Tanda tangan TL belum diunggah. Apakah yakin ingin lanjut tanpa tanda tangan TL (bisa diunggah nanti)?")) {
        return;
      }
    }
    setCreating(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE_TL_SALES_ACCOUNT",
          payload: {
            ...tlSalesForm,
            tlSignatureBase64: tlSigBase64
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("Akun Sales TL berhasil dibuat dan langsung aktif!");
        setShowCreateModal(false);
        setTlSalesForm({ tlFullName: "", salesEmail: "", salesPassword: "", salesFullName: "" });
        setTlSigBase64(null);
        fetchUsers();
      } else {
        alert(data.error || "Gagal membuat akun Sales TL");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setCreating(false);
    }
  };
  
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
    if (!confirm(`Apakah Anda yakin ingin menghapus akun ${user.full_name} secara permanen? Seluruh data terkait akun ini akan dihapus.`)) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "DELETE_USER", payload: { userId: user.id } })
      });
      const data = await res.json();
      if (data.success) {
        // Optimistic UI update: immediately remove user from list
        setUsers(prev => prev.filter(u => u.id !== user.id));
        alert("Akun berhasil dihapus secara permanen!");
        fetchUsers();
      } else {
        alert("Gagal menghapus akun: " + (data.error || "Terjadi kesalahan"));
      }
    } catch (e: any) {
      alert("Error: " + e.message);
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
              onClick={() => { setCreateMode('TL_SALES'); setShowCreateModal(true); }}
              style={{ padding: '10px 16px', borderRadius: '8px', backgroundColor: '#10B981', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)' }}
            >
              <Shield size={18} /> + Akun Sales TL
            </button>
            <button 
              onClick={() => { setCreateMode('STANDARD'); setShowCreateModal(true); }}
              style={{ padding: '10px 16px', borderRadius: '8px', backgroundColor: '#3B82F6', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}
            >
              <Plus size={18} /> Tambah Akun Biasa
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
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div className="animate-fade-in" style={{ backgroundColor: '#1E293B', width: '100%', maxWidth: '480px', borderRadius: '12px', border: '1px solid #334155', overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            
            {/* Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0F172A' }}>
              <h3 style={{ margin: 0, color: '#F8FAFC', fontSize: '1.1rem' }}>Buat Akun Baru</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            {/* Mode Switch Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #334155', backgroundColor: '#0B1120' }}>
              <button
                type="button"
                onClick={() => setCreateMode('TL_SALES')}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: createMode === 'TL_SALES' ? '#1E293B' : 'transparent',
                  border: 'none',
                  borderBottom: createMode === 'TL_SALES' ? '2px solid #10B981' : 'none',
                  color: createMode === 'TL_SALES' ? '#34D399' : '#94A3B8',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Shield size={16} /> Akun Sales TL
              </button>
              <button
                type="button"
                onClick={() => setCreateMode('STANDARD')}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: createMode === 'STANDARD' ? '#1E293B' : 'transparent',
                  border: 'none',
                  borderBottom: createMode === 'STANDARD' ? '2px solid #3B82F6' : 'none',
                  color: createMode === 'STANDARD' ? '#60A5FA' : '#94A3B8',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Users size={16} /> Akun Standar
              </button>
            </div>

            {/* Content Scrollable */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {createMode === 'TL_SALES' ? (
                <form onSubmit={handleCreateTlSalesUser} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ padding: '10px 12px', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '8px', fontSize: '0.785rem', color: '#A7F3D0', lineHeight: 1.4 }}>
                    💡 <strong>Format Akun Sales TL:</strong> Akun ini sama persis dengan sistem <em>alfath_sales</em>, <em>parulian_sales</em>, atau <em>ayi_cro</em>. Nama & Tanda Tangan TL yang diisi di sini akan otomatis terkunci di kolom kanan bawah PDF formulir!
                  </div>

                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: '#94A3B8', fontWeight: 500 }}>
                      Nama Lengkap Team Leader (TL) <span style={{ color: '#EF4444' }}>*</span>
                    </p>
                    <input 
                      required 
                      type="text" 
                      placeholder="Contoh: Muhammad Ayi N. H. atau Dimas Prasetyo" 
                      value={tlSalesForm.tlFullName} 
                      onChange={e => {
                        const val = e.target.value;
                        const firstWord = val.trim().split(' ')[0] || '';
                        setTlSalesForm(prev => ({
                          ...prev,
                          tlFullName: val,
                          salesFullName: prev.salesFullName || (firstWord ? `Sales ${firstWord}` : ''),
                          salesEmail: prev.salesEmail || (firstWord ? `${firstWord.toLowerCase()}_sales@zentry.com` : '')
                        }));
                      }} 
                      style={{ width: '100%', padding: '10px 14px', backgroundColor: '#0F172A', color: 'white', borderRadius: '6px', border: '1px solid #334155', outline: 'none' }} 
                    />
                    <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Nama ini yang akan tercetak di kotak tanda tangan TL (kanan bawah PDF).</span>
                  </div>

                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: '#94A3B8', fontWeight: 500 }}>
                      Tanda Tangan Digital TL <span style={{ color: '#EF4444' }}>*</span>
                    </p>
                    <input type="file" accept="image/*" ref={tlSigFileInputRef} onChange={handleTlSigUpload} style={{ display: 'none' }} />
                    <div 
                      onClick={() => tlSigFileInputRef.current?.click()} 
                      style={{ 
                        border: '2px dashed #334155', 
                        borderRadius: '8px', 
                        padding: '16px', 
                        textAlign: 'center', 
                        cursor: 'pointer', 
                        backgroundColor: '#0F172A',
                        transition: 'all 0.2s'
                      }}
                    >
                      {tlSigBase64 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                          <img src={tlSigBase64} alt="Preview TTD TL" style={{ maxHeight: '80px', objectFit: 'contain' }} />
                          <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600 }}>✓ Tanda Tangan Terpilih (Klik untuk ganti)</span>
                        </div>
                      ) : (
                        <div style={{ color: '#94A3B8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                          <Upload size={20} color="#64748B" />
                          <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>Klik untuk pilih file tanda tangan (.png transparan)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: '#94A3B8', fontWeight: 500 }}>
                      Email Login Sales <span style={{ color: '#EF4444' }}>*</span>
                    </p>
                    <input 
                      required 
                      type="email" 
                      placeholder="Contoh: dimas_sales@zentry.com" 
                      value={tlSalesForm.salesEmail} 
                      onChange={e => setTlSalesForm({...tlSalesForm, salesEmail: e.target.value})} 
                      style={{ width: '100%', padding: '10px 14px', backgroundColor: '#0F172A', color: 'white', borderRadius: '6px', border: '1px solid #334155', outline: 'none' }} 
                    />
                  </div>

                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: '#94A3B8', fontWeight: 500 }}>
                      Password Login <span style={{ color: '#EF4444' }}>*</span>
                    </p>
                    <input 
                      required 
                      type="text" 
                      minLength={6} 
                      placeholder="Contoh: password123" 
                      value={tlSalesForm.salesPassword} 
                      onChange={e => setTlSalesForm({...tlSalesForm, salesPassword: e.target.value})} 
                      style={{ width: '100%', padding: '10px 14px', backgroundColor: '#0F172A', color: 'white', borderRadius: '6px', border: '1px solid #334155', outline: 'none' }} 
                    />
                  </div>

                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: '#94A3B8', fontWeight: 500 }}>
                      Nama Akun / Sales Display (Opsional)
                    </p>
                    <input 
                      type="text" 
                      placeholder="Contoh: Sales Dimas" 
                      value={tlSalesForm.salesFullName} 
                      onChange={e => setTlSalesForm({...tlSalesForm, salesFullName: e.target.value})} 
                      style={{ width: '100%', padding: '10px 14px', backgroundColor: '#0F172A', color: 'white', borderRadius: '6px', border: '1px solid #334155', outline: 'none' }} 
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={creating} 
                    style={{ 
                      padding: '12px 16px', 
                      borderRadius: '8px', 
                      border: 'none', 
                      backgroundColor: '#10B981', 
                      color: 'white', 
                      cursor: creating ? 'not-allowed' : 'pointer', 
                      fontWeight: 700, 
                      marginTop: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                    }}
                  >
                    <Shield size={18} /> {creating ? 'Memproses Akun...' : 'Simpan & Aktifkan Akun Sales TL'}
                  </button>
                </form>
              ) : (
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
                    {creating ? 'Menyimpan...' : 'Buat Akun Standar'}
                  </button>
                </form>
              )}
            </div>
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

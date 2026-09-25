"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { MessageSquare, CheckCircle, AlertTriangle, Lightbulb, Clock } from "lucide-react";

export default function DeveloperFeedbackPage() {
  const supabase = createClient();
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const getCookie = (name: string) => {
    if (typeof document === 'undefined') return null;
    const value = "; " + document.cookie;
    const parts = value.split("; " + name + "=");
    if (parts.length === 2) return parts.pop()?.split(";").shift();
    return null;
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    setLoading(true);
    
    if (getCookie('dummy_auth') === 'true') {
      setFeedbacks([
        { id: '1', user_name: 'Alfath (Sales)', user_role: 'Sales', type: 'Saran', message: 'Tampilan aplikasi sangat elegan dan profesional!', status: 'Resolved', created_at: new Date(Date.now() - 86400000).toISOString() },
        { id: '2', user_name: 'Akun Demo (Sales)', user_role: 'Sales', type: 'Kritik', message: 'Terkadang loading saat scan KTP agak lama.', status: 'In Progress', created_at: new Date().toISOString() },
        { id: '3', user_name: 'Bima (Manager)', user_role: 'Manager', type: 'Saran', message: 'Tolong tambahkan filter berdasarkan area.', status: 'New', created_at: new Date(Date.now() - 3600000).toISOString() }
      ]);
      setLoading(false);
      return;
    }

    const { data: fData, error } = await supabase
      .from('feedbacks')
      .select('*')
      .order('created_at', { ascending: false });

    if (fData) {
      const { data: usersData } = await supabase.from('users').select('id, full_name, role');
      const combined = fData.map((f: any) => {
        const user = usersData?.find((u: any) => u.id === f.user_id);
        return {
          ...f,
          user_name: user?.full_name || 'User Tidak Diketahui',
          user_role: user?.role || 'Unknown'
        };
      });
      setFeedbacks(combined);
    }
    setLoading(false);
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    if (getCookie('dummy_auth') === 'true') {
      setFeedbacks(feedbacks.map(f => f.id === id ? { ...f, status: newStatus } : f));
      return;
    }

    const { error } = await supabase
      .from('feedbacks')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      alert("Gagal memperbarui status: " + error.message);
    } else {
      fetchFeedbacks();
    }
  };

  const filteredFeedbacks = feedbacks.filter((f: any) => {
    const matchType = filterType === 'All' ? true : f.type === filterType;
    const matchStatus = filterStatus === 'All' ? true : f.status === filterStatus;
    return matchType && matchStatus;
  });

  return (
    <div className="animate-fade-in" style={{ padding: 'var(--spacing-xl)', flex: 1 }}>
      <header style={{ marginBottom: 'var(--spacing-xl)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="h2" style={{ color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <MessageSquare size={28} color="#94A3B8" />
            Data Kritik & Saran
          </h1>
          <p style={{ color: '#94A3B8' }}>Pantau masukan, saran, dan kritik dari seluruh karyawan.</p>
        </div>
      </header>

      {/* Filter Bar */}
      <div style={{ backgroundColor: '#1E293B', padding: '16px', borderRadius: '12px', border: '1px solid #334155', marginBottom: 'var(--spacing-xl)', display: 'flex', gap: '16px' }}>
        <select 
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{ padding: '10px 14px', backgroundColor: '#0F172A', color: 'white', borderRadius: '6px', border: '1px solid #334155', outline: 'none', width: '200px' }}
        >
          <option value="All">Semua Kategori</option>
          <option value="Saran">Saran & Masukan</option>
          <option value="Kritik">Kritik / Laporan</option>
        </select>
        
        <select 
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ padding: '10px 14px', backgroundColor: '#0F172A', color: 'white', borderRadius: '6px', border: '1px solid #334155', outline: 'none', width: '200px' }}
        >
          <option value="All">Semua Status</option>
          <option value="New">New (Baru)</option>
          <option value="In Progress">In Progress (Diproses)</option>
          <option value="Resolved">Resolved (Selesai)</option>
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {loading ? (
          <div style={{ color: '#94A3B8', textAlign: 'center', padding: '40px' }}>Memuat data feedback...</div>
        ) : filteredFeedbacks.length === 0 ? (
          <div style={{ color: '#94A3B8', textAlign: 'center', padding: '40px', backgroundColor: '#1E293B', borderRadius: '12px', border: '1px solid #334155' }}>
            Tidak ada pesan yang ditemukan.
          </div>
        ) : filteredFeedbacks.map((f: any) => (
          <div key={f.id} style={{ 
            backgroundColor: '#1E293B', borderRadius: '12px', border: '1px solid #334155', overflow: 'hidden',
            borderLeft: `4px solid ${f.type === 'Kritik' ? '#EF4444' : '#0F172A'}`
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {f.type === 'Kritik' ? (
                  <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', padding: '8px', borderRadius: '50%' }}>
                    <AlertTriangle size={18} color="#F87171" />
                  </div>
                ) : (
                  <div style={{ backgroundColor: 'rgba(148, 163, 184, 0.2)', padding: '8px', borderRadius: '50%' }}>
                    <Lightbulb size={18} color="#94A3B8" />
                  </div>
                )}
                <div>
                  <div style={{ color: '#F8FAFC', fontWeight: 600, fontSize: '1.1rem' }}>{f.user_name}</div>
                  <div style={{ color: '#94A3B8', fontSize: '0.85rem' }}>{f.user_role} • {new Date(f.created_at).toLocaleString('id-ID')}</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ 
                  display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, padding: '4px 12px', borderRadius: '16px',
                  backgroundColor: f.status === 'Resolved' ? 'rgba(16, 185, 129, 0.1)' : f.status === 'In Progress' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                  color: f.status === 'Resolved' ? '#34D399' : f.status === 'In Progress' ? '#FBBF24' : '#94A3B8'
                }}>
                  {f.status === 'Resolved' ? <CheckCircle size={14}/> : f.status === 'In Progress' ? <Clock size={14}/> : <div style={{width:'8px', height:'8px', borderRadius:'50%', backgroundColor:'#94A3B8'}}></div>}
                  {f.status}
                </span>

                <select 
                  value={f.status}
                  onChange={(e) => handleUpdateStatus(f.id, e.target.value)}
                  style={{ padding: '6px 10px', backgroundColor: '#0F172A', color: 'white', borderRadius: '6px', border: '1px solid #334155', outline: 'none', fontSize: '0.85rem' }}
                >
                  <option value="New">Set: New</option>
                  <option value="In Progress">Set: In Progress</option>
                  <option value="Resolved">Set: Resolved</option>
                </select>
              </div>
            </div>
            
            <div style={{ padding: '20px', color: '#E2E8F0', lineHeight: '1.6', fontSize: '0.95rem' }}>
              {f.message}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

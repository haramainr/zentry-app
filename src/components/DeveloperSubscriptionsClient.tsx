"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle, XCircle } from 'lucide-react';

export default function DeveloperSubscriptionsClient() {
  const supabase = createClient();
  const [users, setUsers] = useState<any[]>([]);
  const [durations, setDurations] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('users')
      .select('id, full_name, email, role, subscription_status, subscription_end_date, created_at')
      .order('created_at', { ascending: false });
    
    if (data) setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const activateUser = async (userId: string, days: number) => {
    if (!confirm(`Aktifkan akun ini selama ${days} hari?`)) return;
    
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + days);
    
    const { error } = await supabase
      .from('users')
      .update({ 
        subscription_status: 'Active',
        subscription_end_date: expiry.toISOString()
      })
      .eq('id', userId);
      
    if (error) {
      alert("Gagal mengaktifkan user: " + error.message);
    } else {
      alert("User berhasil diaktifkan!");
      fetchUsers();
    }
  };

  if (loading) return <div style={{ color: '#94A3B8' }}>Loading users...</div>;

  const pendingUsers = users.filter(u => u.subscription_status !== 'Active' && u.role !== 'Developer');
  const activeUsers = users.filter(u => u.subscription_status === 'Active' && u.role !== 'Developer');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Pending Users */}
      <div>
        <h4 style={{ margin: '0 0 12px 0', color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#F59E0B' }}></span>
          Menunggu Aktivasi ({pendingUsers.length})
        </h4>
        <div style={{ backgroundColor: '#0F172A', borderRadius: '8px', overflow: 'hidden', border: '1px solid #334155' }}>
          {pendingUsers.length === 0 ? (
            <div style={{ padding: '16px', color: '#64748B', textAlign: 'center' }}>Tidak ada user pending</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #334155', backgroundColor: '#1E293B' }}>
                  <th style={{ padding: '12px', color: '#94A3B8' }}>Nama / Email</th>
                  <th style={{ padding: '12px', color: '#94A3B8' }}>Role</th>
                  <th style={{ padding: '12px', textAlign: 'right', color: '#94A3B8' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pendingUsers.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #1E293B' }}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ color: '#F8FAFC', fontWeight: 500 }}>{u.full_name}</div>
                      <div style={{ color: '#64748B', fontSize: '0.8rem' }}>{u.email}</div>
                    </td>
                    <td style={{ padding: '12px', color: '#E2E8F0' }}>{u.role}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        <select 
                          value={durations[u.id] || 30} 
                          onChange={(e) => setDurations({...durations, [u.id]: parseInt(e.target.value)})}
                          style={{ backgroundColor: '#1E293B', color: '#E2E8F0', border: '1px solid #334155', borderRadius: '4px', padding: '5px 8px', fontSize: '0.8rem', outline: 'none' }}
                        >
                          <option value={7}>7 Hari</option>
                          <option value={30}>30 Hari</option>
                          <option value={90}>3 Bulan</option>
                          <option value={180}>6 Bulan</option>
                          <option value={365}>1 Tahun</option>
                        </select>
                        <button 
                          onClick={() => activateUser(u.id, durations[u.id] || 30)}
                          style={{ backgroundColor: '#3B82F6', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                          Aktifkan
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Active Users Summary */}
      <div>
        <h4 style={{ margin: '0 0 12px 0', color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }}></span>
          User Aktif ({activeUsers.length})
        </h4>
        <div style={{ backgroundColor: '#0F172A', borderRadius: '8px', padding: '16px', border: '1px solid #334155' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {activeUsers.map(u => (
              <div key={u.id} style={{ backgroundColor: '#1E293B', padding: '4px 12px', borderRadius: '16px', fontSize: '0.8rem', color: '#E2E8F0', border: '1px solid #334155' }}>
                {u.email}
              </div>
            ))}
            {activeUsers.length === 0 && <span style={{ color: '#64748B' }}>Belum ada user aktif</span>}
          </div>
        </div>
      </div>

    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Users, Award, TrendingUp, AlertCircle } from "lucide-react";

export default async function ManagerLeadersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Periksa role
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== 'Manager' && profile?.role !== 'Developer') {
    redirect("/sales");
  }

  // Ambil data user (Leaders dan Sales)
  const { data: allUsers } = await supabase.from('users').select('id, full_name, role, supervisor_id');
  const leaders = allUsers?.filter(u => u.role === 'Leader') || [];
  
  // Ambil semua submissions
  const { data: submissions } = await supabase
    .from('submissions')
    .select('id, sales_id, status_pemasangan, biaya_total')
    .eq('is_draft', false);

  // Kalkulasi performa tiap Leader
  const leaderStats = leaders.map(leader => {
    // Cari semua sales di bawah leader ini
    const teamMembers = allUsers?.filter(u => u.supervisor_id === leader.id) || [];
    const teamMemberIds = teamMembers.map(m => m.id);
    
    // Filter submissions milik tim ini
    const teamSubmissions = submissions?.filter(sub => teamMemberIds.includes(sub.sales_id)) || [];
    
    const totalRegistrations = teamSubmissions.length;
    const totalRevenue = teamSubmissions.reduce((sum, s) => sum + (s.biaya_total || 0), 0);
    
    // Cari Top Sales di tim ini
    let topSalesName = "-";
    let topSalesScore = -1;
    
    teamMembers.forEach(member => {
      const memberSubs = teamSubmissions.filter(s => s.sales_id === member.id);
      if (memberSubs.length > topSalesScore && memberSubs.length > 0) {
        topSalesScore = memberSubs.length;
        topSalesName = member.full_name;
      }
    });
    
    return {
      id: leader.id,
      name: leader.full_name,
      teamSize: teamMembers.length,
      totalRegistrations,
      totalRevenue,
      topSalesName,
      topSalesScore
    };
  });
  
  // Urutkan berdasarkan Revenue (Ranking 1 di atas)
  leaderStats.sort((a, b) => b.totalRevenue - a.totalRevenue);

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(angka);
  };

  return (
    <div className="animate-fade-in" style={{ padding: 'var(--spacing-xl)', flex: 1 }}>
      <header style={{ marginBottom: 'var(--spacing-xl)' }}>
        <h1 className="h2" style={{ color: 'var(--text-primary)' }}>Monitoring Leader</h1>
        <p className="text-body">Komparasi dan peringkat performa antartim (Leader).</p>
      </header>

      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <div className="table-responsive">

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                <th style={{ padding: 'var(--spacing-md) var(--spacing-sm)', color: 'var(--text-secondary)', width: '60px' }}>Rank</th>
                <th style={{ padding: 'var(--spacing-sm)', color: 'var(--text-secondary)' }}>Nama Leader</th>
                <th style={{ padding: 'var(--spacing-sm)', color: 'var(--text-secondary)', textAlign: 'center' }}>Total Terkirim</th>
                <th style={{ padding: 'var(--spacing-sm)', color: 'var(--text-secondary)', textAlign: 'right' }}>Total Estimasi Revenue</th>
                <th style={{ padding: 'var(--spacing-md) var(--spacing-sm)', color: 'var(--text-secondary)' }}>Top Sales Tim</th>
              </tr>
            </thead>
            <tbody>
              {leaderStats.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--text-muted)' }}>
                    Belum ada data Leader terdaftar.
                  </td>
                </tr>
              ) : leaderStats.map((stat, index) => (
                <tr key={stat.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: 'var(--spacing-md) var(--spacing-sm)' }}>
                    {index === 0 ? <span style={{ color: '#F59E0B' }}><Award size={24} /></span> : 
                     index === 1 ? <span style={{ color: '#9CA3AF' }}><Award size={24} /></span> :
                     index === 2 ? <span style={{ color: '#B45309' }}><Award size={24} /></span> : 
                     <span style={{ fontWeight: 500, paddingLeft: '8px' }}>#{index + 1}</span>}
                  </td>
                  <td style={{ padding: 'var(--spacing-md) var(--spacing-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {stat.name}
                  </td>
                  <td style={{ padding: 'var(--spacing-md) var(--spacing-sm)', textAlign: 'center' }}>
                    {stat.totalRegistrations}
                  </td>
                  <td style={{ padding: 'var(--spacing-md) var(--spacing-sm)', color: 'var(--success)', fontWeight: 600, textAlign: 'right' }}>
                    {formatRupiah(stat.totalRevenue)}
                  </td>
                  <td style={{ padding: 'var(--spacing-md) var(--spacing-sm)' }}>
                    {stat.topSalesName !== "-" ? (
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 500, color: 'var(--solasi-blue)' }}>{stat.topSalesName}</span>
                        <span className="text-small text-muted">{stat.topSalesScore} sales</span>
                      </div>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          </div>
        </div>
      </div>
    </div>
  );
}

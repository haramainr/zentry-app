"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function TeamMonitoringPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [teamStats, setTeamStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // Ambil profil leader
      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== 'Leader') {
        router.push("/");
        return;
      }

      // Ambil daftar tim
      const { data: teamMembers } = await supabase
        .from("users")
        .select("id, full_name, created_at")
        .eq("supervisor_id", user.id)
        .order('full_name', { ascending: true });

      // Ambil submissions dari tim
      const { data: submissions } = await supabase
        .from("submissions")
        .select("sales_id, biaya_total, status_pemasangan")
        .eq('is_draft', false);

      const validTeamMembers = Array.isArray(teamMembers) ? teamMembers : [];
      const validSubmissions = Array.isArray(submissions) ? submissions : [];

      // Kalkulasi performa masing-masing sales
      const stats = validTeamMembers.map(member => {
        const memberSubmissions = validSubmissions.filter(s => s.sales_id === member.id);
        
        return {
          ...member,
          totalSales: memberSubmissions.length,
          revenue: memberSubmissions.reduce((sum, s) => sum + Number(s.biaya_total || 0), 0),
        };
      }).sort((a, b) => b.totalSales - a.totalSales);

      setTeamStats(stats);
      setLoading(false);
    };

    fetchData();
  }, [router, supabase]);

  if (loading) {
    return <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>Memuat data tim...</div>;
  }

  return (
    <div className="animate-fade-in" style={{ padding: 'var(--spacing-xl)' }}>
      <header style={{ marginBottom: 'var(--spacing-xl)' }}>
        <h1 className="h2" style={{ color: 'var(--text-primary)' }}>Monitoring Tim</h1>
        <p className="text-body">Daftar anggota Sales Anda dan peringkat performa mereka.</p>
      </header>

      <div className="card">
        {!teamStats || teamStats.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--spacing-xxl) 0', color: 'var(--text-muted)' }}>
            Belum ada anggota Sales yang memilih Anda sebagai Leader.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <div className="table-responsive">

              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: 'var(--spacing-sm)', color: 'var(--text-secondary)' }}>Peringkat</th>
                  <th style={{ padding: 'var(--spacing-sm)', color: 'var(--text-secondary)' }}>Nama Sales</th>
                  <th style={{ padding: 'var(--spacing-sm)', color: 'var(--text-secondary)', textAlign: 'center' }}>Total Terkirim</th>
                  <th style={{ padding: 'var(--spacing-sm)', color: 'var(--text-secondary)', textAlign: 'right' }}>Total Estimasi Revenue</th>
                </tr>
              </thead>
              <tbody>
                {teamStats.map((stat, index) => (
                  <tr key={stat.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }} className="hover-bg">
                    <td style={{ padding: 'var(--spacing-md) var(--spacing-sm)', fontWeight: 600, color: index === 0 ? 'var(--warning)' : 'var(--text-secondary)' }}>
                      #{index + 1}
                    </td>
                    <td style={{ padding: 'var(--spacing-md) var(--spacing-sm)', fontWeight: 500, color: 'var(--solasi-blue)' }}>
                      {stat.full_name}
                      <div className="text-small" style={{ fontWeight: 400 }}>
                        Bergabung: {new Date(stat.created_at || Date.now()).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td style={{ padding: 'var(--spacing-md) var(--spacing-sm)', textAlign: 'center', fontWeight: 600 }}>
                      {stat.totalSales}
                    </td>
                    <td style={{ padding: 'var(--spacing-md) var(--spacing-sm)', textAlign: 'right', fontWeight: 600 }}>
                      {new Intl.NumberFormat('id-ID', { notation: "compact", maximumFractionDigits: 1 }).format(stat.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ExportCSVButton from "@/components/ExportCSVButton";

export default async function ManagerReportsPage() {
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

  // 1. Ambil semua submissions untuk ditampilkan dan diexport
  const { data: submissions } = await supabase
    .from("submissions")
    .select(`
      id, 
      nama_lengkap, 
      ktp, 
      paket_layanan, 
      alamat,
      biaya_total, 
      created_at,
      sales_id,
      sales:users(full_name, supervisor_id)
    `)
    .eq('is_draft', false)
    .order('created_at', { ascending: false });

  // Kita juga perlu data users untuk mapping nama leader
  const { data: allUsers } = await supabase.from('users').select('id, full_name');
  const userMap = new Map();
  allUsers?.forEach(u => userMap.set(u.id, u.full_name));

  // 2. Format data untuk disiapkan sebagai CSV
  const csvData = (submissions || []).map(sub => {
    // Cari nama Leader (supervisor) dari sales
    const salesSupId = (sub.sales as any)?.supervisor_id;
    const leaderName = salesSupId ? userMap.get(salesSupId) || 'Tanpa Leader' : 'Tanpa Leader';
    
    return {
      "Tanggal Registrasi": new Date(sub.created_at).toLocaleDateString('id-ID'),
      "Nama Tim (Leader)": leaderName,
      "Nama Sales": (sub.sales as any)?.full_name || 'Tidak diketahui',
      "Nama Pelanggan": sub.nama_lengkap,
      "Nomor KTP": sub.ktp,
      "Paket Layanan": sub.paket_layanan,
      "Alamat Pemasangan": sub.alamat,
      "Total Biaya (Rp)": sub.biaya_total
    };
  });

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(angka);
  };

  return (
    <div className="animate-fade-in" style={{ padding: 'var(--spacing-xl)', flex: 1 }}>
      <header style={{ marginBottom: 'var(--spacing-xl)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="h2" style={{ color: 'var(--text-primary)' }}>Laporan Bisnis Eksekutif</h1>
          <p className="text-body">Data seluruh pendaftaran pelanggan dari semua tim.</p>
        </div>
        <div>
          <ExportCSVButton data={csvData} filename={`Laporan_Eksekutif_ZEntry_${new Date().toISOString().split('T')[0]}.csv`} />
        </div>
      </header>

      <div className="card">
        {!submissions || submissions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--spacing-xxl) 0', color: 'var(--text-muted)' }}>
            Belum ada data pendaftaran di platform.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <div className="table-responsive">

              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: 'var(--spacing-sm)', color: 'var(--text-secondary)' }}>Tanggal</th>
                  <th style={{ padding: 'var(--spacing-sm)', color: 'var(--text-secondary)' }}>Tim (Leader)</th>
                  <th style={{ padding: 'var(--spacing-sm)', color: 'var(--text-secondary)' }}>Sales</th>
                  <th style={{ padding: 'var(--spacing-sm)', color: 'var(--text-secondary)' }}>Nama Pelanggan</th>
                  <th style={{ padding: 'var(--spacing-sm)', color: 'var(--text-secondary)' }}>Paket</th>
                  <th style={{ padding: 'var(--spacing-sm)', color: 'var(--text-secondary)', textAlign: 'right' }}>Total (Rp)</th>
                </tr>
              </thead>
              <tbody>
                {submissions.slice(0, 50).map((sub) => {
                  const salesSupId = (sub.sales as any)?.supervisor_id;
                  const leaderName = salesSupId ? userMap.get(salesSupId) || '-' : '-';

                  return (
                    <tr key={sub.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: 'var(--spacing-md) var(--spacing-sm)', color: 'var(--text-primary)' }}>
                        {new Date(sub.created_at).toLocaleDateString('id-ID')}
                      </td>
                      <td style={{ padding: 'var(--spacing-md) var(--spacing-sm)', color: 'var(--text-muted)' }}>
                        {leaderName}
                      </td>
                      <td style={{ padding: 'var(--spacing-md) var(--spacing-sm)' }}>
                        {(sub.sales as any)?.full_name || '-'}
                      </td>
                      <td style={{ padding: 'var(--spacing-md) var(--spacing-sm)', fontWeight: 500, color: 'var(--solasi-blue)' }}>
                        {sub.nama_lengkap}
                      </td>
                      <td style={{ padding: 'var(--spacing-md) var(--spacing-sm)' }}>
                        ZEntry {sub.paket_layanan}
                      </td>
                      <td style={{ padding: 'var(--spacing-md) var(--spacing-sm)', textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {formatRupiah(sub.biaya_total)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            </div>
            {submissions.length > 50 && (
              <div style={{ padding: 'var(--spacing-md)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Menampilkan 50 data terbaru. Silakan gunakan tombol Export CSV untuk melihat {submissions.length} data secara keseluruhan.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

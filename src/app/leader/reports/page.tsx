"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import ExportCSVButton from "@/components/ExportCSVButton";

export default function LeaderReportsPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [csvData, setCsvData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // 1. Dapatkan profile leader
      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== 'Leader') {
        router.push("/");
        return;
      }

      // 2. Dapatkan seluruh data submissions milik tim
      const { data: submissions } = await supabase
        .from("submissions")
        .select(`
          id, 
          nama_lengkap, 
          ktp, 
          alamat,
          paket_layanan, 
          biaya_total, 
          created_at,
          sales_id,
          sales:users(full_name)
        `)
        .eq('is_draft', false)
        .order('created_at', { ascending: false });

      // 3. Format data untuk disiapkan sebagai CSV
      const validSubmissions = Array.isArray(submissions) ? submissions : [];
      const data = validSubmissions.map((sub: any) => ({
        "Tanggal Registrasi": new Date(sub.created_at).toLocaleDateString('id-ID'),
        "Nama Sales": (sub.sales as any)?.full_name || 'Tidak diketahui',
        "Nama Pelanggan": sub.nama_lengkap,
        "Nomor KTP": sub.ktp,
        "Paket Layanan": sub.paket_layanan,
        "Alamat Pemasangan": sub.alamat,
        "Total Biaya (Rp)": sub.biaya_total
      }));

      setCsvData(data);
      setLoading(false);
    };

    fetchData();
  }, [router, supabase]);

  if (loading) {
    return <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>Memuat laporan...</div>;
  }

  return (
    <div className="animate-fade-in" style={{ padding: 'var(--spacing-xl)' }}>
      <header style={{ marginBottom: 'var(--spacing-xl)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="h2" style={{ color: 'var(--text-primary)' }}>Laporan & Export Data</h1>
          <p className="text-body">Unduh data registrasi seluruh anggota tim Anda untuk keperluan rekapitulasi.</p>
        </div>
        
        {/* Export Button Component */}
        {csvData.length > 0 && <ExportCSVButton data={csvData} filename={"Laporan_Tim_" + new Date().toISOString().split("T")[0] + ".csv"} />}
      </header>

      <div className="card">
        {csvData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--spacing-xxl) 0', color: 'var(--text-muted)' }}>
            Belum ada data pendaftaran dari tim Anda.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <p className="text-body" style={{ fontWeight: 500 }}>Pratinjau Data Terbaru (Maks. 5 baris)</p>
            <div style={{ overflowX: 'auto' }}>
              <div className="table-responsive">

                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', backgroundColor: 'var(--bg-color)' }}>
                    <th style={{ padding: 'var(--spacing-sm)' }}>Tanggal</th>
                    <th style={{ padding: 'var(--spacing-sm)' }}>Sales</th>
                    <th style={{ padding: 'var(--spacing-sm)' }}>Pelanggan</th>
                    <th style={{ padding: 'var(--spacing-sm)' }}>Paket</th>
                  </tr>
                </thead>
                <tbody>
                  {csvData.slice(0, 5).map((row, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: 'var(--spacing-sm)' }}>{row["Tanggal Registrasi"]}</td>
                      <td style={{ padding: 'var(--spacing-sm)', fontWeight: 500 }}>{row["Nama Sales"]}</td>
                      <td style={{ padding: 'var(--spacing-sm)' }}>{row["Nama Pelanggan"]}</td>
                      <td style={{ padding: 'var(--spacing-sm)' }}>{row["Paket Layanan"]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              </div>
            </div>
            {csvData.length > 5 && (
              <p className="text-small text-muted" style={{ textAlign: 'center', marginTop: 'var(--spacing-sm)' }}>
                ... dan {csvData.length - 5} baris lainnya. Unduh CSV untuk melihat data lengkap.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

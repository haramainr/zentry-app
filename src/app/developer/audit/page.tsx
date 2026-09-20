import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Clock, UserPlus, FileText, CheckCircle, Save } from "lucide-react";

export default async function AuditLogPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Periksa role
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== 'Developer') {
    redirect("/sales");
  }

  // 1. Ambil data Users (Pendaftaran Akun)
  const { data: usersData } = await supabase
    .from('users')
    .select('id, full_name, role, created_at');

  // 2. Ambil data Submissions (Aktivitas Sales)
  const { data: submissionsData } = await supabase
    .from('submissions')
    .select('id, nama_lengkap, is_draft, status_pemasangan, created_at, updated_at, sales:users(full_name)');

  // 3. Gabungkan dan bentuk menjadi array of logs
  let logs: any[] = [];

  // Log: Pembuatan Akun Baru
  if (usersData) {
    usersData.forEach((u: any) => {
      logs.push({
        id: `user_${u.id}`,
        timestamp: new Date(u.created_at).getTime(),
        dateStr: u.created_at,
        type: 'user_register',
        actor: u.full_name,
        target: `Role awal: ${u.role}`,
        action: 'Mendaftar akun baru ke sistem ZEntry',
        icon: <UserPlus size={18} color="#A78BFA" />,
        bgColor: 'rgba(139, 92, 246, 0.2)'
      });
    });
  }

  // Log: Pembuatan Submission (PDF / Draft)
  if (submissionsData) {
    submissionsData.forEach((sub: any) => {
      const salesName = (sub.sales as any)?.full_name || 'Sales Tidak Diketahui';
      
      // Jika draft, gunakan updated_at karena created_at mungkin lama
      // Sebenarnya idealnya kita catat 2 log (saat created, dan saat generated).
      // Untuk kesederhanaan, kita ambil state terakhir saja berdasarkan is_draft
      
      if (sub.is_draft) {
        logs.push({
          id: `draft_${sub.id}`,
          timestamp: new Date(sub.updated_at).getTime(),
          dateStr: sub.updated_at,
          type: 'save_draft',
          actor: salesName,
          target: sub.nama_lengkap,
          action: 'Menyimpan draft form pendaftaran',
          icon: <Save size={18} color="#FBBF24" />,
          bgColor: 'rgba(251, 191, 36, 0.2)'
        });
      } else {
        logs.push({
          id: `submit_${sub.id}`,
          timestamp: new Date(sub.created_at).getTime(), // atau updated_at saat generate
          dateStr: sub.created_at,
          type: 'generate_pdf',
          actor: salesName,
          target: sub.nama_lengkap,
          action: 'Membuat pendaftaran resmi & Generate PDF',
          icon: <FileText size={18} color="#34D399" />,
          bgColor: 'rgba(16, 185, 129, 0.2)'
        });
        
        // Log ekstra jika statusnya sudah terlaksana (instalasi selesai)
        if (sub.status_pemasangan === 'Terlaksana') {
          logs.push({
            id: `install_${sub.id}`,
            timestamp: new Date(sub.updated_at).getTime() + 1000, // asumsikan setelah created
            dateStr: sub.updated_at,
            type: 'install_success',
            actor: 'System / Teknisi',
            target: sub.nama_lengkap,
            action: 'Instalasi pelanggan selesai (Terlaksana)',
            icon: <CheckCircle size={18} color="#60A5FA" />,
            bgColor: 'rgba(59, 130, 246, 0.2)'
          });
        }
      }
    });
  }

  // 4. Urutkan berdasarkan waktu terbaru (Descending)
  logs.sort((a, b) => b.timestamp - a.timestamp);

  const formatWaktu = (isoString: string) => {
    return new Date(isoString).toLocaleString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  return (
    <div className="animate-fade-in" style={{ padding: 'var(--spacing-xl)', flex: 1 }}>
      <header style={{ marginBottom: 'var(--spacing-xl)' }}>
        <h1 className="h2" style={{ color: '#F8FAFC' }}>Audit Log (Aktivitas Sistem)</h1>
        <p style={{ color: '#94A3B8' }}>Jejak rekam aktivitas registrasi dan pembuatan akun secara *real-time*.</p>
      </header>

      <div style={{ backgroundColor: '#1E293B', borderRadius: '12px', border: '1px solid #334155', padding: '24px' }}>
        {logs.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#94A3B8', padding: '40px 0' }}>
            Belum ada aktivitas terekam di sistem.
          </div>
        ) : (
          <div style={{ position: 'relative', paddingLeft: '20px' }}>
            {/* Garis Vertikal Timeline */}
            <div style={{ position: 'absolute', left: '29px', top: '10px', bottom: '10px', width: '2px', backgroundColor: '#334155' }}></div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {logs.slice(0, 100).map((log) => ( // Tampilkan maksimal 100 log terbaru
                <div key={log.id} style={{ display: 'flex', gap: '20px', position: 'relative', zIndex: 1 }}>
                  {/* Icon Log */}
                  <div style={{ 
                    width: '40px', height: '40px', borderRadius: '50%', 
                    backgroundColor: log.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, border: '4px solid #1E293B' 
                  }}>
                    {log.icon}
                  </div>
                  
                  {/* Konten Log */}
                  <div style={{ flex: 1, backgroundColor: '#0F172A', padding: '16px', borderRadius: '8px', border: '1px solid #334155' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ color: '#F8FAFC', fontWeight: 600 }}>{log.actor}</span>
                      <span style={{ color: '#64748B', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={14} /> {formatWaktu(log.dateStr)}
                      </span>
                    </div>
                    <div style={{ color: '#CBD5E1', fontSize: '0.95rem' }}>
                      {log.action} <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>({log.target})</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

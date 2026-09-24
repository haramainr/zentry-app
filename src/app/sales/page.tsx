import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SalesDashboardClient from "@/components/SalesDashboardClient";
import ProfileDropdown from "@/components/ProfileDropdown";

export const dynamic = 'force-dynamic';

export default async function SalesDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Ambil data profile
  const { data: profile } = await supabase
    .from("users")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  // Jika nyasar ke halaman sales tapi rolenya bukan sales, kembalikan ke tempat yang benar
  if (profile?.role === 'Developer') {
    redirect("/developer");
  } else if (profile?.role === 'Manager' || profile?.role === 'Admin') {
    redirect("/manager");
  } else if (profile?.role === 'Leader') {
    redirect("/leader");
  }

  const { data: submissions } = await supabase
    .from("submissions")
    .select("id, status_pemasangan, biaya_total, created_at, paket_layanan, paket_spec, promo, is_draft, nama_lengkap")
    .eq("sales_id", user.id)
    .order('created_at', { ascending: false });

  const sentSubmissions = submissions?.filter(s => !s.is_draft) || [];
  const draftSubmissions = submissions?.filter(s => s.is_draft) || [];

  const stats = {
    totalRegistrations: sentSubmissions.length,
    drafts: draftSubmissions.length,
    totalRevenue: sentSubmissions.reduce((sum, current) => sum + Number(current.biaya_total || 0), 0),
  };

  const usersList = [
    { id: user.id, full_name: profile?.full_name || '', role: 'Sales', supervisor_id: null }
  ];

  return (
    <div className="animate-fade-in" style={{ position: 'relative', minHeight: '100vh' }}>
      
      <div style={{ padding: 'clamp(12px, 4vw, 32px)' }}>
        <header style={{ 
          marginBottom: '28px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '16px',
          paddingBottom: '24px',
          borderBottom: '1px solid #E2E8F0'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2563EB', backgroundColor: '#EFF6FF', padding: '3px 10px', borderRadius: '6px', letterSpacing: '0.3px' }}>
                Sales Dashboard
              </span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.5px' }}>
              Selamat Datang, {profile?.full_name || 'Sales Zentry'} 👋
            </h1>
            <p style={{ fontSize: '0.925rem', color: '#64748B', margin: 0, marginTop: '4px' }}>
              Ringkasan performa penjualan dan pemantauan aktivitas pendaftaran pelanggan Anda.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <div className="hidden-mobile">
              <ProfileDropdown profile={profile} />
            </div>
          </div>
        </header>

        <SalesDashboardClient 
          submissions={submissions || []} 
          role="Sales" 
          currentUserId={user.id} 
          usersList={usersList} 
        />
      </div>
    </div>
  );
}

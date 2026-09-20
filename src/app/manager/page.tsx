import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ExportExcelButton from "@/components/ExportExcelButton";
import ManagerDashboardClient from "@/components/ManagerDashboardClient";
import ProfileDropdown from "@/components/ProfileDropdown";

export const dynamic = 'force-dynamic';

export default async function ManagerDashboardPage() {
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

  // Ambil semua submissions (kecuali draft)
  const { data: submissions, error } = await supabase
    .from("submissions")
    .select("id, status_pemasangan, biaya_total, created_at, paket_layanan, sales_id")
    .eq("is_draft", false);

  // Ambil semua pengguna untuk modal export
  const { data: allUsers } = await supabase
    .from("users")
    .select("id, full_name, role, supervisor_id");

  if (error) {
    console.error("Error fetching all submissions:", error);
  }

  return (
    <div className="animate-fade-in dashboard-container" style={{ position: 'relative', minHeight: '100vh', padding: '32px' }}>
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="h2" style={{ color: 'var(--text-primary)', margin: 0 }}>Executive Dashboard</h1>
          <p className="text-body" style={{ margin: 0, marginTop: '4px' }}>Ringkasan performa bisnis dan registrasi keseluruhan ZEntry.</p>
        </div>
        
        <div className="hidden-mobile">
          <ProfileDropdown profile={profile} />
        </div>
      </header>

      <ManagerDashboardClient 
        submissions={submissions || []} 
        role="Manager"
        currentUserId={user.id}
        usersList={allUsers || []}
      />
    </div>
  );
}

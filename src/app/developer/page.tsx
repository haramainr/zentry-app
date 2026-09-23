import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DeveloperOverviewClient from "@/components/DeveloperOverviewClient";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const revalidate = 0;

export default async function DeveloperDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (profile?.role !== 'Developer') {
    redirect("/sales");
  }

  const adminAuth = getSupabaseAdmin();

  // Use Admin client to bypass RLS for system-wide stats
  const { count: totalUsers } = await adminAuth.from('users').select('*', { count: 'exact', head: true });
  const { count: activeSubs } = await adminAuth.from('users').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active');
  
  const { count: totalSubmissions } = await adminAuth.from('submissions').select('*', { count: 'exact', head: true });
  const { count: totalDrafts } = await adminAuth.from('submissions').select('*', { count: 'exact', head: true }).eq('is_draft', true);
  
  const stats = {
    totalUsers: totalUsers || 0,
    activeSubs: activeSubs || 0,
    totalSubmissions: totalSubmissions || 0,
    totalRegistrations: (totalSubmissions || 0) - (totalDrafts || 0),
    totalDrafts: totalDrafts || 0,
  };

  // Recent Submissions
  const { data: recentSubmissions } = await adminAuth
    .from('submissions')
    .select('id, nama_lengkap, paket_layanan, status_pemasangan, created_at, is_draft, user:sales_id(full_name)')
    .order('created_at', { ascending: false })
    .limit(10);

  // Recent Users
  const { data: recentUsers } = await adminAuth
    .from('users')
    .select('id, full_name, role, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  // Data for Charts (Fetch all recent submissions to group them)
  const { data: chartDataRaw } = await adminAuth
    .from('submissions')
    .select('created_at, is_draft, paket_layanan')
    .order('created_at', { ascending: true })
    .limit(100); // For demo purposes, get last 100

  // 1. Chart Data for Packages (Pie)
  const packagesMap: Record<string, number> = {};
  if (chartDataRaw) {
    chartDataRaw.forEach(item => {
      const pkg = item.paket_layanan || 'Unknown';
      packagesMap[pkg] = (packagesMap[pkg] || 0) + 1;
    });
  }
  const packagesChartData = Object.keys(packagesMap).map(key => ({
    name: key,
    value: packagesMap[key]
  }));

  // 2. Chart Data for Daily Activity (Area/Bar)
  const dailyMap: Record<string, { date: string; submitted: number; draft: number }> = {};
  if (chartDataRaw) {
    chartDataRaw.forEach(item => {
      const date = new Date(item.created_at).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
      if (!dailyMap[date]) dailyMap[date] = { date, submitted: 0, draft: 0 };
      if (item.is_draft) dailyMap[date].draft += 1;
      else dailyMap[date].submitted += 1;
    });
  }
  const activityChartData = Object.values(dailyMap);

  
  // Expiring Licenses (Next 7 days)
  const { data: activeUsers } = await adminAuth
    .from('users')
    .select('id, full_name, role, subscription_end_date')
    .eq('subscription_status', 'Active')
    .not('subscription_end_date', 'is', null);
  
  let expiringUsers: any[] = [];
  if (activeUsers) {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    expiringUsers = activeUsers.filter(u => {
      if (!u.subscription_end_date) return false;
      const expiry = new Date(u.subscription_end_date);
      return expiry <= nextWeek;
    }).sort((a, b) => new Date(a.subscription_end_date).getTime() - new Date(b.subscription_end_date).getTime());
  }

  return (
    <div style={{ flex: 1, backgroundColor: "#0B1220", minHeight: "100vh" }}>
      <DeveloperOverviewClient 
        stats={stats} 
        recentSubmissions={recentSubmissions || []} 
        recentUsers={recentUsers || []} 
        packagesChartData={packagesChartData}
        activityChartData={activityChartData}
        expiringUsers={expiringUsers}
      />
    </div>
  );

}

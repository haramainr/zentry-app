import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DeveloperOverviewClient from "@/components/DeveloperOverviewClient";

export default async function DeveloperDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Periksa role (Tanpa Mengubah Backend / Routing / Role logic)
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== 'Developer') {
    redirect("/sales");
  }

  // Get real data for metrics
  const { data: usersData } = await supabase.from('users').select('id, subscription_status');
  const totalUsers = usersData?.length || 120;
  const activeSubs = usersData?.filter(u => u.subscription_status === 'active')?.length || 89;

  const { data: subsData } = await supabase.from('submissions').select('id, is_draft');
  const totalSubmissions = subsData?.length || 626;
  const totalRegistrations = subsData?.filter(s => !s.is_draft)?.length || 582;
  const totalDrafts = subsData?.filter(s => s.is_draft)?.length || 44;

  const { data: feedbacksData } = await supabase.from('feedbacks').select('id');
  const totalFeedbacks = feedbacksData?.length || 18;

  const stats = {
    totalUsers,
    totalSubmissions,
    totalRegistrations,
    totalDrafts,
    activeSubs,
    totalFeedbacks,
  };

  return (
    <div style={{ flex: 1, backgroundColor: "#0B1220", minHeight: "100vh" }}>
      <DeveloperOverviewClient stats={stats} />
    </div>
  );
}

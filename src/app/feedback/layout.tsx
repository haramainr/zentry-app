import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function FeedbackLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) redirect("/login");

  let role: any = 'Sales';
  let subscriptionEndDate = null;
  let profile: { full_name?: string; role?: string } | null = null;
  
  const { data } = await supabase.from('users').select('full_name, role, subscription_end_date').eq('id', user.id).single();
  if (data) {
    role = data.role;
    subscriptionEndDate = data.subscription_end_date;
    profile = { full_name: data.full_name, role: data.role };
  }

  return (
    <div className="flex stack-mobile app-layout-wrapper" style={{ height: '100vh', maxHeight: '100vh', overflow: 'hidden', backgroundColor: 'var(--bg-color)', position: 'relative' }}>
      <Sidebar role={role} subscriptionEndDate={subscriptionEndDate} profile={profile} />

      {/* Main Content Area */}
      <main style={{ flex: 1, height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1 }}>
          {children}
        </div>
        <Footer />
      </main>
    </div>
  );
}

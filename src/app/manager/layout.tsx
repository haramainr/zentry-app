import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";

export default async function ManagerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let subscriptionEndDate = null;
  let profile: { full_name?: string; role?: string } | null = null;
  
  if (user) {
    const { data } = await supabase.from('users').select('subscription_end_date, full_name, role').eq('id', user.id).single();
    if (data) {
      subscriptionEndDate = data.subscription_end_date;
      profile = { full_name: data.full_name, role: data.role };
    }
  }

  return (
    <div className="flex stack-mobile app-layout-wrapper" style={{ height: '100vh', maxHeight: '100vh', overflow: 'hidden', backgroundColor: 'var(--bg-color)', position: 'relative' }}>
      <Sidebar role="Manager" subscriptionEndDate={subscriptionEndDate} profile={profile} />

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

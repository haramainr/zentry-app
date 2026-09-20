import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";

export default async function ManagerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let subscriptionEndDate = null;
  
  if (user) {
    const { data } = await supabase.from('users').select('subscription_end_date').eq('id', user.id).single();
    if (data) subscriptionEndDate = data.subscription_end_date;
  }

  return (
    <div className="flex stack-mobile" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)' }}>
      <Sidebar role="Manager" subscriptionEndDate={subscriptionEndDate} />

      {/* Main Content Area */}
      <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {children}
        <Footer />
      </main>
    </div>
  );
}

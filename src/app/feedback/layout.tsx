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
  
  const { data } = await supabase.from('users').select('role, subscription_end_date').eq('id', user.id).single();
  if (data) {
    role = data.role;
    subscriptionEndDate = data.subscription_end_date;
  }

  return (
    <div className="flex stack-mobile" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)' }}>
      <Sidebar role={role} subscriptionEndDate={subscriptionEndDate} />

      {/* Main Content Area */}
      <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {children}
        <Footer />
      </main>
    </div>
  );
}

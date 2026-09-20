import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";

export default async function SalesLayout({ children }: { children: React.ReactNode }) {
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
    <div className="flex stack-mobile" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', position: 'relative' }}>
      
      {/* Premium Dark Blue Hero Banner (Spans full width behind everything) */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '290px',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)',
        borderBottomLeftRadius: '32px',
        borderBottomRightRadius: '32px',
        zIndex: 0,
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-50px', left: '10%', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 10 }}>
        <Sidebar subscriptionEndDate={subscriptionEndDate} profile={profile} />
      </div>

      {/* Main Content Area */}
      <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
        {children}
        <Footer />
      </main>
    </div>
  );
}

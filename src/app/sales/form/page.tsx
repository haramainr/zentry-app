import FormWizard from "@/components/FormWizard";
import { createClient } from "@/lib/supabase/server";

export default async function SalesFormPage({
  searchParams,
}: {
  searchParams: Promise<{ draft_id?: string }>
}) {
  const supabase = await createClient();
  let draftData: any = null;
  let caeName = '';
  let tlName = '';

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase.from('users').select('full_name, supervisor_id').eq('id', user.id).single();
    if (profile) {
      caeName = profile.full_name;
      if (profile.supervisor_id) {
        const { data: tlProfile } = await supabase.from('users').select('full_name').eq('id', profile.supervisor_id).single();
        if (tlProfile) {
          tlName = tlProfile.full_name;
        }
      }
      
      if (!tlName) {
          tlName = 'Windih Niswanti Yanna';
        }
        
        if (user.email === 'demo_sales@zentry.com') {
          tlName = '';
        } else if (user.email === 'alfath_sales@zentry.com') {
        tlName = 'Alfath Nugraha N. A.';
      } else if (user.email === 'iz_sales@zentry.com') {
        tlName = 'Iz Timisela';
      } else if (user.email === 'bima_sales@zentry.com') {
        tlName = 'Bima Giri Pangestu';
      }
    }
  }

  const resolvedParams = await searchParams;

  if (resolvedParams.draft_id) {
    const { data } = await supabase
      .from("submissions")
      .select("*")
      .eq("id", resolvedParams.draft_id)
      .single();
      
    if (data) {
      draftData = data;
    }
  }

  return (
    <div className="animate-fade-in" style={{ padding: '32px', backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            {draftData ? "Melanjutkan Draft Pendaftaran" : "Formulir Pendaftaran Pelanggan"}
          </h1>
          <p style={{ fontSize: '0.95rem', color: '#64748B', margin: 0, marginTop: '4px' }}>
            {draftData 
              ? "Lanjutkan pengisian form yang tersimpan. Tanda tangan Anda akan terlampir di akhir."
              : "Silakan lengkapi data pelanggan. Tanda tangan Anda dan Leader akan otomatis terlampir pada dokumen akhir."}
          </p>
        </div>
        
        {/* Profile Badge & Notification */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '6px 14px 6px 6px', borderRadius: '30px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#0F172A', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.95rem' }}>
            {(caeName || 'S').charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', lineHeight: 1.1 }}>{caeName || 'Sales zyntaxera'} <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>⌄</span></div>
            <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 500 }}>Sales Team</div>
          </div>
          <div style={{ position: 'relative', marginLeft: '6px', paddingLeft: '12px', borderLeft: '1px solid #F1F5F9', cursor: 'pointer' }}>
            <span style={{ fontSize: '1.2rem' }}>🔔</span>
            <span style={{ position: 'absolute', top: '-4px', right: '-6px', background: '#2563EB', color: 'white', fontSize: '0.65rem', fontWeight: 700, width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' }}>2</span>
          </div>
        </div>
      </header>
      
      {/* Multi-step Form Wizard with 2-Column Layout */}
      <FormWizard key={draftData?.id || 'new'} initialData={draftData} caeName={caeName} tlName={tlName} />
    </div>
  );
}

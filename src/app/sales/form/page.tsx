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
      } else if (user.email === 'fachry_sales@zentry.com') {
        tlName = 'Fachry Suryari';
      } else if (user.email === 'ramadhani_sales@zentry.com') {
        tlName = 'Ramadhani Alvian Sandy';
      } else if (user.email === 'parulian_sales@zentry.com') {
        tlName = 'Parulian Butar Butar';
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
    <div className="animate-fade-in" style={{ padding: 'clamp(12px, 4vw, 32px)', backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
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
      </header>
      
      {/* Multi-step Form Wizard with 2-Column Layout */}
      <FormWizard key={draftData?.id || 'new'} initialData={draftData} caeName={caeName} tlName={tlName} />
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import ProfileForm from "@/components/ProfileForm";
import SignatureSettings from "@/components/SignatureSettings";
import Footer from "@/components/Footer";

export default async function SettingsProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Ambil data profil dari tabel users
  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  let supervisorName = "-";
  if (profile?.supervisor_id) {
    const { data: supervisor } = await supabase
      .from("users")
      .select("full_name")
      .eq("id", profile.supervisor_id)
      .single();
    if (supervisor) supervisorName = supervisor.full_name;
  }

  return (
    <div className="flex stack-mobile app-layout-wrapper" style={{ height: '100vh', maxHeight: '100vh', overflow: 'hidden', backgroundColor: 'var(--bg-color)', position: 'relative' }}>
      {/* We use Sidebar here but pass the role and profile so it knows what menu and user details to show */}
      <Sidebar role={profile?.role || 'Sales'} profile={profile} subscriptionEndDate={profile?.subscription_end_date} />

      <main style={{ flex: 1, height: '100%', padding: 'var(--spacing-xl)', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto', flex: 1 }}>
          <header style={{ marginBottom: 'var(--spacing-xl)' }}>
            <h1 className="h2" style={{ color: 'var(--text-primary)' }}>Pengaturan Profil</h1>
            <p className="text-body">Kelola informasi akun Anda dan ganti kata sandi.</p>
          </header>

          <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
            <h3 className="h3" style={{ marginBottom: 'var(--spacing-md)' }}>Informasi Akun</h3>
            <div className="grid-mobile-1" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--spacing-sm)', fontSize: '0.95rem' }}>
              <div style={{ color: 'var(--text-secondary)' }}>Nama Lengkap</div>
              <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{profile?.full_name}</div>
              
              <div style={{ color: 'var(--text-secondary)' }}>Email Terdaftar</div>
              <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{user.email}</div>
              
              <div style={{ color: 'var(--text-secondary)' }}>Jabatan (Role)</div>
              <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{profile?.role}</div>
              
              <div style={{ color: 'var(--text-secondary)' }}>Status Akun</div>
              <div style={{ fontWeight: 500, color: 'var(--success)' }}>Aktif</div>

              {profile?.role === 'Sales' && (
                <>
                  <div style={{ color: 'var(--text-secondary)' }}>Leader (Supervisor)</div>
                  <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{supervisorName}</div>
                </>
              )}
            </div>
          </div>

          <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
            <h3 className="h3" style={{ marginBottom: 'var(--spacing-md)' }}>Keamanan</h3>
            <ProfileForm />
          </div>

          <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
            <h3 className="h3" style={{ marginBottom: 'var(--spacing-md)' }}>Tanda Tangan Digital</h3>
            <SignatureSettings userId={user.id} />
          </div>

          <div style={{ textAlign: 'center', marginTop: 'var(--spacing-xl)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <p>ZEntry Web Platform v1.0.0 (Release 3)</p>
            <p>Dibangun dan dikelola oleh Administrator</p>
          </div>
        </div>
        <Footer />
      </main>
    </div>
  );
}

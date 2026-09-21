import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import HistoryClient from "@/components/HistoryClient";

export const dynamic = 'force-dynamic';

export default async function SalesHistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch riwayat
  const { data: submissions, error } = await supabase
    .from("submissions")
    .select("id, nama_lengkap, paket_layanan, paket_spec, promo, status_pemasangan, is_draft, biaya_total, created_at, pdf_url, vas")
    .eq("sales_id", user.id)
    .neq("status_pemasangan", "Deleted")
    .order('created_at', { ascending: false });

  if (error) {
    return <div style={{ color: 'var(--error)', padding: 'var(--spacing-xl)' }}>Terjadi kesalahan saat memuat data: {error.message}</div>;
  }

  return <HistoryClient initialSubmissions={submissions || []} />;
}

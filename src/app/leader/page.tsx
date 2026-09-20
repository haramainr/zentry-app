"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import LeaderDashboardClient from "@/components/LeaderDashboardClient";
import ExportExcelButton from "@/components/ExportExcelButton";

export default function LeaderDashboard() {
  const router = useRouter();
  const supabase = createClient();
  
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);

      // 1. Dapatkan profile leader
      const { data: p } = await supabase
        .from("users")
        .select("full_name, role")
        .eq("id", user.id)
        .single();

      if (p?.role !== 'Leader') {
        router.push("/");
        return;
      }
      setProfile(p);

      // 2. Dapatkan data pendaftaran dari tim
      const { data: subs, error: subError } = await supabase
        .from("submissions")
        .select(`
          id, 
          status_pemasangan, 
          biaya_total, 
          paket_layanan, 
          created_at,
          sales_id,
          sales:users(full_name)
        `)
        .eq('is_draft', false);

      if (subError) {
        console.error("Error fetching team submissions:", subError);
      }

      // 3. Dapatkan daftar anggota tim (Sales)
      const { data: members } = await supabase
        .from("users")
        .select("id, full_name, role, supervisor_id")
        .eq("supervisor_id", user.id);

      setSubmissions(Array.isArray(subs) ? subs : []);
      setTeamMembers(Array.isArray(members) ? members : []);
      setLoading(false);
    };

    fetchData();
  }, [router, supabase]);

  if (loading) {
    return <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>Memuat dashboard...</div>;
  }

  const usersList = [
    { id: user.id, full_name: profile.full_name, role: 'Leader', supervisor_id: null },
    ...teamMembers
  ];

  return (
    <div className="animate-fade-in" style={{ padding: 'var(--spacing-xl)' }}>
      <header style={{ marginBottom: 'var(--spacing-xl)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="h2" style={{ color: 'var(--text-primary)' }}>Dashboard Tim, {profile?.full_name}</h1>
          <p className="text-body">Ringkasan performa kolektif seluruh anggota tim Anda.</p>
        </div>
      </header>

      <LeaderDashboardClient 
        submissions={submissions} 
        teamMembers={teamMembers} 
        role="Leader"
        currentUserId={user.id}
        usersList={usersList}
      />
    </div>
  );
}

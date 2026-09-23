import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    // Verifikasi bahwa yang akses adalah Manager atau Developer
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (!profile || (profile.role !== 'Developer')) {
      return NextResponse.json({ error: "Forbidden. Developer only." }, { status: 403 });
    }

    const body = await req.json();
    const adminAuth = getSupabaseAdmin();

    const { action } = body;

    if (action === 'CREATE_USER') {
      const { email, password, fullName, role, supervisorId } = body.payload;
      
      // Bikin user di Auth Supabase
      const { data: authData, error: authError } = await adminAuth.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          role: role,
          supervisor_id: supervisorId || null
        }
      });

      if (authError) throw authError;

      // Trigger di DB akan otomatis memasukkan ke tabel users. Tapi kita pastikan supervisor_id masuk.
      if (supervisorId) {
        await adminAuth.from('users').update({ supervisor_id: supervisorId }).eq('id', authData.user.id);
      }

      return NextResponse.json({ success: true, user: authData.user });
    }
    
    else if (action === 'UPDATE_USER') {
      const { userId, supervisorId, role, subscriptionStatus, subscriptionEndDate } = body.payload;
      
      // Update public.users
      const { error: dbError } = await adminAuth.from('users').update({ 
        supervisor_id: supervisorId || null,
        role: role,
        subscription_status: subscriptionStatus || 'Active',
        subscription_end_date: subscriptionEndDate || null
      }).eq('id', userId);
      
      if (dbError) throw dbError;

      // Update auth metadata
      await adminAuth.auth.admin.updateUserById(userId, {
        user_metadata: { role: role }
      });

      return NextResponse.json({ success: true });
    }

    else if (action === 'UPLOAD_SIGNATURE') {
      const { userId, base64 } = body.payload;
      
      // Check if signature exists
      const { data: existing } = await adminAuth.from('signatures').select('id').eq('user_id', userId).single();
      
      let sigError;
      if (existing) {
        const { error } = await adminAuth.from('signatures').update({ signature_url: base64 }).eq('user_id', userId);
        sigError = error;
      } else {
        const { error } = await adminAuth.from('signatures').insert({ user_id: userId, signature_url: base64 });
        sigError = error;
      }

      if (sigError) throw sigError;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error: any) {
    console.error("Admin API Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (!profile || (profile.role !== 'Developer')) {
      return NextResponse.json({ error: "Forbidden. Developer only." }, { status: 403 });
    }

    const adminAuth = getSupabaseAdmin();
    
    // Ambil daftar user dan join ke tabel users untuk ambil supervisor
    const { data: users, error } = await adminAuth
      .from('users')
      .select('*, signatures(id), supervisor:supervisor_id(full_name)')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    // Ambil daftar Auth users untuk dapat email
    const { data: authUsers, error: authError } = await adminAuth.auth.admin.listUsers();
    if (authError) throw authError;
    
    const emailMap = new Map();
    authUsers.users.forEach(u => emailMap.set(u.id, u.email));

    const enrichedUsers = users.map(u => ({
      ...u,
      email: emailMap.get(u.id) || '',
      has_signature: u.signatures && u.signatures.length > 0 ? true : false,
      supervisor_name: u.supervisor ? u.supervisor.full_name : '-'
    }));

    return NextResponse.json({ users: enrichedUsers });
  } catch (error: any) {
    console.error("Admin GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

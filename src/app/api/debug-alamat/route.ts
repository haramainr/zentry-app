import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('submissions').select('nama_lengkap, alamat, rt, rw, kode_pos, telp_selular').ilike('nama_lengkap', '%Yusuf%').order('created_at', { ascending: false }).limit(5);
  return NextResponse.json({ data, error });
}

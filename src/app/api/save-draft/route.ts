import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const { id, ...draftData } = data; // If id exists, it's an update

    const payload = {
      sales_id: user.id,
      nama_lengkap: draftData.nama_lengkap || '',
      tempat_lahir: draftData.tempat_lahir || null,
      tanggal_lahir: draftData.tanggal_lahir || null,
      ktp: draftData.ktp || '',
      jenis_kelamin: draftData.jenis_kelamin || null,
      telp_selular: draftData.telp_selular || '',
      telp_rumah: draftData.telp_rumah || null,
      alamat: draftData.alamat || '',
      rt: draftData.rt || null,
      rw: draftData.rw || null,
      kode_pos: draftData.kode_pos || null,
      status_kepemilikan: draftData.status_kepemilikan || null,
      email: draftData.email || '',
      paket_layanan: draftData.paket_layanan || '',
      paket_spec: draftData.paket_spec || null,
      router_qty: draftData.router_qty || 0,
      smartbox_qty: draftData.smartbox_qty || 0,
      username_zentry: draftData.username_zentry || null,
      tgl_pemasangan: (draftData.tgl_pemasangan === 'Secepatnya' || draftData.tgl_pemasangan?.toLowerCase() === 'secepatnya') ? null : (draftData.tgl_pemasangan || null),
      waktu_pemasangan: (draftData.tgl_pemasangan === 'Secepatnya' || draftData.tgl_pemasangan?.toLowerCase() === 'secepatnya') ? 'Secepatnya' : (draftData.waktu_pemasangan || null),
      catatan: draftData.catatan || null,
      cc_nama: draftData.cc_nama || null,
      cc_nomor: draftData.cc_nomor || null,
      cc_berlaku: draftData.cc_berlaku || null,
      cc_bank: draftData.cc_bank || null,
      cc_wewenang: draftData.cc_wewenang || false,
      
      vas: draftData.vas || null,
      promo: draftData.promo || null,
      homepass_id: draftData.homepass_id || null,
      titik_koordinat: draftData.titik_koordinat || null,

      biaya_pemasangan: draftData.biaya_pemasangan || 0,
      biaya_paket: draftData.biaya_paket || 0,
      biaya_tambahan: draftData.biaya_tambahan || 0,
      biaya_services: draftData.biaya_services || 0,
      biaya_addons: draftData.biaya_addons || 0,
      biaya_perangkat: draftData.biaya_perangkat || 0,
      biaya_lainnya: draftData.biaya_lainnya || 0,
      biaya_ppn: draftData.biaya_ppn || 0,
      biaya_total: draftData.biaya_total || 0,
      is_draft: draftData.is_draft !== undefined ? draftData.is_draft : true,
      status_pemasangan: 'Pending',
      updated_at: new Date().toISOString()
    };

    let result;
    if (id) {
      // Update existing draft
      result = await supabase
        .from('submissions')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
    } else {
      // Insert new draft
      result = await supabase
        .from('submissions')
        .insert([payload])
        .select()
        .single();
    }

    if (result.error) {
      throw result.error;
    }

    return NextResponse.json({ success: true, draftId: result.data.id });
  } catch (error: any) {
    console.error("Error saving draft:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

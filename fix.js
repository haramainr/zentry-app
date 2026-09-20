const fs = require('fs');
let code = fs.readFileSync('src/components/FormWizard.tsx', 'utf-8');

const anchorBefore = 'rw: formData.rw,';
const anchorAfter = 'biaya_lainnya: Number(formData.biayaLainnya) || 0,';

const insertBlock = 
'        kode_pos: formData.kodePos,\n' +
'        status_kepemilikan: formData.statusKepemilikan,\n' +
'        email: formData.email,\n' +
'        paket_layanan: formData.paketLayanan,\n' +
'        paket_spec: formData.paketSpec,\n' +
'        vas: JSON.stringify({\n' +
'          vas: formData.vas,\n' +
'          routerText: formData.routerText,\n' +
'          routerPrice: formData.routerPrice,\n' +
'          routerQty: formData.routerQty,\n' +
'          smartboxText: formData.smartboxText,\n' +
'          smartboxQty: formData.smartboxQty,\n' +
'          customText: formData.customText,\n' +
'          customPrice: formData.customPrice,\n' +
'          customQty: formData.customQty,\n' +
'          densTvCheck: formData.densTvCheck,\n' +
'          visionTvCheck: formData.visionTvCheck,\n' +
'          addon1Check: formData.addon1Check,\n' +
'          addon1Text: formData.addon1Text,\n' +
'          area: formData.area,\n' +
'          promoTerm: formData.promoTerm,\n' +
'          promo: formData.promo,\n' +
'          signature_base64: signatureData,\n' +
'          cc_signature_base64: ccSignatureData\n' +
'        }),\n' +
'        promo: formData.promoTerm || formData.promo || null,\n' +
'        router_qty: Number(formData.routerQty) || 0,\n' +
'        smartbox_qty: Number(formData.smartboxQty) || 0,\n' +
'        username_zentry: formData.username,\n' +
'        tgl_pemasangan: formData.tglPemasangan,\n' +
'        waktu_pemasangan: formData.waktuPemasangan,\n' +
'        homepass_id: formData.homepassId,\n' +
'        titik_koordinat: formData.titikKoordinat,\n' +
'        catatan: formData.catatan,\n' +
'        cc_nama: formData.ccNama,\n' +
'        cc_nomor: formData.ccNomor,\n' +
'        cc_berlaku: formData.ccBerlaku,\n' +
'        cc_bank: formData.ccBank,\n' +
'        cc_wewenang: formData.ccWewenang,\n' +
'        biaya_pemasangan: Number(formData.biayaPemasangan) || 0,\n' +
'        biaya_paket: Number(formData.biayaPaket) || 0,\n' +
'        biaya_tambahan: Number(formData.biayaTambahan) || 0,\n' +
'        biaya_services: Number(formData.biayaServices) || 0,\n' +
'        biaya_addons: Number(formData.biayaAddons) || 0,\n' +
'        biaya_perangkat: Number(formData.biayaPerangkat) || 0,\n';

code = code.replace(anchorBefore + '\r\n        ' + anchorAfter, anchorBefore + '\n' + insertBlock + '        ' + anchorAfter);
code = code.replace(anchorBefore + '\n        ' + anchorAfter, anchorBefore + '\n' + insertBlock + '        ' + anchorAfter);
fs.writeFileSync('src/components/FormWizard.tsx', code);

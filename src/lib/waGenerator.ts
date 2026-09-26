export const generateWaTemplate = (formData: any) => {
  const serviceText = formData.paketLayanan === 'Fiber' 
    ? `Fiber ${formData.paketSpec || ''}`
    : formData.paketLayanan === 'Safe' 
      ? `Safe ${formData.paketSpec || ''}`
      : `Pro ${formData.paketSpec || ''}`;

  let tglLahirFormatted = formData.tanggalLahir || '';
  if (tglLahirFormatted && tglLahirFormatted.includes('-')) {
    const parts = tglLahirFormatted.split('-');
    if (parts.length === 3) {
      // YYYY-MM-DD to MM/DD/YYYY
      const year = parts[0];
      const month = parts[1];
      const day = parts[2];
      tglLahirFormatted = `${month}/${day}/${year}`;
    }
  }

  const formatPhone = (phone: string) => {
    if (!phone) return '';
    return phone.startsWith('0') ? '62' + phone.substring(1) : phone;
  };

  const telp1Formatted = formatPhone(formData.telpSelular);
  const telp2Formatted = formatPhone(formData.telpRumah) || '.';

  // Helper function to convert text to Title Case (Proper Case)
  const toTitleCase = (str: string) => {
    if (!str) return '';
    return str.toLowerCase().replace(/\b\w/g, (s) => s.toUpperCase());
  };

  const formattedNama = toTitleCase(formData.namaLengkap);

  return `Format Pendaftaran

Nama : ${formattedNama}
NIK : ${formData.ktp || ''}
Tgl Lahir : ${tglLahirFormatted}
Telp 1 : ${telp1Formatted}
Telp 2 : ${telp2Formatted}
Building Status : ${formData.statusKepemilikan || 'Pemilik'}
----------------------------------------------------------
Username : ${(formData.username || '').toLowerCase()}
Service : ${serviceText.trim()}
Email : ${formData.email ? formData.email.toLowerCase() : '**'}
Installation Date : ${formData.tglPemasangan || ''}
Promo : ${formData.catatan || formData.promoTerm || '**'}
STB :${formData.smartboxQty || '**'}
====================

Home ID : ${formData.homepassId || ''}
Alamat : ${formData.alamat || ''}

Tikor : ${formData.titikKoordinat || ''}

CAE : ${formData.salesNameManual || formData.caeName || '[Ketik Nama Anda]'}
TL : ${formData.tlNameManual || formData.tlName || '[Ketik Nama TL Anda]'}

Terima kasih`;
};

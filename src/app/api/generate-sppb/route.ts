import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    const sppbPath = path.join(process.cwd(), 'public', 'templates', 'SPPB.pdf');
    if (!fs.existsSync(sppbPath)) {
      return NextResponse.json({ error: 'Template SPPB tidak ditemukan' }, { status: 404 });
    }
    
    const sppbBytes = fs.readFileSync(sppbPath);
    const pdfDoc = await PDFDocument.load(sppbBytes);
    
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    const page = pdfDoc.getPages()[0];
    const { height } = page.getSize();
    
    const nama = data.namaLengkap || '';
    const alamat = (data.alamat || '').replace(/\n/g, ' ').trim();
    const noKtp = data.ktp || '';
    let telpVal = data.telpRumah || '';
    let hpVal = data.telpSelular || '';
    
    // Jika keduanya ada, gabungkan di baris HP
    if (telpVal && hpVal) {
      hpVal = `${hpVal} / ${telpVal}`;
      telpVal = '';
    } else {
      if (!telpVal) telpVal = '';
      if (!hpVal) hpVal = '';
    }
    
    const telp = telpVal;
    const hp = hpVal;
    
    const dateObj = new Date();
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const formattedDate = `${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
    
    page.drawText(nama, { x: 190, y: height - 205, size: 11, font: helveticaBoldFont });
    
    let alamatFontSize = 11;
    const maxAlamatWidth = 370; // Maksimal lebar area teks alamat
    const alamatWidth = helveticaBoldFont.widthOfTextAtSize(alamat, alamatFontSize);
    if (alamatWidth > maxAlamatWidth) {
      alamatFontSize = Math.max(7, Math.floor((maxAlamatWidth / alamatWidth) * alamatFontSize));
    }
    page.drawText(alamat, { x: 190, y: height - 241, size: alamatFontSize, font: helveticaBoldFont });
    
    page.drawText(noKtp, { x: 190, y: height - 276, size: 11, font: helveticaBoldFont });
    page.drawText(telp, { x: 190, y: height - 316, size: 11, font: helveticaBoldFont });
    page.drawText(hp, { x: 190, y: height - 345, size: 11, font: helveticaBoldFont });
    page.drawRectangle({
      x: 65,
      y: height - 615,
      width: 150,
      height: 25,
      color: rgb(1, 1, 1),
    });
    
    // Tulis ulang Jakarta beserta tanggalnya agar dijamin sejajar dalam 1 baris
    page.drawText(`Jakarta, ${formattedDate}`, { x: 70, y: height - 600, size: 11, font: helveticaFont });
    
    // Hapus kurung kosong ( ) di bawah dan ganti dengan nama user
    page.drawRectangle({
      x: 65,
      y: height - 725,
      width: 250,
      height: 25,
      color: rgb(1, 1, 1),
    });
    
    page.drawText(`${nama}`, { x: 70, y: height - 710, size: 11, font: helveticaBoldFont });
    
    const pdfBytes = await pdfDoc.save();

    return new NextResponse(pdfBytes as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="sppb_filled.pdf"',
      },
    });
  } catch (error: any) {
    console.error('Error generating SPPB:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

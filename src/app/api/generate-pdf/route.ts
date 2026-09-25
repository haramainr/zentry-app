import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, TextAlignment, PDFName, rgb, PDFTextField, PDFCheckBox } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { createClient } from '@/lib/supabase/server';
import { DEA_SIGNATURE, WINDIH_SIGNATURE, ALFATH_SIGNATURE, IZ_SIGNATURE, BIMA_SIGNATURE, FACHRY_SIGNATURE, RAMADHANI_SIGNATURE } from '@/lib/locked-signatures';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Fetch user signature from Supabase Vault
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    
      let salesSignatureBase64: string | null = null;
      let leaderSignatureBase64: string | null = null;
      let salesFullName = '';
      let leaderFullName = '';

      if (user) {
        // PURE MANUAL UNTUK SALES
        salesSignatureBase64 = null;
        salesFullName = '';
        
        if (data.signature) {
          salesSignatureBase64 = data.signature.replace(/^data:image\/\w+;base64,/, '');
        }
        if (data.salesNameManual) {
          salesFullName = data.salesNameManual;
        }
        
        // TETAP KUNCI NAMA & TTD LEADER (WINDIH)
        leaderSignatureBase64 = WINDIH_SIGNATURE;
          leaderFullName = 'Windih Niswanti Yanna';
          
          if (user.email === 'demo_sales@zentry.com') {
            // HANYA hapus TTD Leader. TTD Sales tetap dipertahankan.
            leaderSignatureBase64 = null;
            leaderFullName = '';
          } else if (user.email === 'alfath_sales@zentry.com') {
            leaderSignatureBase64 = ALFATH_SIGNATURE;
            leaderFullName = 'Alfath Nugraha N. A.';
          } else if (user.email === 'iz_sales@zentry.com') {
            leaderSignatureBase64 = IZ_SIGNATURE;
            leaderFullName = 'Iz Timisela';
          } else if (user.email === 'fachry_sales@zentry.com') {
              leaderSignatureBase64 = FACHRY_SIGNATURE;
              leaderFullName = 'Fachry Suryari';
            } else if (user.email === 'ramadhani_sales@zentry.com') {
              leaderSignatureBase64 = RAMADHANI_SIGNATURE;
              leaderFullName = 'Ramadhani Alvian Sandy';
            } else if (user.email === 'bima_sales@zentry.com') {
            leaderSignatureBase64 = BIMA_SIGNATURE;
            leaderFullName = 'Bima Giri Pangestu';
          }
      }

    const templatePath = path.join(process.cwd(), 'public', 'templates', 'cbn-form-template.pdf');
    const existingPdfBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    
    // Embed font agar bisa resize ukuran dengan akurat
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const form = pdfDoc.getForm();
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    const fillText = (fieldName: string, value: string, fontSize?: number, bold = true) => {
      try { 
        const field = form.getTextField(fieldName);
        
        // Hapus background color (MK dictionary) agar transparan
        const widgets = field.acroField.getWidgets();
        widgets.forEach(w => w.dict.delete(PDFName.of('MK')));

        if (!value) return;
          value = value.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').replace(/[\u2013\u2014]/g, '-'); value = value.replace(/[^\x20-\x7E\n]/g, ' ');
          value = value.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').replace(/[\u2013\u2014]/g, '-'); value = value.replace(/[^\x20-\x7E\n]/g, ' ');

        field.setText(value); 
        if (fontSize) {
          field.setFontSize(fontSize);
        }
        // Wajib panggil update agar font dan transparansi di-render
        field.defaultUpdateAppearances(bold ? helveticaBoldFont : helveticaFont);
      } catch (e) { console.error('Error drawing Text16:', fieldName, e); }
    };

    const drawCustomCombBox = (value: string, x: number, y: number, width: number, height: number, maxBoxes: number, fontSize: number = 10, label?: string) => {
      firstPage.drawRectangle({
        x, y, width, height,
        borderColor: rgb(0.2, 0.2, 0.2),
        borderWidth: 0.5
      });
      const boxWidth = width / maxBoxes;
      for (let i = 1; i < maxBoxes; i++) {
        firstPage.drawLine({
          start: { x: x + i * boxWidth, y },
          end: { x: x + i * boxWidth, y: y + height },
          thickness: 0.5,
          color: rgb(0.2, 0.2, 0.2)
        });
      }
      if (label) {
        firstPage.drawText(label, {
          x: x - 175,
          y: y + 4,
          size: 7.5,
          font: helveticaFont,
          color: rgb(0, 0, 0)
        });
      }
      if (value) {
        const cleanValue = value.replace(/\n/g, ' ').trim();
        const chars = cleanValue.split('').slice(0, maxBoxes);
        chars.forEach((char, i) => {
          const charWidth = helveticaFont.widthOfTextAtSize(char, fontSize);
          const charX = x + (boxWidth * i) + (boxWidth - charWidth) / 2;
          const charY = y + (height - fontSize) / 2 + 1.5; 
          firstPage.drawText(char, {
            x: charX,
            y: charY,
            size: fontSize,
            font: helveticaBoldFont,
            color: rgb(0, 0, 0)
          });
        });
      }
    };

    const drawCustomFieldText = (fieldName: string, text: string, yOffset: number = 3, fontSize: number = 9, bold: boolean = true, xOffset: number = 0) => {
      if (!text) return;
      try {
        const field = form.getTextField(fieldName);
        const widgets = field.acroField.getWidgets();
        widgets.forEach((w: any) => w.dict.delete(PDFName.of('MK')));
        field.defaultUpdateAppearances(helveticaFont);
        
        const rect = widgets[0].getRectangle();
        firstPage.drawText(text, {
          x: rect.x + 2 + xOffset,
          y: rect.y + yOffset,
          size: fontSize,
          font: bold ? helveticaBoldFont : helveticaFont,
          color: rgb(0, 0, 0)
        });
      } catch (e) {
        console.error(`Gagal menggambar custom text untuk ${fieldName}`, e);
      }
    };

    const fillSignatureName = (fieldName: string, value: string, fontSize: number = 7) => {
      try {
        const field = form.getTextField(fieldName);
        const widgets = field.acroField.getWidgets();
        if (widgets.length > 0 && value) {
          value = value.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').replace(/[\u2013\u2014]/g, '-'); value = value.replace(/[^\x20-\x7E\n]/g, ' ');
          value = value.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').replace(/[\u2013\u2014]/g, '-'); value = value.replace(/[^\x20-\x7E\n]/g, ' ');
          const rect = widgets[0].getRectangle();
          
          const textWidth = helveticaBoldFont.widthOfTextAtSize(value, fontSize);
          const xPos = rect.x + (rect.width - textWidth) / 2;
          
          firstPage.drawText(value, {
            x: xPos,
            y: rect.y + 4,
            size: fontSize,
            font: helveticaBoldFont,
            color: rgb(0, 0, 0)
          });
        }
        form.removeField(field);
      } catch (e) {}
    };

    // =========================================================================
    // MENGHAPUS SEMUA TEKS BAWAAN DI BAGIAN BAWAH KERTAS
    // =========================================================================
    // Daripada repot menebak kordinat kotor, kita blok putih seluruh area bawah halaman.
    // Ini akan menghapus semua "Tanda tangan..." yang berulang, sekaligus kode legal form-nya.
    const { width, height } = firstPage.getSize();
    firstPage.drawRectangle({
      x: 0,
      y: 0,
      width: width,
      height: 22, // Hapus bersih 22 piksel terbawah halaman
      color: rgb(1, 1, 1),
      borderWidth: 0
    });

    // Karena kode legal form ikut terhapus, kita tulis ulang secara manual di pojok kanan bawah
    const legalCode = 'F /CA-COMM/CBO-BDSA/IX/2025/';
    const legalFontSize = 5;
    const legalTextWidth = helveticaFont.widthOfTextAtSize(legalCode, legalFontSize);
    
    firstPage.drawText(legalCode, {
      x: 577 - legalTextWidth, // Sejajarkan ke kanan agar sama persis dengan aslinya
      y: 8,
      size: legalFontSize,
      font: helveticaFont, // Gunakan font normal, bukan bold
      color: rgb(0, 0, 0)
    });

    // Fungsi khusus untuk mengisi text pada comb box (kotak-kotak) secara presisi
        const fillCombText = (fieldName: string, value: string, maxBoxes: number, fontSize: number = 10, isMultiline: boolean = false, customWidth?: number, forceNormalText: boolean = false, bold: boolean = true) => {
      try {
        const field = form.getTextField(fieldName);
        const widgets = field.acroField.getWidgets();
        if (widgets.length > 0) {
          if (value) {
            const rect = widgets[0].getRectangle();
            
            let numRows = 1;
            let totalWidth = customWidth || rect.width;
            let boxWidth = totalWidth / maxBoxes;
            let rowHeight = rect.height;
            
            if (isMultiline) {
              numRows = 2; // Khusus untuk alamat yang terdiri dari 2 baris
              rowHeight = rect.height / 2;
            }
            
            // Hapus spasi berlebih atau newline (kecuali untuk multiline yang sengaja pakai Enter)
            
              let cleanValue = value.trim();
              cleanValue = cleanValue.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').replace(/[\u2013\u2014]/g, '-'); cleanValue = cleanValue.replace(/[^\x20-\x7E\n]/g, ' ');
              cleanValue = cleanValue.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').replace(/[\u2013\u2014]/g, '-'); cleanValue = cleanValue.replace(/[^\x20-\x7E\n]/g, ' ');

            if (!isMultiline) {
              cleanValue = cleanValue.replace(/\n/g, ' ');
            }
            
            // Jika teks melebihi jumlah kotak yang tersedia, atau dipaksa normal text
            if (forceNormalText || cleanValue.length > maxBoxes * numRows) {
              // 1. Gambar kotak putih solid tanpa border untuk menghapus tuntas comb box bawaan
                if (fieldName === 'Text17') {
                  // KHUSUS USERNAME:
                  // rect.height untuk Text17 terlalu besar dan menutupi label "USERNAME"
                  // Kita hanya block bagian bawahnya saja (sekitar 15pt) dan jangan beri border hitam
                  firstPage.drawRectangle({
                    x: rect.x - 2,
                    y: rect.y,
                    width: totalWidth + 4,
                    height: 16,
                    color: rgb(1, 1, 1),
                    borderWidth: 0
                  });
                } else {
                  // Untuk field lain (seperti Alamat)
                  firstPage.drawRectangle({
                    x: rect.x - 4,
                    y: rect.y - 2,
                    width: totalWidth + 8,
                    height: rect.height + 6,
                    color: rgb(1, 1, 1),
                    borderWidth: 0
                  });
                  // 2. Gambar kotak bergaris yang posisinya digeser ke atas agar tidak menempel dengan RT/RW
                  firstPage.drawRectangle({
                    x: rect.x - 2,
                    y: rect.y + 3,
                    width: totalWidth + 4,
                    height: rect.height + 2,
                    borderColor: rgb(0.2, 0.2, 0.2),
                    borderWidth: 0.5
                  });
                }
                            const textToDraw = cleanValue;
                
                let customSize = fontSize + 1; // Default 11
                let customLineHeight = 15;
                let startYOffset = 10;
                
                // Hitung estimasi jumlah baris (mempertimbangkan enter & teks kepanjangan)
                const segments = cleanValue.split('\n');
                let estimatedLines = 0;
                segments.forEach(seg => {
                   if (!seg.trim()) {
                     estimatedLines += 1;
                   } else {
                     const textWidth = helveticaBoldFont.widthOfTextAtSize(seg, customSize);
                     estimatedLines += Math.max(1, Math.ceil(textWidth / (totalWidth - 8)));
                   }
                });
                
                // Sesuaikan font dan jarak baris agar muat di dalam kotak tanpa menabrak RT/RW
                if (estimatedLines === 2) {
                   customSize = 10;
                   customLineHeight = 14;
                   startYOffset = 8;
                } else if (estimatedLines === 3) {
                   customSize = 9;
                   customLineHeight = 11;
                   startYOffset = 6;
                } else if (estimatedLines >= 4) {
                   customSize = 7.5;
                   customLineHeight = 9.5;
                   startYOffset = 4;
                }
                
                
                  // Auto-shrink font size if a single word (like a long email or username) overflows the box width
                  while (customSize > 4) {
                    let tooWide = false;
                    const segmentsForWidth = textToDraw.split('\n');
                    for (const seg of segmentsForWidth) {
                      const words = seg.split(' ');
                      for (const word of words) {
                        if (helveticaBoldFont.widthOfTextAtSize(word, customSize) > totalWidth - 6) {
                          tooWide = true;
                          break;
                        }
                      }
                    }
                    if (!tooWide) break;
                    customSize -= 0.5;
                  }
                  
                  firstPage.drawText(textToDraw, {
                  x: rect.x + 4,
                  y: fieldName === 'Text17' ? rect.y + 4 : rect.y + rect.height - startYOffset,
                  size: customSize,
                  font: helveticaBoldFont,
                  color: rgb(0, 0, 0),
                  maxWidth: totalWidth - 8,
                  lineHeight: customLineHeight
                });            } else {
              const chars = cleanValue.split('').slice(0, maxBoxes * numRows);
              const selectedFont = bold ? helveticaBoldFont : helveticaFont;
              
              chars.forEach((char, i) => {
                const currentRow = Math.floor(i / maxBoxes);
                const currentCol = i % maxBoxes;
                
                const charWidth = selectedFont.widthOfTextAtSize(char, fontSize);
                
                // X position (Center text inside its specific box)
                const x = rect.x + (boxWidth * currentCol) + (boxWidth - charWidth) / 2;
                
                // Y position (PDF y-axis goes upwards. So row 0 is top)
                const boxY = rect.y + rect.height - (rowHeight * (currentRow + 1));
                const y = boxY + (rowHeight - fontSize) / 2 + 1.5; 
                
                firstPage.drawText(char, {
                  x,
                  y,
                  size: fontSize,
                  font: selectedFont,
                });
              });
            }
          }
          // Hapus text field agar form aslinya tidak menutupi kotak bawaan PDF (meskipun value kosong)
          form.removeField(field);
        }
      } catch (e) {
        console.error("Gagal menggambar comb text", fieldName, e);
      }
    };

    const checkBox = (fieldName: string, check: boolean) => {
      if (!check) return;
      try { form.getCheckBox(fieldName).check(); } catch (e) {}
    };

    // Helper function to convert text to Title Case
    const toTitleCase = (str: string) => {
      if (!str) return '';
      return str.toLowerCase().replace(/\b\w/g, (s) => s.toUpperCase());
    };
    
    if (data.namaLengkap) {
      data.namaLengkap = toTitleCase(data.namaLengkap);
    }
    if (data.tempatLahir) {
      data.tempatLahir = toTitleCase(data.tempatLahir);
    }

    // 1. Data Pelanggan (Gunakan maxBoxes sesuai jumlah kotak di desain PDF)
    fillCombText('Text1', data.namaLengkap, 38, 10, false, undefined, false, true);
    fillCombText('Text7', data.tempatLahir, 14, 10, false, undefined, false, true);
    
    if (data.tanggalLahir) {
      const parts = data.tanggalLahir.split('-'); 
      if (parts.length === 3) {
        fillCombText('Text12', parts[2], 2, 10, false, undefined, false, true); // DD
        fillCombText('Text13', parts[1], 2, 10, false, undefined, false, true); // MM
        fillCombText('Text14', parts[0], 4, 10, false, undefined, false, true); // YYYY
      }
    }

    checkBox('Button5', data.jenisKelamin === 'Pria');
    checkBox('Button6', data.jenisKelamin === 'Wanita');

    fillCombText('Text9', data.ktp ? data.ktp.replace(/[^0-9]/g, '') : '', 20); // Kotak identitas di form ada 20
    fillCombText('Text10', data.telpSelular ? data.telpSelular.replace(/[^0-9]/g, '') : '', 13);
    
    try {
      form.removeField(form.getTextField('Text11'));
    } catch(e) {}

    const cleanTelpRumah = (data.telpRumah || '').replace(/[^0-9]/g, '');
    if (cleanTelpRumah.length > 0) {
      // Gambar kotak kedua di bawah telpSelular (y - 20) tanpa label tambahan
      drawCustomCombBox(cleanTelpRumah, 407.38, 660, 148.12, 15.15, 13, 10);
    }

    // 2. Alamat Pemasangan
    fillCombText('Text16', data.alamat, 38, 10, true, undefined, true); // 38 kotak per baris, 2 baris, force normal text
    fillCombText('Text43', data.rt, 3);
    fillCombText('Text44', data.rw, 3);
    fillCombText('Text25', data.kodePos, 6);
    
    checkBox('Button26', data.statusKepemilikan === 'Pemilik');
    checkBox('Button27', data.statusKepemilikan === 'Penyewa');
    
    fillCombText('Text15', data.email, 38);

    // 3. Paket Layanan & Perangkat
    const formatPaketText = (spec: string, area: string, promo: string) => {
      let text = spec || '';
      // Strip ' + DramaFlix' from the text printed on the PDF form
      text = text.replace(' + DramaFlix', '');
      return text;
    };

    const fillPaketText = (fieldName: string, value: string) => {
      try {
        const field = form.getTextField(fieldName);
        const widgets = field.acroField.getWidgets();
        if (widgets.length > 0 && value) {
          const rect = widgets[0].getRectangle();
          firstPage.drawText(value, {
            x: rect.x + 5,
            y: rect.y + 7, // Geser lebih ke atas lagi agar tidak menabrak titik-titik
            size: 11, // Font diperbesar
            font: helveticaBoldFont,
            color: rgb(0, 0, 0)
          });
        }
        form.removeField(field);
      } catch (e) {}
    };

    checkBox('Button28', data.paketLayanan === 'Fiber');
    if (data.paketLayanan === 'Fiber') fillPaketText('Text3', formatPaketText(data.paketSpec, data.area, data.promoTerm));
    
    checkBox('Button29', data.paketLayanan === 'Safe');
    if (data.paketLayanan === 'Safe') fillPaketText('Text4', formatPaketText(data.paketSpec, data.area, data.promoTerm));
    
    checkBox('Button30', data.paketLayanan === 'Pro');
    if (data.paketLayanan === 'Pro') fillPaketText('Text5', formatPaketText(data.paketSpec, data.area, data.promoTerm));

    const getDynamicFontSize = (text: string) => {
      if (!text) return 7;
      if (text.length > 50) return 5;
      if (text.length > 35) return 6;
      if (text.length > 25) return 6.5;
      return 7;
    };

    if (data.routerQty || data.routerText) {
      checkBox('Button31', true);
      if (data.routerQty) fillText('Text46', data.routerQty.toString());
      if (data.routerText) drawCustomFieldText('Text41', data.routerText, 3, 9, true, 40);
    }
    if (data.smartboxQty || data.smartboxText) {
      checkBox('Button32', true);
      if (data.smartboxQty) fillText('Text47', data.smartboxQty.toString());
      if (data.smartboxText) drawCustomFieldText('Text42', data.smartboxText.replace(' STB', ''), 3, 9, true, 40);
    }
    if (data.customQty || data.customText) {
      checkBox('Button33', true);
      if (data.customText) drawCustomFieldText('Text48', data.customText, 3, 9, true, 40);
    }
    
    // Paket Add-On TV (Custom / Checkbox)
    if (data.densTvCheck) checkBox('Button37', true);
    if (data.visionTvCheck) checkBox('Button38', true);

    // Custom Add-On TV (Lainnya) -> Left Side (Button51 & Text53)
    if (data.addon1Check || data.addon1Text) {
      if (data.addon1Check) checkBox('Button51', true);
      if (data.addon1Text) drawCustomFieldText('Text53', data.addon1Text, 3, 9);
    }

    // VAS Mapping -> Right Side (3 Slots)
    let vasArray: string[] = [];
    if (data.vas && Array.isArray(data.vas)) {
      vasArray = data.vas.filter((v: string) => v && v.trim() !== '');
    } else if (typeof data.vas === 'string' && data.vas.trim() !== '') {
      vasArray = [data.vas];
    }

    if (vasArray.length > 0) {
      checkBox('Button49', true);
      drawCustomFieldText('Text51', vasArray[0], 2, getDynamicFontSize(vasArray[0]), true, -4);
    }
    if (vasArray.length > 1) {
      checkBox('Button50', true);
      drawCustomFieldText('Text52', vasArray[1], 4, getDynamicFontSize(vasArray[1]), true, -4);
    }
    if (vasArray.length > 2) {
      checkBox('Button1', true);
      // Jika lebih dari 3, gabungkan sisanya di slot ke-3
      const remaining = vasArray.slice(2).join(', ');
      drawCustomFieldText('Text49', remaining, 4, getDynamicFontSize(remaining), true, -4);
    }

    // 4. Aktivasi, Jadwal & Catatan
    fillCombText('Text17', data.username, 14);
    if (data.tglPemasangan === 'Secepatnya') {
      try {
        const field21 = form.getTextField('Text21');
        const widgets = field21.acroField.getWidgets();
        if (widgets.length > 0) {
          const rect = widgets[0].getRectangle();
          firstPage.drawText('Secepatnya', {
              x: rect.x + 8,
              y: rect.y + 4,
              size: 11,
            font: helveticaBoldFont,
          });
        }
        form.removeField(form.getTextField('Text21'));
        form.removeField(form.getTextField('Text23'));
        form.removeField(form.getTextField('Text24'));
        form.removeField(form.getTextField('Text45'));
      } catch(e) {}
    } else {
      fillCombText('Text21', data.hariPemasangan, 9);
      if (data.tglPemasangan) {
        const parts = data.tglPemasangan.split('-');
        if (parts.length === 3) {
          fillCombText('Text23', parts[2], 2); 
          fillCombText('Text24', parts[1], 2); 
          fillCombText('Text45', parts[0], 4); 
        }
      }
    }

    checkBox('Button39', data.waktuPemasangan === '09.00-11.00');
    checkBox('Button40', data.waktuPemasangan === '11.00-13.00');
    checkBox('Button41', data.waktuPemasangan === '13.00-15.00');
    checkBox('Button42', data.waktuPemasangan === '15.00-17.00');

    // fillText('Text8', data.catatan, 6); 
    if (data.catatan) {
      const cleanCatatan = data.catatan.replace(/\n/g, ' ').trim();
      try {
        // Hapus background color (MK dictionary) pada kolom Text8 agar tidak ada kotak abu-abu
        const field = form.getTextField('Text8');
        const widgets = field.acroField.getWidgets();
        widgets.forEach((w: any) => w.dict.delete(PDFName.of('MK')));
        field.defaultUpdateAppearances(helveticaFont);
      } catch (e) {
        console.error("Gagal menghapus background Text8", e);
      }

      firstPage.drawText(cleanCatatan, {
        x: 316.63,
        y: 92, // Dinaikkan 3 poin lagi agar tulisan benar-benar di atas titik-titik
        size: 9,
        font: helveticaBoldFont,
        color: rgb(0, 0, 0)
      });
    }

    // 5. Pembayaran Via Kartu Kredit (Ubah font ke 6 agar super pas!)
    fillText('Text35', data.ccNama, 6);
    fillText('Text36', data.ccNomor, 6);
    fillText('Text38', data.ccBerlaku, 6);
    fillText('Text37', data.ccBank, 6);
    checkBox('Button43', data.ccWewenang);

    // 6. Rincian Biaya
    fillText('Text26', data.biayaPemasangan, 8);
    fillText('Text27', data.biayaPaket, 8);
    fillText('Text28', data.biayaTambahan, 8);
    fillText('Text29', data.biayaServices, 8);
    fillText('Text30', data.biayaAddons, 8);
    fillText('Text31', data.biayaPerangkat, 8);
    fillText('Text32', data.biayaLainnya, 8);
    fillText('Text33', data.biayaPpn && data.biayaPpn !== 'Rp 0' ? 'PPN 11%' : '', 8);
    fillText('Text22', data.biayaTotal, 11, true); // TOTAL DIBUAT BESAR DAN BOLD

    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
    fillText('Text2', formattedDate, 8);

    // =========================================================================
    // KOORDINAT KOTAK TANDA TANGAN 
    // =========================================================================
    let sigBoxRect: any = null;
    try {
      const sigField = form.getTextField('Text18');
      const widgets = sigField.acroField.getWidgets();
      if(widgets.length > 0) {
        sigBoxRect = widgets[0].getRectangle();
      }
      form.removeField(sigField);
    } catch(e) {}

    let ccSigBoxRect: any = null;
    try {
      const ccSigField = form.getTextField('Text34'); 
      const widgets = ccSigField.acroField.getWidgets();
      if(widgets.length > 0) {
        ccSigBoxRect = widgets[0].getRectangle();
      }
      form.removeField(ccSigField);
    } catch(e) {}

    let salesSigBoxRect: any = null;
    try {
      const salesSigField = form.getTextField('Text19'); 
      const widgets = salesSigField.acroField.getWidgets();
      if(widgets.length > 0) {
        salesSigBoxRect = widgets[0].getRectangle();
      }
      form.removeField(salesSigField);
    } catch(e) {}

    let leaderSigBoxRect: any = null;
    try {
      const leaderSigField = form.getTextField('Text20'); 
      const widgets = leaderSigField.acroField.getWidgets();
      if(widgets.length > 0) {
        leaderSigBoxRect = widgets[0].getRectangle();
      }
      form.removeField(leaderSigField);
    } catch(e) {}

    // =========================================================================
    // NAMA DI BAWAH TANDA TANGAN (MENGGUNAKAN BOX BARU)
    // =========================================================================
    fillSignatureName('Text6', data.namaLengkap, 9);
    fillSignatureName('Text39', salesFullName, 9);
    fillSignatureName('Text40', leaderFullName, 9);

    // Hapus SEMUA text field dan checkbox yang kosong (tidak terisi) sebelum form di-flatten.
    // Ini menjamin kotak bawaan dari PDF tidak akan tercetak.
    const allFields = form.getFields();
    allFields.forEach(f => {
      try {
        if (f instanceof PDFTextField) {
          const val = f.getText();
          if (!val || val.trim() === '') {
            form.removeField(f);
          }
        } else if (f instanceof PDFCheckBox) {
          if (!f.isChecked()) {
            form.removeField(f);
          }
        }
      } catch (e) {}
    });

    // Flatten form sebelum menggambar tanda tangan (ini yang akan apply semua appearance)
    form.flatten();



    // =========================================================================
    // MENGGAMBAR TANDA TANGAN 
    // =========================================================================
    // Helper function untuk menggambar tanda tangan lebih tebal (dengan menumpuk gambar)
    // dan menggeser posisinya sedikit ke atas agar tidak menabrak garis
    const drawThickSignature = (pngImage: any, boxRect: any, isCC: boolean = false) => {
      const imgDims = pngImage.scale(1);
      const scaleX = boxRect.width / imgDims.width;
      const scaleY = boxRect.height / imgDims.height;
      const scaleToFit = Math.min(scaleX, scaleY); 
      
      const finalWidth = imgDims.width * scaleToFit;
      const finalHeight = imgDims.height * scaleToFit;
      
      const centerX = boxRect.x + (boxRect.width - finalWidth) / 2;
      // Geser posisi Y ke atas sebesar 8 piksel agar mengambang indah di atas garis
      const centerY = boxRect.y + (boxRect.height - finalHeight) / 2 + (isCC ? 0 : 8);

      // Gambar 4 kali dengan offset sangat kecil (0.5 pixel) ke berbagai arah
      // Ini akan memberikan efek "bold" / lebih tebal pada coretan tanda tangan
      const offsets = [
        { dx: 0, dy: 0 },
        { dx: 0.5, dy: 0 },
        { dx: 0, dy: 0.5 },
        { dx: 0.5, dy: 0.5 },
        { dx: -0.5, dy: 0 },
        { dx: 0, dy: -0.5 },
      ];

      offsets.forEach(offset => {
        firstPage.drawImage(pngImage, { 
          x: centerX + offset.dx, 
          y: centerY + offset.dy, 
          width: finalWidth, 
          height: finalHeight 
        });
      });
    };

    // Pelanggan tidak tanda tangan secara digital, dibiarkan kosong untuk ttd basah.

    if (data.ccSignature) {
      try {
        const base64Data = data.ccSignature.replace(/^data:image\/png;base64,/, "");
        const pngImage = await pdfDoc.embedPng(Buffer.from(base64Data, 'base64'));
        
        if (ccSigBoxRect) {
          drawThickSignature(pngImage, ccSigBoxRect, true); // true = no Y offset for CC
        } else {
          // Fallback manual 
          const pngDims = pngImage.scale(0.3); // agak besar sedikit
          firstPage.drawImage(pngImage, { 
            x: 160, 
            y: 283, 
            width: pngDims.width, 
            height: pngDims.height 
          });
        }
      } catch (e) {
        console.error("Gagal menggambar tanda tangan CC", e);
      }
    }

    // Menggambar Tanda Tangan Sales dari Vault
    if (salesSignatureBase64) {
      try {
        const pngImage = await pdfDoc.embedPng(Buffer.from(salesSignatureBase64, 'base64'));
        if (salesSigBoxRect) drawThickSignature(pngImage, salesSigBoxRect);
      } catch (e) {
        console.error("Gagal menggambar tanda tangan Sales", e);
      }
    }

    // Menggambar Tanda Tangan Leader/Supervisor dari Vault
    if (leaderSignatureBase64) {
      try {
        const pngImage = await pdfDoc.embedPng(Buffer.from(leaderSignatureBase64, 'base64'));
        if (leaderSigBoxRect) drawThickSignature(pngImage, leaderSigBoxRect);
      } catch (e) {
        console.error("Gagal menggambar tanda tangan Leader", e);
      }
    }
    // ----------------------------------
    
    const pdfBytes = await pdfDoc.save();

    // Workaround for TypeScript error: Cast to 'any' or 'unknown as BodyInit'
    return new NextResponse(pdfBytes as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="form_pendaftaran_filled.pdf"',
      },
    });
  } catch (error: any) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF', details: error.message || String(error) }, { status: 500 });
  }
}
























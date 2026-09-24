export const maxDuration = 60;

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('ktp') as File;
    if (!file) {
      return NextResponse.json({ error: 'No image uploaded' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key is not configured.' }, { status: 500 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    const genAI = new GoogleGenerativeAI(apiKey);
    // Kita gunakan model flash karena sangat cepat dan murah
    const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite' });

    const prompt = `
Anda adalah sistem pengekstrak data KTP Indonesia.
Ekstrak informasi berikut dari gambar KTP ini.
Kembalikan HANYA format JSON murni tanpa markdown (tanpa \`\`\`json) dan tanpa teks tambahan apa pun.
Gunakan format kunci (key) berikut:
{
  "nik": "string (tepat 16 digit angka)",
  "nama": "string (Huruf Kapital)",
  "tempatLahir": "string (Nama Kota/Kabupaten saja, Huruf Kapital)",
  "tglLahir": "string (Wajib format: YYYY-MM-DD)",
  "jenisKelamin": "string (Wajib tepat 'Pria' atau 'Wanita')"
}
Jika sebuah data tidak terbaca atau buram, biarkan string kosong "".
Pastikan data jenis kelamin dikonversi: jika tertulis "LAKI-LAKI" jadikan "Pria", jika "PEREMPUAN" jadikan "Wanita".
`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: 'image/jpeg',
        },
      },
    ]);

    const text = result.response.text();
    // Bersihkan dari potensi blok kode markdown (```json ... ```)
    const cleanedText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    try {
      const data = JSON.parse(cleanedText);
      return NextResponse.json(data);
    } catch (parseError) {
      console.error("Gagal parse JSON dari Gemini:", cleanedText);
      return NextResponse.json({ error: 'Hasil pembacaan format tidak valid.' }, { status: 500 });
    }
  } catch (error: any) {
    console.error('OCR API Error:', error);
    return NextResponse.json({ error: error.message || 'Gagal mengekstrak data KTP' }, { status: 500 });
  }
}

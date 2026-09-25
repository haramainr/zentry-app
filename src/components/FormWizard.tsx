"use client";
import { createPortal } from 'react-dom';

import React, { useState, useRef, useEffect } from "react";
import { CheckCircle, ChevronRight, ChevronLeft, Save, Calendar, Upload, Plus, Minus, Scan, Receipt, FileText, Camera, ShieldCheck, Copy, Check, Info, Loader2 } from "lucide-react";
import SignatureCanvas from 'react-signature-canvas';
import Select from 'react-select';
import { createClient } from "@/lib/supabase/client";
import { generateWaTemplate } from "@/lib/waGenerator";
import { AREAS, PACKAGE_CATEGORIES, PAYMENT_TERMS, PACKAGES_DATA, VAS_DATA, SMARTBOX_PRICES } from '@/lib/packagesData';

export default function FormWizard({ initialData, caeName, tlName }: { initialData?: any, caeName?: string, tlName?: string }) {
  const supabase = createClient();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;
  
  const sigCanvas = useRef<SignatureCanvas>(null);
  const ccSigCanvas = useRef<SignatureCanvas>(null);

  const sigFileInputRef = useRef<HTMLInputElement>(null);
  
  const handleSigImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result && sigCanvas.current) {
          sigCanvas.current.clear();
                      sigCanvas.current.fromDataURL(event.target.result.toString(), {
              width: sigCanvas.current.getCanvas().width,
              height: sigCanvas.current.getCanvas().height
            });
            setTimeout(() => {
              onSigEnd();
            }, 100);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const salesSigCanvas = useRef<SignatureCanvas>(null);
  
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isConvertingToJpg, setIsConvertingToJpg] = useState(false);
  const [isWaCopied, setIsWaCopied] = useState(false);
  
  let parsedVas: string[] = [];
  let parsedExtras: any = {};
  if (initialData?.vas) {
    try {
      const decoded = JSON.parse(initialData.vas);
      if (Array.isArray(decoded)) {
        if (decoded.length === 1 && typeof decoded[0] === 'string' && decoded[0].startsWith('[')) {
          parsedVas = JSON.parse(decoded[0]);
        } else {
          parsedVas = decoded;
        }
      } else if (typeof decoded === 'object' && decoded !== null) {
        parsedVas = decoded.vas || [];
        parsedExtras = decoded;
      } else {
        parsedVas = initialData.vas.split(', ').filter(Boolean);
      }
    } catch (e) {
      parsedVas = initialData.vas.split(', ').filter(Boolean);
    }
  }

  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Preload PDF.js di background saat user masuk ke langkah 3 (Rangkuman)
  // Ini memangkas waktu loading 2-4 detik saat menekan tombol Terbitkan JPG!
  useEffect(() => {
    if (currentStep === 3) {
      import('pdfjs-dist').then(pdfjsLib => {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
        // Opsional: pre-fetch file mjs-nya agar masuk cache browser
        fetch(pdfjsLib.GlobalWorkerOptions.workerSrc, { mode: 'no-cors' }).catch(() => {});
      }).catch(e => console.error('Gagal preload pdf.js', e));
    }
  }, [currentStep]);

  // Simpan data Tanda Tangan ke state agar tidak hilang saat unmount
  const [signatureData, setSignatureData] = useState<string | null>(initialData?.signature_base64 || parsedExtras?.signature_base64 || null);
  const [ccSignatureData, setCcSignatureData] = useState<string | null>(initialData?.cc_signature_base64 || parsedExtras?.cc_signature_base64 || null);
  const [salesSignatureData, setSalesSignatureData] = useState<string | null>(null);
  const [salesNameInput, setSalesNameInput] = useState<string>(parsedExtras?.salesNameManual || '');
  
  // State untuk ID draft agar auto-save tidak membuat draft baru berkali-kali
  const [draftId, setDraftId] = useState(initialData?.id || null);

  useEffect(() => {
    // Sinkronisasi step dari URL saat mount dan saat popstate
    const handlePopState = () => {
      const url = new URL(window.location.href);
      const step = parseInt(url.searchParams.get('step') || '1', 10);
      if (step >= 1 && step <= totalSteps) {
        setCurrentStep(step);
      }
    };
    window.addEventListener('popstate', handlePopState);
    
    // Inisialisasi awal
    const url = new URL(window.location.href);
    const initialUrlStep = parseInt(url.searchParams.get('step') || '1', 10);
    if (initialUrlStep >= 1 && initialUrlStep <= totalSteps && initialUrlStep !== currentStep) {
      setCurrentStep(initialUrlStep);
    } else if (!url.searchParams.get('step')) {
      url.searchParams.set('step', '1');
      window.history.replaceState({}, '', url);
    }
    
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  useEffect(() => {
    setFormData(prev => {
      let updated = { ...prev };
      let changed = false;

      // Fix DramaFlix first
      if (updated.vas && Array.isArray(updated.vas) && updated.vas.some(v => v && v.toLowerCase().includes('dramaflix'))) {
        const m = getPromoMultiplier(updated.promoTerm);
        const expectedTambahan = (15000 * m).toString();
        
        if (updated.biayaLainnya === '15000' || updated.biayaLainnya === expectedTambahan) {
          updated.biayaLainnya = '0';
          updated.biayaTambahan = expectedTambahan;
          changed = true;
        } else if ((updated.biayaServices === '15000' || updated.biayaServices === expectedTambahan) && !updated.vas.some(v => v && (v.toLowerCase().includes('stream') || v.toLowerCase().includes('gamers')))) {
          updated.biayaServices = '0';
          updated.biayaTambahan = expectedTambahan;
          changed = true;
        }
        
        // Ensure DramaFlix multiplier is correct in current biayaTambahan
        if (updated.biayaTambahan === '15000' && m > 1) {
          updated.biayaTambahan = expectedTambahan;
          changed = true;
        }
      }

      // Consolidate admin fee (5000) into biayaLainnya
      if (updated.biayaPerangkat === '5000' && !updated.smartboxText && !updated.routerPrice && !updated.customPrice) {
        updated.biayaPerangkat = '0';
        updated.biayaLainnya = '5000';
        changed = true;
      }
      if (updated.biayaAddons === '5000') {
        updated.biayaAddons = '0';
        updated.biayaLainnya = '5000';
        changed = true;
      }

      // If biayaLainnya is 0 for regular promos, force it to 5000
      if (updated.biayaLainnya === '0' && updated.paketLayanan === 'Fiber' && ['100 Mbps', '150 Mbps', '200 Mbps', '300 Mbps', '20 Mbps', '20 Mbps + DramaFlix', '100 Mbps + DramaFlix', '150 Mbps + DramaFlix', '200 Mbps + DramaFlix', '300 Mbps + DramaFlix'].includes(updated.paketSpec)) {
         updated.biayaLainnya = '5000';
         changed = true;
      }

      // Ensure biayaPaket is correctly multiplied for Advance Pay
      if (updated.promoTerm && updated.promoTerm.includes('Advance Pay')) {
         const areaData = PACKAGES_DATA[updated.area];
         const categoryMap: Record<string, string> = { 'Fiber': 'Fiber Reguler', 'Safe': 'Fiber Safe', 'Soho': 'Fiber Soho' };
         const category = categoryMap[updated.paketLayanan];
         if (areaData && areaData[category] && updated.paketSpec) {
            const prices = areaData[category].prices?.[updated.promoTerm];
            if (prices && prices[updated.paketSpec] !== undefined) {
               const expectedPaket = prices[updated.paketSpec].toString();
               if (updated.biayaPaket !== expectedPaket) {
                  updated.biayaPaket = expectedPaket;
                  changed = true;
               }
            }
         }
      }

      return changed ? updated : prev;
    });
  }, []);

  useEffect(() => {
    // Restore signatures to canvas if they exist
    if (initialData?.signature_base64 && sigCanvas.current && sigCanvas.current.isEmpty()) {
      sigCanvas.current.fromDataURL(initialData.signature_base64);
    }
    if (initialData?.cc_signature_base64 && ccSigCanvas.current && ccSigCanvas.current.isEmpty()) {
      ccSigCanvas.current.fromDataURL(initialData.cc_signature_base64);
    }
  }, [initialData]);

  // Restore dari state saat step berpindah (mencegah ttd hilang)
  useEffect(() => {
    if (currentStep === 6 && signatureData && sigCanvas.current && sigCanvas.current.isEmpty()) {
      sigCanvas.current.fromDataURL(signatureData);
    }
    if (currentStep === 5 && ccSignatureData && ccSigCanvas.current && ccSigCanvas.current.isEmpty()) {
      ccSigCanvas.current.fromDataURL(ccSignatureData);
    }
  }, [currentStep, signatureData, ccSignatureData, salesSignatureData]);

  const [isDrafting, setIsDrafting] = useState(false);
  const [isOcring, setIsOcring] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

    const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.src = objectUrl;
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas toBlob failed'));
        }, 'image/jpeg', 0.7);
      };
      img.onerror = (error) => {
        URL.revokeObjectURL(objectUrl);
        reject(error);
      };
    });
  };

  const handleOcrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsOcring(true);
      try {
        const compressedBlob = await compressImage(e.target.files[0]);
        const apiFormData = new FormData();
        apiFormData.append('ktp', compressedBlob, 'ktp-compressed.jpg');

        const response = await fetch('/api/extract-ktp', {
          method: 'POST',
          body: apiFormData,
        });

        const ocrData = await response.json();
        
        if (response.ok && ocrData) {
          setFormData(prev => ({
            ...prev,
            ktp: ocrData.nik || prev.ktp,
            namaLengkap: ocrData.nama || prev.namaLengkap,
            tempatLahir: ocrData.tempatLahir || prev.tempatLahir,
            tanggalLahir: ocrData.tglLahir || prev.tanggalLahir,
            jenisKelamin: ocrData.jenisKelamin || prev.jenisKelamin,
          }));
          alert("Beberapa data berhasil diisi dari KTP. Silakan periksa kembali ketepatannya.");
        } else {
          alert(ocrData.error || "Gagal membaca KTP. Silakan isi manual.");
        }
      } catch (err) {
        alert("Error memindai KTP.");
      } finally {
        setIsOcring(false);
        // Reset file input so user can select the same file again if needed
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        if (cameraInputRef.current) {
          cameraInputRef.current.value = '';
        }
      }
    }
  };

  const [formData, setFormData] = useState({
    namaLengkap: initialData?.nama_lengkap || '',
    tempatLahir: initialData?.tempat_lahir || '',
    tanggalLahir: initialData?.tanggal_lahir || '',
    ktp: initialData?.ktp || '',
    jenisKelamin: initialData?.jenis_kelamin || '',
    telpSelular: initialData?.telp_selular || '',
    telpRumah: initialData?.telp_rumah || '',
    alamat: initialData?.alamat || '',
    rt: initialData?.rt || '',
    rw: initialData?.rw || '',
    kodePos: initialData?.kode_pos || '',
    statusKepemilikan: initialData?.status_kepemilikan || '',
    email: initialData?.email || '',
    area: parsedExtras.area || 'Regular FS',
    promoTerm: parsedExtras.promoTerm || 'Bulanan (Regular)',
    paketLayanan: initialData?.paket_layanan || 'Fiber',
    paketSpec: initialData?.paket_spec || '',
    vas: parsedVas,
    promo: parsedExtras.promo || initialData?.promo || '',
    routerQty: initialData?.router_qty ? initialData.router_qty.toString() : (parsedExtras.routerQty || ''),
    routerText: parsedExtras.routerText || '',
    routerPrice: parsedExtras.routerPrice || '',
    smartboxQty: initialData?.smartbox_qty ? initialData.smartbox_qty.toString() : (parsedExtras.smartboxQty || ''),
    smartboxText: (parsedExtras.smartboxText || '').replace(' STB', ''),
    customQty: parsedExtras.customQty || '',
    customText: parsedExtras.customText || '',
    customPrice: parsedExtras.customPrice || '',
    densTvCheck: parsedExtras.densTvCheck || false,
    visionTvCheck: parsedExtras.visionTvCheck || false,
    addon1Check: parsedExtras.addon1Check || false,
    addon1Text: parsedExtras.addon1Text || '',
    addon2Check: false,
    addon2Text: '',
    username: initialData?.username_zentry || '',
    tglPemasangan: initialData?.waktu_pemasangan === 'Secepatnya' ? 'Secepatnya' : (initialData?.tgl_pemasangan || ''),
    waktuPemasangan: initialData?.waktu_pemasangan === 'Secepatnya' ? '' : (initialData?.waktu_pemasangan || ''),
    catatan: initialData?.catatan || '',
    homepassId: initialData?.homepass_id || '',
    titikKoordinat: initialData?.titik_koordinat || '',
    
    ccNama: initialData?.cc_nama || '',
    ccNomor: initialData?.cc_nomor || '',
    ccBerlaku: initialData?.cc_berlaku || '',
    ccBank: initialData?.cc_bank || '',
    ccWewenang: initialData?.cc_wewenang || false,
    
    biayaPemasangan: initialData?.biaya_pemasangan ? initialData.biaya_pemasangan.toString() : '0',
    biayaPemasanganDropdown: initialData?.biaya_pemasangan ? initialData.biaya_pemasangan.toString() : '0',
    biayaPaket: initialData?.biaya_paket ? initialData.biaya_paket.toString() : '0',
    biayaTambahan: initialData?.biaya_tambahan ? initialData.biaya_tambahan.toString() : '0',
    biayaServices: initialData?.biaya_services ? initialData.biaya_services.toString() : '0',
    biayaAddons: initialData?.biaya_addons ? initialData.biaya_addons.toString() : '0',
    biayaPerangkat: initialData?.biaya_perangkat ? initialData.biaya_perangkat.toString() : '0',
    biayaLainnya: initialData?.biaya_lainnya ? initialData.biaya_lainnya.toString() : '5000',
    caeName: caeName || '',
    tlName: tlName || '',
  });

  const [kalkulasi, setKalkulasi] = useState({
    ppn: 0,
    total: 0
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;
    
    setFormData(prev => {
      let actualValue = type === 'checkbox' ? checked : value;
        if (name === 'username' || name === 'email') {
          actualValue = typeof actualValue === 'string' ? actualValue.toLowerCase() : actualValue;
        }
        let newData = { ...prev, [name]: actualValue };
      
      // Auto-check custom add-on TV if text is typed
      if (name === 'addon1Text' && value.trim() !== '') {
        newData.addon1Check = true;
      }
      
      // Auto-fill biaya jika dropdown berubah
      if (name === 'area') {
        const newAreaData = PACKAGES_DATA[newData.area] || {};
        const categoryMap: Record<string, string> = { 'Fiber': 'Fiber Reguler', 'Safe': 'Fiber Safe', 'Soho': 'Fiber Soho' };
        
        let newPaketLayanan = newData.paketLayanan;
        if (!newAreaData[categoryMap[newPaketLayanan]]) {
          const availableCats = Object.keys(newAreaData);
          if (availableCats.length > 0) {
            const reverseMap: Record<string, string> = { 'Fiber Reguler': 'Fiber', 'Fiber Safe': 'Safe', 'Fiber Soho': 'Soho' };
            newPaketLayanan = reverseMap[availableCats[0]] || 'Fiber';
          }
        }
        newData.paketLayanan = newPaketLayanan;
        
        const terms = (newAreaData[categoryMap[newPaketLayanan]]?.terms) || [];
        newData.promoTerm = terms.length > 0 ? terms[0] : 'Bulanan (Regular)';
        
        newData.paketSpec = '';
        newData.biayaPaket = '0';
      } else if (name === 'paketLayanan') {
        const areaData = PACKAGES_DATA[newData.area] || {};
        const categoryMap: Record<string, string> = { 'Fiber': 'Fiber Reguler', 'Safe': 'Fiber Safe', 'Soho': 'Fiber Soho' };
        const categoryName = categoryMap[newData.paketLayanan];
        const newTerms = (areaData[categoryName]?.terms) || [];
        
        if (!newTerms.includes(newData.promoTerm) && newTerms.length > 0) {
          newData.promoTerm = newTerms[0];
        }
        
        newData.paketSpec = '';
        newData.biayaPaket = '0';
      }
      
      if (['area', 'paketLayanan', 'promoTerm', 'paketSpec'].includes(name)) {
        const areaData = PACKAGES_DATA[newData.area];
        const categoryMap: Record<string, string> = { 'Fiber': 'Fiber Reguler', 'Safe': 'Fiber Safe', 'Soho': 'Fiber Soho' };
        const category = categoryMap[newData.paketLayanan];
        
        if (newData.paketLayanan === 'Fiber' && ['100 Mbps', '150 Mbps', '200 Mbps'].includes(newData.paketSpec)) {
          // OVERRIDE FOR FIBER 100, 150, 200 Mbps
          newData.vas = [
            'CBN Fiber July 2026 Package 2 (100, 150, & 200 Mbps)',
            'Trend Micro Maximum Security 1 Months - 1 Device (Free)'
          ];
          
          let basicPrice = '199000';
          if (newData.paketSpec === '150 Mbps') basicPrice = '229000';
          if (newData.paketSpec === '200 Mbps') basicPrice = '339000';
          
          newData.biayaPaket = (Number(basicPrice) * getPromoMultiplier(newData.promoTerm)).toString();
          newData.biayaPemasangan = '0';
          newData.biayaPerangkat = '0';
          newData.biayaAddons = '0';
            newData.biayaLainnya = '5000';
          newData.biayaServices = '0';
          newData.routerText = 'ZTE';
          newData.routerQty = '1';
          newData.catatan = 'REGULER PROMO JULY 2026 - NAB';
        } else if (newData.paketLayanan === 'Fiber' && ['100 Mbps + DramaFlix', '150 Mbps + DramaFlix', '200 Mbps + DramaFlix'].includes(newData.paketSpec)) {
          // OVERRIDE FOR FIBER 100, 150, 200 Mbps + DramaFlix
          newData.vas = [
            'DramaFlix +50Mbps',
            'CBN Fiber July 2026 Package 2 (100, 150, & 200 Mbps)',
            'Trend Micro Maximum Security 1 Months - 1 Device (Free)'
          ];
          
          let basicPrice = '199000';
          if (newData.paketSpec === '150 Mbps + DramaFlix') basicPrice = '229000';
          if (newData.paketSpec === '200 Mbps + DramaFlix') basicPrice = '339000';
          
          newData.biayaPaket = (Number(basicPrice) * getPromoMultiplier(newData.promoTerm)).toString();
          newData.biayaPemasangan = '0';
          newData.biayaPerangkat = '0';
          newData.biayaAddons = '0';
            newData.biayaLainnya = '5000';
          newData.biayaServices = '0';
          newData.biayaTambahan = (15000 * getPromoMultiplier(newData.promoTerm)).toString();
          newData.routerText = 'ZTE';
          newData.routerQty = '1';
          newData.catatan = 'Regular Promo July 2026 - NAB';
        } else if (newData.paketLayanan === 'Safe' && ['100 Mbps', '150 Mbps', '200 Mbps'].includes(newData.paketSpec)) {
          // OVERRIDE FOR FIBER SAFE 100, 150, 200 Mbps
          newData.vas = [
            'CBN Fiber Safe July 2026 Package 2 (100, 150 & 200 Mbps)',
            'Trend Micro Maximum Security 1 Months - 1 Device (Free)'
          ];
          
          let basicPrice = '219000';
          if (newData.paketSpec === '150 Mbps') basicPrice = '249000';
          if (newData.paketSpec === '200 Mbps') basicPrice = '359000';
          
          newData.biayaPaket = (Number(basicPrice) * getPromoMultiplier(newData.promoTerm)).toString();
          newData.biayaPemasangan = '0';
          newData.biayaPerangkat = '0';
          newData.biayaAddons = '0';
            newData.biayaLainnya = '5000';
          newData.biayaServices = '0';
          newData.routerText = 'ZTE';
          newData.routerQty = '1';
          newData.catatan = 'Reguler Promo July 2026 - NAB';
        } else if (newData.paketLayanan === 'Fiber' && newData.paketSpec === '20 Mbps') {
          // OVERRIDE FOR FIBER 20 Mbps
          newData.vas = [
            'CBN Fiber July 2026 Package 1 (15 & 20 Mbps)'
          ];
          newData.biayaPaket = (169000 * getPromoMultiplier(newData.promoTerm)).toString();
          newData.biayaPemasangan = '0';
          newData.biayaPerangkat = '0';
          newData.biayaAddons = '0';
            newData.biayaLainnya = '5000';
          newData.biayaServices = '0';
          newData.routerText = 'ZTE';
          newData.routerQty = '1';
          newData.catatan = 'REGULER PROMO JULY 2026 - NAB';
        } else if (newData.paketLayanan === 'Fiber' && newData.paketSpec === '20 Mbps + DramaFlix') {
          // OVERRIDE FOR FIBER 20 Mbps + DramaFlix
          newData.vas = [
            'DramaFlix +50Mbps',
            'CBN Fiber July 2026 Package 1 (15 & 20 Mbps)'
          ];
          newData.biayaPaket = (169000 * getPromoMultiplier(newData.promoTerm)).toString();
          newData.biayaPemasangan = '0';
          newData.biayaPerangkat = '0';
          newData.biayaAddons = '0';
            newData.biayaLainnya = '5000';
          newData.biayaTambahan = (15000 * getPromoMultiplier(newData.promoTerm)).toString();
          newData.biayaServices = '0';
          newData.routerText = 'ZTE';
          newData.routerQty = '1';
          newData.catatan = 'REGULER PROMO JULY 2026 - NAB';
        } else if (newData.paketLayanan === 'Fiber' && newData.paketSpec === '300 Mbps') {
          // OVERRIDE FOR FIBER 300 Mbps
          newData.vas = [
            'CBN Fiber July 2026 Package 3 (300 Mbps)',
            'Trend Micro Maximum Security 1 Months - 1 Device (Free)'
          ];
          newData.biayaPaket = (429000 * getPromoMultiplier(newData.promoTerm)).toString();
          newData.biayaPemasangan = '0';
          newData.biayaPerangkat = '0';
          newData.biayaAddons = '0';
            newData.biayaLainnya = '5000';
          newData.biayaServices = '0';
          newData.routerText = 'ZTE';
          newData.routerQty = '1';
          newData.catatan = 'REGULER PROMO JULY 2026 - NAB';
        } else if (newData.paketLayanan === 'Fiber' && newData.paketSpec === '300 Mbps + DramaFlix') {
          // OVERRIDE FOR FIBER 300 Mbps + DramaFlix
          newData.vas = [
            'DramaFlix +50Mbps',
            'CBN Fiber July 2026 Package 3 (300 Mbps)',
            'Trend Micro Maximum Security 1 Months - 1 Device (Free)'
          ];
          newData.biayaPaket = (429000 * getPromoMultiplier(newData.promoTerm)).toString();
          newData.biayaPemasangan = '0';
          newData.biayaPerangkat = '0';
          newData.biayaAddons = '0';
            newData.biayaLainnya = '5000';
          newData.biayaServices = '0';
          newData.biayaTambahan = (15000 * getPromoMultiplier(newData.promoTerm)).toString();
          newData.routerText = 'ZTE';
          newData.routerQty = '1';
          newData.catatan = 'Regular Promo July 2026 - NAB';
        } else if (newData.paketLayanan === 'Safe' && newData.paketSpec === '300 Mbps') {
          // OVERRIDE FOR FIBER SAFE 300 Mbps
          newData.vas = [
            'CBN Fiber Safe July 2026 Package 3 (300 Mbps)',
            'Trend Micro Maximum Security 1 Months - 1 Device (Free)'
          ];
          newData.biayaPaket = (449000 * getPromoMultiplier(newData.promoTerm)).toString();
          newData.biayaPemasangan = '0';
          newData.biayaPerangkat = '0';
          newData.biayaAddons = '0';
            newData.biayaLainnya = '5000';
          newData.biayaServices = '0';
          newData.routerText = 'ZTE';
          newData.routerQty = '1';
          newData.catatan = 'Reguler Promo July 2026 - NAB';
        } else {
          if (areaData && areaData[category] && newData.paketSpec) {
            if (newData.promoTerm === 'Bulanan (Regular)' && areaData[category].monthlyPrices?.[newData.paketSpec]) {
              newData.biayaPaket = areaData[category].monthlyPrices[newData.paketSpec].basicPrice.toString();
              newData.biayaPemasangan = areaData[category].monthlyPrices[newData.paketSpec].setupFee.toString();
            } else {
              const prices = areaData[category].prices?.[newData.promoTerm];
              if (prices && prices[newData.paketSpec] !== undefined) {
                newData.biayaPaket = prices[newData.paketSpec].toString();
              } else {
                newData.biayaPaket = '0';
              }
              if (newData.promoTerm && newData.promoTerm.includes('Advance Pay')) {
                newData.biayaPemasangan = '0';
              }
            }
          } else if (name === 'paketSpec' && !newData.paketSpec) {
            newData.biayaPaket = '0';
          }
        }

        // Auto-fill Catatan (Notes)
        const getAutoNotes = (area: string, cat: string, term: string) => {
          if (area === 'Regular FS') {
            if (term === 'Advance Pay 5 Get 6') return "Regular Promo July 2026 - Bill in Advance Pay 5 Get 6 - NAB";
            if (term === 'Advance Pay 9 Get 12') return "Regular Promo July 2026 - Bill in Advance Pay 9 Get 12 - NAB";
            return "Regular Promo July 2026 - NAB";
          }
          if (area === 'Pro') {
            if (term === 'Advance Pay 6 Get 7') return "Regular Promo Juli 2025 - SOHO PRO - Bill in Advance Pay 6 Get 7";
            if (term === 'Advance Pay 12 Get 15') return "Regular Promo Juli 2025 - SOHO PRO - Bill in Advance Pay 12 Get 15";
            return "Regular Promo Juli 2025 - SOHO PRO";
          }
          if (area === 'PIK 1 JMS') {
            if (cat === 'Fiber Soho') {
              if (term === 'Advance Pay 6 Get 7') return "Fiber SOHO Promo - PIK 1 Area - Bill in Advance Pay 6 Get 7 June 2024";
              if (term === 'Advance Pay 12 Get 14') return "Fiber SOHO Promo - PIK 1 Area - Bill in Advance Pay 12 Get 14 June 2024";
              return "Fiber SOHO Promo - PIK 1 Area June 2024";
            }
            if (term === 'Advance Pay 6 Get 7') return "Regular Promo June 2024 - PIK 1 JMS Area - Bill in Advance Pay 6 Get 7";
            if (term === 'Advance Pay 12 Get 14') return "Regular Promo June 2024 - PIK 1 JMS Area - Bill in Advance Pay 12 Get 14";
            return "Regular Promo June 2024 - PIK 1 JMS Area";
          }
          if (area === 'PIK 2 JMS') {
            if (cat === 'Fiber Soho') {
              if (term === 'Advance Pay 6 Get 7') return "Fiber SOHO Promo - PIK 2 Area - Bill in Advance Pay 6 Get 7 June 2024";
              if (term === 'Advance Pay 12 Get 14') return "Fiber SOHO Promo - PIK 2 Area - Bill in Advance Pay 12 Get 14 June 2024";
              return "Fiber SOHO Promo - PIK 2 Area May 2024";
            }
            if (term === 'Advance Pay 6 Get 7') return "Regular Promo July 2024 - PIK 2 JMS Area - Bill in Advance Pay 6 Get 7";
            if (term === 'Advance Pay 12 Get 14') return "Regular Promo July 2024 - PIK 2 JMS Area - Bill in Advance Pay 12 Get 14";
            return "Regular Promo July 2024 - PIK 2 JMS Area";
          }
          if (area === 'Golf Island') {
            if (cat === 'Fiber Soho') {
              if (term === 'Advance Pay 6 Get 7') return "Fiber SOHO Promo - Golf Island Area - Bill in Advance Pay 6 Get 7 May 2024";
              if (term === 'Advance Pay 12 Get 14') return "Fiber SOHO Promo - Golf Island Area - Bill in Advance Pay 12 Get 14 May 2024";
              return "Fiber SOHO Promo - Golf Island Area May 2024";
            }
            if (term === 'Advance Pay 6 Get 7') return "Regular Promo Maret 2025 - Golf Island Area - Bill in Advance Pay 6 Get 7";
            if (term === 'Advance Pay 12 Get 14') return "Regular Promo Maret 2025 - Golf Island Area - Bill in Advance Pay 12 Get 14";
            return "Regular Promo Maret 2025 - Golf Island Area";
          }
          return "";
        };

        const autoNotes = getAutoNotes(newData.area, category, newData.promoTerm);
        if (autoNotes) {
          newData.catatan = autoNotes;
        }
        
        // Recalculate VAS based on new promo multiplier
        if (newData.vas && Array.isArray(newData.vas)) {
          const m = getPromoMultiplier(newData.promoTerm);
          let totalServices = 0;
          let totalTambahanFromVas = 0;
          newData.vas.forEach((val: string) => {
            if (!val) return;
            const vasItem = VAS_DATA.find(v => v.name === val);
            if (vasItem) {
              if (val.toLowerCase().includes('dramaflix')) {
                totalTambahanFromVas += (vasItem.price * m);
              } else {
                totalServices += (vasItem.price * m);
              }
            }
          });
          newData.biayaServices = totalServices.toString();
          newData.biayaTambahan = totalTambahanFromVas.toString();
        }
      }
      
      if (['smartboxText', 'smartboxQty', 'routerQty', 'customQty', 'routerPrice', 'customPrice'].includes(name)) {
        const qtySBox = name === 'smartboxQty' ? parseInt(value) || 0 : parseInt(newData.smartboxQty) || 0;
        const sBox = name === 'smartboxText' ? value : newData.smartboxText;
        
        let perangkatTotal = 0;
        if (sBox && SMARTBOX_PRICES[sBox]) {
          const multiplier = qtySBox > 0 ? qtySBox : 1;
          perangkatTotal += SMARTBOX_PRICES[sBox] * multiplier;
          if (name === 'smartboxText' && !newData.smartboxQty) newData.smartboxQty = '1';
        }

        const rPrice = name === 'routerPrice' ? parseInt(value) || 0 : parseInt(newData.routerPrice) || 0;
        const rQty = name === 'routerQty' ? parseInt(value) || 0 : parseInt(newData.routerQty) || 0;
        if (rPrice > 0) perangkatTotal += rPrice * (rQty > 0 ? rQty : 1);

        const cPrice = name === 'customPrice' ? parseInt(value) || 0 : parseInt(newData.customPrice) || 0;
        const cQty = name === 'customQty' ? parseInt(value) || 0 : parseInt(newData.customQty) || 0;
        if (cPrice > 0) perangkatTotal += cPrice * (cQty > 0 ? cQty : 1);
        
        newData.biayaPerangkat = perangkatTotal.toString();
      }
      
      return newData;
    });
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericValue = value.replace(/[^0-9]/g, '');
    setFormData(prev => ({ ...prev, [name]: numericValue }));
  };

  useEffect(() => {
    const hargaPaket = Number(formData.biayaPaket) || 0;
    const hargaVas = Number(formData.biayaServices) || 0;
    const hargaInstalasi = Number(formData.biayaPemasangan) || 0;
    const hargaTambahan = Number(formData.biayaTambahan) || 0;
    const hargaAddons = Number(formData.biayaAddons) || 0;
    const hargaPerangkat = Number(formData.biayaPerangkat) || 0;
    const hargaLainnya = Number(formData.biayaLainnya) || 0;

    let diskonPromo = 0;
    if (formData.promo === 'Diskon 50K') diskonPromo = 50000;
    
    let instalasiAkhir = hargaInstalasi;
    if (formData.promo === 'Free Instalasi') {
      instalasiAkhir = 0; 
    }

    const subtotal = hargaPaket + hargaVas + instalasiAkhir + hargaTambahan + hargaAddons + hargaPerangkat + hargaLainnya - diskonPromo;
    const ppn = Math.max(0, Math.round(subtotal * 0.11)); 
    const total = Math.max(0, subtotal + ppn);

    setKalkulasi({ ppn, total });
  }, [formData.biayaPaket, formData.biayaServices, formData.biayaPemasangan, formData.biayaTambahan, formData.biayaAddons, formData.biayaPerangkat, formData.biayaLainnya, formData.promo]);



  const getPromoMultiplier = (term: string) => {
    if (!term) return 1;
    if (term.includes('Advance Pay 5')) return 5;
    if (term.includes('Advance Pay 6')) return 6;
    if (term.includes('Advance Pay 9')) return 9;
    if (term.includes('Advance Pay 12')) return 12;
    return 1;
  };

  const formatRupiah = (angka: number | string) => {
    if (angka === 0 || angka === '0') return 'Rp 0';
    if (!angka) return '';
    return 'Rp ' + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const getHari = (dateString: string) => {
    if (!dateString) return '';
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const d = new Date(dateString);
    return days[d.getDay()];
  };

  const handleSingleVasChange = (index: number, selectedOption: any) => {
    const selectedValue = selectedOption ? selectedOption.value : '';
    
    setFormData(prev => {
      const newVas = [...prev.vas];
      while (newVas.length < 3) newVas.push(''); // Ensure array has 3 slots
      newVas[index] = selectedValue;
      
      const m = getPromoMultiplier(prev.promoTerm);
        let totalServices = 0;
      let totalTambahanFromVas = 0;
      newVas.forEach((val: string) => {
        if (!val) return;
        const vasItem = VAS_DATA.find(v => v.name === val);
        if (vasItem) {
          if (val.toLowerCase().includes('dramaflix')) {
              totalTambahanFromVas += (vasItem.price * m);
            } else {
            totalServices += (vasItem.price * m);
          }
        }
      });
      
      const qty = parseInt(prev.smartboxQty) || 0;
      let perangkatTotal = 0;
      if (prev.smartboxText && SMARTBOX_PRICES[prev.smartboxText]) {
        const multiplier = qty > 0 ? qty : 1;
        perangkatTotal += SMARTBOX_PRICES[prev.smartboxText] * multiplier;
      }
      const rPrice = parseInt(prev.routerPrice) || 0;
      const rQty = parseInt(prev.routerQty) || 0;
      if (rPrice > 0) perangkatTotal += rPrice * (rQty > 0 ? rQty : 1);
  
      const cPrice = parseInt(prev.customPrice) || 0;
      const cQty = parseInt(prev.customQty) || 0;
      if (cPrice > 0) perangkatTotal += cPrice * (cQty > 0 ? cQty : 1);
      
      let baseLainnya = 5000;
      
      return {
        ...prev,
        vas: newVas,
        biayaServices: totalServices.toString(),
        biayaTambahan: totalTambahanFromVas > 0 ? totalTambahanFromVas.toString() : prev.biayaTambahan,
          biayaLainnya: baseLainnya.toString(),
        biayaPerangkat: perangkatTotal.toString()
      };
    });
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.ktp || formData.ktp.length !== 16) {
        alert("Peringatan: Nomor Identitas (KTP) harus diisi dan berjumlah tepat 16 digit angka!");
        return;
      }
    }
    if (currentStep === 3) {
      const rPrice = parseInt(formData.routerPrice) || 0;
      const rQty = parseInt(formData.routerQty) || 0;
      if ((formData.routerText || rPrice > 0) && rQty <= 0) {
        alert("Peringatan: Unit (Qty) untuk Wireless Router harus diisi minimal 1!");
        return;
      }
      
      const sQty = parseInt(formData.smartboxQty) || 0;
      if (formData.smartboxText && sQty <= 0) {
        alert("Peringatan: Unit (Qty) untuk Smartbox harus diisi minimal 1!");
        return;
      }
      
      const cPrice = parseInt(formData.customPrice) || 0;
      const cQty = parseInt(formData.customQty) || 0;
      if ((formData.customText || cPrice > 0) && cQty <= 0) {
        alert("Peringatan: Unit (Qty) untuk Custom Perangkat harus diisi minimal 1!");
        return;
      }
    }
    if (currentStep < totalSteps) {
      const nextStep = currentStep + 1;
      
      // Auto-save silently if we have at least some basic data
      if (currentStep >= 1 && (formData.namaLengkap || formData.ktp)) {
        handleSaveDraft(true);
      }
      
      setCurrentStep(nextStep);
      const url = new URL(window.location.href);
      url.searchParams.set('step', nextStep.toString());
      window.history.pushState({}, '', url);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      window.history.back();
    }
  };

  const clearSignature = () => {
    sigCanvas.current?.clear();
    setSignatureData(null);
  };

  const clearCCSignature = () => {
    ccSigCanvas.current?.clear();
    setCcSignatureData(null);
  };

  // Callback setiap kali coretan CC selesai
  const onCCSigEnd = () => {
    if (ccSigCanvas.current && !ccSigCanvas.current.isEmpty()) {
      setCcSignatureData(ccSigCanvas.current.toDataURL());
    }
  };

  // Callback setiap kali coretan TTD Utama selesai
  const onSigEnd = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      setSignatureData(sigCanvas.current.toDataURL());
    }
  };

  const handleSaveDraft = async (isSilent: boolean | React.MouseEvent = false, isFinal: boolean = false) => {
    const silent = typeof isSilent === 'boolean' ? isSilent : false;
    
    if (!silent) setIsDrafting(true);
    try {
      const payload = {
        id: draftId,
        is_draft: !isFinal,
        nama_lengkap: formData.namaLengkap,
        tempat_lahir: formData.tempatLahir,
        tanggal_lahir: formData.tanggalLahir,
        ktp: formData.ktp,
        jenis_kelamin: formData.jenisKelamin,
        telp_selular: formData.telpSelular,
        telp_rumah: formData.telpRumah,
        alamat: formData.alamat,
        rt: formData.rt,
        rw: formData.rw,
        kode_pos: formData.kodePos,
        status_kepemilikan: formData.statusKepemilikan,
        email: formData.email,
        paket_layanan: formData.paketLayanan,
        paket_spec: formData.paketSpec,
        vas: JSON.stringify({
          vas: formData.vas,
          routerText: formData.routerText,
          routerPrice: formData.routerPrice,
          routerQty: formData.routerQty,
          smartboxText: formData.smartboxText,
          smartboxQty: formData.smartboxQty,
          customText: formData.customText,
          customPrice: formData.customPrice,
          customQty: formData.customQty,
          densTvCheck: formData.densTvCheck,
          visionTvCheck: formData.visionTvCheck,
          addon1Check: formData.addon1Check,
          addon1Text: formData.addon1Text,
          area: formData.area,
          promoTerm: formData.promoTerm,
          promo: formData.promo,
          signature_base64: signatureData,
          cc_signature_base64: ccSignatureData,
          salesNameManual: salesNameInput
        }),
        promo: formData.promoTerm || formData.promo || null,
        router_qty: Number(formData.routerQty) || 0,
        smartbox_qty: Number(formData.smartboxQty) || 0,
        username_zentry: formData.username,
        tgl_pemasangan: formData.tglPemasangan,
        waktu_pemasangan: formData.waktuPemasangan,
        homepass_id: formData.homepassId,
        titik_koordinat: formData.titikKoordinat,
        catatan: formData.catatan,
        cc_nama: formData.ccNama,
        cc_nomor: formData.ccNomor,
        cc_berlaku: formData.ccBerlaku,
        cc_bank: formData.ccBank,
        cc_wewenang: formData.ccWewenang,
        biaya_pemasangan: Number(formData.biayaPemasangan) || 0,
        biaya_paket: Number(formData.biayaPaket) || 0,
        biaya_tambahan: Number(formData.biayaTambahan) || 0,
        biaya_services: Number(formData.biayaServices) || 0,
        biaya_addons: Number(formData.biayaAddons) || 0,
        biaya_perangkat: Number(formData.biayaPerangkat) || 0,
        biaya_lainnya: Number(formData.biayaLainnya) || 0,
        biaya_administrasi: 5000,
        biaya_ppn: kalkulasi.ppn,
        biaya_total: kalkulasi.total
      };

      const res = await fetch('/api/save-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        let errMsg = "Gagal menyimpan draft";
        try {
          const errData = await res.json();
          errMsg = errData.error || errMsg;
        } catch (e) {}
        if (!silent) throw new Error(errMsg);
        else console.error(errMsg);
      }
      
      const result = await res.json();
      
      if (!silent) {
        alert("Draft berhasil disimpan! Anda bisa melanjutkannya nanti di menu Riwayat.");
      }
      
      if (!draftId && result.draftId) {
        setDraftId(result.draftId);
        const url = new URL(window.location.href);
        url.searchParams.set('draft_id', result.draftId);
        window.history.replaceState({}, '', url);
      }
    } catch (e: any) {
      if (!silent) alert("Error: " + e.message);
    } finally {
      if (!silent) setIsDrafting(false);
    }
  };

  const handleSubmit = async (format: 'pdf' | 'jpg' = 'pdf') => {
    setIsSubmitting(true);
    try {
      await handleSaveDraft(true, true);
      
      const { data: { user } } = await supabase.auth.getUser();
      let salesSignatureBase64 = null;
      let leaderSignatureBase64 = null;
      
      if (user) {
        const { data: salesSig } = await supabase.from('signatures').select('signature_url').eq('user_id', user.id).maybeSingle();
        if (salesSig && salesSig.signature_url) salesSignatureBase64 = salesSig.signature_url;
        
        const { data: profile } = await supabase.from('users').select('supervisor_id').eq('id', user.id).maybeSingle();
        if (profile && profile.supervisor_id) {
          const { data: leaderSig } = await supabase.from('signatures').select('signature_url').eq('user_id', profile.supervisor_id).maybeSingle();
          if (leaderSig && leaderSig.signature_url) leaderSignatureBase64 = leaderSig.signature_url;
        }
      }

      const payload = {
        ...formData,
        id: draftId,
        signature: signatureData,
        ccSignature: ccSignatureData,
        hariPemasangan: getHari(formData.tglPemasangan),
        biayaPemasangan: formatRupiah(formData.biayaPemasangan),
        biayaPaket: formatRupiah(formData.biayaPaket),
        biayaTambahan: formatRupiah(formData.biayaTambahan),
        biayaServices: formatRupiah(formData.biayaServices),
        biayaAddons: formatRupiah(formData.biayaAddons),
        biayaPerangkat: formatRupiah(formData.biayaPerangkat),
        biayaLainnya: formatRupiah(formData.biayaLainnya),
        biayaPpn: formatRupiah(kalkulasi.ppn),
        biayaTotal: formatRupiah(kalkulasi.total),
        // Signatures fetched from client-side for dummy DB compatibility
        salesSignatureBase64,
        leaderSignatureBase64,
        salesNameManual: salesNameInput
      };

      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        let errDetails = 'Gagal generate PDF';
        try {
          const errBody = await response.json();
          if (errBody.details) errDetails = errBody.details;
        } catch(e) {}
        throw new Error(errDetails);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setPdfBlobUrl(url);
      
      if (format === 'jpg') {
        await handleDownloadJpg(url);
        alert('Form berhasil di-generate dan otomatis diunduh dalam format JPG!');
      } else {
        const a = document.createElement('a');
        a.href = url;
        a.download = `Form_ZEntry_${formData.namaLengkap || 'Pelanggan'}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        alert('PDF berhasil di-generate dan diunduh!');
      }
      
      // Set form as submitted to show the success screen with buttons
      setIsSubmitted(true);
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
      
    } catch (error: any) {
      console.error(error);
      alert(`Terjadi kesalahan saat generate PDF: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const [isGeneratingSppb, setIsGeneratingSppb] = useState(false);
  const [showSppbDropdown, setShowSppbDropdown] = useState(false);
  const sppbDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sppbDropdownRef.current && !sppbDropdownRef.current.contains(e.target as Node)) {
        setShowSppbDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDownloadSppb = async (format: 'pdf' | 'jpg') => {
    try {
      setIsGeneratingSppb(true);
      const payload = {
        ...formData,
        signature: signatureData,
      };

      const response = await fetch('/api/generate-sppb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Gagal generate SPPB');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      if (format === 'pdf') {
        const a = document.createElement('a');
        a.href = url;
        a.download = `Form_SPPB_${formData.namaLengkap || 'Pelanggan'}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
        
        const arrayBuffer = await blob.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        
        const scale = 2;
        const viewport = page.getViewport({ scale });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Canvas context null');
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({ canvasContext: context, viewport: viewport } as any).promise;
        
        canvas.toBlob((blob) => {
          if (blob) {
            const urlJpg = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = urlJpg;
            a.download = `Form_SPPB_${formData.namaLengkap || 'Pelanggan'}.jpg`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(urlJpg);
          }
        }, 'image/jpeg', 0.9);
      }
    } catch (error: any) {
      console.error(error);
      alert('Terjadi kesalahan saat generate SPPB.');
    } finally {
      setIsGeneratingSppb(false);
    }
  };

  const handleDownloadJpg = async (directUrl?: string) => {
    const urlToUse = directUrl || pdfBlobUrl;
    if (!urlToUse) return;
    try {
      setIsConvertingToJpg(true);
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

      // Ambil data array buffer langsung dari URL Blob (bypass worker XHR restrictions)
      const fetchRes = await fetch(urlToUse);
      const arrayBuffer = await fetchRes.arrayBuffer();

      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1);
      
      const scale = 2; // High resolution
      const viewport = page.getViewport({ scale });
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Canvas context null');
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };
      
      await page.render(renderContext as any).promise;
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Form_ZEntry_${formData.namaLengkap || 'Pelanggan'}.jpg`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
        }
        setIsConvertingToJpg(false);
      }, 'image/jpeg', 0.9);
    } catch (e) {
      console.error("Gagal convert JPG", e);
      alert('Gagal mengonversi PDF ke JPG.');
      setIsConvertingToJpg(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!pdfBlobUrl) return;
    const a = document.createElement('a');
    a.href = pdfBlobUrl;
    a.download = `Form_ZEntry_${formData.namaLengkap || 'Pelanggan'}.pdf`;
    document.body.appendChild(a);
    a.click();
  };

  const handleShareWa = async () => {
    const { generateWaTemplate } = await import("@/lib/waGenerator");
    const template = generateWaTemplate({ ...formData, salesNameManual: salesNameInput });
    const waUrl = `https://wa.me/?text=${encodeURIComponent(template)}`;
    window.open(waUrl, '_blank');
  };

  const handleCopyText = async () => {
    const { generateWaTemplate } = await import("@/lib/waGenerator");
    const template = generateWaTemplate({ ...formData, salesNameManual: salesNameInput });
    try {
      await navigator.clipboard.writeText(template);
      setIsWaCopied(true);
      setTimeout(() => setIsWaCopied(false), 2500);
    } catch(e) {
      alert('Gagal menyalin teks. Pastikan browser Anda mengizinkan akses Clipboard.');
    }
  };

  if (isSubmitted) {
    return (
      <div className="wizard-container animate-fade-in" style={{ textAlign: 'center', padding: 'var(--spacing-xxl) 0' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#D1FAE5', color: 'var(--success)', marginBottom: 'var(--spacing-lg)' }}>
          <CheckCircle size={40} />
        </div>
        <h2 className="h2" style={{ marginBottom: 'var(--spacing-sm)' }}>Pendaftaran Berhasil!</h2>
        <p className="text-body text-muted" style={{ marginBottom: 'var(--spacing-xl)' }}>
          Dokumen JPG telah otomatis diunduh ke perangkat Anda. <br/>
          Bentuk gambar (JPG) lebih mudah dibagikan langsung ke grup WhatsApp!
        </p>
        
        <div className="flex flex-col gap-md" style={{ maxWidth: '400px', margin: '0 auto' }}>
          <div style={{ padding: '15px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', marginBottom: '15px', textAlign: 'left' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#166534', fontWeight: 'bold' }}>
              Preview Format WhatsApp
            </h4>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '12px', color: '#374151', fontFamily: 'inherit', maxHeight: '200px', overflowY: 'auto', backgroundColor: '#ffffff', padding: '10px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
              {generateWaTemplate({ ...formData, salesNameManual: salesNameInput })}
            </pre>
          </div>
          <button type="button" className="btn btn-primary" onClick={handleShareWa} style={{ width: '100%', backgroundColor: '#25D366', borderColor: '#25D366', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
            Kirim ke WhatsApp
          </button>
          
          <button type="button" className="btn btn-secondary" onClick={handleCopyText} style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', backgroundColor: isWaCopied ? '#ECFDF5' : '', borderColor: isWaCopied ? '#10B981' : '', color: isWaCopied ? '#059669' : '', transition: 'all 0.2s' }}>
              {isWaCopied ? <Check size={18} /> : <Copy size={18} />}
              {isWaCopied ? 'Tersalin!' : 'Salin Teks Format Saja'}
            </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => handleDownloadJpg()} disabled={isConvertingToJpg || !pdfBlobUrl} style={{ width: '100%', backgroundColor: '#e2e8f0', color: '#1e293b', borderColor: '#cbd5e1' }}>
              {isConvertingToJpg ? 'Memproses...' : 'Unduh Ulang (JPG)'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleDownloadPdf} disabled={!pdfBlobUrl} style={{ width: '100%', backgroundColor: '#f8fafc', color: '#475569', borderColor: '#e2e8f0' }}>
              Unduh PDF
            </button>
          </div>

          <div style={{ padding: '15px', backgroundColor: '#fffbe1', borderRadius: '8px', border: '1px solid #fde047', marginTop: '10px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#854d0e', textAlign: 'left' }}>Form SPPB (Opsional)</h4>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => handleDownloadSppb('jpg')} disabled={isGeneratingSppb} style={{ width: '100%', fontSize: '13px', padding: '6px' }}>
                {isGeneratingSppb ? 'Loading...' : 'Unduh SPPB (JPG)'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => handleDownloadSppb('pdf')} disabled={isGeneratingSppb} style={{ width: '100%', fontSize: '13px', padding: '6px' }}>
                {isGeneratingSppb ? 'Loading...' : 'Unduh SPPB (PDF)'}
              </button>
            </div>
          </div>

          <a href="/sales/history" className="btn btn-outline" style={{ width: '100%', marginTop: 'var(--spacing-md)' }}>
            Kembali ke Riwayat
          </a>
        </div>
      </div>
    );
  }

  const STEP_TITLES = ['Data Pelanggan', 'Data Alamat', 'Paket & Layanan', 'Dokumen', 'Rincian Harga', 'Finalisasi'];
  const STEP_ICONS = ['👤', '📍', '📦', '📄', '✅', '📝'];
  const STEP_TIPS = [
      [
      'Pastikan data sesuai dengan KTP',
      'Periksa kembali NIK, nama, dan tanggal lahir',
      'Data yang benar mempercepat proses verifikasi',
      'Simpan draft jika belum selesai'
    ],
      [
      'Wajib sama persis dengan alamat terdaftar pada Home ID',
      'Baris 1: Nama perumahan jika ada (lalu Enter)',
      'Baris 2: Nama jalan dan nomor rumah (lalu Enter)',
      'Baris 3: Kelurahan/Desa - Kecamatan (AREN JAYA - BEKASI TIMUR)'
    ],
      [
      'Pilih paket yang sesuai dengan kebutuhan internet',
      'Periksa promo atau diskon yang sedang berlaku',
      'Pastikan area jangkauan (servis) sudah sesuai',
      'Tambahkan VAS jika pelanggan membutuhkan'
    ],
    [
      'Unggah foto KTP asli dengan jelas dan tidak buram',
      'Pastikan seluruh sudut dokumen masuk ke dalam frame',
      'Format file yang didukung: JPG, PNG, atau PDF',
      'Periksa kembali lampiran sebelum melanjutkan ke tahap verifikasi'
    ],
    [
      'Periksa ringkasan paket dan biaya yang telah dipilih',
      'Pastikan pelanggan telah membaca syarat & ketentuan',
      'Konfirmasi kembali total biaya bulanan kepada pelanggan',
      'Lakukan tanda tangan persetujuan kontak darurat jika diperlukan'
    ],
    [
      'Pastikan tanda tangan pelanggan jelas dan berada di dalam kotak',
      'Tanda tangan Leader/Sales akan terlampir secara otomatis',
      'Tekan tombol Simpan & Generate PDF untuk menghasilkan dokumen resmi',
      'Bagikan ringkasan PDF ke grup WhatsApp atau unduh arsipnya'
    ]
  ];

  return (
    <div className="grid-mobile-1" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '28px', alignItems: 'start' }}>
      
      {/* Left Column: Progress Bar + Form Card */}
      <div style={{ minWidth: 0 }}>
        
        {/* Progress Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', overflowX: 'auto', paddingBottom: '12px', gap: '8px' }}>
          {[1, 2, 3, 4, 5, 6].map((step, idx) => {
            const isActive = step === currentStep;
            const isDone = step < currentStep;
            return (
              <React.Fragment key={step}>
                <div 
                  onClick={() => setCurrentStep(step)}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px', 
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                >
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: isDone ? '#10B981' : isActive ? '#0F172A' : '#F1F5F9',
                    color: isDone || isActive ? 'white' : '#94A3B8',
                    fontWeight: 700, fontSize: '0.85rem',
                    border: isDone || isActive ? 'none' : '1px solid #CBD5E1',
                    boxShadow: isActive ? '0 4px 10px -2px rgba(37, 99, 235, 0.4)' : 'none',
                    transition: 'all 0.3s ease'
                  }}>
                    {isDone ? <CheckCircle size={16} /> : step}
                  </div>
                  <span style={{
                    fontSize: '0.85rem',
                    fontWeight: isActive || isDone ? 700 : 500,
                    color: isActive ? '#0F172A' : isDone ? '#0F172A' : '#94A3B8',
                    whiteSpace: 'nowrap'
                  }}>
                    {STEP_TITLES[idx]}
                  </span>
                </div>
                {step < 6 && (
                  <div style={{ flex: 1, minWidth: '15px', height: '2px', backgroundColor: isDone ? '#10B981' : '#E2E8F0', margin: '0 6px' }} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* White Card for Current Step Form */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: 'clamp(16px, 5vw, 32px)', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)' }}>
          
          {/* Step Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px', borderBottom: '1px solid #F1F5F9', paddingBottom: '20px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#F1F5F9', color: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
              {STEP_ICONS[currentStep - 1]}
            </div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#0F172A' }}>
              {currentStep}. {STEP_TITLES[currentStep - 1]}
            </h2>
          </div>

          {/* Form Content Area */}
          <div style={{ minHeight: '380px' }}>
            
            {/* STEP 1 */}
            {currentStep === 1 && (
              <div className="animate-fade-in">
                {/* OCR Scanner Banner (Clean Enterprise SaaS) */}
                <div style={{ 
                  background: '#F8FAFC', 
                  border: '1px solid #E2E8F0', 
                  borderRadius: '10px', 
                  padding: '18px 20px', 
                  marginBottom: '28px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  flexWrap: 'wrap', 
                  gap: '16px' 
                }}>
                  <div style={{ flex: '1 1 340px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <div style={{ 
                        width: '28px', height: '28px', borderRadius: '6px', 
                        backgroundColor: '#0F172A', color: '#FFFFFF', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center' 
                      }}>
                        <Scan size={15} strokeWidth={2.2} />
                      </div>
                      <span style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.925rem', letterSpacing: '-0.2px' }}>
                        Scan e-KTP Otomatis
                      </span>
                      <span style={{ 
                        background: '#E2E8F0', 
                        color: '#475569', 
                        fontSize: '0.68rem', 
                        fontWeight: 700, 
                        padding: '2px 6px', 
                        borderRadius: '4px', 
                        letterSpacing: '0.5px' 
                      }}>
                        BETA
                      </span>
                    </div>
                    
                    <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0 0 14px 0', lineHeight: 1.4 }}>
                      Pindai foto e-KTP fisik untuk mengisi NIK, Nama, dan Tempat/Tanggal Lahir secara otomatis.
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
                      <button 
                        type="button" 
                        onClick={() => cameraInputRef.current?.click()} 
                        disabled={isOcring} 
                        style={{ 
                          background: '#0F172A', 
                          border: '1px solid #0F172A', 
                          color: '#FFFFFF', 
                          padding: '7px 14px', 
                          borderRadius: '6px', 
                          fontWeight: 600, 
                          fontSize: '0.825rem', 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '6px', 
                          cursor: isOcring ? 'not-allowed' : 'pointer', 
                          transition: 'all 0.15s ease' 
                        }}
                        onMouseEnter={(e) => { if (!isOcring) e.currentTarget.style.backgroundColor = '#1E293B'; }}
                        onMouseLeave={(e) => { if (!isOcring) e.currentTarget.style.backgroundColor = '#0F172A'; }}
                      >
                        <Camera size={14} strokeWidth={2} /> 
                        <span>{isOcring ? 'Memindai...' : 'Buka Kamera'}</span>
                      </button>

                      <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()} 
                        disabled={isOcring} 
                        style={{ 
                          background: '#FFFFFF', 
                          border: '1px solid #CBD5E1', 
                          color: '#334155', 
                          padding: '7px 14px', 
                          borderRadius: '6px', 
                          fontWeight: 600, 
                          fontSize: '0.825rem', 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '6px', 
                          cursor: isOcring ? 'not-allowed' : 'pointer', 
                          transition: 'all 0.15s ease' 
                        }}
                        onMouseEnter={(e) => { if (!isOcring) e.currentTarget.style.backgroundColor = '#F1F5F9'; }}
                        onMouseLeave={(e) => { if (!isOcring) e.currentTarget.style.backgroundColor = '#FFFFFF'; }}
                      >
                        <Upload size={14} strokeWidth={2} /> 
                        <span>{isOcring ? 'Memindai...' : 'Pilih File Galeri'}</span>
                      </button>

                      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleOcrUpload} disabled={isOcring} style={{ display: 'none' }} />
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleOcrUpload} disabled={isOcring} style={{ display: 'none' }} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px' }}>
                      <ShieldCheck size={13} color="#10B981" />
                      <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                        Privasi terjamin: Foto diproses langsung di memori browser dan tidak disimpan di server.
                      </span>
                    </div>
                  </div>

                  {/* Clean Vector Visual Placeholder (No fake 3D cartoon, no emojis) */}
                  <div className="hidden-mobile" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '120px',
                    height: '82px',
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    padding: '8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                  }}>
                    <div style={{
                      width: '100%',
                      height: '100%',
                      border: '1px dashed #CBD5E1',
                      borderRadius: '5px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      background: '#F8FAFC'
                    }}>
                      <Camera size={18} color="#64748B" strokeWidth={1.8} />
                      <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Frame KTP</span>
                    </div>
                  </div>
                </div>

            <div className="input-group">
              <label className="input-label">Nama Lengkap</label>
              <input type="text" name="namaLengkap" className="input-field" value={formData.namaLengkap} onChange={handleChange} />
            </div>
            
            <div className="flex stack-mobile gap-md">
              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label">Tempat Lahir</label>
                <input type="text" name="tempatLahir" className="input-field" value={formData.tempatLahir} onChange={handleChange} />
              </div>
              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label">Tanggal Lahir</label>
                <input type="date" name="tanggalLahir" className="input-field" value={formData.tanggalLahir} onChange={handleChange} />
              </div>
            </div>

            <div className="flex stack-mobile gap-md">
              <div className="input-group" style={{ flex: 2 }}>
                <label className="input-label">Nomor Identitas (KTP)</label>
                <input type="text" name="ktp" className="input-field" maxLength={16} value={formData.ktp} onChange={handleNumberChange} placeholder="Harus 16 Digit Angka" />
                {formData.ktp.length > 0 && formData.ktp.length !== 16 && (
                  <span style={{ color: 'red', fontSize: '12px' }}>KTP harus 16 digit angka ({formData.ktp.length}/16)</span>
                )}
              </div>
              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label">Jenis Kelamin</label>
                <select name="jenisKelamin" className="input-field" value={formData.jenisKelamin} onChange={handleChange}>
                  <option value="">Pilih...</option>
                  <option value="Pria">Pria</option>
                  <option value="Wanita">Wanita</option>
                </select>
              </div>
            </div>

            <div className="flex stack-mobile gap-md">
              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label">Telepon Selular</label>
                <input type="tel" name="telpSelular" className="input-field" value={formData.telpSelular} onChange={handleChange} />
              </div>
              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label">Telepon Selular 2 (Opsional)</label>
                <input type="tel" name="telpRumah" className="input-field" value={formData.telpRumah} onChange={handleChange} />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 */}
          {currentStep === 2 && (
          <div className="animate-fade-in">
            <div className="input-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="input-label" style={{ fontWeight: 600, color: '#0F172A', margin: 0 }}>
                  Alamat Lengkap
                </label>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#0284C7', backgroundColor: '#F0F9FF', border: '1px solid #BAE6FD', padding: '2px 8px', borderRadius: '4px' }}>
                  Wajib Sesuai Home ID
                </span>
              </div>
              <textarea 
                name="alamat" 
                className="input-field" 
                rows={4} 
                value={formData.alamat} 
                onChange={handleChange}
                placeholder="Baris 1: Nama perumahan jika ada (tekan Enter)&#10;Baris 2: Nama jalan dan nomor rumah (tekan Enter)&#10;Baris 3: Kelurahan/desa - kecamatan (Contoh: AREN JAYA - BEKASI TIMUR)"
                style={{ resize: 'vertical', minHeight: '98px', lineHeight: '1.5' }}
              />
              
              {/* Petunjuk / Note Alamat */}
              <div style={{
                marginTop: '8px',
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px'
              }}>
                <Info size={16} color="#0284C7" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.785rem', lineHeight: '1.5', color: '#475569' }}>
                  <div style={{ fontWeight: 600, color: '#0F172A', marginBottom: '4px' }}>
                    Ketentuan Format Alamat (Wajib Dienter Per Baris & Sesuai Home ID):
                  </div>
                  <div>
                    • <strong>Wajib Sesuai Home ID:</strong> Alamat harus sama persis dengan yang tertera pada <em>Home ID</em> agar tidak terkena revisi saat diserahkan ke pihak admin untuk pembuatan CID.
                  </div>
                  <div style={{ marginTop: '5px' }}>
                    • <strong>Wajib Dienter Sesuai Format 3 Baris:</strong>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '4px', paddingLeft: '8px', borderLeft: '2px solid #BAE6FD' }}>
                      <div>
                        <strong>Baris 1:</strong> Nama perumahan (jika lokasi pelanggan di dalam perumahan) &rarr; lalu tekan <kbd style={{ padding: '1px 5px', fontSize: '0.7rem', backgroundColor: '#EDE9FE', color: '#6D28D9', borderRadius: '4px', border: '1px solid #DDD6FE', fontWeight: 600 }}>Enter</kbd>
                      </div>
                      <div>
                        <strong>Baris 2:</strong> Nama jalan, RT/RW, dan nomor rumah (Contoh: <em>Jl. Maluku 14 RT009/009 No. 122</em>) &rarr; lalu tekan <kbd style={{ padding: '1px 5px', fontSize: '0.7rem', backgroundColor: '#EDE9FE', color: '#6D28D9', borderRadius: '4px', border: '1px solid #DDD6FE', fontWeight: 600 }}>Enter</kbd>
                      </div>
                      <div>
                        <strong>Baris 3:</strong> Kelurahan/Desa - Kecamatan dengan pemisah strip (Contoh: <strong>AREN JAYA - BEKASI TIMUR</strong>)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex stack-mobile gap-md">
              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label">RT</label>
                <input type="text" name="rt" className="input-field" maxLength={3} value={formData.rt} onChange={handleChange} />
              </div>
              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label">RW</label>
                <input type="text" name="rw" className="input-field" maxLength={3} value={formData.rw} onChange={handleChange} />
              </div>
              <div className="input-group" style={{ flex: 2 }}>
                <label className="input-label">Kode Pos</label>
                <input type="text" name="kodePos" className="input-field" maxLength={5} value={formData.kodePos} onChange={handleChange} />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label" style={{ marginBottom: 'var(--spacing-sm)' }}>Status Kepemilikan</label>
              <div className="flex stack-mobile gap-md">
                <label className="flex items-center gap-sm" style={{ cursor: 'pointer' }}>
                  <input type="radio" name="statusKepemilikan" value="Pemilik" checked={formData.statusKepemilikan === 'Pemilik'} onChange={handleChange} /> Pemilik
                </label>
                <label className="flex items-center gap-sm" style={{ cursor: 'pointer' }}>
                  <input type="radio" name="statusKepemilikan" value="Penyewa" checked={formData.statusKepemilikan === 'Penyewa'} onChange={handleChange} /> Penyewa
                </label>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Alamat Email Pelanggan</label>
              <input type="email" name="email" className="input-field" value={formData.email} onChange={handleChange} />
            </div>
          </div>
        )}
          {/* STEP 3 */}
          {currentStep === 3 && (
            <div className="animate-fade-in">
              {(() => {
                const areaData = PACKAGES_DATA[formData.area] || {};
              const categoryMap: Record<string, string> = { 'Fiber': 'Fiber Reguler', 'Safe': 'Fiber Safe', 'Soho': 'Fiber Soho' };
              const selectedCategoryName = categoryMap[formData.paketLayanan];
              
              let availableTerms: string[] = [];
              if (areaData[selectedCategoryName]) {
                availableTerms = areaData[selectedCategoryName].terms || [];
              } else {
                availableTerms = Array.from(new Set(Object.values(areaData).flatMap((cat: any) => cat.terms || []))) as string[];
              }

              return (
                <>
                  <div className="flex stack-mobile gap-md" style={{ marginBottom: 'var(--spacing-md)' }}>
                    <div className="input-group" style={{ flex: 1 }}>
                      <label className="input-label">Servis</label>
                      <select name="area" className="input-field" value={formData.area} onChange={handleChange}>
                        {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                    </div>
                    <div className="input-group" style={{ flex: 1 }}>
                      <label className="input-label">Promo</label>
                      <select name="promoTerm" className="input-field" value={formData.promoTerm} onChange={handleChange}>
                        {availableTerms.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label" style={{ marginBottom: 'var(--spacing-sm)' }}>Paket Layanan Utama</label>
                    <div className="flex-col gap-sm">
                      {['Fiber', 'Safe', 'Soho'].map((cat) => {
                        const categoryMap: Record<string, string> = { 'Fiber': 'Fiber Reguler', 'Safe': 'Fiber Safe', 'Soho': 'Fiber Soho' };
                        const categoryName = categoryMap[cat];
                        const hasCategory = areaData && areaData[categoryName];
                        
                        if (!hasCategory) return null; // Hide if not available in this area
                        
                        return (
                          <div key={cat} className="card flex gap-md" style={{ padding: 'var(--spacing-md)', borderColor: formData.paketLayanan === cat ? 'var(--solasi-blue)' : 'var(--border-color)', flexWrap: 'wrap', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '140px' }}>
                              <input type="radio" name="paketLayanan" value={cat} checked={formData.paketLayanan === cat} onChange={handleChange} style={{ flexShrink: 0 }} />
                              <span style={{ fontWeight: 600 }}>
                                {cat === 'Fiber' ? 'CBN Fiber' : cat === 'Safe' ? 'CBN Fiber Safe' : 'CBN Fiber Pro'}
                              </span>
                            </div>
                            {formData.paketLayanan === cat && (
                              <select name="paketSpec" className="input-field" value={formData.paketSpec} onChange={handleChange} style={{ flex: '1 1 150px' }}>
                                <option value="">-- Pilih Kecepatan --</option>
                                {areaData[categoryName].speeds.map((speed: string) => (
                                  <option key={speed} value={speed}>{speed}</option>
                                ))}
                              </select>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              );
            })()}

            <div className="input-group" style={{ marginTop: 'var(--spacing-xl)' }}>
              <label className="input-label" style={{ marginBottom: 'var(--spacing-sm)' }}>VAS (Value Added Service) - Bisa diketik untuk mencari</label>
              {[0, 1, 2].map(index => (
                <div key={index} style={{ marginBottom: 'var(--spacing-sm)' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>VAS {index + 1}</label>
                  <Select
                    instanceId={`vas-select-${index}`}
                    name={`vas-${index}`}
                    options={[
                      {
                        label: 'VAS Berbayar',
                        options: VAS_DATA.filter(v => v.category === 'Berbayar').map(v => ({ value: v.name, label: `${v.name} (+Rp ${v.price.toLocaleString('id-ID')})` }))
                      },
                      {
                        label: 'VAS Free',
                        options: VAS_DATA.filter(v => v.category === 'Free').map(v => ({ value: v.name, label: `${v.name} (Gratis)` }))
                      }
                    ]}
                    className="basic-single-select"
                    classNamePrefix="select"
                    value={
                      formData.vas[index] ? {
                        value: formData.vas[index],
                        label: VAS_DATA.find(v => v.name === formData.vas[index])?.category === 'Free' 
                          ? `${formData.vas[index]} (Gratis)` 
                          : `${formData.vas[index]} (+Rp ${(VAS_DATA.find(v => v.name === formData.vas[index])?.price || 0).toLocaleString('id-ID')})`
                      } : null
                    }
                    onChange={(selected) => handleSingleVasChange(index, selected)}
                    placeholder={`Pilih VAS ${index + 1}...`}
                    isClearable
                    styles={{
                      control: (base) => ({
                        ...base,
                        borderColor: 'var(--border-color)',
                        padding: '2px',
                        borderRadius: '8px'
                      })
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="input-group" style={{ marginTop: 'var(--spacing-xl)' }}>
              <label className="input-label" style={{ marginBottom: 'var(--spacing-sm)' }}>Perangkat Tambahan</label>
              <div className="flex stack-mobile gap-md" style={{ marginBottom: 'var(--spacing-md)' }}>
                <label className="flex items-center gap-sm" style={{ minWidth: '100px', fontSize: '0.85rem', lineHeight: '1.2' }}>Wireless Router</label>
                <input type="text" name="routerText" className="input-field" placeholder="Keterangan (Merek/Tipe)..." value={formData.routerText} onChange={handleChange} style={{ flex: 1, fontSize: '0.85rem' }} />
                <input type="text" name="routerPrice" className="input-field" placeholder="Rp Harga" style={{ width: '100px', fontSize: '0.85rem' }} value={formData.routerPrice} onChange={handleNumberChange} />
                <input type="number" name="routerQty" className="input-field" placeholder="Unit" style={{ width: '70px', fontSize: '0.85rem' }} value={formData.routerQty} onChange={handleChange} />
              </div>
              <div className="flex stack-mobile gap-md" style={{ marginBottom: 'var(--spacing-md)' }}>
                <label className="flex items-center gap-sm" style={{ minWidth: '100px', fontSize: '0.85rem', lineHeight: '1.2' }}>Smartbox</label>
                <select name="smartboxText" className="input-field" value={formData.smartboxText} onChange={handleChange} style={{ flex: 1, fontSize: '0.85rem' }}>
                  <option value="">-- Pilih --</option>
                  <option value="DensTV">DensTV (Rp 45.000)</option>
                  <option value="DensTV V.3">DensTV V.3 (Rp 55.000)</option>
                  <option value="DensTV V.3 (Area JMS)">DensTV V.3 Area JMS (Rp 60.000)</option>
                </select>
                <input type="number" name="smartboxQty" className="input-field" placeholder="Unit" style={{ width: '70px', fontSize: '0.85rem' }} value={formData.smartboxQty} onChange={handleChange} />
              </div>
              <div className="flex stack-mobile gap-md" style={{ marginBottom: 'var(--spacing-md)' }}>
                <label className="flex items-center gap-sm" style={{ minWidth: '100px', fontSize: '0.85rem', lineHeight: '1.2' }}>Custom Perangkat</label>
                <input type="text" name="customText" className="input-field" placeholder="Nama & Ket Perangkat..." value={formData.customText} onChange={handleChange} style={{ flex: 1, fontSize: '0.85rem' }} />
                <input type="text" name="customPrice" className="input-field" placeholder="Rp Harga" style={{ width: '100px', fontSize: '0.85rem' }} value={formData.customPrice} onChange={handleNumberChange} />
                <input type="number" name="customQty" className="input-field" placeholder="Unit" style={{ width: '70px', fontSize: '0.85rem' }} value={formData.customQty} onChange={handleChange} />
              </div>
            </div>

            <div className="input-group" style={{ marginTop: 'var(--spacing-xl)' }}>
              <label className="input-label" style={{ marginBottom: 'var(--spacing-sm)' }}>Paket Add-On TV (Opsional)</label>
              
              <div className="flex stack-mobile gap-md">
                <label className="flex items-center gap-sm" style={{ fontSize: '0.85rem', lineHeight: '1.2', flex: 1 }}>
                  <input type="checkbox" name="densTvCheck" checked={formData.densTvCheck} onChange={handleChange} style={{ flexShrink: 0 }} /> 
                  <span style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>Dens.TV+ Apps</span>
                </label>
                <label className="flex items-center gap-sm" style={{ fontSize: '0.85rem', lineHeight: '1.2', flex: 1 }}>
                  <input type="checkbox" name="visionTvCheck" checked={formData.visionTvCheck} onChange={handleChange} style={{ flexShrink: 0 }} /> 
                  <span style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>Vision+ Premium Sports</span>
                </label>
              </div>

              <div className="flex items-center gap-md" style={{ marginTop: 'var(--spacing-sm)' }}>
                <label className="flex items-center gap-sm" style={{ fontSize: '0.85rem', lineHeight: '1.2', minWidth: '130px' }}>
                  <input type="checkbox" name="addon1Check" checked={formData.addon1Check} onChange={handleChange} style={{ flexShrink: 0 }} /> 
                  <span style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>Lainnya (Custom)</span>
                </label>
                <input type="text" name="addon1Text" className="input-field" placeholder="Contoh: Dramaflix +50Mbps..." value={formData.addon1Text} onChange={handleChange} style={{ flex: 1, fontSize: '0.85rem' }} />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {currentStep === 4 && (
          <div className="animate-fade-in">
            <div className="input-group">
              <label className="input-label">Username ZEntry</label>
              <div className="flex items-center">
                <input type="text" name="username" className="input-field" style={{ flex: 1 }} value={formData.username} onChange={handleChange} />
              </div>
            </div>

            <div className="flex stack-mobile gap-md">
              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label">Homepass ID</label>
                <input type="text" name="homepassId" className="input-field" value={formData.homepassId} onChange={handleChange} placeholder="Contoh: CBN-12345" />
              </div>
              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label">Titik Koordinat (Lat, Long)</label>
                <input type="text" name="titikKoordinat" className="input-field" value={formData.titikKoordinat} onChange={handleChange} placeholder="-6.2088, 106.8456" />
              </div>
            </div>

            <div style={{ marginTop: 'var(--spacing-lg)' }}>
              <label className="flex items-center gap-sm cursor-pointer" style={{ marginBottom: 'var(--spacing-md)' }}>
                <input 
                  type="checkbox" 
                  checked={formData.tglPemasangan === 'Secepatnya'} 
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData(prev => ({ ...prev, tglPemasangan: 'Secepatnya', waktuPemasangan: '' }));
                    } else {
                      setFormData(prev => ({ ...prev, tglPemasangan: '' }));
                    }
                  }} 
                  style={{ width: '18px', height: '18px' }}
                />
                <span style={{ fontWeight: 600, color: 'var(--solasi-blue)', fontSize: '1rem' }}>Pemasangan Secepatnya (ASAP)</span>
              </label>

              {formData.tglPemasangan !== 'Secepatnya' && (
                <div className="flex stack-mobile gap-md">
                  <div className="input-group" style={{ flex: 1 }}>
                    <label className="input-label">Tanggal Pemasangan</label>
                    <input type="date" name="tglPemasangan" className="input-field" value={formData.tglPemasangan} onChange={handleChange} />
                  </div>
                  <div className="input-group" style={{ flex: 1 }}>
                    <label className="input-label">Hari (Otomatis)</label>
                    <input type="text" className="input-field" value={getHari(formData.tglPemasangan)} readOnly style={{ backgroundColor: '#f0f0f0' }} />
                  </div>
                  <div className="input-group" style={{ flex: 1 }}>
                    <label className="input-label">Waktu Pemasangan</label>
                    <select name="waktuPemasangan" className="input-field" value={formData.waktuPemasangan} onChange={handleChange}>
                      <option value="">Pilih...</option>
                      <option value="09.00-11.00">09.00 - 11.00</option>
                      <option value="11.00-13.00">11.00 - 13.00</option>
                      <option value="13.00-15.00">13.00 - 15.00</option>
                      <option value="15.00-17.00">15.00 - 17.00</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="input-group" style={{ marginTop: 'var(--spacing-md)' }}>
              <label className="input-label">Catatan (Notes)</label>
              <textarea name="catatan" className="input-field" rows={4} value={formData.catatan} onChange={handleChange} placeholder="Masukkan catatan opsional..."></textarea>
            </div>
          </div>
        )}

        {/* STEP 5 */}
        {currentStep === 5 && (
          <div className="animate-fade-in">
            <div className="flex stack-mobile gap-lg">
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 className="text-large" style={{ marginBottom: 'var(--spacing-md)', color: 'var(--solasi-blue)' }}>Kartu Kredit</h4>
                
                <div className="input-group">
                  <label className="input-label">Nama Pada Kartu</label>
                  <input type="text" name="ccNama" className="input-field" value={formData.ccNama} onChange={handleChange} />
                </div>
                <div className="input-group">
                  <label className="input-label">Nomor Kartu</label>
                  <input type="text" name="ccNomor" className="input-field" value={formData.ccNomor} onChange={handleChange} />
                </div>
                <div className="flex stack-mobile gap-md">
                  <div className="input-group" style={{ flex: 1, minWidth: 0 }}>
                    <label className="input-label">Masa Berlaku (MM/YYYY)</label>
                    <input type="text" name="ccBerlaku" className="input-field" placeholder="01/2028" value={formData.ccBerlaku} onChange={handleChange} />
                  </div>
                  <div className="input-group" style={{ flex: 1, minWidth: 0 }}>
                    <label className="input-label">Nama Bank</label>
                    <input type="text" name="ccBank" className="input-field" value={formData.ccBank} onChange={handleChange} />
                  </div>
                </div>
                
                <label className="flex items-start gap-sm mt-md" style={{ cursor: 'pointer', fontSize: '13px', lineHeight: '1.4' }}>
                  <input type="checkbox" name="ccWewenang" checked={formData.ccWewenang} onChange={handleChange} style={{ marginTop: '3px', flexShrink: 0 }} />
                  <span style={{ wordBreak: 'break-word' }}>
                    Saya memberikan wewenang kepada PT. Cyberindo Aditama untuk melakukan penagihan melalui kartu kredit saya untuk segala biaya CBN yang saya gunakan selama masa berlangganan.
                    <br/><i style={{ color: 'var(--text-muted)' }}>I authorize PT. Cyberindo Aditama to debit my credit card for all my CBN expenses during subscription period.</i>
                  </span>
                </label>

                {/* TANDA TANGAN KARTU KREDIT */}
                <div style={{ marginTop: 'var(--spacing-lg)' }}>
                  <label className="input-label">Tanda Tangan Pemegang Kartu</label>
                  <div style={{ border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--bg-color)', overflow: 'hidden' }}>
                    <SignatureCanvas 
                      ref={ccSigCanvas}
                      onEnd={onCCSigEnd}
                      clearOnResize={false}
                      minWidth={2}
                      maxWidth={3.5}
                      canvasProps={{
                        className: 'signature-canvas',
                        style: { width: '100%', height: '120px', cursor: 'crosshair', touchAction: 'none' }
                      }} 
                    />
                  </div>
                  <div className="flex justify-end" style={{ marginTop: '8px' }}>
                    <button className="btn" style={{ padding: '4px 8px', fontSize: '12px', border: '1px solid var(--border-color)' }} onClick={clearCCSignature}>Hapus Tanda Tangan CC</button>
                  </div>
                  {ccSignatureData && <span style={{fontSize: '12px', color: 'green', display: 'block', textAlign: 'right', marginTop: '4px'}}>✓ Tersimpan</span>}
                </div>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 className="text-large" style={{ marginBottom: 'var(--spacing-md)', color: 'var(--solasi-blue)' }}>Rincian Biaya (Auto-Kalkulasi)</h4>
                
                <div className="flex flex-col gap-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-small">Biaya Pemasangan</span>
                    <div className="flex items-center gap-sm">
                      <span className="text-muted">Rp</span>
                      <input type="text" name="biayaPemasangan" className="input-field" style={{ width: '120px', padding: '4px', textAlign: 'right', transition: 'all 0.2s' }} value={formatRupiah(formData.biayaPemasangan).replace('Rp ', '')} onChange={handleNumberChange} placeholder="0" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-small">Biaya Paket</span>
                    <div className="flex items-center gap-sm">
                      <span className="text-muted">Rp</span>
                      <input type="text" name="biayaPaket" className="input-field" style={{ width: '120px', padding: '4px', textAlign: 'right', transition: 'all 0.2s' }} value={formatRupiah(formData.biayaPaket).replace('Rp ', '')} onChange={handleNumberChange} placeholder="0" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-small">Biaya Tambahan</span>
                    <div className="flex items-center gap-sm">
                      <span className="text-muted">Rp</span>
                      <input type="text" name="biayaTambahan" className="input-field" style={{ width: '120px', padding: '4px', textAlign: 'right', transition: 'all 0.2s' }} value={formatRupiah(formData.biayaTambahan).replace('Rp ', '')} onChange={handleNumberChange} placeholder="0" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-small">Biaya Services (VAS)</span>
                    <div className="flex items-center gap-sm">
                      <span className="text-muted">Rp</span>
                      <input type="text" name="biayaServices" className="input-field" style={{ width: '120px', padding: '4px', textAlign: 'right', transition: 'all 0.2s' }} value={formatRupiah(formData.biayaServices).replace('Rp ', '')} onChange={handleNumberChange} placeholder="0" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-small">Biaya Add Ons</span>
                    <div className="flex items-center gap-sm">
                      <span className="text-muted">Rp</span>
                      <input type="text" name="biayaAddons" className="input-field" style={{ width: '120px', padding: '4px', textAlign: 'right', transition: 'all 0.2s' }} value={formatRupiah(formData.biayaAddons).replace('Rp ', '')} onChange={handleNumberChange} placeholder="0" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-small">Biaya Perangkat</span>
                    <div className="flex items-center gap-sm">
                      <span className="text-muted">Rp</span>
                      <input type="text" name="biayaPerangkat" className="input-field" style={{ width: '120px', padding: '4px', textAlign: 'right', transition: 'all 0.2s' }} value={formatRupiah(formData.biayaPerangkat).replace('Rp ', '')} onChange={handleNumberChange} placeholder="0" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-small">Biaya Lainnya</span>
                    <div className="flex items-center gap-sm">
                      <span className="text-muted">Rp</span>
                      <input type="text" name="biayaLainnya" className="input-field" style={{ width: '120px', padding: '4px', textAlign: 'right', transition: 'all 0.2s', backgroundColor: '#f0f0f0' }} value={formatRupiah(formData.biayaLainnya).replace('Rp ', '')} readOnly />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-small">PPN (Auto)</span>
                    <div className="flex items-center gap-sm">
                      <span className="text-muted">Rp</span>
                      <input type="text" className="input-field" style={{ width: '120px', padding: '4px', textAlign: 'right', backgroundColor: '#f0f0f0' }} value={formatRupiah(kalkulasi.ppn).replace('Rp ', '')} readOnly />
                    </div>
                  </div>
                  <hr style={{ margin: '8px 0', borderColor: 'var(--border-color)' }} />
                  <div className="flex items-center justify-between" style={{ fontWeight: 'bold' }}>
                    <span>TOTAL (Auto)</span>
                    <div className="flex items-center gap-sm">
                      <span className="text-muted" style={{ fontWeight: 'bold' }}>Rp</span>
                      <input type="text" className="input-field" style={{ width: '120px', padding: '4px', textAlign: 'right', fontWeight: 'bold', backgroundColor: '#e6f7ff', borderColor: 'var(--solasi-blue)', color: 'var(--solasi-blue)' }} value={formatRupiah(kalkulasi.total).replace('Rp ', '')} readOnly />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6 */}
        {currentStep === 6 && (
          <div className="animate-fade-in">
            <h3 className="text-lg font-semibold mb-2">Nama & Tanda Tangan Sales</h3>
            <p className="text-muted" style={{ marginBottom: 'var(--spacing-sm)' }}>Silakan masukkan nama dan tanda tangan Sales. (Kotak TTD Pelanggan dibiarkan kosong untuk tanda tangan basah).</p>
            
            <div className="input-group" style={{ marginBottom: '16px', width: '100%' }}>
                <label className="input-label">Nama Lengkap Sales</label>
                <input type="text" className="input-field" style={{ width: '100%' }} placeholder="Ketik nama lengkap Sales..." value={salesNameInput} onChange={(e) => setSalesNameInput(e.target.value)} />
              </div>
            <label className="input-label">Tanda Tangan Sales</label>

              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <Upload size={18} color="#475569" style={{ marginTop: '2px' }} />
                  <div>
                    <span style={{ fontSize: '0.85rem', color: '#0F172A', fontWeight: 600, display: 'block' }}>Import dari Galeri (Disarankan)</span>
                    <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Gunakan gambar tanda tangan berlatar transparan agar menyatu dengan dokumen PDF.</span>
                  </div>
                </div>
                <button type="button" onClick={() => sigFileInputRef.current?.click()} style={{ background: 'white', border: '1px solid #CBD5E1', color: '#334155', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, marginTop: '10px', cursor: 'pointer', transition: 'all 0.2s' }}>
                  Pilih Gambar Tanda Tangan
                </button>
                <input ref={sigFileInputRef} type="file" accept="image/*" onChange={handleSigImageUpload} style={{ display: 'none' }} />
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 500 }}>Atau gambar manual di bawah ini:</div>
              <div style={{ border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--bg-color)', overflow: 'hidden' }}>

              <SignatureCanvas 
                ref={sigCanvas}
                onEnd={onSigEnd}
                clearOnResize={false}
                minWidth={2.5}
                maxWidth={4}
                canvasProps={{
                  className: 'signature-canvas',
                  style: { width: '100%', height: '200px', cursor: 'crosshair', touchAction: 'none' }
                }} 
              />
            </div>
            <div className="flex justify-end" style={{ marginTop: 'var(--spacing-sm)' }}>
              <button className="btn btn-secondary" onClick={clearSignature}>Hapus & Ulangi</button>
            </div>
            {signatureData && <span style={{fontSize: '12px', color: 'green', display: 'block', textAlign: 'right'}}>✓ Tersimpan</span>}
          </div>
        )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '40px', paddingTop: '24px', borderTop: '1px solid #E2E8F0', flexWrap: 'wrap', gap: '16px' }} className="btn-group-mobile">
            <div style={{ display: 'flex', gap: '10px' }} className="btn-group-mobile">
              <button 
                type="button" 
                onClick={handlePrev} 
                disabled={currentStep === 1 || isSubmitting || isDrafting} 
                style={{ 
                  background: 'white', 
                  border: '1px solid #CBD5E1', 
                  padding: '10px 20px', 
                  borderRadius: '8px', 
                  fontWeight: 600, 
                  fontSize: '0.875rem', 
                  color: '#475569', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  cursor: currentStep === 1 ? 'not-allowed' : 'pointer', 
                  opacity: currentStep === 1 ? 0.5 : 1, 
                  transition: 'all 0.15s ease' 
                }}
              >
                ← Kembali
              </button>
              <button 
                type="button" 
                onClick={handleSaveDraft} 
                disabled={isSubmitting || isDrafting} 
                style={{ 
                  background: '#FFFBEB',
                    border: '1px solid #FDE68A',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    color: '#D97706', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  cursor: 'pointer', 
                  transition: 'all 0.15s ease' 
                }}
              >
                {isDrafting ? (
                  'Menyimpan...'
                ) : (
                  <>
                    <Save size={14} strokeWidth={2} />
                    <span>Simpan Draft</span>
                  </>
                )}
              </button>
            </div>
            {currentStep < totalSteps ? (
              <button 
                type="button" 
                onClick={handleNext} 
                disabled={isSubmitting || isDrafting} 
                style={{ 
                  background: '#0F172A', 
                  border: 'none', 
                  padding: '10px 24px', 
                  borderRadius: '8px', 
                  fontWeight: 700, 
                  fontSize: '0.9rem', 
                  color: 'white', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  cursor: 'pointer', 
                  boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)', 
                  transition: 'all 0.15s ease' 
                }}
              >
                Selanjutnya →
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end', alignItems: 'center' }} className="btn-group-mobile">
                
                {/* Salin Format WA Button */}
                <button
                  type="button"
                  onClick={handleCopyText}
                  disabled={isSubmitting || isGeneratingSppb || isDrafting}
                  style={{
                    background: isWaCopied ? '#ECFDF5' : '#FFFFFF',
                    border: `1px solid ${isWaCopied ? '#10B981' : '#CBD5E1'}`,
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    color: isWaCopied ? '#059669' : '#334155',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease'
                  }}
                  title="Salin ringkasan data formulir dalam format teks WhatsApp"
                  onMouseEnter={(e) => {
                    if (!isWaCopied) e.currentTarget.style.backgroundColor = '#F8FAFC';
                  }}
                  onMouseLeave={(e) => {
                    if (!isWaCopied) e.currentTarget.style.backgroundColor = '#FFFFFF';
                  }}
                >
                  {isWaCopied ? <Check size={15} color="#059669" strokeWidth={2.5} /> : <Copy size={15} color="#059669" />}
                  <span>{isWaCopied ? 'Format WA Tersalin!' : 'Salin Format WA'}</span>
                </button>

                {/* SPPB Options Dropdown */}
                <div ref={sppbDropdownRef} style={{ position: 'relative' }}>
                  <button 
                    type="button" 
                    onClick={() => setShowSppbDropdown(!showSppbDropdown)} 
                    disabled={isGeneratingSppb || isSubmitting || isDrafting} 
                    style={{ 
                      background: '#FFFFFF', 
                      border: '1px solid #CBD5E1', 
                      padding: '10px 14px', 
                      borderRadius: '8px', 
                      fontWeight: 600, 
                      fontSize: '0.85rem', 
                      color: '#475569', 
                      cursor: 'pointer', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '6px',
                      transition: 'all 0.15s ease'
                    }}
                    title="Cetak Surat Permintaan Pemasangan Baru (SPPB)"
                  >
                    <FileText size={15} color="#D97706" />
                    <span>{isGeneratingSppb ? 'Memproses...' : 'SPPB (Opsional)'}</span>
                    <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>▾</span>
                  </button>

                  {showSppbDropdown && (
                    <div style={{ 
                      position: 'absolute', 
                      bottom: 'calc(100% + 8px)', 
                      right: 0, 
                      background: '#FFFFFF', 
                      border: '1px solid #E2E8F0', 
                      borderRadius: '8px', 
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', 
                      padding: '6px', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '4px',
                      minWidth: '175px',
                      zIndex: 50
                    }}>
                      <div style={{ padding: '6px 10px', fontSize: '0.7rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Format SPPB
                      </div>
                      <button 
                        type="button"
                        onClick={() => { setShowSppbDropdown(false); handleDownloadSppb('jpg'); }}
                        disabled={isGeneratingSppb}
                        style={{
                          background: 'none', border: 'none', textAlign: 'left',
                          padding: '8px 10px', borderRadius: '6px', fontSize: '0.825rem',
                          color: '#0F172A', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                          fontWeight: 500, transition: 'background-color 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <FileText size={14} color="#64748B" />
                        <span>Unduh SPPB (JPG)</span>
                      </button>
                      <button 
                        type="button"
                        onClick={() => { setShowSppbDropdown(false); handleDownloadSppb('pdf'); }}
                        disabled={isGeneratingSppb}
                        style={{
                          background: 'none', border: 'none', textAlign: 'left',
                          padding: '8px 10px', borderRadius: '6px', fontSize: '0.825rem',
                          color: '#0F172A', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                          fontWeight: 500, transition: 'background-color 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <FileText size={14} color="#64748B" />
                        <span>Unduh SPPB (PDF)</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Secondary Action: Unduh PDF */}
                <button 
                  type="button" 
                  onClick={() => handleSubmit('pdf')} 
                  disabled={isSubmitting || isGeneratingSppb || isDrafting} 
                  style={{ 
                    background: '#FFFFFF', 
                    border: '1px solid #CBD5E1', 
                    padding: '10px 16px', 
                    borderRadius: '8px', 
                    fontWeight: 600, 
                    fontSize: '0.85rem', 
                    color: '#334155', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px',
                    transition: 'all 0.15s ease'
                  }}
                  title="Simpan formulir dan unduh dalam format dokumen PDF"
                >
                  <FileText size={15} color="#64748B" />
                  <span>{isSubmitting ? 'Memproses...' : 'Unduh PDF'}</span>
                </button>

                {/* Primary Action: Simpan & Generate JPG */}
                <button 
                  type="button" 
                  onClick={() => handleSubmit('jpg')} 
                  disabled={isSubmitting || isGeneratingSppb || isDrafting} 
                  style={{ 
                    background: '#10B981', 
                    border: 'none', 
                    padding: '10px 22px', 
                    borderRadius: '8px', 
                    fontWeight: 700, 
                    fontSize: '0.9rem', 
                    color: 'white', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    cursor: isSubmitting ? 'not-allowed' : 'pointer', 
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)', 
                    transition: 'all 0.15s ease' 
                  }}
                  title="Simpan pendaftaran dan terbitkan gambar formulir JPG siap kirim ke WhatsApp"
                >
                  {isSubmitting ? 'Memproses Dokumen...' : 'Simpan & Terbitkan (JPG) →'}
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Right Column: Live Order Summary & Progress */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '24px' }}>
        
        {/* Widget 1: RINGKASAN TAGIHAN (LIVE ORDER SUMMARY) */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Receipt size={17} color="#0F172A" />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ringkasan Tagihan</span>
            </div>
            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#059669', backgroundColor: '#ECFDF5', padding: '2px 8px', borderRadius: '6px' }}>
              Real-Time
            </span>
          </div>

          {/* Info Pelanggan & Paket Ringkas */}
          <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ background: '#F8FAFC', borderRadius: '8px', padding: '10px 12px', border: '1px solid #F1F5F9' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Calon Pelanggan</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A', marginTop: '2px', wordBreak: 'break-word' }}>
                {formData.namaLengkap ? formData.namaLengkap : <span style={{ color: '#94A3B8', fontWeight: 400, fontStyle: 'italic' }}>Belum diisi (Step 1)</span>}
              </div>
            </div>

            <div style={{ background: '#F8FAFC', borderRadius: '8px', padding: '10px 12px', border: '1px solid #F1F5F9' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Paket Dipilih</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
                {formData.paketSpec ? (
                  `${formData.paketLayanan === 'Fiber' ? 'CBN Fiber' : formData.paketLayanan === 'Safe' ? 'CBN Fiber Safe' : formData.paketLayanan === 'Soho' ? 'CBN Fiber Pro' : formData.paketLayanan} ${formData.paketSpec}`
                ) : (
                  <span style={{ color: '#94A3B8', fontWeight: 400, fontStyle: 'italic' }}>Pilih di Step 3</span>
                )}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '3px' }}>
                {formData.area || 'Regular FS'} • {formData.promoTerm || 'Bulanan'}
              </div>
            </div>
          </div>

          {/* Breakdown Biaya Table */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', color: '#475569' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Biaya Paket</span>
              <span style={{ fontWeight: 600, color: '#0F172A' }}>{formatRupiah(formData.biayaPaket || 0)}</span>
            </div>

            {Number(formData.biayaPemasangan) > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Biaya Pemasangan</span>
                <span style={{ fontWeight: 600, color: formData.promo === 'Free Instalasi' ? '#059669' : '#0F172A' }}>
                  {formData.promo === 'Free Instalasi' ? 'Rp 0 (Promo)' : formatRupiah(formData.biayaPemasangan)}
                </span>
              </div>
            )}

            {Number(formData.biayaLainnya) > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Biaya Admin / Lainnya</span>
                <span style={{ fontWeight: 600, color: '#0F172A' }}>{formatRupiah(formData.biayaLainnya)}</span>
              </div>
            )}

            {(Number(formData.biayaTambahan) > 0 || Number(formData.biayaServices) > 0) && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Layanan Tambahan (VAS)</span>
                <span style={{ fontWeight: 600, color: '#0F172A' }}>
                  {formatRupiah((Number(formData.biayaTambahan) || 0) + (Number(formData.biayaServices) || 0))}
                </span>
              </div>
            )}

            {(Number(formData.biayaPerangkat) > 0 || Number(formData.biayaAddons) > 0) && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Perangkat & Add-ons</span>
                <span style={{ fontWeight: 600, color: '#0F172A' }}>
                  {formatRupiah((Number(formData.biayaPerangkat) || 0) + (Number(formData.biayaAddons) || 0))}
                </span>
              </div>
            )}

            {formData.promo === 'Diskon 50K' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#059669' }}>
                <span>Diskon Promo</span>
                <span style={{ fontWeight: 600 }}>- Rp 50.000</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>PPN</span>
              <span style={{ fontWeight: 600, color: '#0F172A' }}>{formatRupiah(kalkulasi.ppn)}</span>
            </div>
          </div>

          {/* Total Highlight Box */}
          <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px dashed #CBD5E1', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A' }}>Total Tagihan</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px' }}>
                {formatRupiah(kalkulasi.total)}
              </span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94A3B8', textAlign: 'right' }}>
              *Estimasi tagihan pembayaran pertama
            </div>
          </div>
        </div>

        {/* Widget 2: PROGRES & PANDUAN LANGKAH */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Langkah {currentStep} dari {totalSteps}
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0F172A' }}>
              {Math.round((currentStep / totalSteps) * 100)}% Selesai
            </span>
          </div>

          {/* Progress bar */}
          <div style={{ width: '100%', height: '6px', backgroundColor: '#F1F5F9', borderRadius: '9999px', overflow: 'hidden', marginBottom: '14px' }}>
            <div 
              style={{ 
                width: `${(currentStep / totalSteps) * 100}%`, 
                height: '100%', 
                backgroundColor: '#0F172A', 
                borderRadius: '9999px',
                transition: 'width 0.3s ease'
              }} 
            />
          </div>

          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
            Petunjuk Pengisian:
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(STEP_TIPS[currentStep - 1] || STEP_TIPS[0]).slice(0, 2).map((tip, idx) => (
              <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.78rem', color: '#475569', lineHeight: 1.4 }}>
                <span style={{ color: '#0F172A', fontWeight: 700, flexShrink: 0 }}>•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>


      {/* OCR Scanning Overlay */}
      {isOcring && typeof document !== 'undefined' && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', zIndex: 99999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)' }}>
          <div style={{ background: 'white', padding: '40px', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', maxWidth: '85%', width: '360px', textAlign: 'center', animation: 'scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            
            {/* Animated Scanner Ring */}
            <div style={{ position: 'relative', width: '90px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', width: '100%', height: '100%', border: '6px solid #F1F5F9', borderRadius: '50%' }} />
              <div style={{ position: 'absolute', width: '100%', height: '100%', border: '6px solid #0F172A', borderRadius: '50%', borderTopColor: 'transparent', animation: 'spin 1.2s cubic-bezier(0.5, 0.1, 0.4, 0.9) infinite' }} />
              
              {/* Inner scanning laser */}
              <div style={{ position: 'absolute', width: '40px', height: '40px', overflow: 'hidden' }}>
                <Scan size={40} color="#0F172A" strokeWidth={2} />
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: '#0F172A', boxShadow: '0 0 8px rgba(15, 23, 42, 0.5)', animation: 'scan 1.5s ease-in-out infinite alternate' }} />
              </div>
            </div>

            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0F172A', marginBottom: '8px', fontWeight: 800 }}>Menganalisis KTP...</h3>
              <p style={{ margin: 0, color: '#64748B', fontSize: '0.95rem', lineHeight: '1.5' }}>Sistem sedang mengekstrak data dari KTP Anda. Mohon tunggu sebentar.</p>
            </div>
            
            <div style={{ width: '100%', background: '#F1F5F9', height: '6px', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: '50%', height: '100%', background: '#0F172A', borderRadius: '4px', animation: 'progress 2s ease-in-out infinite' }} />
            </div>
          </div>
          
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes scaleUp {
              0% { transform: scale(0.9); opacity: 0; }
              100% { transform: scale(1); opacity: 1; }
            }
            @keyframes scan {
              0% { top: 0%; opacity: 0; }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { top: 100%; opacity: 0; }
            }
            @keyframes progress {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(200%); }
            }
          `}</style>
          </div>,
          document.body
        )}
  
      {/* GLOBAL LOADING OVERLAY */}
      {isSubmitting && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: 'white',
            padding: '32px 48px',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            color: '#0F172A'
          }}>
            <Loader2 size={48} color="#10B981" className="animate-spin" style={{ marginBottom: '16px' }} />
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', fontWeight: 700 }}>Memproses Dokumen</h3>
            <p style={{ margin: 0, color: '#64748B', fontSize: '0.95rem' }}>Harap tunggu sebentar, dokumen sedang di-generate...</p>
          </div>
        </div>
      )}
    </div>
  );
}


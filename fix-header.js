const fs = require('fs');
let code = fs.readFileSync('src/components/FormWizard.tsx', 'utf-8');

const anchor = '  useEffect(() => {\r\n    window.scrollTo({ top: 0, behavior: \'smooth\' });\r\n  }, [currentStep]);';
const anchorUnix = '  useEffect(() => {\n    window.scrollTo({ top: 0, behavior: \'smooth\' });\n  }, [currentStep]);';

let anchorIndex = code.indexOf(anchor);
if (anchorIndex === -1) anchorIndex = code.indexOf(anchorUnix);

const header = `"use client";

import React, { useState, useRef, useEffect } from "react";
import { CheckCircle, ChevronRight, ChevronLeft, Save, Calendar, Upload, Plus, Minus } from "lucide-react";
import SignatureCanvas from 'react-signature-canvas';
import Select from 'react-select';
import { createClient } from "@/lib/supabase/client";
import { AREAS, PACKAGE_CATEGORIES, PAYMENT_TERMS, PACKAGES_DATA, VAS_DATA, SMARTBOX_PRICES } from '@/lib/packagesData';

export default function FormWizard({ initialData, caeName, tlName }: { initialData?: any, caeName?: string, tlName?: string }) {
  const supabase = createClient();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;
  
  const sigCanvas = useRef<SignatureCanvas>(null);
  const ccSigCanvas = useRef<SignatureCanvas>(null);
  const salesSigCanvas = useRef<SignatureCanvas>(null);
  
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isConvertingToJpg, setIsConvertingToJpg] = useState(false);
  
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

`;

if (anchorIndex !== -1) {
  code = header + code.substring(anchorIndex);
  fs.writeFileSync('src/components/FormWizard.tsx', code);
  console.log('Fixed header');
} else {
  console.log('Anchor not found');
}

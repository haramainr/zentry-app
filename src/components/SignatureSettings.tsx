"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Save, Eraser, Upload } from "lucide-react";
import SignatureCanvas from 'react-signature-canvas';

export default function SignatureSettings({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [existingSignature, setExistingSignature] = useState<string | null>(null);
  
  const sigCanvas = useRef<SignatureCanvas>(null);
  const supabase = createClient();

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result && sigCanvas.current) {
          // Clear first
          sigCanvas.current.clear();
          // Draw image
          sigCanvas.current.fromDataURL(event.target.result.toString(), {
            width: sigCanvas.current.getCanvas().width,
            height: sigCanvas.current.getCanvas().height
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };


  useEffect(() => {
    const fetchSignature = async () => {
      try {
        const { data, error } = await supabase
          .from("signatures")
          .select("signature_url")
          .eq("user_id", userId)
          .maybeSingle();
          
        if (data && data.signature_url) {
          setExistingSignature(data.signature_url);
          if (sigCanvas.current) {
            sigCanvas.current.fromDataURL(data.signature_url);
          }
        }
      } catch (err) {
        console.error("Gagal memuat tanda tangan", err);
      } finally {
        setFetching(false);
      }
    };
    
    fetchSignature();
  }, [userId]);

  const clearSignature = () => {
    sigCanvas.current?.clear();
    setExistingSignature(null);
  };

  const handleSaveSignature = async () => {
    if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
      setMessage({ type: "error", text: "Tanda tangan masih kosong." });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });
    
    const signatureDataUrl = sigCanvas.current.toDataURL();

    try {
      // Cek apakah sudah ada
      const { data: existing } = await supabase
        .from("signatures")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (existing) {
        // Update
        const { error } = await supabase
          .from("signatures")
          .update({ signature_url: signatureDataUrl })
          .eq("user_id", userId);
        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from("signatures")
          .insert([{ user_id: userId, signature_url: signatureDataUrl }]);
        if (error) throw error;
      }

      setMessage({ type: "success", text: "Tanda tangan berhasil disimpan!" });
      setExistingSignature(signatureDataUrl);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Gagal menyimpan tanda tangan." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-md">
      {message.text && (
        <div style={{ 
          padding: '12px', 
          borderRadius: 'var(--radius-md)', 
          backgroundColor: message.type === 'error' ? '#FEE2E2' : '#D1FAE5',
          color: message.type === 'error' ? 'var(--error)' : 'var(--success)',
          fontSize: '0.875rem'
        }}>
          {message.text}
        </div>
      )}

      
      <p className="text-body" style={{ fontSize: '0.9rem', marginBottom: '8px' }}>
        Tanda tangan ini akan otomatis dicetak pada form PDF saat Anda (atau tim Anda) membuat dokumen baru.
      </p>
      
      <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
          <Upload size={18} color="#475569" style={{ marginTop: '2px' }} />
          <div>
            <span style={{ fontSize: '0.85rem', color: '#0F172A', fontWeight: 600, display: 'block' }}>Import dari Galeri (Disarankan)</span>
            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Gunakan gambar tanda tangan berlatar transparan (hapus background) agar hasilnya lebih menyatu dengan dokumen PDF.</span>
          </div>
        </div>
        <button type="button" onClick={() => fileInputRef.current?.click()} style={{ background: 'white', border: '1px solid #CBD5E1', color: '#334155', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, marginTop: '10px', cursor: 'pointer', transition: 'all 0.2s' }}>
          Pilih Gambar Tanda Tangan
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
      </div>

      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 500 }}>Atau gambar manual di bawah ini:</div>


      {fetching ? (
        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>Memuat tanda tangan...</div>
      ) : (
        <div style={{ border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--bg-color)', overflow: 'hidden' }}>
          <SignatureCanvas 
            ref={sigCanvas}
            canvasProps={{
              className: 'signature-canvas',
              style: { width: '100%', height: '200px', cursor: 'crosshair', touchAction: 'none' }
            }}
          />
        </div>
      )}

      <div className="flex justify-between" style={{ marginTop: 'var(--spacing-sm)' }}>
        <button type="button" className="btn btn-secondary" onClick={clearSignature} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Eraser size={18} />
          Hapus & Ulangi
        </button>
        <button type="button" className="btn btn-primary" onClick={handleSaveSignature} disabled={loading || fetching} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Save size={18} />
          {loading ? "Menyimpan..." : "Simpan Tanda Tangan"}
        </button>
      </div>
    </div>
  );
}

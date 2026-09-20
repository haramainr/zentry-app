"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Save, Eraser } from "lucide-react";
import SignatureCanvas from 'react-signature-canvas';

export default function SignatureSettings({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [existingSignature, setExistingSignature] = useState<string | null>(null);
  
  const sigCanvas = useRef<SignatureCanvas>(null);
  const supabase = createClient();

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

      <p className="text-body" style={{ fontSize: '0.9rem' }}>
        Tanda tangan ini akan otomatis dicetak pada form PDF saat Anda (atau tim Anda) membuat dokumen baru.
      </p>

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

"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Save, Eye, EyeOff } from "lucide-react";

export default function ProfileForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showPassword, setShowPassword] = useState(false);

  const supabase = createClient();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "Konfirmasi kata sandi tidak cocok." });
      return;
    }
    
    if (password.length < 6) {
      setMessage({ type: "error", text: "Kata sandi minimal 6 karakter." });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      setMessage({ type: "success", text: "Kata sandi berhasil diperbarui!" });
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Gagal memperbarui kata sandi." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleUpdatePassword} className="flex flex-col gap-md">
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

      <div className="input-group">
        <label className="input-label">Kata Sandi Baru</label>
        <div style={{ position: 'relative' }}>
          <input 
            type={showPassword ? "text" : "password"} 
            className="input-field" 
            style={{ width: '100%', paddingRight: '40px' }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Masukkan kata sandi baru"
          />
          <button 
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>
      
      <div className="input-group">
        <label className="input-label">Ulangi Kata Sandi Baru</label>
        <div style={{ position: 'relative' }}>
          <input 
            type={showPassword ? "text" : "password"}
            className="input-field" 
            style={{ width: '100%', paddingRight: '40px' }}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Konfirmasi kata sandi baru"
          />
          <button 
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div className="flex justify-end mt-sm">
        <button type="submit" className="btn btn-primary" disabled={loading || !password} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Save size={18} />
          {loading ? "Menyimpan..." : "Simpan Kata Sandi"}
        </button>
      </div>
    </form>
  );
}

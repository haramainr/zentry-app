"use client";

import { useState } from "react";
import { Settings, Save, FileCode, CheckCircle, Package } from "lucide-react";

export default function PlatformConfigPage() {
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Mock config state
  const [config, setConfig] = useState({
    ppnRate: 11,
    biayaTambahanDefault: 0,
    enableDrafts: true,
    maintenanceMode: false,
    pdfTemplateName: "CBN_Form_v2.pdf"
  });

  const handleSave = () => {
    setSaving(true);
    // Simulasi penyimpanan ke database
    setTimeout(() => {
      setSaving(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 800);
  };

  return (
    <div className="animate-fade-in" style={{ padding: 'var(--spacing-xl)', flex: 1, position: 'relative' }}>
      
      {/* Toast Notification */}
      {showToast && (
        <div style={{
          position: 'absolute', top: '20px', right: '20px', backgroundColor: '#10B981', color: 'white',
          padding: '12px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', zIndex: 10
        }}>
          <CheckCircle size={18} /> Konfigurasi berhasil disimpan!
        </div>
      )}

      <header style={{ marginBottom: 'var(--spacing-xl)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="h2" style={{ color: '#F8FAFC' }}>Konfigurasi Platform</h1>
          <p style={{ color: '#94A3B8' }}>Atur variabel global, template PDF, dan pengaturan bisnis.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          style={{ 
            padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#3B82F6', 
            color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', 
            fontWeight: 500, opacity: saving ? 0.7 : 1
          }}
        >
          <Save size={18} /> {saving ? 'Menyimpan...' : 'Simpan Semua Konfigurasi'}
        </button>
      </header>

      {/* Cards Area */}
      <div className="grid-mobile-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)' }}>
        
        {/* Kolom Kiri */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          
          <div style={{ backgroundColor: '#1E293B', borderRadius: '12px', border: '1px solid #334155', padding: '24px' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Settings size={20} color="#60A5FA" /> Variabel Bisnis & Biaya
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', margin: '0 0 6px 0', fontSize: '0.9rem', color: '#CBD5E1' }}>Tarif PPN (%)</label>
                <input 
                  type="number" 
                  value={config.ppnRate}
                  onChange={e => setConfig({...config, ppnRate: Number(e.target.value)})}
                  style={{ width: '100%', padding: '10px 14px', backgroundColor: '#0F172A', color: 'white', borderRadius: '6px', border: '1px solid #334155', outline: 'none' }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', margin: '0 0 6px 0', fontSize: '0.9rem', color: '#CBD5E1' }}>Default Biaya Tambahan (Rp)</label>
                <input 
                  type="number" 
                  value={config.biayaTambahanDefault}
                  onChange={e => setConfig({...config, biayaTambahanDefault: Number(e.target.value)})}
                  style={{ width: '100%', padding: '10px 14px', backgroundColor: '#0F172A', color: 'white', borderRadius: '6px', border: '1px solid #334155', outline: 'none' }}
                />
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: '#1E293B', borderRadius: '12px', border: '1px solid #334155', padding: '24px' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Package size={20} color="#F59E0B" /> Manajemen Paket (Blueprint)
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#94A3B8', marginBottom: '16px' }}>
              Fitur ini akan menghubungkan FormWizard dengan database tabel <code style={{ backgroundColor: '#0F172A', padding: '2px 6px', borderRadius: '4px' }}>packages</code> di masa mendatang, sehingga Anda dapat menambah/menghapus paket tanpa coding ulang.
            </p>
            <div style={{ padding: '12px', backgroundColor: '#0F172A', borderRadius: '8px', border: '1px solid #334155', opacity: 0.7 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #334155', paddingBottom: '8px', marginBottom: '8px' }}>
                <span style={{ color: '#CBD5E1' }}>Fiber 100Mbps</span>
                <span style={{ color: '#94A3B8' }}>Rp 399.000</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #334155', paddingBottom: '8px', marginBottom: '8px' }}>
                <span style={{ color: '#CBD5E1' }}>Safe 150Mbps</span>
                <span style={{ color: '#94A3B8' }}>Rp 499.000</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#CBD5E1' }}>Pro 300Mbps</span>
                <span style={{ color: '#94A3B8' }}>Rp 699.000</span>
              </div>
            </div>
            <button style={{ marginTop: '16px', padding: '8px 16px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: 'transparent', color: '#94A3B8', cursor: 'not-allowed', width: '100%' }}>
              + Tambah Paket Baru (Segera Hadir)
            </button>
          </div>
          
        </div>

        {/* Kolom Kanan */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          
          <div style={{ backgroundColor: '#1E293B', borderRadius: '12px', border: '1px solid #334155', padding: '24px' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileCode size={20} color="#10B981" /> PDF Template & AcroFields
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', margin: '0 0 6px 0', fontSize: '0.9rem', color: '#CBD5E1' }}>File Template Aktif</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" 
                    value={config.pdfTemplateName}
                    readOnly
                    style={{ flex: 1, padding: '10px 14px', backgroundColor: '#0F172A', color: '#64748B', borderRadius: '6px', border: '1px solid #334155', outline: 'none' }}
                  />
                  <button style={{ padding: '0 16px', borderRadius: '6px', backgroundColor: '#334155', color: 'white', border: 'none', cursor: 'pointer' }}>Upload</button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', margin: '0 0 6px 0', fontSize: '0.9rem', color: '#CBD5E1' }}>AcroFields Mapping</label>
                <div style={{ padding: '16px', backgroundColor: '#0F172A', borderRadius: '8px', border: '1px solid #334155', fontFamily: 'monospace', fontSize: '0.85rem', color: '#34D399', whiteSpace: 'pre', overflowX: 'auto' }}>
{`{
  "namaLengkap": "Text1",
  "ktp": "Text2",
  "alamat": "Text3",
  "paketLayanan": "Dropdown1",
  "signature": "SigField"
}`}
                </div>
                <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '8px' }}>Ubah mapping JSON di atas jika template PDF baru memiliki nama field yang berbeda.</p>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: '#1E293B', borderRadius: '12px', border: '1px solid #334155', padding: '24px' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Settings size={20} color="#EF4444" /> System Toggles
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={config.enableDrafts}
                  onChange={e => setConfig({...config, enableDrafts: e.target.checked})}
                  style={{ width: '18px', height: '18px', accentColor: '#3B82F6' }}
                />
                <span style={{ color: '#CBD5E1' }}>Aktifkan Fitur Draft (Simpan Sementara)</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={config.maintenanceMode}
                  onChange={e => setConfig({...config, maintenanceMode: e.target.checked})}
                  style={{ width: '18px', height: '18px', accentColor: '#EF4444' }}
                />
                <span style={{ color: '#FCA5A5' }}>Aktifkan Maintenance Mode (Kunci Akses Semua Sales)</span>
              </label>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function PanduanPenggunaan() {
  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', padding: 'var(--spacing-xl) 0', width: '100%' }}>
      <header style={{ marginBottom: 'var(--spacing-xl)' }}>
        <h1 className="h2" style={{ color: 'var(--text-primary)' }}>Panduan Penggunaan ZEntry</h1>
        <p className="text-body">Pelajari cara menggunakan sistem registrasi dengan mudah dan cepat.</p>
      </header>

      <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h3 className="h3" style={{ marginBottom: 'var(--spacing-md)' }}>Modul Panduan (Teks & Gambar)</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          <details style={{ padding: 'var(--spacing-sm)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <summary style={{ fontWeight: 600, cursor: 'pointer' }}>1. Cara Scan KTP Otomatis (OCR)</summary>
            <div style={{ marginTop: 'var(--spacing-sm)', color: 'var(--text-secondary)' }}>
              <p>Pada Langkah 1 pengisian form, terdapat tombol <strong>"Auto-isi dengan Scan KTP"</strong>.</p>
              <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
                <li>Klik tombol tersebut dan pilih foto KTP pelanggan (format JPG/PNG).</li>
                <li>Tunggu beberapa saat hingga sistem memindai NIK, Nama, dan Tempat/Tanggal Lahir.</li>
                <li>Data akan otomatis terisi. Selalu periksa kembali keakuratannya karena terkadang KTP yang buram bisa salah terbaca.</li>
              </ul>
            </div>
          </details>

          <details style={{ padding: 'var(--spacing-sm)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <summary style={{ fontWeight: 600, cursor: 'pointer' }}>2. Kalkulasi Biaya Otomatis</summary>
            <div style={{ marginTop: 'var(--spacing-sm)', color: 'var(--text-secondary)' }}>
              <p>Anda tidak perlu lagi menghitung biaya secara manual.</p>
              <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
                <li>Pilih Paket Layanan (ZEntry Fiber / Safe / Pro).</li>
                <li>Pilih tambahan VAS atau Promo dari menu Dropdown.</li>
                <li>Biaya Administrasi (Rp5.000) dan PPN 11% akan langsung ditambahkan ke <strong>TOTAL</strong> di Langkah 5.</li>
              </ul>
            </div>
          </details>

          <details style={{ padding: 'var(--spacing-sm)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <summary style={{ fontWeight: 600, cursor: 'pointer' }}>3. Fitur Generate Ulang (Revisi)</summary>
            <div style={{ marginTop: 'var(--spacing-sm)', color: 'var(--text-secondary)' }}>
              <p>Jika PDF sudah di-generate namun ada kesalahan data:</p>
              <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
                <li>Masuk ke menu <strong>Riwayat</strong> di sidebar kiri.</li>
                <li>Cari data registrasi yang salah, lalu klik tombol <strong>Edit</strong>.</li>
                <li>Anda akan dibawa kembali ke formulir. Ubah data yang salah, lalu klik Simpan & Generate PDF di langkah terakhir.</li>
              </ul>
            </div>
          </details>
          
          <details style={{ padding: 'var(--spacing-sm)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <summary style={{ fontWeight: 600, cursor: 'pointer' }}>4. Menyalin Format WhatsApp</summary>
            <div style={{ marginTop: 'var(--spacing-sm)', color: 'var(--text-secondary)' }}>
              <p>Setelah selesai submit form, akan muncul notifikasi *popup* untuk menyalin format WA.</p>
              <p>Format tersebut berisi rangkuman data termasuk <strong>Homepass ID</strong> dan <strong>Titik Koordinat</strong> yang siap dikirimkan ke grup operasional. Jika lupa, Anda bisa menyalinnya lagi di menu Riwayat.</p>
            </div>
          </details>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h3 className="h3" style={{ marginBottom: 'var(--spacing-md)' }}>Video Tutorial</h3>
        <p className="text-body" style={{ marginBottom: 'var(--spacing-md)' }}>
          Tonton video di bawah ini untuk melihat panduan interaktif step-by-step.
        </p>
        
        {/* Placeholder untuk Video Tutorial */}
        <div style={{ 
          width: '100%', 
          aspectRatio: '16/9', 
          backgroundColor: '#000', 
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          position: 'relative'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              backgroundColor: 'var(--solasi-blue)', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto var(--spacing-sm) auto',
              cursor: 'pointer'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            </div>
            <p>Video Tutorial akan segera tersedia.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

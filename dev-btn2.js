const fs = require('fs');
let code = fs.readFileSync('src/app/developer/users/page.tsx', 'utf-8');

const perpanjangBtn = `
                {editingUser.subscription_status === 'Active' && (
                  <button 
                    type="button"
                    onClick={async () => {
                      setSaving(true);
                      const expiry = new Date(editingUser.subscription_end_date || new Date());
                      expiry.setDate(expiry.getDate() + 30);
                      const { data, error } = await supabase.from('users').update({ subscription_end_date: expiry.toISOString() }).eq('id', editingUser.id).select();
                      if (error || !data || data.length === 0) {
                        alert("Gagal perpanjang lisensi! Pastikan aturan RLS Supabase mengizinkan Developer meng-update tabel users.");
                      } else {
                        alert("Lisensi berhasil diperpanjang 30 hari!");
                        setEditingUser({ ...editingUser, subscription_end_date: expiry.toISOString() });
                        fetchUsers();
                      }
                      setSaving(false);
                    }}
                    style={{ background: '#10B981', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', marginTop: '8px', width: '100%' }}
                    disabled={saving}
                  >
                    + Perpanjang 30 Hari
                  </button>
                )}
`;

code = code.replace(
  '<option value="Suspended">Suspended (Ditangguhkan)</option>\n                  </select>',
  '<option value="Suspended">Suspended (Ditangguhkan)</option>\n                  </select>\n' + perpanjangBtn
);

code = code.replace(
  'if (error) {\n        alert("Gagal memperbarui pengguna: " + error.message);\n      } else {\n        alert("Pengguna berhasil diperbarui!");',
  'if (error) {\n        alert("Gagal memperbarui pengguna: " + error.message);\n      } else {\n        alert("Pengguna berhasil diperbarui! (Jika data belum berubah, pastikan ada aturan RLS Supabase yang mengizinkan update).");'
);

fs.writeFileSync('src/app/developer/users/page.tsx', code);

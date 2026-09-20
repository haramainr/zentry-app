import re

# 1. Update register page
reg_file = 'src/app/register/page.tsx'
with open(reg_file, 'r', encoding='utf-8') as f:
    reg_content = f.read()

# Update the database
old_update = "await supabase.from('users').update({ email: formData.email }).eq('id', authData.user.id);"
new_update = "await supabase.from('users').update({ email: formData.email, subscription_status: 'Pending Approval' }).eq('id', authData.user.id);"
reg_content = reg_content.replace(old_update, new_update)

# Update the alert and redirect
old_alert = '''alert("Registrasi Berhasil! Anda sekarang masuk ke dalam sistem.");
      
      // Arahkan ke dashboard sesuai role
      if (formData.role === 'Sales') router.push('/sales/form');
      else router.push('/'); // Placeholder untuk dashboard lain'''

new_alert = '''alert("Registrasi Berhasil! Akun Anda harus diaktivasi oleh Developer sebelum dapat digunakan.");
      
      router.push('/suspended');'''

reg_content = reg_content.replace(old_alert, new_alert)
with open(reg_file, 'w', encoding='utf-8') as f:
    f.write(reg_content)

# 2. Update Developer Users page
dev_file = 'src/app/developer/users/page.tsx'
with open(dev_file, 'r', encoding='utf-8') as f:
    dev_content = f.read()

dev_old = '''<option value="Active">Active</option>
                  <option value="Pending Payment">Pending Payment</option>
                  <option value="Suspended">Suspended (Ditangguhkan)</option>'''
dev_new = '''<option value="Active">Active</option>
                  <option value="Pending Approval">Pending Approval (Menunggu Aktivasi)</option>
                  <option value="Pending Payment">Pending Payment</option>
                  <option value="Suspended">Suspended (Ditangguhkan)</option>'''
dev_content = dev_content.replace(dev_old, dev_new)
with open(dev_file, 'w', encoding='utf-8') as f:
    f.write(dev_content)

# 3. Update Suspended page
susp_file = 'src/app/suspended/page.tsx'
with open(susp_file, 'r', encoding='utf-8') as f:
    susp_content = f.read()

susp_old = ''') : (
          <>
            <h1 className="h2" style={{ color: 'red', marginBottom: 'var(--spacing-md)' }}>Akses Ditangguhkan</h1>'''

susp_new = ''') : profile?.subscription_status === 'Pending Approval' ? (
          <>
            <h1 className="h2" style={{ color: '#F59E0B', marginBottom: 'var(--spacing-md)' }}>Menunggu Aktivasi</h1>
            <p className="text-body" style={{ marginBottom: 'var(--spacing-xl)' }}>
              Pendaftaran Anda berhasil! Namun, akun Anda masih berstatus <strong>Pending</strong>. Silakan hubungi Admin atau Developer untuk mengaktifkan akun Anda agar dapat mengakses sistem.
            </p>
            <button className="btn btn-outline" style={{ width: '100%', marginBottom: '16px' }} onClick={() => window.location.reload()}>
              Refresh Status
            </button>
          </>
        ) : (
          <>
            <h1 className="h2" style={{ color: 'red', marginBottom: 'var(--spacing-md)' }}>Akses Ditangguhkan</h1>'''

susp_content = susp_content.replace(susp_old, susp_new)
with open(susp_file, 'w', encoding='utf-8') as f:
    f.write(susp_content)

print("Updated registration approval flow successfully.")

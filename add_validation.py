import re

file_path = 'src/app/register/page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_val = '''// 1. Validasi Tanda Tangan
        if (needsSignature && sigCanvas.current?.isEmpty()) {
          throw new Error("Tanda Tangan wajib diisi untuk role Sales dan Leader.");
        }'''

new_val = '''// 1. Validasi
        if (formData.role === 'Sales' && !formData.supervisor_id) {
          throw new Error("Leader wajib dipilih untuk jabatan Sales.");
        }
        if (needsSignature && sigCanvas.current?.isEmpty()) {
          throw new Error("Tanda Tangan wajib diisi untuk role Sales dan Leader.");
        }'''

content = content.replace(old_val, new_val)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Added manual validation.")

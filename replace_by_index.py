file_path = 'src/app/login/page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1
for i, line in enumerate(lines):
    if "if (formData.password === 'admin123' && (" in line:
        start_idx = i
    if start_idx != -1 and "return;" in line:
        end_idx = i + 1
        break

if start_idx != -1 and end_idx != -1:
    new_block = """        const bypassEmails = ['admin', 'sales', 'leader', 'manager', 'dev'];
        if (formData.password === 'admin123' && bypassEmails.includes(formData.email.toLowerCase().trim())) {
          let role = 'Manager';
          let target = '/manager';
          if (formData.email.toLowerCase().trim() === 'sales') { role = 'Sales'; target = '/sales'; }
          else if (formData.email.toLowerCase().trim() === 'leader') { role = 'Leader'; target = '/leader'; }
          else if (formData.email.toLowerCase().trim() === 'dev') { role = 'Developer'; target = '/developer'; }
          
          document.cookie = `dummy_auth=true; path=/; max-age=86400`;
          document.cookie = `dummy_role=${role}; path=/; max-age=86400`;
          document.cookie = `dummy_user_id=dummy-admin-id; path=/; max-age=86400`;
          document.cookie = `dummy_name=${encodeURIComponent(`Akun ${role} (Preview)`)}; path=/; max-age=86400`;
          document.cookie = `dummy_email=${encodeURIComponent(`${role.toLowerCase()}@zentry.com`)}; path=/; max-age=86400`;
          window.location.href = target;
          return;
        }\n"""
    lines[start_idx:end_idx] = [new_block]
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("Replaced by index successfully.")
else:
    print("Could not find block.")

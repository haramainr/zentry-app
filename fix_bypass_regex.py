import re

file_path = 'src/app/login/page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the whole if statement
pattern = re.compile(r"if\s*\(formData\.password\s*===\s*'admin123'\s*&&\s*\([^)]+\)\)\s*\{[\s\S]*?window\.location\.href\s*=\s*target;\s*return;\s*\}", re.MULTILINE)

new_block = """const bypassEmails = ['admin', 'sales', 'leader', 'manager', 'dev'];
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
        }"""

content = pattern.sub(new_block, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated bypass with regex.")

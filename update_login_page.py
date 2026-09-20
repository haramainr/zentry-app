import re

file_path = 'src/app/login/page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# We will remove the hardcoded interception completely so it relies on dummy.ts
old_login = '''if (formData.password === 'admin123' && (
          formData.email === 'admin' || formData.email.startsWith('admin') ||
          formData.email.startsWith('sales') || formData.email.startsWith('leader') ||
          formData.email.startsWith('manager') || formData.email.startsWith('dev')
        )) {
          let role = 'Manager';
          let target = '/manager';
          if (formData.email.startsWith('sales')) { role = 'Sales'; target = '/sales'; }
          else if (formData.email.startsWith('leader')) { role = 'Leader'; target = '/leader'; }
          else if (formData.email.startsWith('dev')) { role = 'Developer'; target = '/developer'; }
          
          document.cookie = dummy_auth=true; path=/; max-age=86400;
          document.cookie = dummy_role=; path=/; max-age=86400;
          window.location.href = target;
          return;
        }'''

# Replace it with developer backdoor only
new_login = '''if (formData.email === 'dev' && formData.password === 'admin123') {
          document.cookie = dummy_auth=true; path=/; max-age=86400;
          document.cookie = dummy_role=Developer; path=/; max-age=86400;
          document.cookie = dummy_user_id=dummy-admin-id; path=/; max-age=86400;
          window.location.href = '/developer';
          return;
        }'''

content = content.replace(old_login, new_login)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Removed hardcoded login interception.")

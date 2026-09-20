import re

file_path = 'src/app/login/page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Update the bypass logic to set the required cookies
old_bypass = """          document.cookie = `dummy_auth=true; path=/; max-age=86400`;
          document.cookie = `dummy_role=${role}; path=/; max-age=86400`;
          window.location.href = target;"""

new_bypass = """          document.cookie = `dummy_auth=true; path=/; max-age=86400`;
          document.cookie = `dummy_role=${role}; path=/; max-age=86400`;
          document.cookie = `dummy_user_id=dummy-admin-id; path=/; max-age=86400`;
          document.cookie = `dummy_name=${encodeURIComponent(`Akun ${role} (Preview)`)}; path=/; max-age=86400`;
          document.cookie = `dummy_email=${encodeURIComponent(`${role.toLowerCase()}@zentry.com`)}; path=/; max-age=86400`;
          window.location.href = target;"""

content = content.replace(old_bypass, new_bypass)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated login bypass to set all dummy cookies.")

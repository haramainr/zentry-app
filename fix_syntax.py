import re

file_path = 'src/lib/supabase/dummy.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("document.cookie = dummy_auth=true; path=/; max-age=86400;", "document.cookie = 'dummy_auth=true; path=/; max-age=86400';")
content = content.replace("document.cookie = dummy_role=${newUser.user_metadata.role}; path=/; max-age=86400;", "document.cookie = `dummy_role=${newUser.user_metadata.role}; path=/; max-age=86400`;")
content = content.replace("document.cookie = dummy_user_id=${newUser.id}; path=/; max-age=86400;", "document.cookie = `dummy_user_id=${newUser.id}; path=/; max-age=86400`;")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed syntax error.")

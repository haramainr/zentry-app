import re

file_path = 'src/lib/supabase/dummy.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("email: 'admin@zentry.com',", "email: serverUserEmail || 'admin@zentry.com',")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

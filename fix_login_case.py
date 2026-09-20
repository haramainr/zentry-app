import re

file_path = 'src/lib/supabase/dummy.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_find = '''const found = globalForDummy.dummyDataMap.users.find((x:any) => x.email === credentials.email);'''
new_find = '''const found = globalForDummy.dummyDataMap.users.find((x:any) => x.email.toLowerCase().trim() === credentials.email.toLowerCase().trim());'''

content = content.replace(old_find, new_find)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed case sensitivity in dummy login.")

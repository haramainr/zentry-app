import re

file_path = 'src/lib/supabase/dummy.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add dummy_name to signInWithPassword
content = re.sub(
    r'document\.cookie = dummy_user_id=\$\{found\.id\}; path=/; max-age=86400;',
    r'document.cookie = dummy_user_id=; path=/; max-age=86400;\n                document.cookie = dummy_name=; path=/; max-age=86400;',
    content
)

# Add dummy_name to signUp
content = re.sub(
    r'document\.cookie = dummy_user_id=\$\{newUser\.id\}; path=/; max-age=86400;',
    r'document.cookie = dummy_user_id=; path=/; max-age=86400;\n            document.cookie = dummy_name=; path=/; max-age=86400;',
    content
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Injected dummy_name into cookies.")

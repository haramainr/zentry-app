import re

file_path = 'src/app/login/page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the JSX targeting issue by putting the class on a span inside the Link
old_link = '<Link href="/register" className="register-link">Buat Akun Baru</Link>'
new_link = '<Link href="/register"><span className="register-link">Buat Akun Baru</span></Link>'

content = content.replace(old_link, new_link)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed styled-jsx targeting for the Link component in login.")

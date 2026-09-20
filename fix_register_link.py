import re

file_path = 'src/app/register/page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the duplicate one inside the form
dup_link = '''<p className="login-link">
                  Sudah punya akun? <Link href="/login">Masuk di sini</Link>
                </p>'''

content = content.replace(dup_link, "")

# Fix the JSX targeting issue for the correct link in the footer
old_link = '<Link href="/login" className="register-link">Login di sini</Link>'
new_link = '<Link href="/login"><span className="register-link">Login di sini</span></Link>'

content = content.replace(old_link, new_link)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed duplicate link and hover effect in register page.")

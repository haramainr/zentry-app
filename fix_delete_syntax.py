import re

file_path = 'src/app/developer/users/page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the stripped backticks and variable in the confirm dialog
old_confirm = "if (!confirm(Apakah Anda yakin ingin menghapus akun  secara permanen? Data ini tidak dapat dipulihkan.)) return;"
new_confirm = "if (!confirm(`Apakah Anda yakin ingin menghapus akun ${user.full_name} secara permanen? Data ini tidak dapat dipulihkan.`)) return;"

content = content.replace(old_confirm, new_confirm)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed syntax error in user deletion.")

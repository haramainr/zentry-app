import re

file_path = 'src/components/DeveloperSubscriptionsClient.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the stripped backticks and variable in the confirm dialog
old_confirm = "if (!confirm(Aktifkan akun ini selama  hari?)) return;"
new_confirm = "if (!confirm(`Aktifkan akun ini selama ${days} hari?`)) return;"

content = content.replace(old_confirm, new_confirm)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed syntax error in DeveloperSubscriptionsClient.")

import re

file_path = 'src/app/login/page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_bypass = """        if (formData.password === 'admin123' && (
          formData.email === 'admin' || formData.email.startsWith('admin') ||
          formData.email.startsWith('sales') || formData.email.startsWith('leader') ||
          formData.email.startsWith('manager') || formData.email.startsWith('dev')
        )) {"""

new_bypass = """        const bypassEmails = ['admin', 'sales', 'leader', 'manager', 'dev'];
        if (formData.password === 'admin123' && bypassEmails.includes(formData.email.toLowerCase().trim())) {"""

content = content.replace(old_bypass, new_bypass)

# Also need to fix the internal if-else logic
old_internal = """          if (formData.email.startsWith('sales')) { role = 'Sales'; target = '/sales'; }
          else if (formData.email.startsWith('leader')) { role = 'Leader'; target = '/leader'; }
          else if (formData.email.startsWith('dev')) { role = 'Developer'; target = '/developer'; }"""

new_internal = """          if (formData.email.toLowerCase().trim() === 'sales') { role = 'Sales'; target = '/sales'; }
          else if (formData.email.toLowerCase().trim() === 'leader') { role = 'Leader'; target = '/leader'; }
          else if (formData.email.toLowerCase().trim() === 'dev') { role = 'Developer'; target = '/developer'; }"""

content = content.replace(old_internal, new_internal)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated login/page.tsx to use exact match bypass.")

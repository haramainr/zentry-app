import re

file_path = 'src/app/register/page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_state = '''const [leaders, setLeaders] = useState<{id: string, full_name: string}[]>([]);'''
new_state = '''const [leaders, setLeaders] = useState<{id: string, full_name: string}[]>([]);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showLeaderDropdown, setShowLeaderDropdown] = useState(false);'''

content = content.replace(old_state, new_state)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Added missing state variables.")

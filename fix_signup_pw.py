import re

file_path = 'src/lib/supabase/dummy.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_signup = '''globalForDummy.dummyDataMap.users.push({
            id: newUser.id,
            full_name: newUser.user_metadata.full_name,
            role: newUser.user_metadata.role,
            subscription_status: 'Pending Approval',
            email: newUser.email,
            supervisor_id: credentials.options?.data?.supervisor_id || null
          });'''

new_signup = '''globalForDummy.dummyDataMap.users.push({
            id: newUser.id,
            full_name: newUser.user_metadata.full_name,
            role: newUser.user_metadata.role,
            subscription_status: 'Pending Approval',
            email: newUser.email,
            password: credentials.password,
            supervisor_id: credentials.options?.data?.supervisor_id || null
          });'''

content = content.replace(old_signup, new_signup)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed dummy signUp to save password.")

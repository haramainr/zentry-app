import re

file_path = 'src/lib/supabase/server.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_server = '''  if (isDummyAuth) {
    const dummyRole = cookieStore.get('dummy_role')?.value || 'Manager'
    return getDummyClient(dummyRole) as any
  }'''

new_server = '''  if (isDummyAuth) {
    const dummyRole = cookieStore.get('dummy_role')?.value || 'Manager';
    const userIdCookie = cookieStore.get('dummy_user_id')?.value;
    const nameCookie = cookieStore.get('dummy_name')?.value;
    const decodedName = nameCookie ? decodeURIComponent(nameCookie) : undefined;
    const emailCookie = cookieStore.get('dummy_email')?.value;
    const decodedEmail = emailCookie ? decodeURIComponent(emailCookie) : undefined;
    return getDummyClient(dummyRole, userIdCookie, decodedName, decodedEmail) as any;
  }'''

content = content.replace(old_server, new_server)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated server.ts successfully.")

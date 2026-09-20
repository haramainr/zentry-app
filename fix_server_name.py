import re

file_path = 'src/lib/supabase/server.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_server = '''const userIdCookie = cookieStore.get('dummy_user_id')?.value;
    return getDummyClient(roleCookie, userIdCookie);'''

new_server = '''const userIdCookie = cookieStore.get('dummy_user_id')?.value;
    const nameCookie = cookieStore.get('dummy_name')?.value;
    const decodedName = nameCookie ? decodeURIComponent(nameCookie) : undefined;
    return getDummyClient(roleCookie, userIdCookie, decodedName);'''

content = content.replace(old_server, new_server)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated server.ts with name cookie extraction.")

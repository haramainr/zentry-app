import re

file_path = 'src/lib/supabase/server.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_code = '''export async function createClient() {
  if (process.env.NEXT_PUBLIC_USE_DUMMY_DB === 'true' || true) {
    const cookieStore = cookies();
    const roleCookie = cookieStore.get('dummy_role')?.value || 'Manager';
    return getDummyClient(roleCookie);
  }'''

new_code = '''export async function createClient() {
  if (process.env.NEXT_PUBLIC_USE_DUMMY_DB === 'true' || true) {
    const cookieStore = cookies();
    const roleCookie = cookieStore.get('dummy_role')?.value || 'Manager';
    const userIdCookie = cookieStore.get('dummy_user_id')?.value;
    return getDummyClient(roleCookie, userIdCookie);
  }'''

content = content.replace(old_code, new_code)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated server.ts to pass dummy_user_id.")

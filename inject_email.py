import re

# 1. Update dummy.ts
file_path = 'src/lib/supabase/dummy.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Update getDummyClient signature
old_sig = "export function getDummyClient(role: string = 'Manager', serverUserId?: string, serverUserName?: string) {"
new_sig = "export function getDummyClient(role: string = 'Manager', serverUserId?: string, serverUserName?: string, serverUserEmail?: string) {"
content = content.replace(old_sig, new_sig)

# Update getUser hack
old_get_user = "u = { id: activeUserId, email: 'user@zentry.com', user_metadata: { full_name: serverUserName || `Akun ${role} (Preview)`, role: role } };"
new_get_user = "u = { id: activeUserId, email: serverUserEmail || 'admin@zentry.com', user_metadata: { full_name: serverUserName || `Akun ${role} (Preview)`, role: role } };"
content = content.replace(old_get_user, new_get_user)

# Update single() hack
old_single = "return { data: { id: serverUserId || 'dummy', full_name: serverUserName || `Akun ${role} (Preview)`, role: role }, error: null };"
new_single = "return { data: { id: serverUserId || 'dummy', email: serverUserEmail || 'admin@zentry.com', full_name: serverUserName || `Akun ${role} (Preview)`, role: role }, error: null };"
content = content.replace(old_single, new_single)

# Update signInWithPassword to save dummy_email
content = re.sub(
    r'document\.cookie = `dummy_name=\$\{encodeURIComponent\(found\.full_name\)\}; path=/; max-age=86400`;',
    r'document.cookie = `dummy_name=${encodeURIComponent(found.full_name)}; path=/; max-age=86400`;\n                document.cookie = `dummy_email=${encodeURIComponent(found.email)}; path=/; max-age=86400`;',
    content
)

# Update signUp to save dummy_email
content = re.sub(
    r'document\.cookie = `dummy_name=\$\{encodeURIComponent\(newUser\.user_metadata\.full_name\)\}; path=/; max-age=86400`;',
    r'document.cookie = `dummy_name=${encodeURIComponent(newUser.user_metadata.full_name)}; path=/; max-age=86400`;\n            document.cookie = `dummy_email=${encodeURIComponent(newUser.email)}; path=/; max-age=86400`;',
    content
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

# 2. Update server.ts
file_path_server = 'src/lib/supabase/server.ts'
with open(file_path_server, 'r', encoding='utf-8') as f:
    content_s = f.read()

old_s = "const decodedName = nameCookie ? decodeURIComponent(nameCookie) : undefined;\n    return getDummyClient(roleCookie, userIdCookie, decodedName);"
new_s = "const decodedName = nameCookie ? decodeURIComponent(nameCookie) : undefined;\n    const emailCookie = cookieStore.get('dummy_email')?.value;\n    const decodedEmail = emailCookie ? decodeURIComponent(emailCookie) : undefined;\n    return getDummyClient(roleCookie, userIdCookie, decodedName, decodedEmail);"
content_s = content_s.replace(old_s, new_s)

with open(file_path_server, 'w', encoding='utf-8') as f:
    f.write(content_s)

print("Injected dummy_email cookie hack.")

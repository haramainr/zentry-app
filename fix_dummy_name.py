import re

file_path = 'src/lib/supabase/dummy.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add serverUserName to signature
old_sig = "export function getDummyClient(role: string = 'Manager', serverUserId?: string) {"
new_sig = "export function getDummyClient(role: string = 'Manager', serverUserId?: string, serverUserName?: string) {"
content = content.replace(old_sig, new_sig)

# 2. Update getUser to use serverUserName
old_get_user = '''if (activeUserId && globalForDummy.dummyDataMap?.users) {
            const found = globalForDummy.dummyDataMap.users.find((x:any) => x.id === activeUserId);
            if (found) u = { id: found.id, email: found.email, user_metadata: { full_name: found.full_name, role: found.role } };
          }'''
new_get_user = '''if (activeUserId && globalForDummy.dummyDataMap?.users) {
            const found = globalForDummy.dummyDataMap.users.find((x:any) => x.id === activeUserId);
            if (found) {
                u = { id: found.id, email: found.email, user_metadata: { full_name: found.full_name, role: found.role } };
            } else {
                // If not found in server RAM (because it's only in client localStorage), construct from cookies
                u = { id: activeUserId, email: 'user@zentry.com', user_metadata: { full_name: serverUserName || Akun  (Preview), role: role } };
            }
          }'''
content = content.replace(old_get_user, new_get_user)

# 3. Intercept .single() inside createBuilder to return the fake profile if not found
old_single = '''single: () => {
          if (Array.isArray(currentData) && currentData.length > 0) {
            return { data: currentData[0], error: null };
          }
          return { data: null, error: new Error('No rows found') };
        },'''
new_single = '''single: () => {
          if (Array.isArray(currentData) && currentData.length > 0) {
            return { data: currentData[0], error: null };
          }
          // Hack for dummy SSR: if not found, return the dummyUser / cookie user
          if (table === 'users') {
              return { data: { id: serverUserId || 'dummy', full_name: serverUserName || Akun  (Preview), role: role }, error: null };
          }
          return { data: null, error: new Error('No rows found') };
        },'''
content = content.replace(old_single, new_single)

# 4. Set dummy_name cookie in signInWithPassword
old_signin_cookie = '''document.cookie = dummy_user_id=; path=/; max-age=86400;'''
new_signin_cookie = '''document.cookie = dummy_user_id=; path=/; max-age=86400;
                document.cookie = dummy_name=; path=/; max-age=86400;'''
content = content.replace(old_signin_cookie, new_signin_cookie)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated dummy.ts with full name cookie hack.")

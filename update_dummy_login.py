import re

file_path = 'src/lib/supabase/dummy.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_signin = "signInWithPassword: async () => ({ data: { user: dummyUser, session: { user: dummyUser } }, error: null }),"
new_signin = '''signInWithPassword: async (credentials: any) => {
        let u = dummyUser;
        if (globalForDummy.dummyDataMap?.users) {
          const found = globalForDummy.dummyDataMap.users.find((x:any) => x.email === credentials.email);
          if (found) {
            u = { id: found.id, email: found.email, user_metadata: { full_name: found.full_name, role: found.role } };
            if (typeof document !== 'undefined') {
              document.cookie = dummy_auth=true; path=/; max-age=86400;
              document.cookie = dummy_role=; path=/; max-age=86400;
              document.cookie = dummy_user_id=; path=/; max-age=86400;
            }
            return { data: { user: u, session: { user: u } }, error: null };
          }
        }
        return { data: { user: null, session: null }, error: new Error('User not found in dummy DB') };
      },'''

content = content.replace(old_signin, new_signin)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated dummy signInWithPassword to support real dummy accounts.")

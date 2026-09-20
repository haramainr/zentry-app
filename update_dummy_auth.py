import re

file_path = 'src/lib/supabase/dummy.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Make signUp return a newly created dummy user that defaults to pending
old_signup = "signUp: async (credentials: any) => ({ data: { user: dummyUser, session: { user: dummyUser } }, error: null }),"
new_signup = '''signUp: async (credentials: any) => {
        const newUser = {
          id: 'dummy-new-' + Date.now(),
          email: credentials.email,
          user_metadata: { full_name: credentials.options?.data?.full_name, role: credentials.options?.data?.role }
        };
        // Add to dummy db
        globalForDummy.dummyDataMap.users.push({
          id: newUser.id,
          full_name: newUser.user_metadata.full_name,
          role: newUser.user_metadata.role,
          subscription_status: 'Pending Approval',
          email: newUser.email,
          supervisor_id: credentials.options?.data?.supervisor_id || null
        });
        if (typeof document !== 'undefined') {
          document.cookie = dummy_auth=true; path=/; max-age=86400;
          document.cookie = dummy_role=; path=/; max-age=86400;
          document.cookie = dummy_user_id=; path=/; max-age=86400;
        }
        return { data: { user: newUser, session: { user: newUser } }, error: null };
      },'''

content = content.replace(old_signup, new_signup)

# Also update getUser to respect dummy_user_id cookie so the suspended page works
old_getuser = "getUser: async () => ({ data: { user: dummyUser }, error: null }),"
new_getuser = '''getUser: async () => {
        let u = dummyUser;
        if (typeof document !== 'undefined') {
          const match = document.cookie.match(/dummy_user_id=([^;]+)/);
          if (match && globalForDummy.dummyDataMap?.users) {
            const found = globalForDummy.dummyDataMap.users.find((x:any) => x.id === match[1]);
            if (found) u = { id: found.id, email: found.email, user_metadata: { full_name: found.full_name, role: found.role } };
          }
        }
        return { data: { user: u }, error: null };
      },'''

content = content.replace(old_getuser, new_getuser)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated dummy.ts mock logic.")

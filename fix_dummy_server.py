import re

file_path = 'src/lib/supabase/dummy.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Change getDummyClient signature to accept userId
old_sig = "export function getDummyClient(role: string = 'Manager') {"
new_sig = "export function getDummyClient(role: string = 'Manager', serverUserId?: string) {"
content = content.replace(old_sig, new_sig)

# Change dummyUser to use the actual user if serverUserId is provided
old_dummy_user = '''const dummyUser = {
    id: 'dummy-admin-id',
    email: 'admin@zentry.com',
    user_metadata: { full_name: Akun  (Preview), role: role }
  };'''

new_dummy_user = '''let dummyUser = {
    id: 'dummy-admin-id',
    email: 'admin@zentry.com',
    user_metadata: { full_name: Akun  (Preview), role: role }
  };'''
content = content.replace(old_dummy_user, new_dummy_user)

# Update getUser to use serverUserId on the server
old_get_user = '''getUser: async () => {
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

new_get_user = '''getUser: async () => {
          let u = dummyUser;
          let activeUserId = serverUserId;
          
          if (typeof document !== 'undefined') {
            const match = document.cookie.match(/dummy_user_id=([^;]+)/);
            if (match) activeUserId = match[1];
          }
          
          if (activeUserId && globalForDummy.dummyDataMap?.users) {
            const found = globalForDummy.dummyDataMap.users.find((x:any) => x.id === activeUserId);
            if (found) u = { id: found.id, email: found.email, user_metadata: { full_name: found.full_name, role: found.role } };
          }
          
          return { data: { user: u }, error: null };
        },'''
content = content.replace(old_get_user, new_get_user)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated dummy.ts to support serverUserId.")

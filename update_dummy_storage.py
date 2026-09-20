import re

file_path = 'src/lib/supabase/dummy.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace globalForDummy memory map with localStorage logic for users
old_init = '''if (!globalForDummy.dummyDataMap) {'''
new_init = '''
  // Try to load from localStorage first
  if (typeof window !== 'undefined' && !globalForDummy.dummyDataMap) {
    const saved = localStorage.getItem('dummyDataMap');
    if (saved) {
      try {
        globalForDummy.dummyDataMap = JSON.parse(saved);
      } catch(e) {}
    }
  }

  if (!globalForDummy.dummyDataMap) {'''

content = content.replace(old_init, new_init)

# Add save to localStorage after insert/update/delete
old_execute = '''if (pendingDelete && Array.isArray(currentData)) {
        currentData.forEach(item => {
          const index = dummyDataMap[table].findIndex((i: any) => i.id === item.id);
          if (index !== -1) dummyDataMap[table].splice(index, 1);
        });
        currentData = [];
        pendingDelete = false;
      }'''

new_execute = old_execute + '''
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('dummyDataMap', JSON.stringify(dummyDataMap));
      }'''
      
content = content.replace(old_execute, new_execute)

old_insert = '''dummyDataMap[table] = [...(dummyDataMap[table] || []), ...newItems];
        currentData = newItems; // Return the newly inserted items'''

new_insert = old_insert + '''
        if (typeof window !== 'undefined') {
          localStorage.setItem('dummyDataMap', JSON.stringify(dummyDataMap));
        }'''

content = content.replace(old_insert, new_insert)

old_signup = '''globalForDummy.dummyDataMap.users.push({
          id: newUser.id,
          full_name: newUser.user_metadata.full_name,
          role: newUser.user_metadata.role,
          subscription_status: 'Pending Approval',
          email: newUser.email,
          supervisor_id: credentials.options?.data?.supervisor_id || null
        });'''

new_signup = old_signup + '''
        if (typeof window !== 'undefined') {
          localStorage.setItem('dummyDataMap', JSON.stringify(globalForDummy.dummyDataMap));
        }'''
        
content = content.replace(old_signup, new_signup)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Added localStorage persistence to dummy DB.")

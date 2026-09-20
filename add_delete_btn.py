import re

file_path = 'src/app/developer/users/page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add Trash2 icon
old_icon = 'import { UserCog, Edit, Search, Save, X, Shield, Users } from "lucide-react";'
new_icon = 'import { UserCog, Edit, Trash2, Search, Save, X, Shield, Users } from "lucide-react";'
content = content.replace(old_icon, new_icon)

# 2. Add handleDelete function
old_handle = '''const handleEditClick = (user: any) => {'''
new_handle = '''const handleDelete = async (user: any) => {
    if (!confirm(Apakah Anda yakin ingin menghapus akun  secara permanen? Data ini tidak dapat dipulihkan.)) return;
    
    setLoading(true);
    const { error } = await supabase.from('users').delete().eq('id', user.id);
    
    if (error) {
      alert("Gagal menghapus akun: " + error.message);
    } else {
      alert("Akun berhasil dihapus!");
      fetchUsers();
    }
    setLoading(false);
  };

  const handleEditClick = (user: any) => {'''
content = content.replace(old_handle, new_handle)

# 3. Add Delete button in the table row
old_btn = '''<td style={{ padding: '16px', textAlign: 'right' }}>
                      <button 
                        onClick={() => handleEditClick(user)}
                        style={{ 
                          background: 'none', border: 'none', cursor: 'pointer', color: '#60A5FA',
                          display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px',
                          borderRadius: '6px', backgroundColor: 'rgba(59, 130, 246, 0.1)'
                        }}
                      >
                        <Edit size={16} /> Edit
                      </button>
                    </td>'''

new_btn = '''<td style={{ padding: '16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        <button 
                          onClick={() => handleEditClick(user)}
                          style={{ 
                            background: 'none', border: 'none', cursor: 'pointer', color: '#60A5FA',
                            display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px',
                            borderRadius: '6px', backgroundColor: 'rgba(59, 130, 246, 0.1)'
                          }}
                        >
                          <Edit size={16} /> Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(user)}
                          style={{ 
                            background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444',
                            display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px',
                            borderRadius: '6px', backgroundColor: 'rgba(239, 68, 68, 0.1)'
                          }}
                        >
                          <Trash2 size={16} /> Hapus
                        </button>
                      </div>
                    </td>'''
content = content.replace(old_btn, new_btn)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Added delete button to user management.")

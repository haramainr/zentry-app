import re

file_path = 'src/components/DeveloperSubscriptionsClient.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add durations state
state_old = "const [users, setUsers] = useState<any[]>([]);"
state_new = "const [users, setUsers] = useState<any[]>([]);\n  const [durations, setDurations] = useState<{ [key: string]: number }>({});"
content = content.replace(state_old, state_new)

# 2. Modify activateUser
activate_old = '''const activateUser = async (userId: string) => {
    if (!confirm('Aktifkan akun ini selama 30 hari?')) return;
    
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);'''

activate_new = '''const activateUser = async (userId: string, days: number) => {
    if (!confirm(Aktifkan akun ini selama  hari?)) return;
    
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + days);'''

content = content.replace(activate_old, activate_new)

# 3. Modify the UI for the button
ui_old = '''<td style={{ padding: '12px', textAlign: 'right' }}>
                      <button 
                        onClick={() => activateUser(u.id)}
                        style={{ backgroundColor: '#3B82F6', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                      >
                        Aktifkan 30 Hari
                      </button>
                    </td>'''

ui_new = '''<td style={{ padding: '12px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        <select 
                          value={durations[u.id] || 30} 
                          onChange={(e) => setDurations({...durations, [u.id]: parseInt(e.target.value)})}
                          style={{ backgroundColor: '#1E293B', color: '#E2E8F0', border: '1px solid #334155', borderRadius: '4px', padding: '5px 8px', fontSize: '0.8rem', outline: 'none' }}
                        >
                          <option value={7}>7 Hari</option>
                          <option value={30}>30 Hari</option>
                          <option value={90}>3 Bulan</option>
                          <option value={180}>6 Bulan</option>
                          <option value={365}>1 Tahun</option>
                        </select>
                        <button 
                          onClick={() => activateUser(u.id, durations[u.id] || 30)}
                          style={{ backgroundColor: '#3B82F6', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                          Aktifkan
                        </button>
                      </div>
                    </td>'''

content = content.replace(ui_old, ui_new)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Added duration selection to DeveloperSubscriptionsClient.")

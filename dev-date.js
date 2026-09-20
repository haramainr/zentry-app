const fs = require('fs');
let code = fs.readFileSync('src/app/developer/users/page.tsx', 'utf-8');

// 1. Update setEditForm state
code = code.replace(
  /subscription_status: ''\n    }\);/,
  `subscription_status: '',\n      subscription_end_date: ''\n    });`
);

// 2. Update handleEditClick
code = code.replace(
  /subscription_status: user\.subscription_status \|\| 'Active'\n      }\);/,
  `subscription_status: user.subscription_status || 'Active',\n        subscription_end_date: user.subscription_end_date ? new Date(user.subscription_end_date).toISOString().split('T')[0] : ''\n      });`
);

// 3. Update handleSave payload logic
code = code.replace(
  /if \(editForm\.subscription_status === 'Active' && editingUser\.subscription_status !== 'Active'\) \{\n        const expiry = new Date\(\);\n        expiry\.setDate\(expiry\.getDate\(\) \+ 30\);\n        payload\.subscription_end_date = expiry\.toISOString\(\);\n      \}/,
  `if (editForm.subscription_status === 'Active') {
        if (editForm.subscription_end_date) {
          payload.subscription_end_date = new Date(editForm.subscription_end_date).toISOString();
        } else {
          const expiry = new Date();
          expiry.setDate(expiry.getDate() + 30);
          payload.subscription_end_date = expiry.toISOString();
        }
      }`
);

// 4. Replace the old button with the Date Input UI
const oldBtnRegex = /\{\s*editingUser\.subscription_status === 'Active' && \([\s\S]*?\+ Perpanjang 30 Hari\s*<\/button>\s*\)\s*\}/m;
const dateUI = `
                {editForm.subscription_status === 'Active' && (
                  <div style={{ marginTop: '16px' }}>
                    <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: '#94A3B8' }}>Tanggal Berakhir Lisensi</p>
                    <input 
                      type="date" 
                      value={editForm.subscription_end_date}
                      onChange={(e) => setEditForm({...editForm, subscription_end_date: e.target.value})}
                      style={{ width: '100%', padding: '10px 14px', backgroundColor: '#0F172A', color: 'white', borderRadius: '6px', border: '1px solid #334155', outline: 'none', colorScheme: 'dark' }}
                    />
                  </div>
                )}
`;

code = code.replace(oldBtnRegex, dateUI);

fs.writeFileSync('src/app/developer/users/page.tsx', code);

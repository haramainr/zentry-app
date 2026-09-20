const fs = require('fs');
let code = fs.readFileSync('src/app/developer/users/page.tsx', 'utf-8');

code = code.replace(
  /const\s+\[editForm,\s*setEditForm\]\s*=\s*useState\(\{\s*role:\s*'',\s*supervisor_id:\s*'',\s*subscription_status:\s*''\s*\}\);/,
  `const [editForm, setEditForm] = useState({
      role: '',
      supervisor_id: '',
      subscription_status: '',
      subscription_end_date: ''
    });`
);

code = code.replace(
  /setEditForm\(\{\s*role:\s*user\.role,\s*supervisor_id:\s*user\.supervisor_id\s*\|\|\s*'',\s*subscription_status:\s*user\.subscription_status\s*\|\|\s*'Active'\s*\}\);/,
  `setEditForm({
        role: user.role,
        supervisor_id: user.supervisor_id || '',
        subscription_status: user.subscription_status || 'Active',
        subscription_end_date: user.subscription_end_date ? new Date(user.subscription_end_date).toISOString().split('T')[0] : ''
      });`
);

fs.writeFileSync('src/app/developer/users/page.tsx', code);

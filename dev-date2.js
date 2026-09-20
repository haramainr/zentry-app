const fs = require('fs');
let code = fs.readFileSync('src/app/developer/users/page.tsx', 'utf-8');

code = code.replace(
  /if\s*\(\s*editForm\.subscription_status === 'Active' && editingUser\.subscription_status !== 'Active'\s*\)\s*\{[\s\S]*?payload\.subscription_end_date = expiry\.toISOString\(\);\s*\}/,
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

fs.writeFileSync('src/app/developer/users/page.tsx', code);

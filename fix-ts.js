const fs = require('fs');
let code = fs.readFileSync('src/app/developer/users/page.tsx', 'utf-8');

code = code.replace(
  "subscription_status: ''\n    });",
  "subscription_status: '',\n      subscription_end_date: ''\n    });"
);

// We should also replace the editForm assignment in handleEditClick, but we didn't use any types for it.
// Oh wait, TS is inferring the type from the initial useState object. 
// So changing the initial state object fixes it!

code = code.replace(
  "subscription_status: user.subscription_status || 'Active'\n      });",
  "subscription_status: user.subscription_status || 'Active',\n        subscription_end_date: user.subscription_end_date ? new Date(user.subscription_end_date).toISOString().split('T')[0] : ''\n      });"
);

fs.writeFileSync('src/app/developer/users/page.tsx', code);

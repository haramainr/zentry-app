const fs = require('fs');
let code = fs.readFileSync('src/app/sales/page.tsx', 'utf-8');
code = code.replace("!</h1>", "👋</h1>");
fs.writeFileSync('src/app/sales/page.tsx', code, 'utf-8');

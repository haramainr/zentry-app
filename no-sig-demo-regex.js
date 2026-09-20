const fs = require('fs');
let code = fs.readFileSync('src/app/api/generate-pdf/route.ts', 'utf-8');

code = code.replace(
  /leaderSignatureBase64 = WINDIH_SIGNATURE;\s*leaderFullName = 'Windih Niswanti Yanna';/,
  `leaderSignatureBase64 = WINDIH_SIGNATURE;
          leaderFullName = 'Windih Niswanti Yanna';
          
          if (user.email === 'demo_sales@zentry.com') {
            salesSignatureBase64 = null;
            data.signature = null;
            data.salesNameManual = '';
            salesFullName = '';
            leaderSignatureBase64 = null;
            leaderFullName = '';
          }`
);

fs.writeFileSync('src/app/api/generate-pdf/route.ts', code);

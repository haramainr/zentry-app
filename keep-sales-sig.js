const fs = require('fs');
let code = fs.readFileSync('src/app/api/generate-pdf/route.ts', 'utf-8');

const oldLogic = `if (user.email === 'demo_sales@zentry.com') {
            salesSignatureBase64 = null;
            data.signature = null;
            data.salesNameManual = '';
            salesFullName = '';
            leaderSignatureBase64 = null;
            leaderFullName = '';
          }`;

const newLogic = `if (user.email === 'demo_sales@zentry.com') {
            // HANYA hapus TTD Leader. TTD Sales tetap dipertahankan.
            leaderSignatureBase64 = null;
            leaderFullName = '';
          }`;

code = code.replace(oldLogic, newLogic);

fs.writeFileSync('src/app/api/generate-pdf/route.ts', code);

const fs = require('fs');
let code = fs.readFileSync('src/app/api/generate-pdf/route.ts', 'utf-8');

// Insert the demo logic where user email is checked
code = code.replace(
  `// PURE MANUAL UNTUK SALES
          salesSignatureBase64 = null;`,
  `// PURE MANUAL UNTUK SALES
          salesSignatureBase64 = null;
          
          if (user.email === 'demo_sales@zentry.com') {
            data.signature = null;
            data.salesNameManual = '';
            leaderFullName = '';
          }`
);

// We also need to clear out leaderSignatureBase64 for the demo account
code = code.replace(
  `// TETAP KUNCI NAMA & TTD LEADER (WINDIH)
          leaderSignatureBase64 = WINDIH_SIGNATURE;
          leaderFullName = 'Windih Niswanti Yanna';`,
  `// TETAP KUNCI NAMA & TTD LEADER (WINDIH)
          leaderSignatureBase64 = WINDIH_SIGNATURE;
          leaderFullName = 'Windih Niswanti Yanna';
          
          if (user.email === 'demo_sales@zentry.com') {
            leaderSignatureBase64 = null;
            leaderFullName = '';
          }`
);

fs.writeFileSync('src/app/api/generate-pdf/route.ts', code);

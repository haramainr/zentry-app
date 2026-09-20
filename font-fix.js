const fs = require('fs');
let code = fs.readFileSync('src/components/HistoryClient.tsx', 'utf-8');

code = code.replace(
  /<td style=\{\{\s*padding: '20px 22px',\s*fontSize: '0.98rem',\s*fontWeight: 700,\s*color: '#0F172A'\s*\}\}>/g,
  `<td style={{ padding: '20px 22px', fontSize: '0.9rem', fontWeight: 600, color: '#0F172A' }}>`
);

fs.writeFileSync('src/components/HistoryClient.tsx', code);

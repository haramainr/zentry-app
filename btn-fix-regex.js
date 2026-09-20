const fs = require('fs');
let code = fs.readFileSync('src/components/HistoryClient.tsx', 'utf-8');

code = code.replace(
  /backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE',\s*color: '#1D4ED8'/g,
  `backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0',
                                    color: '#334155'`
);

code = code.replace(
  /onMouseEnter=\{\(e\) => \{ e.currentTarget.style.backgroundColor = '#DBEAFE'; e.currentTarget.style.borderColor = '#93C5FD'; \}\}/g,
  `onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F1F5F9'; e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.color = '#0F172A'; }}`
);

code = code.replace(
  /onMouseLeave=\{\(e\) => \{ e.currentTarget.style.backgroundColor = '#EFF6FF'; e.currentTarget.style.borderColor = '#BFDBFE'; \}\}/g,
  `onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#F8FAFC'; e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#334155'; }}`
);

fs.writeFileSync('src/components/HistoryClient.tsx', code);

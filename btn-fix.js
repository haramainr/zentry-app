const fs = require('fs');
let code = fs.readFileSync('src/components/HistoryClient.tsx', 'utf-8');

const oldStyle = `                                  style={{ 
                                    padding: '8px 18px', borderRadius: '10px',
                                    backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE',
                                    color: '#1D4ED8', fontWeight: 700, fontSize: '0.85rem',
                                    textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#DBEAFE'; e.currentTarget.style.borderColor = '#93C5FD'; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#EFF6FF'; e.currentTarget.style.borderColor = '#BFDBFE'; }}`;

const newStyle = `                                  style={{ 
                                    padding: '8px 18px', borderRadius: '10px',
                                    backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0',
                                    color: '#334155', fontWeight: 700, fontSize: '0.85rem',
                                    textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F1F5F9'; e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.color = '#0F172A'; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#F8FAFC'; e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#334155'; }}`;

code = code.replace(oldStyle, newStyle);

fs.writeFileSync('src/components/HistoryClient.tsx', code);

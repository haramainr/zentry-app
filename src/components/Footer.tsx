import React from 'react';

export default function Footer() {
  return (
    <footer style={{
      textAlign: 'center',
      padding: '24px 32px',
      fontSize: '0.85rem',
      color: '#64748B',
      borderTop: '1px solid #E2E8F0',
      marginTop: 'auto',
      backgroundColor: '#FFFFFF',
      boxShadow: '0 -4px 20px -10px rgba(0,0,0,0.05)'
    }}>
      <p style={{ margin: 0 }}>
        &copy; {new Date().getFullYear()} ZEntry. All rights reserved. Developed by Zyntaxera
      </p>
    </footer>
  );
}

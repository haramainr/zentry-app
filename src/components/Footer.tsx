"use client";

import React from 'react';

interface FooterProps {
  isDark?: boolean;
}

export default function Footer({ isDark = false }: FooterProps) {
  return (
    <footer style={{
      textAlign: 'center',
      padding: '20px 24px',
      fontSize: '0.8rem',
      color: isDark ? '#94A3B8' : '#64748B',
      borderTop: isDark ? '1px solid #1E293B' : '1px solid #E2E8F0',
      marginTop: 'auto',
      backgroundColor: isDark ? '#0B1120' : '#FFFFFF',
      boxShadow: isDark ? 'none' : '0 -2px 10px rgba(0,0,0,0.02)',
      transition: 'all 0.2s ease'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
        <p style={{ margin: 0, fontWeight: 500 }}>
          &copy; {new Date().getFullYear()} <strong style={{ color: isDark ? '#F1F5F9' : '#0F172A' }}>ZEntry Database System</strong>. All rights reserved.
        </p>
        <p style={{ margin: 0, fontSize: '0.75rem', color: isDark ? '#64748B' : '#94A3B8' }}>
          Developed by{' '}
          <span style={{ fontWeight: 600, color: isDark ? '#E2E8F0' : '#334155' }}>Zyntaxera</span>
        </p>
      </div>
    </footer>
  );
}

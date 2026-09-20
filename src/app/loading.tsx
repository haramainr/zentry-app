export default function GlobalLoading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#F8FAFC', gap: '16px' }}>
      <div style={{ 
        width: '40px', 
        height: '40px', 
        border: '4px solid #E2E8F0', 
        borderTop: '4px solid #2563EB', 
        borderRadius: '50%', 
        animation: 'spin 1s linear infinite' 
      }} />
      <div style={{ fontWeight: 600, color: '#64748B', fontSize: '0.95rem' }}>Mohon tunggu...</div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

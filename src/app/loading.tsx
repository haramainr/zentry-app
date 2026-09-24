export default function GlobalLoading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#F8FAFC', gap: '20px' }}>
      
      {/* Sleek Text */}
      <div style={{ fontWeight: 600, color: '#475569', fontSize: '0.9rem', letterSpacing: '0.5px', animation: 'pulse-text 2s ease-in-out infinite' }}>
        Mohon tunggu...
      </div>

      {/* Linear Loader */}
      <div style={{ 
        width: '160px', 
        height: '4px', 
        backgroundColor: '#E2E8F0', 
        borderRadius: '99px', 
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{ 
          position: 'absolute',
          top: 0, bottom: 0, left: 0,
          width: '50%',
          backgroundColor: '#2563EB',
          borderRadius: '99px',
          animation: 'sweep 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite'
        }} />
      </div>

      <style>{`
        @keyframes sweep {
          0% { transform: translateX(-150%); }
          100% { transform: translateX(250%); }
        }
        @keyframes pulse-text {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

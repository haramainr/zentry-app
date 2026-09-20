import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";

export default function DeveloperLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex stack-mobile" style={{ minHeight: '100vh', backgroundColor: '#0F172A' }}>
      <Sidebar role="Developer" />

      {/* Main Content Area */}
      <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Developer Mode Banner */}
        <div style={{ backgroundColor: '#F59E0B', color: '#78350F', padding: '8px 16px', fontSize: '0.875rem', fontWeight: 600, textAlign: 'center' }}>
          DEVELOPER MODE ACTIVE: You have elevated privileges.
        </div>
        
        <div style={{ flex: 1, color: '#F8FAFC' }}>
          {children}
        </div>
        
        <div style={{ filter: 'invert(1) hue-rotate(180deg)' }}>
          <Footer />
        </div>
      </main>
    </div>
  );
}

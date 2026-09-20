export default function LeaderCalendarPage() {
  return (
    <div className="animate-fade-in" style={{ padding: 'var(--spacing-xl)' }}>
      <header style={{ marginBottom: 'var(--spacing-xl)' }}>
        <h1 className="h2" style={{ color: 'var(--text-primary)' }}>Jadwal Pemasangan</h1>
        <p className="text-body">Fitur Kalender sedang dalam tahap pengembangan (Coming Soon).</p>
      </header>

      <div className="card" style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: 'var(--spacing-md)' }}>📅</span>
          Modul Kalender Pemasangan akan segera hadir pada rilis berikutnya.
        </div>
      </div>
    </div>
  );
}

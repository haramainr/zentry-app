"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Clock, CheckCircle2, XCircle, Search, Filter, 
  RotateCcw, MoreVertical, ChevronLeft, ChevronRight, FolderOpen, 
  Globe, FileText, Check, Copy, ExternalLink, Calendar, ArrowUpRight, Edit, Trash2
} from "lucide-react";
import Select from "react-select";

export default function HistoryClient({ initialSubmissions }: { initialSubmissions: any[] }) {
  const [submissionsData, setSubmissionsData] = useState<any[]>(initialSubmissions);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [dateFilter, setDateFilter] = useState("");
  
  const [selectedPackages, setSelectedPackages] = useState({
    Fiber: true,
    Safe: true,
    Soho: true
  });
  const [selectedServices, setSelectedServices] = useState<{value: string, label: string}[]>([]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Dropdown More Menu State
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFilter, selectedPackages, selectedServices]);

  // Handle clicking outside to close dropdown (temporarily disabled to ensure it's not causing the bug)
  // useEffect(() => {
  //   const handleClickOutside = () => setActiveDropdownId(null);
  //   document.addEventListener("click", handleClickOutside);
  //   return () => document.removeEventListener("click", handleClickOutside);
  // }, []);

  const handlePackageToggle = (pkg: 'Fiber' | 'Safe' | 'Soho') => {
    setSelectedPackages(prev => ({
      ...prev,
      [pkg]: !prev[pkg]
    }));
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("Semua");
    setDateFilter("");
    setSelectedPackages({ Fiber: true, Safe: true, Soho: true });
    setSelectedServices([]);
    setCurrentPage(1);
  };

  const allAvailableServices = useMemo(() => {
    const { PACKAGES_DATA } = require('@/lib/packagesData');
    const pkgs = new Set<string>();
    
    if (PACKAGES_DATA) {
      Object.keys(PACKAGES_DATA).forEach(area => {
        const areaData = PACKAGES_DATA[area];
        let hasValidCategory = false;
        
        if (selectedPackages.Fiber && areaData['Fiber Reguler']) hasValidCategory = true;
        if (selectedPackages.Safe && areaData['Fiber Safe']) hasValidCategory = true;
        if (selectedPackages.Soho && areaData['Fiber Soho']) hasValidCategory = true;
        
        if (hasValidCategory) pkgs.add(area);
      });
    }

    submissionsData.forEach(sub => {
      let matchCat = false;
      if (sub.paket_layanan === 'Fiber' && selectedPackages.Fiber) matchCat = true;
      if (sub.paket_layanan === 'Safe' && selectedPackages.Safe) matchCat = true;
      if (sub.paket_layanan === 'Soho' && selectedPackages.Soho) matchCat = true;
      
      if (matchCat) {
        let p = sub.promo || 'Lainnya';
        if (p === 'NAB') p = 'Regular FS';
        pkgs.add(p);
      }
    });

    return Array.from(pkgs).map(p => ({ value: p, label: p }));
  }, [submissionsData, selectedPackages]);

  const filteredSubmissions = useMemo(() => {
    return submissionsData.filter((sub) => {
      // Filter Nama / ID
      const matchName = sub.nama_lengkap 
        ? sub.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) || sub.id.toLowerCase().includes(searchTerm.toLowerCase())
        : searchTerm === "" || sub.id.toLowerCase().includes(searchTerm.toLowerCase());

      // Filter Status
      let matchStatus = true;
      if (statusFilter === "Draft") {
        matchStatus = sub.is_draft === true;
      } else if (statusFilter === "Terkirim") {
        matchStatus = sub.is_draft === false;
      }

      // Filter Tanggal
      let matchDate = true;
      if (dateFilter) {
        const subDate = new Date(sub.created_at).toISOString().split('T')[0];
        matchDate = subDate === dateFilter;
      }
      
      // Filter Kategori Paket
      let matchPackage = true;
      if (sub.paket_layanan === 'Fiber' && !selectedPackages.Fiber) matchPackage = false;
      if (sub.paket_layanan === 'Safe' && !selectedPackages.Safe) matchPackage = false;
      if (sub.paket_layanan === 'Soho' && !selectedPackages.Soho) matchPackage = false;

      // Filter Layanan/Servis
      let matchService = true;
      if (selectedServices.length > 0) {
        const promoVal = sub.promo || 'Lainnya';
        matchService = selectedServices.some(s => s.value === promoVal);
      }

      return matchName && matchStatus && matchDate && matchPackage && matchService;
    });
  }, [submissionsData, searchTerm, statusFilter, dateFilter, selectedPackages, selectedServices]);

  // Calculations for Segmented Controls
  const counts = useMemo(() => {
    const total = submissionsData.length;
    const terkirim = submissionsData.filter(s => !s.is_draft).length;
    const draft = submissionsData.filter(s => s.is_draft).length;
    return { total, terkirim, draft };
  }, [submissionsData]);

  // Sliced Data for Pagination
  const totalPages = Math.max(1, Math.ceil(filteredSubmissions.length / pageSize));
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSubmissions.slice(start, start + pageSize);
  }, [filteredSubmissions, currentPage, pageSize]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return;
    
    try {
      const res = await fetch('/api/delete-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        setSubmissionsData(prev => prev.filter(sub => sub.id !== id));
        setActiveDropdownId(null);
      } else {
        alert('Gagal menghapus data: ' + data.error);
      }
    } catch (err) {
      alert('Terjadi kesalahan saat menghapus data.');
    }
  };

  const handleCopyId = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="animate-fade-in flex stack-mobile" style={{ padding: 'clamp(12px, 4vw, 32px)', backgroundColor: '#F8FAFC', minHeight: '100vh', flexDirection: 'column', gap: '28px' }}>
      
      {/* Header Section */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <Link 
            href="/sales" 
            style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '44px', height: '44px', borderRadius: '14px',
              backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0',
              color: '#0F172A', textDecoration: 'none',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F1F5F9'; e.currentTarget.style.borderColor = '#CBD5E1'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FFFFFF'; e.currentTarget.style.borderColor = '#E2E8F0'; }}
            title="Kembali ke Dashboard"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.5px' }}>Riwayat & Draft</h1>
            <p style={{ fontSize: '0.95rem', color: '#64748B', margin: 0, marginTop: '4px', fontWeight: 500 }}>
              Kelola dan pantau semua pendaftaran pelanggan Anda dengan mudah.
            </p>
          </div>
        </div>
      </header>

      {/* Filter Section (Premium Card) */}
      <div style={{ 
        background: '#FFFFFF', 
        borderRadius: '22px', 
        border: '1px solid #E2E8F0', 
        padding: '26px 28px', 
        boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        
        {/* Row 1: Search, Status, Date */}
        <div className="grid-mobile-1" style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1.2fr', gap: '16px' }}>
          
          {/* Cari Pelanggan */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Cari Pelanggan
            </label>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input 
                type="text" 
                placeholder="Nama pelanggan atau ID pendaftaran..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ 
                  width: '100%', height: '48px', paddingLeft: '44px', paddingRight: '16px',
                  borderRadius: '12px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF',
                  fontSize: '0.95rem', color: '#0F172A', outline: 'none', transition: 'all 0.2s ease'
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#475569'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(71, 85, 105, 0.12)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>
          </div>
          
          {/* Status Dropdown */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Status
            </label>
            <div style={{ position: 'relative' }}>
              <Filter size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ 
                  width: '100%', height: '48px', paddingLeft: '44px', paddingRight: '32px',
                  borderRadius: '12px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF',
                  fontSize: '0.95rem', color: '#0F172A', outline: 'none', cursor: 'pointer',
                  appearance: 'none', transition: 'all 0.2s ease', fontWeight: 500
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#475569'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(71, 85, 105, 0.12)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <option value="Semua">Semua Status</option>
                <option value="Draft">Draft (Belum Dikirim)</option>
                <option value="Terkirim">Terkirim</option>
              </select>
              <span style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748B', pointerEvents: 'none', fontSize: '0.8rem' }}>⌄</span>
            </div>
          </div>
          
          {/* Tanggal Pendaftaran */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Tanggal Pendaftaran
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                type="date" 
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                style={{ 
                  width: '100%', height: '48px', padding: '0 16px',
                  borderRadius: '12px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF',
                  fontSize: '0.95rem', color: dateFilter ? '#0F172A' : '#64748B', outline: 'none', 
                  transition: 'all 0.2s ease', fontWeight: 500
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#475569'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(71, 85, 105, 0.12)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>
          </div>
        </div>

        {/* Row 2: Package Category Chips, Services Select, Reset Button */}
        <div className="grid-mobile-1" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.6fr auto', gap: '20px', alignItems: 'end', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
          
          {/* Kategori Paket Chips */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Kategori Paket
            </label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {[
                { key: 'Fiber' as const, label: 'CBN Fiber' },
                { key: 'Safe' as const, label: 'CBN Fiber Safe' },
                { key: 'Soho' as const, label: 'CBN Fiber Pro' }
              ].map((item) => {
                const active = selectedPackages[item.key];
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handlePackageToggle(item.key)}
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '8px 16px', borderRadius: '12px',
                      border: `1.5px solid ${active ? '#64748B' : '#E2E8F0'}`, // CHANGED
                      backgroundColor: active ? '#F1F5F9' : '#F8FAFC', // CHANGED
                      color: active ? '#0F172A' : '#64748B', // CHANGED
                      fontSize: '0.88rem', fontWeight: active ? 700 : 600,
                      cursor: 'pointer', transition: 'all 0.2s ease',
                      boxShadow: active ? '0 2px 6px rgba(51, 65, 85, 0.15)' : 'none'
                    }}
                  >
                    <div style={{ 
                      width: '18px', height: '18px', borderRadius: '5px', 
                      backgroundColor: active ? '#334155' : '#FFFFFF', // CHANGED
                      border: `1px solid ${active ? '#334155' : '#CBD5E1'}`, // CHANGED
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF'
                    }}>
                      {active && <Check size={12} strokeWidth={3} />}
                    </div>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Layanan / Servis Spesifik */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Layanan / Servis Spesifik
            </label>
            <Select
              instanceId="history-services-filter"
              isMulti
              name="services"
              options={allAvailableServices}
              className="basic-multi-select"
              classNamePrefix="select"
              placeholder="Semua Layanan (Pilih untuk memfilter)"
              value={selectedServices}
              onChange={(newValue) => setSelectedServices(newValue as any)}
              styles={{
                control: (base, state) => ({
                  ...base,
                  minHeight: '48px',
                  borderColor: state.isFocused ? '#475569' : '#CBD5E1',
                  borderRadius: '12px',
                  padding: '2px 6px',
                  boxShadow: state.isFocused ? '0 0 0 3px rgba(71, 85, 105, 0.12)' : 'none',
                  '&:hover': { borderColor: '#94A3B8' },
                  backgroundColor: '#FFFFFF'
                }),
                multiValue: (base) => ({
                  ...base,
                  backgroundColor: '#F1F5F9',
                  borderRadius: '6px',
                  border: '1px solid #E2E8F0',
                }),
                multiValueLabel: (base) => ({
                  ...base,
                  color: '#1D4ED8',
                  fontWeight: 600,
                  fontSize: '0.85rem'
                }),
                multiValueRemove: (base) => ({
                  ...base,
                  color: '#475569',
                  '&:hover': { backgroundColor: '#E2E8F0', color: '#0F172A' },
                }),
              }}
            />
          </div>
          
          {/* Reset Filter Button */}
          <div>
            <button
              type="button"
              onClick={handleResetFilters}
              style={{ 
                height: '48px', padding: '0 20px', borderRadius: '12px',
                border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF',
                color: '#475569', fontSize: '0.9rem', fontWeight: 600,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                transition: 'all 0.2s ease', whiteSpace: 'nowrap',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F1F5F9'; e.currentTarget.style.color = '#0F172A'; e.currentTarget.style.borderColor = '#94A3B8'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FFFFFF'; e.currentTarget.style.color = '#475569'; e.currentTarget.style.borderColor = '#CBD5E1'; }}
            >
              <RotateCcw size={18} />
              <span>Reset Filter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Segmented Control (Statistik Tab) & Result Count Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Segmented Control */}
        <div style={{ 
          backgroundColor: '#F1F5F9', 
          padding: '6px', 
          borderRadius: '9999px', 
          display: 'inline-flex', 
          gap: '6px', 
          border: '1px solid #E2E8F0',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
        }}>
          {[
            { id: 'Semua', label: 'Semua', count: counts.total },
            { id: 'Terkirim', label: 'Terkirim', count: counts.terkirim },
            { id: 'Draft', label: 'Draft', count: counts.draft }
          ].map((tab) => {
            const active = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                style={{ 
                  padding: '10px 22px', 
                  borderRadius: '9999px', 
                  border: 'none',
                  backgroundColor: active ? '#1E293B' : 'transparent',
                  color: active ? '#FFFFFF' : '#475569',
                  fontWeight: active ? 700 : 600,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: active ? '0 4px 12px rgba(37, 99, 235, 0.3)' : 'none'
                }}
              >
                <span>{tab.label}</span>
                <span style={{ 
                  padding: '2px 8px', 
                  borderRadius: '9999px',
                  backgroundColor: active ? 'rgba(255, 255, 255, 0.25)' : '#E2E8F0',
                  color: active ? '#FFFFFF' : '#334155',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  transition: 'all 0.2s ease'
                }}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filtered Count Notice */}
        <div style={{ fontSize: '0.9rem', color: '#64748B', fontWeight: 500 }}>
          Menampilkan <strong style={{ color: '#0F172A' }}>{filteredSubmissions.length}</strong> data yang sesuai
        </div>
      </div>

      {/* Main Table Card */}
      <div style={{ 
        background: '#FFFFFF', 
        borderRadius: '22px', 
        border: '1px solid #E2E8F0', 
        boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.04)', 
        display: 'flex',
        flexDirection: 'column'
      }}>
        {filteredSubmissions.length === 0 ? (
          
          /* Minimalist Empty State */
          <div style={{ padding: '72px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#F1F5F9', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8',
              boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.05)'
            }}>
              <FolderOpen size={40} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0, marginBottom: '6px' }}>Belum Ada Data Pendaftaran</h3>
              <p style={{ fontSize: '0.95rem', color: '#64748B', margin: 0, maxWidth: '420px', lineHeight: 1.5 }}>
                Tidak ada data pendaftaran yang sesuai dengan kriteria filter saat ini. Coba atur ulang filter Anda atau buat pendaftaran baru.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetFilters}
              style={{ 
                marginTop: '8px', padding: '12px 24px', borderRadius: '14px',
                backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0',
                color: '#334155', fontWeight: 700, fontSize: '0.9rem',
                cursor: 'pointer', transition: 'all 0.2s ease',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F1F5F9'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#F8FAFC'; }}
            >
              <RotateCcw size={18} />
              <span>Atur Ulang Semua Filter</span>
            </button>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto', width: '100%', minHeight: '300px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
                
                {/* Sticky Header */}
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                    <th style={{ padding: '18px 22px', fontSize: '0.82rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tanggal</th>
                    <th style={{ padding: '18px 22px', fontSize: '0.82rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nama Pelanggan</th>
                    <th style={{ padding: '18px 22px', fontSize: '0.82rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nama Sales</th>
                    <th style={{ padding: '18px 22px', fontSize: '0.82rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Paket Layanan</th>
                    <th style={{ padding: '18px 22px', fontSize: '0.82rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                    <th style={{ padding: '18px 22px', fontSize: '0.82rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sumber</th>
                    <th style={{ padding: '18px 22px', fontSize: '0.82rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody>
                  {currentData.map((sub, idx) => {
                    const isDraft = sub.is_draft === true;
                    const formattedDate = new Date(sub.created_at).toLocaleString('id-ID', { 
                      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                    });

                    return (
                      <tr 
                        key={sub.id} 
                        style={{ 
                          borderBottom: idx === currentData.length - 1 ? 'none' : '1px solid #F1F5F9',
                          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                          backgroundColor: '#FFFFFF'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F1F5F9'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FFFFFF'; }}
                      >
                        {/* Tanggal */}
                        <td style={{ padding: '20px 22px', fontSize: '0.9rem', color: '#475569', fontWeight: 500, whiteSpace: 'nowrap' }}>
                          {formattedDate}
                        </td>

                        {/* Nama Pelanggan */}
                        <td style={{ padding: '20px 22px', fontSize: '0.9rem', fontWeight: 600, color: '#0F172A' }}>
                          {sub.nama_lengkap ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span>{sub.nama_lengkap}</span>
                            </div>
                          ) : (
                            <span style={{ color: '#94A3B8', fontStyle: 'italic', fontWeight: 500 }}>Tanpa Nama</span>
                          )}
                        </td>
                        {/* Nama Sales */}
                        <td style={{ padding: '20px 22px', fontSize: '0.9rem', color: '#475569', fontWeight: 500 }}>
                          {(() => {
                            let salesName = "-";
                            if (sub.vas) {
                              try {
                                const v = typeof sub.vas === 'string' ? JSON.parse(sub.vas) : sub.vas;
                                if (v && v.salesNameManual) salesName = v.salesNameManual;
                              } catch(e){}
                            }
                            return salesName;
                          })()}
                        </td>


                        {/* Paket */}
                        <td style={{ padding: '20px 22px', fontSize: '0.92rem', color: '#1E293B', fontWeight: 600 }}>
                          {sub.promo ? `${sub.promo} ` : ''}
                          {sub.paket_layanan === 'Fiber' ? 'CBN Fiber' : sub.paket_layanan === 'Safe' ? 'CBN Fiber Safe' : sub.paket_layanan === 'Soho' ? 'CBN Fiber Pro' : sub.paket_layanan}
                          {sub.paket_spec ? ` - ${sub.paket_spec}` : ''}
                        </td>

                        {/* Status Pill Badge */}
                        <td style={{ padding: '20px 22px' }}>
                          {isDraft ? (
                            <span style={{ 
                              display: 'inline-flex', alignItems: 'center', gap: '6px',
                              padding: '6px 14px', borderRadius: '9999px', fontSize: '0.82rem', fontWeight: 700,
                              backgroundColor: '#FFF7ED', color: '#EA580C', border: '1px solid #FED7AA',
                              boxShadow: '0 2px 4px rgba(234, 88, 12, 0.08)'
                            }}>
                              <Clock size={14} />
                              <span>Draft</span>
                            </span>
                          ) : (
                            <span style={{ 
                              display: 'inline-flex', alignItems: 'center', gap: '6px',
                              padding: '6px 14px', borderRadius: '9999px', fontSize: '0.82rem', fontWeight: 700,
                              backgroundColor: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0',
                              boxShadow: '0 2px 4px rgba(5, 150, 105, 0.08)'
                            }}>
                              <CheckCircle2 size={14} />
                              <span>Terkirim</span>
                            </span>
                          )}
                        </td>

                        {/* Sumber */}
                        <td style={{ padding: '20px 22px', fontSize: '0.9rem', color: '#64748B', fontWeight: 500 }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <Globe size={16} color="#94A3B8" />
                            <span>Form Online</span>
                          </span>
                        </td>

                        {/* Aksi & More Menu */}
                        <td style={{ padding: '20px 22px', textAlign: 'right', position: 'relative' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            
                            {isDraft ? (
                              <Link 
                                href={`/sales/form?draft_id=${sub.id}`}
                                style={{ 
                                  padding: '8px 18px', borderRadius: '10px',
                                  background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
                                  color: '#FFFFFF', fontWeight: 700, fontSize: '0.85rem',
                                  textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px',
                                  boxShadow: '0 4px 10px rgba(37, 99, 235, 0.3)',
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 14px rgba(37, 99, 235, 0.4)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 10px rgba(37, 99, 235, 0.3)'; }}
                              >
                                <span>Lanjutkan</span>
                                <ArrowUpRight size={15} />
                              </Link>
                            ) : (
                              <Link 
                                href={`/sales/form?draft_id=${sub.id}`}
                                style={{ 
                                  padding: '8px 18px', borderRadius: '10px',
                                  backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0',
                                    color: '#334155', fontWeight: 700, fontSize: '0.85rem',
                                  textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px',
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F1F5F9'; e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.color = '#0F172A'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#F8FAFC'; e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#334155'; }}
                              >
                                <span>Lihat Detail</span>
                              </Link>
                            )}

                            {/* More Options Menu Trigger */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDropdownId(activeDropdownId === sub.id ? null : sub.id);
                              }}
                              style={{ 
                                width: '36px', height: '36px', borderRadius: '10px',
                                backgroundColor: activeDropdownId === sub.id ? '#E2E8F0' : 'transparent',
                                border: 'none', color: '#475569', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F1F5F9'; e.currentTarget.style.color = '#0F172A'; }}
                              onMouseLeave={(e) => { if (activeDropdownId !== sub.id) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#475569'; } }}
                              title="Opsi Lainnya"
                            >
                              <MoreVertical size={18} />
                            </button>

                            {/* Dropdown Menu */}
                            {activeDropdownId === sub.id && (
                              <div style={{ 
                                position: 'absolute', right: '22px', top: '56px', zIndex: 50,
                                backgroundColor: '#FFFFFF', borderRadius: '14px',
                                border: '1px solid #E2E8F0', boxShadow: '0 12px 30px rgba(0, 0, 0, 0.12)',
                                padding: '6px', minWidth: '190px', textAlign: 'left',
                                animation: 'fadeIn 0.15s ease'
                              }}>
                                <button
                                  type="button"
                                  onClick={(e) => handleCopyId(e, sub.id)}
                                  style={{ 
                                    width: '100%', padding: '10px 14px', borderRadius: '8px',
                                    backgroundColor: 'transparent', border: 'none', color: '#334155',
                                    fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                    transition: 'all 0.15s ease'
                                  }}
                                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F1F5F9'; e.currentTarget.style.color = '#0F172A'; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#334155'; }}
                                >
                                  {copiedId === sub.id ? <Check size={16} color="#10B981" /> : <Copy size={16} />}
                                  <span>{copiedId === sub.id ? "ID Tersalin!" : "Salin ID Submission"}</span>
                                </button>
                                
                                <Link
                                  href={`/sales/form?draft_id=${sub.id}`}
                                  style={{ 
                                    width: '100%', padding: '10px 14px', borderRadius: '8px',
                                    backgroundColor: 'transparent', border: 'none', color: '#334155',
                                    fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                    textDecoration: 'none', transition: 'all 0.15s ease'
                                  }}
                                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F1F5F9'; e.currentTarget.style.color = '#0F172A'; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#334155'; }}
                                >
                                  <Edit size={16} />
                                  <span>Revisi / Edit Data</span>
                                </Link>

                                <button
                                  type="button"
                                  onClick={(e) => handleDelete(e, sub.id)}
                                  style={{ 
                                    width: '100%', padding: '10px 14px', borderRadius: '8px',
                                    backgroundColor: 'transparent', border: 'none', color: '#EF4444',
                                    fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                    transition: 'all 0.15s ease'
                                  }}
                                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FEF2F2'; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                                >
                                  <Trash2 size={16} />
                                  <span>Hapus Data</span>
                                </button>

                                {sub.pdf_url && (
                                  <a
                                    href={sub.pdf_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ 
                                      width: '100%', padding: '10px 14px', borderRadius: '8px',
                                      backgroundColor: 'transparent', border: 'none', color: '#2563EB',
                                      fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer',
                                      display: 'flex', alignItems: 'center', gap: '10px',
                                      textDecoration: 'none', transition: 'all 0.15s ease'
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#EFF6FF'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                                  >
                                    <FileText size={16} />
                                    <span>Lihat Bukti PDF</span>
                                  </a>
                                )}
                              </div>
                            )}

                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div style={{ 
              padding: '18px 24px', borderTop: '1px solid #E2E8F0', backgroundColor: '#FFFFFF',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px'
            }}>
              
              {/* Left: Display status */}
              <div style={{ fontSize: '0.9rem', color: '#64748B', fontWeight: 500 }}>
                Menampilkan <strong style={{ color: '#0F172A' }}>{(currentPage - 1) * pageSize + 1}</strong> - <strong style={{ color: '#0F172A' }}>{Math.min(currentPage * pageSize, filteredSubmissions.length)}</strong> dari <strong style={{ color: '#0F172A' }}>{filteredSubmissions.length}</strong> data
              </div>

              {/* Right: Page Size & Navigation Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                
                {/* Page Size Selector */}
                <select
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                  style={{ 
                    height: '38px', padding: '0 12px', borderRadius: '10px',
                    border: '1px solid #CBD5E1', backgroundColor: '#F8FAFC',
                    fontSize: '0.85rem', fontWeight: 600, color: '#334155',
                    cursor: 'pointer', outline: 'none'
                  }}
                >
                  <option value={10}>10 / halaman</option>
                  <option value={25}>25 / halaman</option>
                  <option value={50}>50 / halaman</option>
                </select>

                {/* Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  
                  {/* Prev Button */}
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    style={{ 
                      width: '38px', height: '38px', borderRadius: '10px',
                      border: '1px solid #CBD5E1', backgroundColor: currentPage === 1 ? '#F1F5F9' : '#FFFFFF',
                      color: currentPage === 1 ? '#94A3B8' : '#334155', cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => { if (currentPage !== 1) { e.currentTarget.style.backgroundColor = '#F1F5F9'; e.currentTarget.style.borderColor = '#94A3B8'; } }}
                    onMouseLeave={(e) => { if (currentPage !== 1) { e.currentTarget.style.backgroundColor = '#FFFFFF'; e.currentTarget.style.borderColor = '#CBD5E1'; } }}
                    title="Halaman Sebelumnya"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  {/* Page Numbers */}
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    // Show around current page
                    if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                      const active = pageNum === currentPage;
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setCurrentPage(pageNum)}
                          style={{ 
                            minWidth: '38px', height: '38px', padding: '0 12px', borderRadius: '10px',
                            border: active ? 'none' : '1px solid #CBD5E1',
                            background: active ? 'linear-gradient(135deg, #1E293B 0%, #334155 100%)' : '#FFFFFF',
                            color: active ? '#FFFFFF' : '#334155',
                            fontWeight: active ? 700 : 600, fontSize: '0.9rem',
                            cursor: 'pointer', transition: 'all 0.2s ease',
                            boxShadow: active ? '0 4px 10px rgba(37, 99, 235, 0.3)' : 'none'
                          }}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                      return <span key={pageNum} style={{ color: '#94A3B8', padding: '0 4px' }}>...</span>;
                    }
                    return null;
                  })}

                  {/* Next Button */}
                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    style={{ 
                      width: '38px', height: '38px', borderRadius: '10px',
                      border: '1px solid #CBD5E1', backgroundColor: currentPage === totalPages ? '#F1F5F9' : '#FFFFFF',
                      color: currentPage === totalPages ? '#94A3B8' : '#334155', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => { if (currentPage !== totalPages) { e.currentTarget.style.backgroundColor = '#F1F5F9'; e.currentTarget.style.borderColor = '#94A3B8'; } }}
                    onMouseLeave={(e) => { if (currentPage !== totalPages) { e.currentTarget.style.backgroundColor = '#FFFFFF'; e.currentTarget.style.borderColor = '#CBD5E1'; } }}
                    title="Halaman Berikutnya"
                  >
                    <ChevronRight size={18} />
                  </button>

                </div>
              </div>

            </div>
          </>
        )}
      </div>

    </div>
  );
}

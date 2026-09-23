"use client";

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import Select from 'react-select';
import ExportExcelButton from "@/components/ExportExcelButton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Users, FileEdit, CheckCircle2, ChevronRight } from "lucide-react";
import GlobalFilter from './GlobalFilter';

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#EF4444', '#14B8A6', '#F97316'];

function getTimeAgo(dateString: string) {
  if (!dateString) return 'Baru saja';
  const now = new Date();
  const date = new Date(dateString);
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  if (diffInMinutes < 1) return 'Baru saja';
  if (diffInMinutes < 60) return `${diffInMinutes} menit yang lalu`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} jam yang lalu`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} hari yang lalu`;
}

export default function SalesDashboardClient({ 
  submissions,
  role,
  currentUserId,
  usersList
}: { 
  submissions: any[];
  role?: string;
  currentUserId?: string;
  usersList?: any[];
}) {
  // Setup default dates (current month)
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const [startDate, setStartDate] = useState(firstDay.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);
  
  const [selectedPackages, setSelectedPackages] = useState({
    Fiber: true,
    Safe: true,
    Soho: true
  });
  const [selectedServices, setSelectedServices] = useState<{value: string, label: string}[]>([]);

  const handlePackageToggle = (pkg: string) => {
    setSelectedPackages(prev => ({
      ...prev,
      [pkg as keyof typeof prev]: !prev[pkg as keyof typeof prev]
    }));
  };

  const getFullPackageName = (sub: any) => {
    const paketName = sub.paket_layanan === 'Fiber' ? 'CBN Fiber' : sub.paket_layanan === 'Safe' ? 'CBN Fiber Safe' : sub.paket_layanan === 'Soho' ? 'CBN Fiber Pro' : sub.paket_layanan;
    let promoName = sub.promo || '';
    if (promoName === 'NAB') promoName = 'Regular FS';
    return `${promoName ? promoName + ' ' : ''}${paketName}${sub.paket_spec ? ' - ' + sub.paket_spec : ''}`;
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
        
        if (hasValidCategory) {
          pkgs.add(area);
        }
      });
    }

    submissions.forEach(sub => {
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
  }, [submissions, selectedPackages]);

  const filteredSubmissions = useMemo(() => {
    return submissions.filter(sub => {
      const subDate = new Date(sub.created_at).toISOString().split('T')[0];
      if (startDate && subDate < startDate) return false;
      if (endDate && subDate > endDate) return false;
      
      if (sub.paket_layanan === 'Fiber' && !selectedPackages.Fiber) return false;
      if (sub.paket_layanan === 'Safe' && !selectedPackages.Safe) return false;
      if (sub.paket_layanan === 'Soho' && !selectedPackages.Soho) return false;

      if (selectedServices.length > 0) {
        const promoVal = sub.promo || 'Lainnya';
        if (!selectedServices.some(s => s.value === promoVal)) return false;
      }
      
      return true;
    });
  }, [submissions, startDate, endDate, selectedPackages, selectedServices]);

  const sentSubmissions = filteredSubmissions.filter(s => !s.is_draft);
  const draftSubmissions = filteredSubmissions.filter(s => s.is_draft);
  
  const stats = {
    totalRegistrations: sentSubmissions.length,
    drafts: draftSubmissions.length,
    totalRevenue: sentSubmissions.reduce((sum, current) => sum + Number(current.biaya_total || 0), 0),
  };

  const activePackagesCount = Object.values(selectedPackages).filter(Boolean).length;
  const isSingleCategory = activePackagesCount === 1;
  const isSingleService = selectedServices.length === 1;
  const isLineChart = isSingleCategory || isSingleService;

  const pieData = useMemo(() => {
    if (isLineChart) return [];
    
    const counts: Record<string, number> = {};
    filteredSubmissions.forEach(sub => {
      const name = getFullPackageName(sub);
      counts[name] = (counts[name] || 0) + 1;
    });

    return Object.keys(counts)
      .map((name, index) => ({
        name,
        value: counts[name],
        color: COLORS[index % COLORS.length]
      }))
      .sort((a, b) => b.value - a.value); 
  }, [filteredSubmissions, isLineChart]);

  const lineKeys = useMemo(() => {
    if (!isLineChart) return [];
    const keys = new Set<string>();
    filteredSubmissions.forEach(sub => keys.add(getFullPackageName(sub)));
    return Array.from(keys);
  }, [filteredSubmissions, isLineChart]);

  const lineData = useMemo(() => {
    if (!isLineChart) return [];
    
    const days: any[] = [];
    if (!startDate || !endDate) return [];
    
    let currentDate = new Date(startDate);
    const end = new Date(endDate);
    
    let safeGuard = 0;
    while (currentDate <= end && safeGuard < 366) {
      const dateStr = currentDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      const dayObj: any = { date: dateStr, rawDate: currentDate.toISOString().split('T')[0] };
      lineKeys.forEach(k => { dayObj[k] = 0; });
      days.push(dayObj);
      
      currentDate.setDate(currentDate.getDate() + 1);
      safeGuard++;
    }
    
    filteredSubmissions.forEach(sub => {
      const rawDate = new Date(sub.created_at).toISOString().split('T')[0];
      const dayItem = days.find(d => d.rawDate === rawDate);
      if (dayItem) {
        const name = getFullPackageName(sub);
        dayItem[name]++;
      }
    });
    
    return days;
  }, [filteredSubmissions, isLineChart, startDate, endDate, lineKeys]);

  return (
    <>
      {/* Global Filters */}
      <GlobalFilter 
        startDate={startDate} setStartDate={setStartDate}
        endDate={endDate} setEndDate={setEndDate}
        selectedPackages={selectedPackages} handlePackageToggle={handlePackageToggle}
        allAvailableServices={allAvailableServices} selectedServices={selectedServices} setSelectedServices={setSelectedServices}
        actionButton={
          role && currentUserId && usersList ? (
            <ExportExcelButton role={role as any} currentUserId={currentUserId} usersList={usersList} />
          ) : undefined
        }
      />

        {/* Top Stats Cards */}
        <div className="grid-mobile-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '28px' }}>
          
          {/* Card 1: Total Pelanggan Didaftarkan */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px 22px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '10px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', flexShrink: 0 }}>
              <Users size={22} strokeWidth={2} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B', marginBottom: '2px' }}>Total Pelanggan Didaftarkan</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.1, marginBottom: '4px' }}>{stats.totalRegistrations}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>
                Formulir terkirim & aktif
              </div>
            </div>
          </div>

          {/* Card 2: Draft Belum Selesai */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px 22px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '10px', background: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EA580C', flexShrink: 0 }}>
              <FileEdit size={22} strokeWidth={2} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B', marginBottom: '2px' }}>Draft Belum Selesai</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.1, marginBottom: '4px' }}>{stats.drafts}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>
                {stats.drafts > 0 ? (
                  <Link href="/sales/history" style={{ color: '#EA580C', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    Lanjutkan pengisian →
                  </Link>
                ) : (
                  'Tidak ada draft tertunda'
                )}
              </div>
            </div>
          </div>

          {/* Card 3: Estimasi Pendapatan Total (Rp) */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px 22px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '10px', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', flexShrink: 0 }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>Rp</span>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B', marginBottom: '2px' }}>Estimasi Pendapatan Total</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.1, marginBottom: '4px' }}>
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(stats.totalRevenue)}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>
                Akumulasi nilai transaksi
              </div>
            </div>
          </div>
        </div>

      {/* Charts & More Info Grid */}
      <div className="grid-mobile-1" style={{ display: 'grid', gridTemplateColumns: '1.7fr 1.3fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Card: Komposisi Penjualan Paket */}
        <div className="komposisi-card" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px 24px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>Komposisi Penjualan Paket</h3>
            <div style={{ border: '1px solid #E2E8F0', padding: '4px 12px', borderRadius: '8px', color: '#475569', fontSize: '0.75rem', fontWeight: 600, background: '#F8FAFC' }}>
              Berdasarkan Jumlah ⏷
            </div>
          </div>

          {filteredSubmissions.length === 0 ? (
            <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontWeight: 500 }}>
              Belum ada data penjualan pada kriteria ini.
            </div>
          ) : isLineChart ? (
            <div style={{ height: '220px', width: '100%', minWidth: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '10px', border: '1px solid #E2E8F0', boxShadow: '0 4px 15px -3px rgba(0,0,0,0.1)' }}
                    labelStyle={{ fontWeight: 'bold', color: '#0F172A' }}
                  />
                  <Legend verticalAlign="top" height={30} />
                  {lineKeys.map((key, i) => (
                    <Line 
                      key={key}
                      type="monotone" 
                      dataKey={key} 
                      name={key} 
                      stroke={COLORS[i % COLORS.length]} 
                      strokeWidth={3} 
                      dot={{ r: 4, strokeWidth: 2 }} 
                      activeDot={{ r: 6, strokeWidth: 2 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div>
              <div className="komposisi-chart-flex" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '20px', minHeight: '180px', width: '100%' }}>
                  
                {/* Donut Chart with Center Text */}
                <div className="komposisi-donut-wrapper" style={{ position: 'relative', width: '180px', height: '180px', flexShrink: 0, alignSelf: 'center', margin: '0 auto' }}>
                  <PieChart width={180} height={180}>
                    <Pie
                      data={pieData}
                      cx={90}
                      cy={90}
                      innerRadius={55}
                      outerRadius={78}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#FFFFFF" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${value} Pelanggan`, 'Terjual']}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                    />
                  </PieChart>
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    pointerEvents: 'none'
                  }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Total</div>
                    <div style={{ fontSize: '1.75rem', color: '#0F172A', fontWeight: 800, lineHeight: 1, margin: '2px 0' }}>{sentSubmissions.length || filteredSubmissions.length}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 500 }}>Paket Terjual</div>
                  </div>
                </div>

                {/* Custom Percentage Legend */}
                <div className="komposisi-legend-wrapper" style={{ flex: 1, minWidth: '200px', maxHeight: '250px', overflowY: 'auto', paddingRight: '8px' }}>
                  {pieData.map((entry, idx) => {
                    const totalCount = sentSubmissions.length || filteredSubmissions.length || 1;
                    const percentage = ((entry.value / totalCount) * 100).toFixed(0);
                    return (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: idx === pieData.length - 1 ? 'none' : '1px solid #F8FAFC', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#334155', fontWeight: 500, paddingRight: '12px' }}>
                          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: entry.color, flexShrink: 0 }} />
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>{entry.name}</span>
                        </div>
                        <div style={{ fontWeight: 700, color: '#0F172A', flexShrink: 0 }}>
                          {entry.value} <span style={{ color: '#64748B', fontWeight: 400 }}>({percentage}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>

              {/* Bottom Link */}
              <div style={{ textAlign: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
                <a href="#detail-paket" style={{ color: '#2563EB', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  Lihat Detail Paket <ChevronRight size={16} />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Right Card: Aktivitas Terbaru */}
        <div className="komposisi-card" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px 24px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>Aktivitas Terbaru</h3>
            <Link href="/sales/history" style={{ textDecoration: 'none' }}>
              <span style={{ background: '#EFF6FF', color: '#2563EB', padding: '4px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#DBEAFE';
                  e.currentTarget.style.color = '#1D4ED8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#EFF6FF';
                  e.currentTarget.style.color = '#2563EB';
                }}
              >
                Lihat Semua
              </span>
            </Link>
          </div>

          {filteredSubmissions && filteredSubmissions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '250px', overflowY: 'auto', paddingRight: '4px' }}>
              {filteredSubmissions.map(sub => (
                <div key={sub.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid #F8FAFC' }}>
                  <div style={{ 
                    width: '36px', 
                    height: '36px', 
                    borderRadius: '50%', 
                    backgroundColor: sub.is_draft ? '#EFF6FF' : '#ECFDF5', 
                    color: sub.is_draft ? '#3B82F6' : '#10B981', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    flexShrink: 0,
                    marginTop: '2px'
                  }}>
                    {!sub.is_draft ? <CheckCircle2 size={18} /> : <FileEdit size={18} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {sub.nama_lengkap || 'Pelanggan'} <span style={{ color: '#64748B', fontWeight: 500 }}>- Paket {getFullPackageName(sub)}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px', color: sub.is_draft ? '#F59E0B' : '#10B981', fontWeight: 600 }}>
                      {!sub.is_draft ? '🚀 Berhasil Terkirim' : '📝 Draft Tersimpan'}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 500, whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {getTimeAgo(sub.created_at)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#94A3B8', fontSize: '0.85rem' }}>
              Belum ada aktivitas penjualan terbaru.
            </div>
          )}
        </div>

      </div>
    </>
  );
}

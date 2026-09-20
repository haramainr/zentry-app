"use client";

import React, { useState, useMemo } from 'react';
import { Users, FileText, CheckCircle, Clock, Banknote, TrendingUp } from "lucide-react";
import GlobalFilter from './GlobalFilter';
import ExportExcelButton from "@/components/ExportExcelButton";

export default function ManagerDashboardClient({ 
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
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState('');
  
  const [selectedPackages, setSelectedPackages] = useState({
    Fiber: true,
    Safe: true,
    Soho: true
  });

  const [selectedServices, setSelectedServices] = useState<{value: string, label: string}[]>([]);

  const handlePackageToggle = (pkg: string) => {
    setSelectedPackages(prev => ({ ...prev, [pkg as keyof typeof prev]: !prev[pkg as keyof typeof prev] }));
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
        let promoVal = sub.promo || 'Lainnya';
        if (promoVal === 'NAB') promoVal = 'Regular FS';
        if (!selectedServices.some(s => s.value === promoVal)) return false;
      }
      
      return true;
    });
  }, [submissions, startDate, endDate, selectedPackages, selectedServices]);

  // 1. Total Registrasi
  const totalRegistrations = filteredSubmissions.length;
  
  // 2. Registrasi Bulan Ini (within the filtered ones)
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const currentMonthSubmissions = filteredSubmissions.filter(sub => {
    const date = new Date(sub.created_at);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });
  
  const registrationsThisMonth = currentMonthSubmissions.length;

  // 3. Status Pemasangan (Semua Data yang di filter)
  const successRate = totalRegistrations > 0 ? 100 : 0;

  // 4. Total Revenue 
  const totalRevenue = filteredSubmissions.reduce((sum, curr) => sum + (Number(curr.biaya_total) || 0), 0);
    
  // 5. Revenue Bulan Ini
  const revenueThisMonth = currentMonthSubmissions.reduce((sum, curr) => sum + (Number(curr.biaya_total) || 0), 0);

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(angka);
  };

  return (
    <>
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

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-xl)' }}>
        
        {/* Card 1: Revenue Total */}
        <div className="card stat-card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', color: 'white' }}>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '16px', borderRadius: '50%' }}>
            <Banknote size={28} color="white" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>Total Revenue (Estimasi)</p>
            <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700 }}>{formatRupiah(totalRevenue)}</h2>
            <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8, marginTop: '4px' }}>
              <TrendingUp size={12} style={{ display: 'inline', marginRight: '4px' }} />
              Rp {revenueThisMonth.toLocaleString('id-ID')} bulan ini
            </p>
          </div>
        </div>

        {/* Card 2: Total Registrasi */}
        <div className="card stat-card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
          <div style={{ backgroundColor: '#EEF2FF', padding: '16px', borderRadius: '50%' }}>
            <FileText size={28} color="var(--solasi-blue)" />
          </div>
          <div>
            <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>Total Registrasi Global</p>
            <h2 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--text-primary)' }}>{totalRegistrations}</h2>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--success)', marginTop: '4px', fontWeight: 500 }}>
              +{registrationsThisMonth} registrasi bulan ini
            </p>
          </div>
        </div>

        {/* Card 3: Completion Rate */}
        <div className="card stat-card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
          <div style={{ backgroundColor: '#D1FAE5', padding: '16px', borderRadius: '50%' }}>
            <CheckCircle size={28} color="var(--success)" />
          </div>
          <div>
            <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>Completion Rate</p>
            <h2 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--text-primary)' }}>{successRate}%</h2>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Semua pendaftaran telah terkirim
            </p>
          </div>
        </div>
      </div>

      <div className="grid-mobile-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)' }}>
        <div className="card">
          <h3 className="h3" style={{ marginBottom: 'var(--spacing-md)' }}>Pipeline Pemasangan</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#D1FAE5', borderRadius: '8px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)', fontWeight: 500 }}><CheckCircle size={18} /> Registrasi Sukses (Terkirim)</span>
              <strong style={{ color: 'var(--success)' }}>{totalRegistrations} pelanggan</strong>
            </div>
          </div>
          <p className="text-small" style={{ marginTop: '16px', color: 'var(--text-muted)' }}>
            Data di atas menyesuaikan dengan parameter filter yang Anda pilih di atas.
          </p>
        </div>
      </div>
    </>
  );
}

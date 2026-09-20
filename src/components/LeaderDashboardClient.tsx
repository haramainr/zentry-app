"use client";

import React, { useState, useMemo } from 'react';
import GlobalFilter from './GlobalFilter';
import ExportExcelButton from "@/components/ExportExcelButton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function LeaderDashboardClient({ 
  submissions, 
  teamMembers,
  role,
  currentUserId,
  usersList
}: { 
  submissions: any[];
  teamMembers: any[];
  role?: string;
  currentUserId?: string;
  usersList?: any[];
}) {
  const validSubmissions = Array.isArray(submissions) ? submissions : [];
  const validTeamMembers = Array.isArray(teamMembers) ? teamMembers : [];

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

    validSubmissions.forEach(sub => {
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
  }, [validSubmissions, selectedPackages]);

  const filteredSubmissions = useMemo(() => {
    return validSubmissions.filter(sub => {
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
  }, [validSubmissions, startDate, endDate, selectedPackages, selectedServices]);

  // Data processing for the charts
  const salesPerformance = useMemo(() => {
    // Initialize map with all team members (even 0 sales)
    const map = new Map();
    validTeamMembers.forEach(member => {
      map.set(member.id, {
        name: member.full_name,
        totalSales: 0,
        revenue: 0
      });
    });

    // Populate with actual data
    filteredSubmissions.forEach(sub => {
      if (sub.sales_id && map.has(sub.sales_id)) {
        const current = map.get(sub.sales_id);
        current.totalSales += 1;
        current.revenue += Number(sub.biaya_total || 0);
      }
    });

    // Convert to array and sort by totalSales descending
    return Array.from(map.values()).sort((a, b) => b.totalSales - a.totalSales);
  }, [filteredSubmissions, validTeamMembers]);

  const stats = {
    totalRegistrations: filteredSubmissions.length,
    totalRevenue: filteredSubmissions.reduce((sum, s) => sum + Number(s.biaya_total || 0), 0),
    activeTeamMembers: validTeamMembers.length,
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

      {/* Top Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-xl)' }}>
        <div className="stat-card">
          <span className="stat-label">Total Registrasi Tim</span>
          <span className="stat-value" style={{ color: 'var(--solasi-blue)' }}>{stats.totalRegistrations}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Pendapatan (Rp)</span>
          <span className="stat-value" style={{ color: 'var(--success)' }}>
            {new Intl.NumberFormat('id-ID', { notation: "compact", maximumFractionDigits: 1 }).format(stats.totalRevenue)}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Anggota Tim Aktif</span>
          <span className="stat-value" style={{ color: 'var(--text-primary)' }}>{stats.activeTeamMembers}</span>
        </div>
      </div>
      
      <div className="card">
        <h3 className="h3" style={{ marginBottom: 'var(--spacing-md)' }}>Performa Top Sales</h3>
        {salesPerformance.length === 0 ? (
          <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            Belum ada penjualan berdasarkan filter ini.
          </div>
        ) : (
          <div style={{ height: '350px', width: '100%', marginTop: 'var(--spacing-lg)' }}>
            <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={salesPerformance}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
          />
          <Tooltip 
            cursor={{ fill: 'var(--bg-color)' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }}
            formatter={(value: any, name: any) => {
              if (name === 'Total Penjualan') return [`${value} Pelanggan`, name];
              if (name === 'Pendapatan') return [new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value), name];
              return [value, name];
            }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Bar dataKey="totalSales" name="Total Penjualan" fill="var(--solasi-blue)" radius={[4, 4, 0, 0]} barSize={40} />
          {/* <Bar dataKey="revenue" name="Pendapatan" fill="var(--success)" radius={[4, 4, 0, 0]} barSize={40} /> */}
        </BarChart>
      </ResponsiveContainer>
    </div>
    )}
    </div>
    </>
  );
}

"use client";

import React from 'react';
import Select from 'react-select';
import { Filter, CalendarDays, Package, Layers, Check } from "lucide-react";

interface GlobalFilterProps {
  startDate: string;
  setStartDate: (val: string) => void;
  endDate: string;
  setEndDate: (val: string) => void;
  selectedPackages: { Fiber: boolean; Safe: boolean; Soho: boolean };
  handlePackageToggle: (pkg: string) => void;
  allAvailableServices: { value: string; label: string }[];
  selectedServices: { value: string; label: string }[];
  setSelectedServices: (val: any) => void;
  actionButton?: React.ReactNode;
}

export default function GlobalFilter({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  selectedPackages,
  handlePackageToggle,
  allAvailableServices,
  selectedServices,
  setSelectedServices,
  actionButton
}: GlobalFilterProps) {
  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #E2E8F0',
      borderRadius: '20px',
      padding: '28px 32px',
      marginBottom: '28px',
      boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.04), 0 0 1px 1px rgba(0, 0, 0, 0.04)',
      position: 'relative',
      overflow: 'visible',
      zIndex: 10,
    }}>
      {/* Isolated wrapper for decorative watermark so card overflow can remain visible for dropdowns */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', borderRadius: '20px', pointerEvents: 'none' }}>
        <div style={{ 
          position: 'absolute', 
          top: '-150px', 
          right: '-100px', 
          height: '420px', 
          width: '420px', 
          opacity: 0.12, 
          background: 'radial-gradient(circle at 80% 30%, #3B82F6 0%, transparent 60%), radial-gradient(circle at 90% 80%, #60A5FA 0%, transparent 50%)',
        }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', borderBottom: '1px solid #F1F5F9', paddingBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)', 
              width: '46px', 
              height: '46px', 
              borderRadius: '12px', 
              color: 'white', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 6px 16px -2px rgba(37, 99, 235, 0.3)'
            }}>
              <Filter size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0F172A' }}>Filter Global</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B', marginTop: '2px' }}>Sesuaikan tampilan data berdasarkan parameter berikut</p>
            </div>
          </div>
          
          {actionButton && (
            <div>{actionButton}</div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '28px' }}>
          
          {/* Date Filter */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2563EB', fontWeight: 700, fontSize: '0.9rem', marginBottom: '12px' }}>
              <CalendarDays size={18} /> Rentang Waktu
            </div>
            <div style={{ display: 'flex', gap: '14px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#64748B', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Dari Tanggal</label>
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                  style={{ 
                    backgroundColor: '#FFFFFF', 
                    border: '1px solid #CBD5E1', 
                    borderRadius: '10px',
                    padding: '10px 12px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#0F172A',
                    width: '100%',
                    outline: 'none',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)'
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#64748B', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sampai Tanggal</label>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)} 
                  style={{ 
                    backgroundColor: '#FFFFFF', 
                    border: '1px solid #CBD5E1', 
                    borderRadius: '10px',
                    padding: '10px 12px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#0F172A',
                    width: '100%',
                    outline: 'none',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Package Category Filter */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2563EB', fontWeight: 700, fontSize: '0.9rem', marginBottom: '12px' }}>
              <Package size={18} /> Kategori Paket
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '18px' }}>
              {[
                { id: 'Fiber', label: 'CBN Fiber', color: '#2563EB', bg: '#EFF6FF', border: '#3B82F6' },
                { id: 'Safe', label: 'CBN Fiber Safe', color: '#059669', bg: '#ECFDF5', border: '#10B981' },
                { id: 'Soho', label: 'CBN Fiber Soho', color: '#7C3AED', bg: '#F5F3FF', border: '#8B5CF6' }
              ].map(pkg => {
                const isSelected = (selectedPackages as any)[pkg.id];
                return (
                  <label key={pkg.id} style={{ 
                    display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', 
                    backgroundColor: isSelected ? pkg.bg : '#F8FAFC',
                    border: `1.5px solid ${isSelected ? pkg.border : '#E2E8F0'}`,
                    padding: '8px 16px', borderRadius: '24px', transition: 'all 0.2s ease',
                    color: isSelected ? pkg.color : '#64748B',
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: '0.85rem',
                    boxShadow: isSelected ? `0 2px 8px ${pkg.color}20` : 'none'
                  }}>
                    <input 
                      type="checkbox" 
                      checked={isSelected} 
                      onChange={() => handlePackageToggle(pkg.id)} 
                      style={{ display: 'none' }}
                    />
                    <div style={{ 
                      width: '18px', height: '18px', borderRadius: '5px', 
                      backgroundColor: isSelected ? pkg.color : '#CBD5E1',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white'
                    }}>
                      {isSelected ? <Check size={12} strokeWidth={3} /> : null}
                    </div>
                    {pkg.label}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Specific Service Filter */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2563EB', fontWeight: 700, fontSize: '0.9rem', marginBottom: '12px' }}>
              <Layers size={18} /> Layanan / Area Spesifik
            </div>
            <div style={{ marginTop: '18px' }}>
              <Select
                instanceId="services-filter"
                isMulti
                name="services"
                options={allAvailableServices}
                className="basic-multi-select"
                classNamePrefix="select"
                placeholder="Pilih layanan untuk memfilter..."
                value={selectedServices}
                onChange={(newValue) => setSelectedServices(newValue as any)}
                menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                styles={{
                  control: (base) => ({
                    ...base,
                    backgroundColor: '#FFFFFF',
                    borderColor: '#CBD5E1',
                    borderRadius: '10px',
                    padding: '2px 4px',
                    minHeight: '42px',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
                    '&:hover': { borderColor: '#2563EB' }
                  }),
                  menuPortal: (base) => ({
                    ...base,
                    zIndex: 9999,
                  }),
                  menu: (base) => ({
                    ...base,
                    zIndex: 9999,
                    borderRadius: '12px',
                    boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.15)',
                    border: '1px solid #E2E8F0',
                  }),
                  multiValue: (base) => ({
                    ...base,
                    backgroundColor: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    borderRadius: '6px',
                  }),
                  multiValueLabel: (base) => ({
                    ...base,
                    color: '#1E40AF',
                    fontWeight: 600,
                    fontSize: '0.8rem'
                  }),
                  multiValueRemove: (base) => ({
                    ...base,
                    color: '#1E40AF',
                    ':hover': {
                      backgroundColor: '#2563EB',
                      color: 'white',
                    },
                  }),
                }}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

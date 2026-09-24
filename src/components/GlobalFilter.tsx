"use client";

import React from 'react';
import Select from 'react-select';
import { SlidersHorizontal, CalendarDays, Package, Layers, Check } from "lucide-react";

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
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '24px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
      position: 'relative',
      overflow: 'visible',
      zIndex: 10,
    }}>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #F1F5F9', paddingBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ 
              background: '#F8FAFC', 
              border: '1px solid #E2E8F0',
              width: '36px', 
              height: '36px', 
              borderRadius: '8px', 
              color: '#334155', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center'
            }}>
              <SlidersHorizontal size={17} strokeWidth={2} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.3px' }}>Filter Data</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B', marginTop: '2px' }}>Sesuaikan parameter rentang tanggal, paket, dan layanan</p>
            </div>
          </div>
          
          {actionButton && (
            <div>{actionButton}</div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          
          {/* Date Filter */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0F172A', fontWeight: 700, fontSize: '0.85rem', marginBottom: '10px' }}>
              <CalendarDays size={16} color="#64748B" /> <span>Rentang Waktu</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#64748B', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Dari Tanggal</label>
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                  style={{ 
                    backgroundColor: '#FFFFFF', 
                    border: '1px solid #CBD5E1', 
                    borderRadius: '8px',
                    padding: '9px 12px',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    color: '#0F172A',
                    width: '100%',
                    outline: 'none',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)'
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#64748B', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sampai Tanggal</label>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)} 
                  style={{ 
                    backgroundColor: '#FFFFFF', 
                    border: '1px solid #CBD5E1', 
                    borderRadius: '8px',
                    padding: '9px 12px',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    color: '#0F172A',
                    width: '100%',
                    outline: 'none',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Package Category Filter */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0F172A', fontWeight: 700, fontSize: '0.85rem', marginBottom: '10px' }}>
              <Package size={16} color="#64748B" /> <span>Kategori Paket</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
              {[
                { id: 'Fiber', label: 'CBN Fiber' },
                { id: 'Safe', label: 'CBN Fiber Safe' },
                { id: 'Soho', label: 'CBN Fiber Pro' }
              ].map(pkg => {
                const isSelected = (selectedPackages as any)[pkg.id];
                return (
                  <label key={pkg.id} style={{ 
                    display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', 
                    backgroundColor: isSelected ? '#F8FAFC' : '#FFFFFF',
                    border: `1px solid ${isSelected ? '#0F172A' : '#E2E8F0'}`,
                    padding: '7px 14px', borderRadius: '8px', transition: 'all 0.15s ease',
                    color: isSelected ? '#0F172A' : '#64748B',
                    fontWeight: isSelected ? 600 : 500,
                    fontSize: '0.825rem'
                  }}>
                    <input 
                      type="checkbox" 
                      checked={isSelected} 
                      onChange={() => handlePackageToggle(pkg.id)} 
                      style={{ display: 'none' }}
                    />
                    <div style={{ 
                      width: '16px', height: '16px', borderRadius: '4px', 
                      backgroundColor: isSelected ? '#0F172A' : '#E2E8F0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white'
                    }}>
                      {isSelected ? <Check size={11} strokeWidth={3} /> : null}
                    </div>
                    {pkg.label}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Specific Service Filter */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0F172A', fontWeight: 700, fontSize: '0.85rem', marginBottom: '10px' }}>
              <Layers size={16} color="#64748B" /> <span>Layanan / Area Spesifik</span>
            </div>
            <div style={{ marginTop: '16px' }}>
              <Select
                instanceId="services-filter"
                isMulti
                name="services"
                options={allAvailableServices}
                className="basic-multi-select"
                classNamePrefix="select"
                placeholder="Pilih layanan atau area..."
                value={selectedServices}
                onChange={(newValue) => setSelectedServices(newValue as any)}
                menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                styles={{
                  control: (base) => ({
                    ...base,
                    backgroundColor: '#FFFFFF',
                    borderColor: '#CBD5E1',
                    borderRadius: '8px',
                    padding: '1px 4px',
                    minHeight: '40px',
                    fontSize: '0.85rem',
                    boxShadow: 'none',
                    '&:hover': { borderColor: '#475569' }
                  }),
                  menuPortal: (base) => ({
                    ...base,
                    zIndex: 9999,
                  }),
                  menu: (base) => ({
                    ...base,
                    zIndex: 9999,
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #E2E8F0',
                  }),
                  multiValue: (base) => ({
                    ...base,
                    backgroundColor: '#F1F5F9',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                  }),
                  multiValueLabel: (base) => ({
                    ...base,
                    color: '#0F172A',
                    fontWeight: 600,
                    fontSize: '0.78rem'
                  }),
                  multiValueRemove: (base) => ({
                    ...base,
                    color: '#64748B',
                    ':hover': {
                      backgroundColor: '#E2E8F0',
                      color: '#0F172A',
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

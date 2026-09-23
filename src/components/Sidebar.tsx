"use client";

import { useState } from "react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, History, Menu, X, Users, Download, Calendar, LayoutDashboard, BarChart3, Settings, ClipboardList, MessageSquare, Crown, PanelLeftClose, PanelLeft } from 'lucide-react';
import LogoutButton from "@/components/LogoutButton";
import DeveloperSidebar from "@/components/DeveloperSidebar";
import ProfileDropdown from "@/components/ProfileDropdown";

interface Profile {
  full_name?: string;
  role?: string;
}

type Role = 'Sales' | 'Leader' | 'Manager' | 'Developer' | 'Admin';

const getMenuForRole = (role: Role) => {
  switch (role) {
    case 'Leader':
      return [
        { name: 'Dashboard Tim', href: '/leader', icon: LayoutDashboard },
        { name: 'Monitoring Tim', href: '/leader/team', icon: Users },
        { name: 'Laporan & Export', href: '/leader/reports', icon: Download },
        { name: 'Jadwal Pemasangan', href: '/leader/calendar', icon: Calendar },
        { name: 'Kritik & Saran', href: '/feedback', icon: MessageSquare },
      ];
    case 'Manager':
      return [
        { name: 'Executive Dashboard', href: '/manager', icon: LayoutDashboard },
        { name: 'Monitoring Leader', href: '/manager/leaders', icon: Users },
        { name: 'Laporan Bisnis', href: '/manager/reports', icon: BarChart3 },
        { name: 'Kritik & Saran', href: '/feedback', icon: MessageSquare },
      ];
    case 'Developer':
      return [
        { name: 'System Overview', href: '/developer', icon: LayoutDashboard },
        { name: 'User Management', href: '/developer/users', icon: Users },
        { name: 'Kritik & Saran', href: '/developer/feedback', icon: MessageSquare },
        { name: 'Konfigurasi', href: '/developer/config', icon: Settings },
        { name: 'Audit Log', href: '/developer/audit', icon: ClipboardList },
      ];
    case 'Sales':
    default:
      return [
        { name: 'Dashboard', href: '/sales', icon: LayoutDashboard },
        { name: 'Form Pendaftaran', href: '/sales/form', icon: FileText },
        { name: 'Riwayat & Draft', href: '/sales/history', icon: History },
        { name: 'Kritik & Saran', href: '/feedback', icon: MessageSquare },
      ];
  }
};

export default function Sidebar({ role = 'Sales', subscriptionEndDate, profile }: { role?: Role, subscriptionEndDate?: string | null, profile?: Profile | null }) {
  if (role === 'Developer') {
    return <DeveloperSidebar />;
  }

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname() || '';
  
  const menuItems = getMenuForRole(role);
  
  // Di mobile, sidebar selalu dianggap dalam mode "terbuka penuh" (tidak collapsed) saat dimunculkan
  const isCollapsed = collapsed && !mobileOpen;

  const isItemActive = (href: string) => {
    if (href === '/sales' || href === '/leader' || href === '/manager' || href === '/developer') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Topbar (Only visible on mobile via CSS) */}
      <div className="mobile-topbar" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={() => setMobileOpen(true)}
            style={{ background: 'none', border: 'none', color: 'var(--text-primary)', padding: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <Menu size={26} />
          </button>
          <img src="/zentry-logo.png" alt="ZEntry Logo" style={{ width: '110px', height: 'auto', objectFit: 'contain' }} />
        </div>
        <div className="hidden-desktop">
          <ProfileDropdown profile={profile || null} />
        </div>
      </div>

      {/* Sidebar Overlay Background for Mobile */}
      {mobileOpen && (
        <div 
          className="hidden-desktop" 
          style={{ 
            position: 'fixed', 
            top: 0, left: 0, right: 0, bottom: 0, 
            backgroundColor: 'rgba(15, 23, 42, 0.6)', 
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 90,
            transition: 'opacity 0.3s ease'
          }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Floating SaaS Sidebar Container */}
      <div 
        className={`sidebar-float-wrapper ${mobileOpen ? 'open' : ''}`}
        style={{ width: isCollapsed ? '96px' : '280px' }}
      >
        <aside className="sidebar-float-card">
          
          {/* Header / Logo & Collapse Toggle */}
          <div style={{ 
            padding: isCollapsed ? '16px 0' : '16px 16px 16px 20px', 
            borderBottom: '1px solid #E2E8F0', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: isCollapsed ? 'center' : 'space-between',
            flexShrink: 0
          }}>
            {!isCollapsed && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src="/zentry-logo.png" alt="ZEntry Logo" style={{ width: '128px', height: 'auto', objectFit: 'contain' }} />
              </div>
            )}
            
            {/* Desktop Collapse Toggle */}
            <button 
              className="hidden-mobile"
              onClick={() => setCollapsed(!collapsed)}
              title={isCollapsed ? "Buka Sidebar" : "Tutup Sidebar"}
              style={{ 
                background: 'transparent', 
                border: 'none', 
                cursor: 'pointer', 
                color: '#64748B',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                padding: '6px', 
                borderRadius: '8px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F1F5F9';
                e.currentTarget.style.color = '#0F172A';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#64748B';
              }}
            >
              {isCollapsed ? <PanelLeft size={22} strokeWidth={1.5} /> : <PanelLeftClose size={22} strokeWidth={1.5} />}
            </button>
            
            {/* Mobile Close Button */}
            <button 
              className="hidden-desktop"
              onClick={() => setMobileOpen(false)}
              style={{ 
                background: 'transparent', 
                border: 'none', 
                cursor: 'pointer', 
                color: '#64748B',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                padding: '6px', 
                borderRadius: '50%',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F1F5F9';
                e.currentTarget.style.color = '#0F172A';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#64748B';
              }}
            >
              <X size={24} strokeWidth={1.5} />
            </button>
          </div>
          
          {/* Navigation */}
          <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto', minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              {!isCollapsed && <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.5px', padding: '0 12px', marginBottom: '8px' }}>MENU UTAMA</div>}
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {menuItems.map((item, index) => {
                  const IconComponent = item.icon;
                  const active = isItemActive(item.href);
                  return (
                    <li key={index}>
                      <Link 
                        href={item.href} 
                        className={`sidebar-nav-item ${active ? 'active' : ''}`} 
                        onClick={() => setMobileOpen(false)} 
                        style={{ 
                          justifyContent: isCollapsed ? 'center' : 'flex-start', 
                          padding: isCollapsed ? '12px 0' : '10px 14px' 
                        }} 
                        title={item.name}
                      >
                        <IconComponent size={20} style={{ minWidth: '20px' }} /> 
                        {!isCollapsed && <span>{item.name}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Bottom Section (Pengaturan, Logout, & Lisensi) */}
            <div style={{ marginTop: 'auto', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {!isCollapsed && <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.5px', padding: '0 12px', marginBottom: '4px' }}>PENGATURAN</div>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <Link 
                  href="/settings/profile" 
                  className="sidebar-settings-item" 
                  onClick={() => setMobileOpen(false)} 
                  style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    color: '#64748B',
                    fontWeight: 500,
                    textDecoration: 'none',
                    borderRadius: '8px',
                    transition: 'all 0.15s ease',
                    justifyContent: isCollapsed ? 'center' : 'flex-start', 
                    padding: isCollapsed ? '10px 0' : '10px 14px' 
                  }} 
                  title="Pengaturan Profil"
                >
                  <Settings size={20} style={{ minWidth: '20px' }} />
                  {!isCollapsed && <span>Pengaturan</span>}
                </Link>
                
                <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                  {isCollapsed ? (
                    <LogoutButton isIconOnly={true} />
                  ) : (
                    <LogoutButton />
                  )}
                </div>
              </div>

            {/* Premium License Card (Emerald Green Glow with 6-Segment Pill Progress) */}
            {(!isCollapsed && subscriptionEndDate && (role as string) !== 'Admin') || (isCollapsed && subscriptionEndDate && (role as string) !== 'Admin') ? (
              <div style={{ 
                marginTop: '24px',
                paddingTop: '24px',
                borderTop: '1px solid rgba(226, 232, 240, 0.6)', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '16px', 
                alignItems: 'center',
                flexShrink: 0
              }}>
              {!isCollapsed && subscriptionEndDate && (role as string) !== 'Admin' && (
                <div className="premium-license-card" style={{ width: '100%' }}>
                  {(() => {
                    const end = new Date(subscriptionEndDate);
                    const now = new Date();
                    const diffMs = end.getTime() - now.getTime();

                    if (diffMs <= 0) {
                      return (
                        <div style={{ fontSize: '0.8rem', color: '#DC2626', fontWeight: 600 }}>
                          Lisensi Telah Berakhir
                        </div>
                      );
                    }
                    
                    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    
                    return (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }}></span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0F172A' }}>Lisensi Enterprise</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '3px', fontWeight: 500 }}>
                          {days > 0 ? `${days} hari tersisa` : `${hours} jam tersisa`}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
              
              {/* Collapsed Subscription Tooltip Icon */}
              {isCollapsed && subscriptionEndDate && (role as string) !== 'Admin' && (
                <div 
                  title="Premium License Aktif" 
                  style={{ 
                    width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#ECFDF5', 
                    border: '1px solid #A7F3D0', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 10px rgba(16, 185, 129, 0.15)'
                  }}
                >
                  <Crown size={20} color="#059669" />
                </div>
              )}
              </div>
            ) : null}
            </div>
          </nav>
        </aside>
      </div>
    </>
  );
}

"use client";

import { useState } from "react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  FileText, 
  Database, 
  Activity, 
  Sliders, 
  Settings, 
  ClipboardList, 
  ShieldCheck, 
  History, 
  MessageSquare, 
  Server, 
  LogOut, 
  Menu, 
  X, 
  Terminal,
  ChevronRight,
  Sparkles,
  Cpu
} from 'lucide-react';
import { createClient } from "@/lib/supabase/client";

interface NavItem {
  name: string;
  href: string;
  icon: any;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export default function DeveloperSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname() || '';
  const supabase = createClient();

  // Di mobile, sidebar selalu dianggap dalam mode "terbuka penuh" (tidak collapsed) saat dimunculkan
  const isCollapsed = collapsed && !mobileOpen;

  const sections: NavSection[] = [
    {
      title: "SYSTEM",
      items: [
        { name: "Overview", href: "/developer", icon: LayoutDashboard },
        { name: "User Management", href: "/developer/users", icon: Users },
        { name: "Subscription", href: "/developer?section=subscriptions", icon: CreditCard },
        { name: "Registration", href: "/developer?section=registrations", icon: FileText },
      ]
    },
    {
      title: "INFRASTRUCTURE",
      items: [
        { name: "Database", href: "/developer?section=database", icon: Database },
        { name: "API Monitor", href: "/developer?section=api", icon: Activity },
        { name: "Configuration", href: "/developer/config", icon: Sliders },
      ]
    },
    {
      title: "SECURITY",
      items: [
        { name: "Audit Logs", href: "/developer/audit", icon: ClipboardList },
        { name: "Security", href: "/developer/audit?section=security", icon: ShieldCheck },
        { name: "Activity Logs", href: "/developer/audit?section=activity", icon: History },
      ]
    },
    {
      title: "SUPPORT",
      items: [
        { name: "Feedback", href: "/developer/feedback", icon: MessageSquare },
      ]
    }
  ];

  const settingsItem: NavItem = { name: "Settings", href: "/settings/profile", icon: Settings };

  const isItemActive = (href: string) => {
    if (href === '/developer') {
      return pathname === '/developer';
    }
    if (href.includes('?')) {
      return false; // For mock sub-links in overview
    }
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    document.cookie = "dummy_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "dummy_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <>
      {/* Custom Thin Scrollbar for Developer Console */}
      <style jsx global>{`
        .dev-sidebar-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .dev-sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .dev-sidebar-scroll::-webkit-scrollbar-thumb {
          background: #22314A;
          border-radius: 9999px;
        }
        .dev-sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: #3B82F6;
        }
        .dev-nav-item {
          display: flex;
          align-items: center;
          gap: 14px;
          border-radius: 14px;
          color: #94A3B8;
          font-weight: 500;
          font-size: 0.9rem;
          text-decoration: none;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          border: 1px solid transparent;
          position: relative;
          overflow: hidden;
        }
        .dev-nav-item:hover:not(.active) {
          background-color: #1E293B;
          color: #F8FAFC;
          transform: translateX(4px);
          border-color: rgba(59, 130, 246, 0.2);
        }
        .dev-nav-item:hover:not(.active) .dev-nav-icon {
          color: #38BDF8;
          transform: scale(1.1);
        }
        .dev-nav-item.active {
          background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
          color: #FFFFFF;
          font-weight: 600;
          box-shadow: 0 6px 18px rgba(37, 99, 235, 0.45);
          border-color: rgba(96, 165, 250, 0.3);
        }
        .dev-nav-item.active .dev-nav-icon {
          color: #FFFFFF;
        }
        .dev-nav-icon {
          transition: all 0.25s ease;
          color: #64748B;
        }
        .dev-status-card {
          background-color: #1A2844;
          border: 1px solid #283D5E;
          border-radius: 18px;
          padding: 14px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .dev-status-card:hover {
          transform: translateY(-2px);
          border-color: #10B981;
          box-shadow: 0 8px 25px rgba(16, 185, 129, 0.15);
        }
        .dev-logout-btn {
          width: 100%;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border-radius: 14px;
          border: 1px solid rgba(239, 68, 68, 0.4);
          background-color: transparent;
          color: #F87171;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .dev-logout-btn:hover {
          background-color: #DC2626;
          border-color: #EF4444;
          color: #FFFFFF;
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(220, 38, 38, 0.35);
        }
      `}</style>

      {/* Mobile Topbar for Developer */}
      <div className="mobile-topbar" style={{ backgroundColor: '#0B1220', borderBottom: '1px solid #22314A' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={() => setMobileOpen(true)}
            style={{ background: 'none', border: 'none', color: '#F8FAFC', padding: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <Menu size={26} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/zentry-logo.png" alt="ZEntry Logo" style={{ width: '110px', height: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
            <span style={{ fontSize: '0.65rem', backgroundColor: '#2563EB', color: '#FFFFFF', padding: '2px 6px', borderRadius: '6px', fontWeight: 700 }}>DEV</span>
          </div>
        </div>
      </div>

      {/* Sidebar Overlay Background for Mobile */}
      {mobileOpen && (
        <div 
          className="hidden-desktop" 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)', zIndex: 90 }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Floating DevOps Sidebar Wrapper */}
      <div 
        className={`sidebar-float-wrapper ${mobileOpen ? 'open' : ''}`}
        style={{ 
          width: isCollapsed ? '96px' : '280px',
          padding: '16px',
          backgroundColor: '#0B1220',
          transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <aside 
          style={{
            backgroundColor: '#131D31',
            border: '1px solid #22314A',
            borderRadius: '24px',
            boxShadow: '0 20px 45px rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(16px)',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          {/* Subtle Top-Right Ambient Glow */}
          <div style={{
            position: 'absolute',
            top: '-40px',
            right: '-40px',
            width: '140px',
            height: '140px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(37, 99, 235, 0.2) 0%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 0
          }} />

          {/* Header / Logo Area */}
          <div style={{ 
            padding: isCollapsed ? '26px 12px 20px 12px' : '26px 20px 20px 24px', 
            marginBottom: '10px',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: isCollapsed ? 'center' : 'space-between',
            flexShrink: 0,
            position: 'relative',
            zIndex: 1
          }}>
            {!isCollapsed && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img src="/zentry-logo.png" alt="ZEntry Logo" style={{ width: '145px', height: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                </div>
                {/* Tech Badge Below Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                  <span style={{ 
                    width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10B981', 
                    boxShadow: '0 0 8px #10B981', display: 'inline-block' 
                  }} className="animate-pulse" />
                  <span style={{ 
                    fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', color: '#38BDF8', 
                    textTransform: 'uppercase', fontFamily: 'monospace' 
                  }}>
                    DEVELOPER CONSOLE
                  </span>
                </div>
              </div>
            )}
            
            {/* Desktop Collapse Toggle */}
            <button 
              className="hidden-mobile"
              onClick={() => setCollapsed(!collapsed)}
              title={isCollapsed ? "Buka Sidebar" : "Tutup Sidebar"}
              style={{ 
                background: '#1A2844', 
                border: '1px solid #283D5E', 
                cursor: 'pointer', 
                color: '#94A3B8',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                padding: '8px', 
                borderRadius: '12px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#22314A';
                e.currentTarget.style.color = '#FFFFFF';
                e.currentTarget.style.borderColor = '#38BDF8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#1A2844';
                e.currentTarget.style.color = '#94A3B8';
                e.currentTarget.style.borderColor = '#283D5E';
              }}
            >
              {isCollapsed ? <Menu size={20} /> : <X size={20} />}
            </button>
            
            {/* Mobile Close Button */}
            <button 
              className="hidden-desktop"
              onClick={() => setMobileOpen(false)}
              style={{ 
                background: '#1A2844', 
                border: 'none', 
                cursor: 'pointer', 
                color: '#94A3B8',
                display: 'flex', 
                alignItems: 'center', 
                padding: '8px', 
                borderRadius: '12px'
              }}
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Navigation Sections */}
          <nav className="dev-sidebar-scroll" style={{ flex: 1, padding: '0 14px 18px 14px', overflowY: 'auto', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {sections.map((sec, secIdx) => (
                <div key={secIdx}>
                  {/* Section Title */}
                  {!isCollapsed && (
                    <div style={{ 
                      fontSize: '0.68rem', 
                      fontWeight: 700, 
                      color: '#64748B', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.12em',
                      padding: '4px 12px 6px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <span>{sec.title}</span>
                      <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, #22314A, transparent)' }} />
                    </div>
                  )}
                  {isCollapsed && secIdx > 0 && (
                    <div style={{ height: '1px', backgroundColor: '#22314A', margin: '8px 12px' }} />
                  )}

                  {/* Section Items */}
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {sec.items.map((item, itemIdx) => {
                      const IconComponent = item.icon;
                      const active = isItemActive(item.href);
                      return (
                        <li key={itemIdx}>
                          <Link 
                            href={item.href} 
                            className={`dev-nav-item ${active ? 'active' : ''}`} 
                            onClick={() => setMobileOpen(false)}
                            style={{ 
                              justifyContent: isCollapsed ? 'center' : 'flex-start', 
                              padding: isCollapsed ? '14px 0' : '12px 16px' 
                            }} 
                            title={item.name}
                          >
                            <IconComponent size={20} className="dev-nav-icon" style={{ minWidth: '20px' }} /> 
                            {!isCollapsed && (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                <span>{item.name}</span>
                                {active && (
                                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#FFFFFF', boxShadow: '0 0 6px #FFFFFF' }} />
                                )}
                              </div>
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}

              {/* SETTINGS SECTION */}
              <div>
                {!isCollapsed && (
                  <div style={{ 
                    fontSize: '0.68rem', 
                    fontWeight: 700, 
                    color: '#64748B', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.12em',
                    padding: '4px 12px 6px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <span>SETTINGS</span>
                    <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, #22314A, transparent)' }} />
                  </div>
                )}
                {isCollapsed && <div style={{ height: '1px', backgroundColor: '#22314A', margin: '8px 12px' }} />}
                
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  <li>
                    <Link 
                      href={settingsItem.href} 
                      className={`dev-nav-item ${isItemActive(settingsItem.href) ? 'active' : ''}`} 
                      onClick={() => setMobileOpen(false)}
                      style={{ 
                        justifyContent: isCollapsed ? 'center' : 'flex-start', 
                        padding: isCollapsed ? '14px 0' : '12px 16px' 
                      }} 
                      title={settingsItem.name}
                    >
                      <settingsItem.icon size={20} className="dev-nav-icon" style={{ minWidth: '20px' }} /> 
                      {!isCollapsed && <span>{settingsItem.name}</span>}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </nav>
          
          {/* Footer Area / Status Card & Logout */}
          <div style={{ 
            padding: isCollapsed ? '16px 10px' : '20px 18px', 
            borderTop: '1px solid #22314A', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '14px', 
            alignItems: 'center',
            marginTop: 'auto',
            flexShrink: 0,
            backgroundColor: 'rgba(11, 18, 32, 0.4)',
            position: 'relative',
            zIndex: 1
          }}>
            
            {/* System Status Card */}
            {!isCollapsed ? (
              <div className="dev-status-card" style={{ width: '100%' }}>
                <div style={{ 
                  width: '36px', height: '36px', borderRadius: '12px', 
                  backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981',
                  boxShadow: '0 0 15px rgba(16, 185, 129, 0.25)', flexShrink: 0
                }}>
                  <Server size={18} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#F8FAFC', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    Production Environment
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }} className="animate-pulse" />
                    <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#34D399' }}>Healthy • v1.3.2</span>
                  </div>
                </div>
              </div>
            ) : (
              <div 
                title="System Status: Healthy (v1.3.2)" 
                style={{ 
                  width: '40px', height: '40px', borderRadius: '12px', 
                  backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981',
                  boxShadow: '0 0 15px rgba(16, 185, 129, 0.25)'
                }}
              >
                <Server size={20} />
              </div>
            )}
            
            {/* Logout Outline Button */}
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <button 
                onClick={handleLogout}
                title="Logout from Developer Console"
                className="dev-logout-btn"
                style={{
                  padding: isCollapsed ? '0' : '0 16px',
                  width: isCollapsed ? '44px' : '100%'
                }}
              >
                <LogOut size={20} style={{ minWidth: '20px' }} />
                {!isCollapsed && <span>Logout</span>}
              </button>
            </div>

          </div>
        </aside>
      </div>
    </>
  );
}

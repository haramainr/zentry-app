'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, LogOut, Settings, User } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface Profile {
  full_name?: string;
  role?: string;
}

export default function ProfileDropdown({ profile }: { profile: Profile | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    // Clear dummy preview cookies
    document.cookie = "dummy_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "dummy_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "dummy_user_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "dummy_name=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "dummy_email=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const displayName = profile?.full_name || 'Pengguna ZEntry';
  const displayRole = profile?.role ? `${profile.role} Team` : 'Tim Operasional';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      {/* Profile Badge */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px', 
          background: '#FFFFFF', 
          border: '1px solid #E2E8F0', 
          padding: '5px 12px 5px 6px', 
          borderRadius: '30px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          cursor: 'pointer',
          userSelect: 'none',
          transition: 'all 0.2s ease'
        }}
      >
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#0F172A', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
          {initial}
        </div>
        <div className="hidden-mobile">
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', lineHeight: 1.1, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayName}
            </span>
            <span style={{ fontSize: '0.65rem', color: '#94A3B8', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 500 }}>{displayRole}</div>
        </div>
      </div>

      {/* Dropdown Menu - Anchored with right: 0 to prevent mobile overflow */}
      {isOpen && (
        <div 
          className="profile-dropdown-menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '230px',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)',
            border: '1px solid #E2E8F0',
            padding: '8px',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            gap: '3px'
          }}
        >
          <div style={{ padding: '8px 12px', marginBottom: '4px', borderBottom: '1px solid #F1F5F9' }}>
            <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Masuk Sebagai</div>
            <div style={{ fontSize: '0.875rem', color: '#0F172A', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {displayName}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#0F172A', fontWeight: 600 }}>{displayRole}</div>
          </div>
          
          <Link href="/settings/profile" style={{ textDecoration: 'none' }} onClick={() => setIsOpen(false)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '10px', color: '#334155', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
              <User size={16} color="#64748B" />
              <span>Profil & Keamanan</span>
            </div>
          </Link>
          
          <Link href="/feedback" style={{ textDecoration: 'none' }} onClick={() => setIsOpen(false)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '10px', color: '#334155', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
              <Settings size={16} color="#64748B" />
              <span>Kritik & Masukan</span>
            </div>
          </Link>
          
          <div style={{ height: '1px', backgroundColor: '#F1F5F9', margin: '4px 0' }} />
          
          <div 
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '10px', color: '#EF4444', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }} 
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'} 
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <LogOut size={16} />
            <span>Keluar dari Akun</span>
          </div>
        </div>
      )}
    </div>
  );
}

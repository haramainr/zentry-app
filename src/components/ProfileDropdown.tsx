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
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      {/* Profile Badge & Notification */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          background: '#FFFFFF', 
          border: '1px solid #E2E8F0', 
          padding: '6px 14px 6px 6px', 
          borderRadius: '30px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          cursor: 'pointer',
          userSelect: 'none',
          transition: 'all 0.2s'
        }}
      >
        <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#0F172A', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.95rem' }}>
          {(profile?.full_name || 'S').charAt(0).toUpperCase()}
        </div>
        <div className="hidden-mobile">
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', lineHeight: 1.1 }}>
            {profile?.full_name || 'Sales zyntaxera'} 
            <span style={{ fontSize: '0.7rem', color: '#94A3B8', marginLeft: '4px', display: 'inline-block', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 500 }}>{profile?.role || 'Sales Team'}</div>
        </div>
        <div style={{ position: 'relative', marginLeft: '6px', paddingLeft: '12px', borderLeft: '1px solid #F1F5F9' }}>
          <Bell size={18} color="#64748B" />
          <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '8px', height: '8px', backgroundColor: '#EF4444', borderRadius: '50%', border: '2px solid #FFFFFF' }} />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="profile-dropdown-menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            width: '220px',
            backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)',
          border: '1px solid #F1F5F9',
          padding: '8px',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <div style={{ padding: '8px 12px', marginBottom: '4px', borderBottom: '1px solid #F8FAFC' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Masuk sebagai</div>
            <div style={{ fontSize: '0.9rem', color: '#0F172A', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {profile?.full_name || 'Sales zyntaxera'}
            </div>
          </div>
          
          <Link href="/settings/profile" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', color: '#334155', fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
              <User size={16} />
              <span>Profil Saya</span>
            </div>
          </Link>
          
          <Link href="/settings/profile" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', color: '#334155', fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
              <Settings size={16} />
              <span>Pengaturan</span>
            </div>
          </Link>
          
          <div style={{ height: '1px', backgroundColor: '#F8FAFC', margin: '4px 0' }} />
          
          <div 
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', color: '#EF4444', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }} 
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'} 
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <LogOut size={16} />
            <span>Keluar</span>
          </div>
        </div>
      )}
    </div>
  );
}

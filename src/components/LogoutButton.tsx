"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";

export default function LogoutButton({ isIconOnly = false }: { isIconOnly?: boolean }) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    document.cookie = "dummy_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "dummy_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <button 
      onClick={handleLogout}
      title="Logout"
      style={{
        width: isIconOnly ? '44px' : '100%',
        height: '44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        padding: isIconOnly ? '0' : '0 16px',
        borderRadius: '14px',
        border: '1px solid #FECACA',
        backgroundColor: 'transparent',
        color: '#DC2626',
        fontWeight: 600,
        fontSize: '0.95rem',
        cursor: 'pointer',
        boxShadow: '0 2px 6px rgba(239, 68, 68, 0.05)',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#FEF2F2';
        e.currentTarget.style.borderColor = '#F87171';
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.12)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
        e.currentTarget.style.borderColor = '#FECACA';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 6px rgba(239, 68, 68, 0.05)';
      }}
    >
      <LogOut size={20} style={{ minWidth: '20px' }} />
      {!isIconOnly && <span>Logout</span>}
    </button>
  );
}

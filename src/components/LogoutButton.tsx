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
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderTop: '1px solid rgba(255, 255, 255, 0.2)',
        background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
        color: '#FFFFFF',
        fontWeight: 600,
        fontSize: '0.95rem',
        cursor: 'pointer',
        boxShadow: '0 4px 14px 0 rgba(239, 68, 68, 0.39)',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.55)';
        e.currentTarget.style.filter = 'brightness(1.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 14px 0 rgba(239, 68, 68, 0.39)';
        e.currentTarget.style.filter = 'brightness(1)';
      }}
    >
      <LogOut size={20} style={{ minWidth: '20px' }} />
      {!isIconOnly && <span>Logout</span>}
    </button>
  );
}

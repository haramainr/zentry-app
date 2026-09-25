"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Send, MessageSquare, Info, Clock, CheckCircle2, Shield, 
  Hash, ChevronRight, Check, Sparkles, AlertCircle, 
  RefreshCw, MessageCircle, ArrowRight, HelpCircle
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function SubmitFeedbackPage() {
  const supabase = createClient();
  const router = useRouter();
  
  const [type, setType] = useState('Saran');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [user, setUser] = useState<any>(null);
  const [myFeedbacks, setMyFeedbacks] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Status Filter State
  const [statusFilter, setStatusFilter] = useState('Semua Status');

  // Expanded details state for cards
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchUserAndHistory();
  }, []);

  const fetchUserAndHistory = async () => {
    setLoadingHistory(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      const { data } = await supabase
        .from('feedbacks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (data) setMyFeedbacks(data);
    }
    setLoadingHistory(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    
    if (!user) {
      alert("Anda harus login untuk mengirim masukan.");
      setIsSubmitting(false);
      return;
    }

    const { error } = await supabase
      .from('feedbacks')
      .insert({
        user_id: user.id,
        type: type,
        message: message,
        status: 'New'
      });

    setIsSubmitting(false);

    if (error) {
      alert("Gagal mengirim pesan: " + error.message);
    } else {
      setSuccess(true);
      setMessage('');
      fetchUserAndHistory(); // Refresh history
      setTimeout(() => setSuccess(false), 5000);
    }
  };

  const filteredFeedbacks = useMemo(() => {
    return myFeedbacks.filter((item) => {
      if (statusFilter === 'Semua Status') return true;
      if (statusFilter === 'Menunggu Review') return item.status === 'New';
      if (statusFilter === 'Ditindaklanjuti') return item.status === 'In Progress';
      if (statusFilter === 'Selesai') return item.status === 'Resolved';
      return true;
    });
  }, [myFeedbacks, statusFilter]);

  // Format Ticket Number
  const getTicketNumber = (item: any, index: number) => {
    const datePart = new Date(item.created_at).toISOString().slice(2, 10).replace(/-/g, '');
    const idPart = String(item.id || index + 1).slice(-3).padStart(3, '0');
    return `#FB-${datePart}-${idPart}`;
  };

  return (
    <div className="animate-fade-in flex stack-mobile" style={{ 
      padding: 'clamp(16px, 4vw, 36px) clamp(12px, 4vw, 32px)', 
      backgroundColor: '#F8FAFC', 
      minHeight: '100vh', 
      flexDirection: 'column', 
      gap: '36px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* Decorative Background Elements (Pointer Events None) */}
      <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '450px', height: '450px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.07) 0%, rgba(255, 255, 255, 0) 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '10%', left: '-5%', width: '380px', height: '380px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, rgba(255, 255, 255, 0) 70%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Header Section */}
      <header style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
          <div style={{ 
            width: '46px', height: '46px', borderRadius: '14px', 
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
          }}>
            <MessageSquare size={24} />
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.5px' }}>
            Kritik & Saran
          </h1>
        </div>
        <p style={{ fontSize: '0.98rem', color: '#64748B', margin: 0, fontWeight: 500, maxWidth: '650px', lineHeight: 1.5 }}>
          Masukan Anda sangat berarti bagi pengembangan sistem dan peningkatan layanan kami ke depannya.
        </p>
      </header>

      {/* Success Notification Alert */}
      {success && (
        <div className="animate-fade-in" style={{ 
          backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', 
          padding: '18px 22px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '14px',
          boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.15)', position: 'relative', zIndex: 1
        }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', flexShrink: 0 }}>
            <Check size={18} strokeWidth={3} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.98rem', color: '#047857' }}>Laporan Berhasil Dikirim!</div>
            <div style={{ fontSize: '0.88rem', color: '#065F46', marginTop: '2px' }}>Terima kasih atas kontribusi Anda. Tim developer akan segera meninjau masukan atau laporan kendala Anda.</div>
          </div>
        </div>
      )}

      {/* Main Focus: Card Form Kritik & Saran */}
      <div style={{ 
        background: '#FFFFFF', 
        borderRadius: '24px', 
        border: '1px solid #E2E8F0', 
        padding: 'clamp(20px, 5vw, 32px) clamp(16px, 5vw, 36px)', 
        boxShadow: '0 12px 35px -5px rgba(0, 0, 0, 0.04), 0 5px 15px -5px rgba(0, 0, 0, 0.02)',
        position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column', gap: '28px'
      }}>
        
        {/* Card Header & SaaS Illustration */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', borderBottom: '1px solid #F1F5F9', paddingBottom: '22px' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.3px' }}>
              Sampaikan Kritik & Saran Anda
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#64748B', margin: 0, marginTop: '4px', fontWeight: 500 }}>
              Pilih kategori yang sesuai lalu ketikkan detail ide atau kendala yang Anda alami.
            </p>
          </div>

          {/* Microsoft Fluent Style SaaS Illustration */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 16px', background: '#F8FAFC', borderRadius: '18px', border: '1px solid #E2E8F0' }}>
            <div style={{ position: 'relative', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ 
                width: '36px', height: '32px', borderRadius: '10px', 
                background: 'linear-gradient(135deg, #1E293B 0%, #60A5FA 100%)',
                boxShadow: '0 4px 10px rgba(59, 130, 246, 0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF',
                position: 'absolute', top: '2px', left: '2px'
              }}>
                <MessageCircle size={18} />
              </div>
              <Sparkles size={16} color="#F59E0B" style={{ position: 'absolute', top: '-4px', right: '-4px' }} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1E293B' }}>ZEntry Help Center</div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>We listen to build better</div>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* 1. Pilih Kategori */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Pilih Kategori
            </label>
            <div className="grid-mobile-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              
              {/* Option 1: Saran & Masukan */}
              <button
                type="button"
                onClick={() => setType('Saran')}
                style={{ 
                  padding: '20px 22px', 
                  borderRadius: '16px', 
                  border: `2px solid ${type === 'Saran' ? '#0F172A' : '#E2E8F0'}`,
                  backgroundColor: type === 'Saran' ? '#F1F5F9' : '#FFFFFF',
                  textAlign: 'left', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '16px',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: type === 'Saran' ? '0 8px 20px -4px rgba(37, 99, 235, 0.15)' : '0 2px 4px rgba(0,0,0,0.02)'
                }}
                onMouseEnter={(e) => { if (type !== 'Saran') e.currentTarget.style.backgroundColor = '#F8FAFC'; }}
                onMouseLeave={(e) => { if (type !== 'Saran') e.currentTarget.style.backgroundColor = '#FFFFFF'; }}
              >
                <div style={{ 
                  width: '26px', height: '26px', borderRadius: '50%', 
                  border: `2px solid ${type === 'Saran' ? '#0F172A' : '#CBD5E1'}`,
                  backgroundColor: type === 'Saran' ? '#0F172A' : '#FFFFFF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#FFFFFF', flexShrink: 0, transition: 'all 0.2s'
                }}>
                  {type === 'Saran' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#FFFFFF' }} />}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.02rem', color: type === 'Saran' ? '#1E293B' : '#0F172A' }}>Saran & Masukan</div>
                  <div style={{ fontSize: '0.85rem', color: type === 'Saran' ? '#1E293B' : '#64748B', marginTop: '2px', fontWeight: 500 }}>Ide baru atau usulan fitur untuk pengembangan</div>
                </div>
              </button>

              {/* Option 2: Kritik / Laporan Kendala */}
              <button
                type="button"
                onClick={() => setType('Kritik')}
                style={{ 
                  padding: '20px 22px', 
                  borderRadius: '16px', 
                  border: `2px solid ${type === 'Kritik' ? '#0F172A' : '#E2E8F0'}`,
                  backgroundColor: type === 'Kritik' ? '#F1F5F9' : '#FFFFFF',
                  textAlign: 'left', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '16px',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: type === 'Kritik' ? '0 8px 20px -4px rgba(37, 99, 235, 0.15)' : '0 2px 4px rgba(0,0,0,0.02)'
                }}
                onMouseEnter={(e) => { if (type !== 'Kritik') e.currentTarget.style.backgroundColor = '#F8FAFC'; }}
                onMouseLeave={(e) => { if (type !== 'Kritik') e.currentTarget.style.backgroundColor = '#FFFFFF'; }}
              >
                <div style={{ 
                  width: '26px', height: '26px', borderRadius: '50%', 
                  border: `2px solid ${type === 'Kritik' ? '#0F172A' : '#CBD5E1'}`,
                  backgroundColor: type === 'Kritik' ? '#0F172A' : '#FFFFFF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#FFFFFF', flexShrink: 0, transition: 'all 0.2s'
                }}>
                  {type === 'Kritik' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#FFFFFF' }} />}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.02rem', color: type === 'Kritik' ? '#1E293B' : '#0F172A' }}>Kritik / Laporan Kendala</div>
                  <div style={{ fontSize: '0.85rem', color: type === 'Kritik' ? '#1E293B' : '#64748B', marginTop: '2px', fontWeight: 500 }}>Keluhan atau fungsi error pada sistem</div>
                </div>
              </button>

            </div>
          </div>

          {/* 2. Text Area */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Tulis Pesan Anda
              </label>
            </div>
            <textarea 
              rows={6}
              placeholder={type === 'Saran' ? "Tuliskan saran, ide brilian, atau usulan fitur yang ingin Anda lihat di ZEntryX..." : "Ceritakan secara detail kendala, error, atau kesulitan yang Anda alami agar dapat kami perbaiki..."}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{ 
                width: '100%', minHeight: '150px', padding: '18px 20px',
                borderRadius: '16px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF',
                fontSize: '0.98rem', color: '#0F172A', outline: 'none', 
                transition: 'all 0.2s ease', resize: 'vertical', lineHeight: 1.6,
                fontFamily: 'inherit'
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#0F172A'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.12)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.boxShadow = 'none'; }}
              required
            />
            
            {/* Character Counter */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <span style={{ 
                fontSize: '0.82rem', fontWeight: 600, 
                color: message.length > 900 ? '#EA580C' : '#64748B' 
              }}>
                {message.length} <span style={{ color: '#94A3B8', fontWeight: 400 }}>/ 1000 karakter</span>
              </span>
            </div>
          </div>

          {/* 3. Privacy Notice & Submit Button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', paddingTop: '8px' }}>
            
            {/* Privacy Information Card */}
            <div style={{ 
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '14px 20px', borderRadius: '14px',
              backgroundColor: '#F1F5F9', border: '1px solid #BFDBFE',
              color: '#1E40AF', fontSize: '0.88rem', fontWeight: 600,
              boxShadow: '0 2px 6px rgba(59, 130, 246, 0.05)'
            }}>
              <Shield size={18} color="#0F172A" style={{ flexShrink: 0 }} />
              <span>Data Anda aman dan akan kami jaga kerahasiaannya.</span>
            </div>

            {/* Premium Submit Button */}
            <button 
              type="submit" 
              disabled={isSubmitting || !message.trim()}
              style={{ 
                height: '50px', padding: '0 32px', borderRadius: '14px',
                background: isSubmitting || !message.trim() ? '#CBD5E1' : 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                color: '#FFFFFF', fontWeight: 700, fontSize: '0.96rem',
                border: 'none', cursor: isSubmitting || !message.trim() ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '10px',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: isSubmitting || !message.trim() ? 'none' : '0 6px 16px rgba(37, 99, 235, 0.35)'
              }}
              onMouseEnter={(e) => { 
                if (!isSubmitting && message.trim()) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 22px rgba(37, 99, 235, 0.45)';
                }
              }}
              onMouseLeave={(e) => { 
                if (!isSubmitting && message.trim()) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(37, 99, 235, 0.35)';
                }
              }}
            >
              <Send size={18} />
              <span>{isSubmitting ? "Mengirim Masukan..." : "Kirim Pesan"}</span>
            </button>

          </div>

        </form>
      </div>

      {/* Focus 2: Status Laporan Anda */}
      <div style={{ 
        background: '#FFFFFF', 
        borderRadius: '24px', 
        border: '1px solid #E2E8F0', 
        padding: 'clamp(20px, 5vw, 32px) clamp(16px, 5vw, 36px)', 
        boxShadow: '0 12px 35px -5px rgba(0, 0, 0, 0.04), 0 5px 15px -5px rgba(0, 0, 0, 0.02)',
        position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column', gap: '24px'
      }}>
        
        {/* Header Row & Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid #F1F5F9', paddingBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F172A' }}>
              <Clock size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.3px' }}>
                Status Laporan Anda
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0, marginTop: '2px', fontWeight: 500 }}>
                Pantau progres dan tindak lanjut dari seluruh saran atau kritik yang pernah Anda kirimkan.
              </p>
            </div>
          </div>

          {/* Modern Dropdown Filter Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              onClick={fetchUserAndHistory}
              style={{ 
                width: '42px', height: '42px', borderRadius: '12px', border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF', color: '#475569', cursor: 'pointer', display: 'flex', 
                alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F1F5F9'; e.currentTarget.style.color = '#0F172A'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FFFFFF'; e.currentTarget.style.color = '#475569'; }}
              title="Refresh Data"
            >
              <RefreshCw size={18} className={loadingHistory ? "animate-spin" : ""} />
            </button>

            <div style={{ position: 'relative' }}>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ 
                  height: '42px', paddingLeft: '16px', paddingRight: '36px',
                  borderRadius: '12px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF',
                  fontSize: '0.88rem', fontWeight: 600, color: '#334155', outline: 'none',
                  cursor: 'pointer', appearance: 'none', transition: 'all 0.2s ease', minWidth: '170px'
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#0F172A'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#CBD5E1'; }}
              >
                <option value="Semua Status">Semua Status</option>
                <option value="Menunggu Review">Menunggu Review</option>
                <option value="Ditindaklanjuti">Ditindaklanjuti</option>
                <option value="Selesai">Selesai</option>
              </select>
              <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748B', pointerEvents: 'none', fontSize: '0.8rem' }}>⌄</span>
            </div>
          </div>
        </div>

        {/* Daftar Laporan List */}
        {loadingHistory ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748B', fontWeight: 500, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <RefreshCw size={28} className="animate-spin text-blue-600" />
            <span>Memuat riwayat masukan Anda...</span>
          </div>
        ) : filteredFeedbacks.length === 0 ? (
          <div style={{ padding: '64px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', backgroundColor: '#F8FAFC', borderRadius: '18px', border: '1px dashed #CBD5E1' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', boxShadow: '0 4px 10px rgba(0,0,0,0.04)' }}>
              <HelpCircle size={32} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0, marginBottom: '4px' }}>Belum Ada Laporan</h4>
              <p style={{ fontSize: '0.9rem', color: '#64748B', margin: 0, maxWidth: '380px' }}>
                {statusFilter === 'Semua Status' 
                  ? "Anda belum pernah mengirimkan kritik ataupun saran sebelumnya." 
                  : `Tidak ada laporan dengan status "${statusFilter}" saat ini.`}
              </p>
            </div>
            {statusFilter !== 'Semua Status' && (
              <button
                type="button"
                onClick={() => setStatusFilter('Semua Status')}
                style={{ padding: '8px 18px', borderRadius: '10px', backgroundColor: '#F1F5F9', color: '#0F172A', fontWeight: 700, fontSize: '0.85rem', border: 'none', cursor: 'pointer', marginTop: '4px' }}
              >
                Lihat Semua Status
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filteredFeedbacks.map((item, idx) => {
              const isKritik = item.type === 'Kritik';
              const isExpanded = expandedId === item.id;
              const formattedDate = new Date(item.created_at).toLocaleString('id-ID', { 
                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
              });
              const ticketNo = getTicketNumber(item, idx);

              return (
                <div 
                  key={item.id}
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  style={{ 
                    borderRadius: '16px', 
                    border: isExpanded ? '1px solid #1E293B' : '1px solid #E2E8F0',
                    backgroundColor: isExpanded ? '#F1F5F9' : '#FFFFFF',
                    padding: '20px 24px',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    cursor: 'pointer',
                    boxShadow: isExpanded ? '0 8px 25px -5px rgba(59, 130, 246, 0.12)' : '0 2px 8px rgba(0, 0, 0, 0.02)',
                    display: 'flex', flexDirection: 'column', gap: '14px'
                  }}
                  onMouseEnter={(e) => { if (!isExpanded) { e.currentTarget.style.backgroundColor = '#F8FAFC'; e.currentTarget.style.borderColor = '#CBD5E1'; } }}
                  onMouseLeave={(e) => { if (!isExpanded) { e.currentTarget.style.backgroundColor = '#FFFFFF'; e.currentTarget.style.borderColor = '#E2E8F0'; } }}
                >
                  
                  {/* Top Bar: Badges & Timestamp */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {/* Badge Jenis */}
                      {isKritik ? (
                        <span style={{ 
                          padding: '5px 14px', borderRadius: '9999px',
                          backgroundColor: '#FFF7ED', color: '#C2410C', border: '1px solid #FED7AA',
                          fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px'
                        }}>
                          <AlertCircle size={13} />
                          <span>Kritik</span>
                        </span>
                      ) : (
                        <span style={{ 
                          padding: '5px 14px', borderRadius: '9999px',
                          backgroundColor: '#F1F5F9', color: '#1E293B', border: '1px solid #BFDBFE',
                          fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px'
                        }}>
                          <MessageSquare size={13} />
                          <span>Saran</span>
                        </span>
                      )}

                      <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 500 }}>
                        {formattedDate} WIB
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      
                      {/* Badge Status */}
                      {item.status === 'Resolved' ? (
                        <span style={{ 
                          padding: '5px 14px', borderRadius: '9999px',
                          backgroundColor: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0',
                          fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px'
                        }}>
                          <CheckCircle2 size={13} />
                          <span>Selesai</span>
                        </span>
                      ) : item.status === 'In Progress' ? (
                        <span style={{ 
                          padding: '5px 14px', borderRadius: '9999px',
                          backgroundColor: '#F5F3FF', color: '#7C3AED', border: '1px solid #DDD6FE',
                          fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px'
                        }}>
                          <Clock size={13} />
                          <span>Ditindaklanjuti</span>
                        </span>
                      ) : (
                        <span style={{ 
                          padding: '5px 14px', borderRadius: '9999px',
                          backgroundColor: '#F1F5F9', color: '#0F172A', border: '1px solid #BFDBFE',
                          fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px'
                        }}>
                          <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#0F172A' }} />
                          <span>Menunggu Review</span>
                        </span>
                      )}

                      {/* Nomor Tiket */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 600, color: '#64748B', backgroundColor: '#F1F5F9', padding: '4px 10px', borderRadius: '8px' }}>
                        <Hash size={13} color="#94A3B8" />
                        <span style={{ fontFamily: 'monospace' }}>{ticketNo.replace('#', '')}</span>
                      </div>

                      {/* Arrow Detail Button */}
                      <div style={{ 
                        width: '34px', height: '34px', borderRadius: '9999px',
                        backgroundColor: isExpanded ? '#1E293B' : '#F1F5F9',
                        color: isExpanded ? '#FFFFFF' : '#475569',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s ease', flexShrink: 0
                      }}>
                        <ChevronRight size={18} style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                      </div>

                    </div>
                  </div>

                  {/* Main Message Content */}
                  <div style={{ fontSize: '0.96rem', color: '#0F172A', fontWeight: 600, lineHeight: 1.6 }}>
                    {item.message}
                  </div>

                  {/* Expanded Detail Notice */}
                  {isExpanded && (
                    <div className="animate-fade-in" style={{ 
                      marginTop: '4px', paddingTop: '12px', borderTop: '1px dashed #CBD5E1', 
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px',
                      fontSize: '0.84rem', color: '#475569', fontWeight: 500 
                    }}>
                      <span>ID Laporan: <strong>{item.id}</strong></span>
                      <span>Status: <strong style={{ color: item.status === 'Resolved' ? '#059669' : item.status === 'In Progress' ? '#7C3AED' : '#0F172A' }}>
                        {item.status === 'New' ? 'Menunggu Review Tim Developer' : item.status === 'In Progress' ? 'Sedang Dalam Proses Tindak Lanjut' : 'Telah Selesai Ditangani'}
                      </strong></span>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

        {/* Footer info */}
        {filteredFeedbacks.length > 0 && (
          <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#64748B', fontWeight: 500, paddingTop: '8px' }}>
            Menampilkan {filteredFeedbacks.length} dari total {myFeedbacks.length} laporan Anda
          </div>
        )}

      </div>

    </div>
  );
}

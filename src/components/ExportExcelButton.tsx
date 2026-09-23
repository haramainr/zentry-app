"use client";

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { Download } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import ExportFilterModal, { UserItem } from './ExportFilterModal';

interface ExportExcelButtonProps {
  role: string;
  currentUserId: string;
  usersList?: UserItem[]; // Optional in case some pages don't pass it
}

export default function ExportExcelButton({ role, currentUserId, usersList = [] }: ExportExcelButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (filters: { startDate: string; endDate: string; managerId: string; leaderId: string; salesId: string }) => {
    setIsExporting(true);
    try {
      const supabase = createClient();
      
      let query = supabase.from('submissions').select(`
        *,
        sales:users(full_name, supervisor_id)
      `).eq('is_draft', false);

      // Apply date filters
      if (filters.startDate) {
        // Start of day
        query = query.gte('created_at', new Date(filters.startDate).toISOString());
      }
      if (filters.endDate) {
        // End of day
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        query = query.lte('created_at', end.toISOString());
      }

      // Apply Sales/Leader filters
      if (filters.salesId) {
        query = query.eq('sales_id', filters.salesId);
      } else if (filters.leaderId) {
        // If Leader is selected but Sales is not, get all sales under this leader
        const salesUnderLeader = usersList
          .filter(u => u.role === 'Sales' && u.supervisor_id === filters.leaderId)
          .map(u => u.id);
        
        if (salesUnderLeader.length > 0) {
          query = query.in('sales_id', salesUnderLeader);
        } else {
          // No sales under this leader, force empty result
          query = query.eq('sales_id', 'no-sales-found'); 
        }
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        alert("Tidak ada data pendaftaran yang sesuai dengan filter tersebut.");
        setIsExporting(false);
        return;
      }

      // Format data for excel
      const excelData = data.map((item: any) => ({
        'Tanggal Registrasi': new Date(item.created_at).toLocaleDateString('id-ID'),
        'Nama Sales': item.sales?.full_name || '-',
        'Nama Pelanggan': item.nama_lengkap,
        'KTP': item.ktp,
        'No. HP': item.telp_selular,
        'Paket Layanan': item.paket_layanan,
        'VAS': item.vas || '-',
        'Promo': item.promo || '-',
        'Homepass ID': item.homepass_id || '-',
        'Titik Koordinat': item.titik_koordinat || '-',
        'Alamat Pemasangan': item.alamat || '-',
        'Total Estimasi Biaya (Rp)': item.biaya_total,
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Registrasi");
      
      const fileName = `Data_Registrasi_${role}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      setIsModalOpen(false);
      
    } catch (error) {
      console.error("Export error:", error);
      alert("Terjadi kesalahan saat meng-export data.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        style={{ 
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '8px 16px', borderRadius: '8px',
          border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF',
          color: '#334155', fontSize: '0.85rem', fontWeight: 600,
          cursor: 'pointer', transition: 'all 0.15s ease',
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
        }}
      >
        <Download size={15} color="#475569" />
        Export Data
      </button>

      <ExportFilterModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        role={role}
        currentUserId={currentUserId}
        usersList={usersList}
        onExport={handleExport}
        isExporting={isExporting}
      />
    </>
  );
}

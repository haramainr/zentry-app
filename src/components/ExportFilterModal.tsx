"use client";

import { useState, useEffect } from 'react';
import { X, Download, Filter } from 'lucide-react';

export interface UserItem {
  id: string;
  full_name: string;
  role: string;
  supervisor_id: string | null;
}

interface ExportFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: string; // The role of the logged in user
  currentUserId: string;
  usersList: UserItem[];
  onExport: (filters: { startDate: string; endDate: string; managerId: string; leaderId: string; salesId: string }) => void;
  isExporting: boolean;
}

export default function ExportFilterModal({ isOpen, onClose, role, currentUserId, usersList, onExport, isExporting }: ExportFilterModalProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [managerId, setManagerId] = useState("");
  const [leaderId, setLeaderId] = useState("");
  const [salesId, setSalesId] = useState("");

  // Set default leaderId if the current user is a Leader
  useEffect(() => {
    if (isOpen && role === 'Leader') {
      setLeaderId(currentUserId);
    }
  }, [isOpen, role, currentUserId]);

  if (!isOpen) return null;

  const leaders = usersList.filter(u => u.role === 'Leader');
  const managers = usersList.filter(u => u.role === 'Manager' || u.role === 'Developer');
  
  // Dynamic sales list based on selected leader
  let availableSales = usersList.filter(u => u.role === 'Sales');
  if (leaderId) {
    availableSales = availableSales.filter(u => u.supervisor_id === leaderId);
  }

  const handleExportClick = () => {
    onExport({ startDate, endDate, managerId, leaderId, salesId });
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <div className="card animate-fade-in" style={{
        backgroundColor: 'var(--bg-color)', width: '90%', maxWidth: '500px',
        padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
          <h3 className="h3" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={20} /> Filter Export Data
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
            <div>
              <label className="text-small" style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Tanggal Awal</label>
              <input 
                type="date" 
                className="input-field" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
              />
            </div>
            <div>
              <label className="text-small" style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Tanggal Akhir</label>
              <input 
                type="date" 
                className="input-field" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
              />
            </div>
          </div>

          {(role === 'Developer' || role === 'Admin') && (
            <div>
              <label className="text-small" style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Manager</label>
              <select className="input-field" value={managerId} onChange={(e) => setManagerId(e.target.value)}>
                <option value="">Semua Manager</option>
                {managers.map(m => (
                  <option key={m.id} value={m.id}>{m.full_name}</option>
                ))}
              </select>
            </div>
          )}

          {(role === 'Manager' || role === 'Developer' || role === 'Admin') && (
            <div>
              <label className="text-small" style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Team Leader</label>
              <select className="input-field" value={leaderId} onChange={(e) => {
                setLeaderId(e.target.value);
                setSalesId(""); // Reset sales when leader changes
              }}>
                <option value="">Semua Leader</option>
                {leaders.map(l => (
                  <option key={l.id} value={l.id}>{l.full_name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-small" style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Sales</label>
            <select className="input-field" value={salesId} onChange={(e) => setSalesId(e.target.value)}>
              <option value="">Semua Sales</option>
              {availableSales.map(s => (
                <option key={s.id} value={s.id}>{s.full_name}</option>
              ))}
            </select>
          </div>

        </div>

        <div style={{ marginTop: 'var(--spacing-xl)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-sm)' }}>
          <button onClick={onClose} className="btn btn-outline" disabled={isExporting}>Batal</button>
          <button 
            onClick={handleExportClick} 
            className="btn btn-primary" 
            disabled={isExporting}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Download size={16} />
            {isExporting ? "Memproses..." : "Unduh Sekarang"}
          </button>
        </div>
      </div>
    </div>
  );
}

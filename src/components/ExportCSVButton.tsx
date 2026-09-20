"use client";

import { Download } from "lucide-react";

export default function ExportCSVButton({ data, filename }: { data: any[], filename: string }) {
  
  const handleExport = () => {
    if (!data || data.length === 0) return;

    // Ambil header dari keys baris pertama
    const headers = Object.keys(data[0]);
    
    // Konversi data menjadi string CSV
    const csvRows: string[] = [];
    
    // Tambahkan header
    csvRows.push(headers.join(','));
    
    // Tambahkan isi data
    for (const row of data) {
      const values = headers.map(header => {
        const val = row[header] === null || row[header] === undefined ? '' : row[header];
        // Escape quotes and wrap in quotes if contains comma
        const stringVal = String(val).replace(/"/g, '""');
        if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
          return `"${stringVal}"`;
        }
        return stringVal;
      });
      csvRows.push(values.join(','));
    }

    const csvString = csvRows.join('\n');
    
    // Buat Blob dan trigger download
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button onClick={handleExport} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Download size={20} />
      Export CSV
    </button>
  );
}

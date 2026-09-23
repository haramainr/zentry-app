"use client";
import React from "react";
import { Users, FileText, CheckCircle2, FileEdit, Database, ShieldCheck, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function DeveloperOverviewClient({ stats, recentSubmissions, recentUsers, packagesChartData, activityChartData, expiringUsers }: any) {
  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("id-ID", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

  return (
    <div style={{ padding: "24px 32px", fontFamily: "'Inter', sans-serif" }}>
      
      {/* HEADER OVERVIEW */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ margin: 0, fontSize: "1.75rem", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.5px" }}>
          System Overview
        </h1>
        <p style={{ margin: "6px 0 0 0", fontSize: "0.95rem", color: "#94A3B8" }}>
          Live metrics and visual analytics across Zentry Database.
        </p>
      </div>

      {/* TOP STATS ROW */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "32px" }}>
        <div className="dev-card-static">
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div className="dev-icon-wrapper" style={{ backgroundColor: "rgba(59, 130, 246, 0.1)", color: "#3B82F6" }}>
              <Users size={20} />
            </div>
            <h3 style={{ margin: 0, fontSize: "0.9rem", color: "#94A3B8", fontWeight: 600 }}>Total Users</h3>
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "#FFFFFF", marginBottom: "4px" }}>
            {stats.totalUsers}
          </div>
          <div style={{ fontSize: "0.8rem", color: "#64748B" }}>Registered Accounts</div>
        </div>

        <div className="dev-card-static">
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div className="dev-icon-wrapper" style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#10B981" }}>
              <CheckCircle2 size={20} />
            </div>
            <h3 style={{ margin: 0, fontSize: "0.9rem", color: "#94A3B8", fontWeight: 600 }}>Completed Forms</h3>
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "#FFFFFF", marginBottom: "4px" }}>
            {stats.totalRegistrations}
          </div>
          <div style={{ fontSize: "0.8rem", color: "#64748B" }}>Generated PDFs</div>
        </div>

        <div className="dev-card-static">
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div className="dev-icon-wrapper" style={{ backgroundColor: "rgba(245, 158, 11, 0.1)", color: "#F59E0B" }}>
              <FileEdit size={20} />
            </div>
            <h3 style={{ margin: 0, fontSize: "0.9rem", color: "#94A3B8", fontWeight: 600 }}>Saved Drafts</h3>
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "#FFFFFF", marginBottom: "4px" }}>
            {stats.totalDrafts}
          </div>
          <div style={{ fontSize: "0.8rem", color: "#64748B" }}>Pending Completion</div>
        </div>

        <div className="dev-card-static">
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div className="dev-icon-wrapper" style={{ backgroundColor: "rgba(168, 85, 247, 0.1)", color: "#A855F7" }}>
              <Database size={20} />
            </div>
            <h3 style={{ margin: 0, fontSize: "0.9rem", color: "#94A3B8", fontWeight: 600 }}>Total Records</h3>
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "#FFFFFF", marginBottom: "4px" }}>
            {stats.totalSubmissions}
          </div>
          <div style={{ fontSize: "0.8rem", color: "#64748B" }}>In Database</div>
        </div>
      </div>

      {/* CHARTS ROW */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", marginBottom: "32px" }}>
        
        {/* Activity Area Chart */}
        <div className="dev-card-static" style={{ height: "350px", display: "flex", flexDirection: "column" }}>
          <h3 style={{ margin: "0 0 20px 0", fontSize: "1.1rem", fontWeight: 700, color: "#FFFFFF" }}>Form Submissions Activity</h3>
          <div style={{ flex: 1, minHeight: 0 }}>
            {activityChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSubmitted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorDraft" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(51, 65, 85, 0.4)" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '8px', color: '#F8FAFC' }}
                    itemStyle={{ color: '#E2E8F0' }}
                  />
                  <Area type="monotone" dataKey="submitted" name="Selesai" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorSubmitted)" />
                  <Area type="monotone" dataKey="draft" name="Draft" stroke="#F59E0B" strokeWidth={3} fillOpacity={1} fill="url(#colorDraft)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
                Belum ada data aktivitas
              </div>
            )}
          </div>
        </div>

        {/* Packages Pie Chart */}
        <div className="dev-card-static" style={{ height: "350px", display: "flex", flexDirection: "column" }}>
          <h3 style={{ margin: "0 0 20px 0", fontSize: "1.1rem", fontWeight: 700, color: "#FFFFFF" }}>Distribusi Layanan</h3>
          <div style={{ flex: 1, minHeight: 0 }}>
            {packagesChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={packagesChartData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {packagesChartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '8px', color: '#F8FAFC' }}
                    itemStyle={{ color: '#E2E8F0' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#94A3B8' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
                Belum ada data layanan
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", alignItems: "start" }}>
        
        {/* RECENT SUBMISSIONS */}
        <section className="dev-card-static">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "#FFFFFF" }}>Live Registrations Feed</h3>
              <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem", color: "#94A3B8" }}>Recent customer forms submitted by Sales</p>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="dev-table" style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ padding: "12px 16px", color: "#94A3B8", borderBottom: "1px solid #334155" }}>Time</th>
                  <th style={{ padding: "12px 16px", color: "#94A3B8", borderBottom: "1px solid #334155" }}>Customer</th>
                  <th style={{ padding: "12px 16px", color: "#94A3B8", borderBottom: "1px solid #334155" }}>Paket</th>
                  <th style={{ padding: "12px 16px", color: "#94A3B8", borderBottom: "1px solid #334155" }}>Status</th>
                  <th style={{ padding: "12px 16px", color: "#94A3B8", borderBottom: "1px solid #334155" }}>Sales</th>
                </tr>
              </thead>
              <tbody>
                {recentSubmissions.map((sub: any) => (
                  <tr key={sub.id} style={{ borderBottom: "1px solid #1E293B" }}>
                    <td style={{ padding: "12px 16px", color: "#94A3B8", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                      {formatTime(sub.created_at)}
                    </td>
                    <td style={{ padding: "12px 16px", fontWeight: 600, color: "#F8FAFC" }}>{sub.nama_lengkap}</td>
                    <td style={{ padding: "12px 16px", color: "#CBD5E1", fontSize: "0.85rem" }}>{sub.paket_layanan || '-'}</td>
                    <td style={{ padding: "12px 16px" }}>
                      {sub.is_draft ? (
                        <span style={{ backgroundColor: "rgba(245, 158, 11, 0.15)", color: "#F59E0B", padding: "4px 10px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 600 }}>
                          Draft
                        </span>
                      ) : (
                        <span style={{ backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#34D399", padding: "4px 10px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 600 }}>
                          Selesai
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#94A3B8", fontSize: "0.85rem" }}>{sub.user?.full_name || '-'}</td>
                  </tr>
                ))}
                {recentSubmissions.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "32px", color: "#64748B" }}>
                      Belum ada data registrasi pelanggan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        
        {/* EXPIRING LICENSES */}
        {expiringUsers && expiringUsers.length > 0 && (
          <section className="dev-card-static" style={{ marginBottom: "24px", border: "1px solid rgba(239, 68, 68, 0.3)", position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', backgroundColor: '#EF4444' }}></div>
            <div style={{ marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#EF4444", display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={20} /> Lisensi Hampir Habis
              </h3>
              <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem", color: "#FCA5A5" }}>Dalam 7 hari ke depan</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {expiringUsers.map((u: any) => {
                const expiry = new Date(u.subscription_end_date);
                const diff = Math.ceil((expiry.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                const isExpired = diff <= 0;
                
                return (
                  <div key={u.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", backgroundColor: "rgba(239, 68, 68, 0.05)", borderRadius: "8px" }}>
                    <div>
                      <div style={{ fontWeight: 600, color: "#F8FAFC", fontSize: "0.9rem" }}>{u.full_name}</div>
                      <div style={{ color: isExpired ? "#EF4444" : "#FCA5A5", fontSize: "0.75rem", marginTop: "4px", fontWeight: isExpired ? 700 : 400 }}>
                        {isExpired ? 'Telah Berakhir!' : `Sisa ${diff} Hari (${expiry.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })})`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* RECENT USERS */}
        <section className="dev-card-static">
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "#FFFFFF" }}>New Accounts</h3>
            <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem", color: "#94A3B8" }}>Recently registered employees</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {recentUsers.map((u: any) => (
              <div key={u.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", backgroundColor: "#0F172A", borderRadius: "10px", border: "1px solid #1E293B" }}>
                <div>
                  <div style={{ fontWeight: 600, color: "#F8FAFC", fontSize: "0.95rem" }}>{u.full_name}</div>
                  <div style={{ color: "#64748B", fontSize: "0.75rem", marginTop: "4px" }}>{formatTime(u.created_at)}</div>
                </div>
                <span style={{ padding: "4px 8px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 600, backgroundColor: u.role === 'Leader' ? 'rgba(59, 130, 246, 0.15)' : u.role === 'Manager' || u.role === 'Developer' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(100, 116, 139, 0.15)', color: u.role === 'Leader' ? '#60A5FA' : u.role === 'Manager' || u.role === 'Developer' ? '#C084FC' : '#94A3B8' }}>
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

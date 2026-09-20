"use client";

import { useState } from "react";
import { 
  Activity, 
  ShieldAlert, 
  Server, 
  Database, 
  Cpu, 
  HardDrive, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Terminal, 
  Search, 
  Filter, 
  ExternalLink, 
  ArrowUpRight, 
  ArrowDownRight, 
  RefreshCw, 
  Globe, 
  Lock, 
  UserCheck, 
  Layers, 
  FileText, 
  MessageSquare, 
  ShieldCheck,
  ChevronRight,
  Sliders,
  Sparkles
} from "lucide-react";
import DeveloperSubscriptionsClient from "@/components/DeveloperSubscriptionsClient";

interface OverviewProps {
  stats: {
    totalUsers: number;
    totalSubmissions: number;
    totalRegistrations: number;
    totalDrafts: number;
    activeSubs: number;
    totalFeedbacks: number;
  };
}

export default function DeveloperOverviewClient({ stats }: OverviewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  // Mock data for sparklines (SVG Path strings)
  const sparklineBlue = "M 0 35 Q 15 30, 30 38 T 60 25 T 90 32 T 120 15 T 150 22";
  const sparklineRed = "M 0 38 Q 20 35, 40 38 T 80 36 T 120 32 T 150 28";
  const sparklineGreen = "M 0 30 Q 25 35, 50 25 T 100 30 T 150 15";
  const sparklinePurple = "M 0 35 Q 30 20, 60 28 T 110 18 T 150 12";

  // Recent Activity Logs (Timeline)
  const recentActivities = [
    { time: "Just now", msg: "System check completed successfully", category: "System", type: "info", icon: Server, color: "#3B82F6", bg: "rgba(59, 130, 246, 0.15)" },
    { time: "2 mins ago", msg: "Database synced with edge network", category: "Database", type: "info", icon: Database, color: "#8B5CF6", bg: "rgba(139, 92, 246, 0.15)" },
    { time: "15 mins ago", msg: "New user registration completed", category: "User", type: "success", icon: UserCheck, color: "#10B981", bg: "rgba(16, 185, 129, 0.15)" },
    { time: "1 hour ago", msg: "API rate limit warning on /generate-pdf", category: "API", type: "warn", icon: Activity, color: "#F59E0B", bg: "rgba(245, 158, 11, 0.15)" },
    { time: "3 hours ago", msg: "Admin login detected via WebAuthn", category: "Auth", type: "info", icon: Lock, color: "#06B6D4", bg: "rgba(6, 182, 212, 0.15)" },
  ];

  // API Endpoints Monitor
  const apiEndpoints = [
    { endpoint: "/api/users", method: "GET", status: 200, latency: "45 ms", requests: "1,245", trend: "+8%" },
    { endpoint: "/api/auth/login", method: "POST", status: 200, latency: "98 ms", requests: "842", trend: "+14%" },
    { endpoint: "/api/auth/register", method: "POST", status: 201, latency: "120 ms", requests: "563", trend: "+5%" },
    { endpoint: "/api/subscriptions", method: "GET", status: 200, latency: "67 ms", requests: "432", trend: "+12%" },
    { endpoint: "/api/generate-pdf", method: "POST", status: 200, latency: "320 ms", requests: "1,024", trend: "+22%" },
  ];

  // Database Overview Grid Items
  const dbOverview = [
    { label: "Users", value: stats.totalUsers || 120, trend: "+12%", up: true, icon: UserCheck, color: "#3B82F6" },
    { label: "Registrations", value: stats.totalRegistrations || 582, trend: "+18%", up: true, icon: FileText, color: "#10B981" },
    { label: "Drafts", value: stats.totalDrafts || 44, trend: "-5%", up: false, icon: Layers, color: "#F59E0B" },
    { label: "Subscriptions", value: stats.activeSubs || 89, trend: "+8%", up: true, icon: ShieldCheck, color: "#8B5CF6" },
    { label: "Feedbacks", value: stats.totalFeedbacks || 18, trend: "+3%", up: true, icon: MessageSquare, color: "#06B6D4" },
    { label: "Audit Logs", value: "1,245", trend: "+22%", up: true, icon: Terminal, color: "#EC4899" },
  ];

  // Latest Audit Logs
  const auditLogs = [
    { time: "15 Jul 2026, 12:55:23", user: "icun.developer", action: "Login", resource: "Authentication", ip: "103.152.***.23", agent: "Chrome 126.0 (Windows)", status: "Success" },
    { time: "15 Jul 2026, 12:42:10", user: "zyntaxera.sales", action: "Create Draft", resource: "/sales/form", ip: "182.253.***.14", agent: "Safari 17.5 (macOS)", status: "Success" },
    { time: "15 Jul 2026, 11:30:05", user: "leader.team", action: "Export CSV", resource: "/leader/reports", ip: "114.122.***.88", agent: "Edge 126.0 (Windows)", status: "Success" },
    { time: "15 Jul 2026, 10:15:44", user: "manager.exec", action: "View Audit", resource: "/manager/leaders", ip: "36.85.***.102", agent: "Chrome 126.0 (Android)", status: "Success" },
    { time: "15 Jul 2026, 09:02:18", user: "system.cron", action: "Sync Edge", resource: "Database Engine", ip: "10.0.0.1 (Local)", agent: "ZEntry-Bot/1.0", status: "Success" },
  ];

  const filteredLogs = auditLogs.filter(log => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return log.user.toLowerCase().includes(term) || 
           log.action.toLowerCase().includes(term) || 
           log.resource.toLowerCase().includes(term) || 
           log.ip.toLowerCase().includes(term);
  });

  return (
    <div className="dev-overview-container">
      {/* Embedded High-Performance CSS for Developer Console */}
      <style jsx global>{`
        .dev-overview-container {
          padding: 24px 28px 48px 28px;
          background: #0B1220;
          color: #F8FAFC;
          min-height: 100vh;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          position: relative;
          overflow-x: hidden;
        }
        /* Subtle Background Ambient Decor */
        .dev-overview-container::before {
          content: "";
          position: absolute;
          top: -100px;
          left: 30%;
          width: 500px;
          height: 350px;
          background: radial-gradient(circle, rgba(37, 99, 235, 0.12) 0%, rgba(11, 18, 32, 0) 70%);
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
        }
        .dev-overview-container::after {
          content: "";
          position: absolute;
          top: 300px;
          right: -100px;
          width: 600px;
          height: 400px;
          background: radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, rgba(11, 18, 32, 0) 70%);
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
        }
        .dev-header-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          border-radius: 9999px;
          background: #131D31;
          border: 1px solid #22314A;
          font-size: 0.8rem;
          font-weight: 600;
          color: #E2E8F0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          transition: all 0.25s ease;
        }
        .dev-header-badge:hover {
          border-color: #38BDF8;
          transform: translateY(-1px);
        }
        .dev-card {
          background: #131D31;
          border: 1px solid #22314A;
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 1;
        }
        .dev-card:hover {
          transform: translateY(-4px);
          border-color: #3B82F6;
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.5), 0 0 15px rgba(59, 130, 246, 0.15);
        }
        .dev-card-static {
          background: #131D31;
          border: 1px solid #22314A;
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
          position: relative;
          z-index: 1;
        }
        .dev-kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 24px;
        }
        @media (max-width: 1280px) {
          .dev-kpi-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 768px) {
          .dev-kpi-grid {
            grid-template-columns: 1fr;
          }
        }
        .dev-middle-grid {
          display: grid;
          grid-template-columns: 1.1fr 1.1fr 0.9fr;
          gap: 20px;
          margin-bottom: 24px;
        }
        @media (max-width: 1350px) {
          .dev-middle-grid {
            grid-template-columns: 1fr 1fr;
          }
          .dev-middle-grid > *:nth-child(3) {
            grid-column: span 2;
          }
        }
        @media (max-width: 900px) {
          .dev-middle-grid {
            grid-template-columns: 1fr;
          }
          .dev-middle-grid > *:nth-child(3) {
            grid-column: span 1;
          }
        }
        .dev-bottom-grid {
          display: grid;
          grid-template-columns: 1.1fr 1.1fr 0.9fr;
          gap: 20px;
          margin-bottom: 24px;
        }
        @media (max-width: 1350px) {
          .dev-bottom-grid {
            grid-template-columns: 1fr 1fr;
          }
          .dev-bottom-grid > *:nth-child(3) {
            grid-column: span 2;
          }
        }
        @media (max-width: 900px) {
          .dev-bottom-grid {
            grid-template-columns: 1fr;
          }
          .dev-bottom-grid > *:nth-child(3) {
            grid-column: span 1;
          }
        }
        .dev-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .dev-table th {
          padding: 12px 16px;
          color: #64748B;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          border-bottom: 1px solid #22314A;
        }
        .dev-table td {
          padding: 14px 16px;
          color: #E2E8F0;
          font-size: 0.88rem;
          border-bottom: 1px solid rgba(34, 49, 74, 0.4);
          transition: background-color 0.2s ease;
        }
        .dev-table tr:hover td {
          background-color: rgba(30, 41, 59, 0.6);
        }
        .dev-progress-bar {
          height: 8px;
          background: #1E293B;
          border-radius: 9999px;
          overflow: hidden;
          position: relative;
        }
        .dev-progress-fill {
          height: 100%;
          border-radius: 9999px;
          transition: width 1s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .dev-btn-primary {
          background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
          color: #FFFFFF;
          font-weight: 600;
          font-size: 0.85rem;
          padding: 10px 16px;
          border-radius: 12px;
          border: 1px solid rgba(96, 165, 250, 0.3);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }
        .dev-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(37, 99, 235, 0.45);
        }
        .dev-btn-outline {
          background: transparent;
          color: #94A3B8;
          font-weight: 600;
          font-size: 0.82rem;
          padding: 8px 14px;
          border-radius: 10px;
          border: 1px solid #22314A;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .dev-btn-outline:hover {
          background: #1E293B;
          color: #F8FAFC;
          border-color: #38BDF8;
        }
        .dev-input {
          background: #0F172A;
          border: 1px solid #22314A;
          border-radius: 12px;
          padding: 10px 16px 10px 42px;
          color: #F8FAFC;
          font-size: 0.88rem;
          width: 100%;
          outline: none;
          transition: all 0.25s ease;
        }
        .dev-input:focus {
          border-color: #3B82F6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
        }
      `}</style>

      {/* HEADER SECTION WITH MODERN ENTERPRISE BADGES */}
      <header style={{ 
        display: "flex", 
        flexWrap: "wrap", 
        justifyContent: "space-between", 
        alignItems: "flex-start", 
        gap: "20px", 
        marginBottom: "28px",
        position: "relative",
        zIndex: 2
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
            <h1 style={{ fontSize: "1.9rem", fontWeight: 800, margin: 0, color: "#FFFFFF", letterSpacing: "-0.5px" }}>
              Developer Console
            </h1>
            <span style={{ 
              fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", 
              backgroundColor: "rgba(37, 99, 235, 0.2)", color: "#38BDF8", border: "1px solid rgba(56, 189, 248, 0.3)", 
              padding: "4px 10px", borderRadius: "8px" 
            }}>
              PROD ENGINE
            </span>
          </div>
          <p style={{ margin: 0, color: "#94A3B8", fontSize: "0.95rem" }}>
            Real-time monitoring and system management
          </p>
        </div>

        {/* Informative Status Badges */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px" }}>
          <div className="dev-header-badge" style={{ backgroundColor: "#131D31" }}>
            <span style={{ color: "#64748B" }}>Environment</span>
            <span style={{ color: "#F8FAFC", fontWeight: 700 }}>Production ⌄</span>
          </div>
          <div className="dev-header-badge">
            <span style={{ color: "#64748B" }}>Version</span>
            <span style={{ color: "#38BDF8", fontWeight: 700 }}>v1.3.2</span>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#10B981" }} />
          </div>
          <div className="dev-header-badge">
            <span style={{ color: "#64748B" }}>Last Deploy</span>
            <span style={{ color: "#F8FAFC", fontWeight: 600 }}>2 menit lalu</span>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#10B981" }} />
          </div>
          <div className="dev-header-badge">
            <span style={{ color: "#64748B" }}>API Status</span>
            <span style={{ color: "#10B981", fontWeight: 700, display: "flex", alignItems: "center", gap: "5px" }}>
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: "#10B981", display: "inline-block" }} className="animate-pulse" />
              Healthy
            </span>
          </div>
          <div className="dev-header-badge">
            <span style={{ color: "#64748B" }}>Database</span>
            <span style={{ color: "#10B981", fontWeight: 700, display: "flex", alignItems: "center", gap: "5px" }}>
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: "#10B981", display: "inline-block" }} className="animate-pulse" />
              Connected
            </span>
          </div>

          <button 
            onClick={handleRefresh} 
            className="dev-btn-outline" 
            title="Refresh Metrics"
            style={{ width: "40px", height: "38px", padding: 0 }}
          >
            <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} color="#38BDF8" />
          </button>
        </div>
      </header>

      {/* KPI CARDS (4 COLUMNS) */}
      <section className="dev-kpi-grid">
        {/* KPI 1: API Latency */}
        <div className="dev-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
            <div>
              <p style={{ margin: 0, fontSize: "0.86rem", color: "#94A3B8", fontWeight: 500 }}>Avg API Latency</p>
              <h2 style={{ margin: "6px 0 0 0", fontSize: "2rem", fontWeight: 800, color: "#F8FAFC", letterSpacing: "-0.5px" }}>
                142 <span style={{ fontSize: "1.1rem", fontWeight: 600, color: "#64748B" }}>ms</span>
              </h2>
            </div>
            <div style={{ backgroundColor: "rgba(59, 130, 246, 0.15)", padding: "12px", borderRadius: "14px", border: "1px solid rgba(59, 130, 246, 0.25)" }}>
              <Activity size={22} color="#60A5FA" />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "12px" }}>
            <span style={{ fontSize: "0.78rem", color: "#10B981", fontWeight: 600, display: "flex", alignItems: "center", gap: "5px" }}>
              <CheckCircle2 size={14} /> Optimal (&lt; 500ms)
            </span>
            {/* Sparkline */}
            <svg width="70" height="24" viewBox="0 0 150 45" style={{ overflow: "visible" }}>
              <path d={sparklineBlue} fill="none" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* KPI 2: Error Rate */}
        <div className="dev-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
            <div>
              <p style={{ margin: 0, fontSize: "0.86rem", color: "#94A3B8", fontWeight: 500 }}>System Error Rate</p>
              <h2 style={{ margin: "6px 0 0 0", fontSize: "2rem", fontWeight: 800, color: "#F8FAFC", letterSpacing: "-0.5px" }}>
                0.04 <span style={{ fontSize: "1.1rem", fontWeight: 600, color: "#64748B" }}>%</span>
              </h2>
            </div>
            <div style={{ backgroundColor: "rgba(239, 68, 68, 0.15)", padding: "12px", borderRadius: "14px", border: "1px solid rgba(239, 68, 68, 0.25)" }}>
              <ShieldAlert size={22} color="#F87171" />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "12px" }}>
            <span style={{ fontSize: "0.78rem", color: "#10B981", fontWeight: 600, display: "flex", alignItems: "center", gap: "5px" }}>
              <CheckCircle2 size={14} /> Stable
            </span>
            {/* Sparkline */}
            <svg width="70" height="24" viewBox="0 0 150 45" style={{ overflow: "visible" }}>
              <path d={sparklineRed} fill="none" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* KPI 3: Server Uptime */}
        <div className="dev-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
            <div>
              <p style={{ margin: 0, fontSize: "0.86rem", color: "#94A3B8", fontWeight: 500 }}>Server Uptime</p>
              <h2 style={{ margin: "6px 0 0 0", fontSize: "2rem", fontWeight: 800, color: "#F8FAFC", letterSpacing: "-0.5px" }}>
                99.9 <span style={{ fontSize: "1.1rem", fontWeight: 600, color: "#64748B" }}>%</span>
              </h2>
            </div>
            <div style={{ backgroundColor: "rgba(16, 185, 129, 0.15)", padding: "12px", borderRadius: "14px", border: "1px solid rgba(16, 185, 129, 0.25)" }}>
              <Server size={22} color="#34D399" />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "12px" }}>
            <span style={{ fontSize: "0.78rem", color: "#94A3B8", fontWeight: 500 }}>
              Last 30 days
            </span>
            {/* Sparkline */}
            <svg width="70" height="24" viewBox="0 0 150 45" style={{ overflow: "visible" }}>
              <path d={sparklineGreen} fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* KPI 4: Database Entities */}
        <div className="dev-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
            <div>
              <p style={{ margin: 0, fontSize: "0.86rem", color: "#94A3B8", fontWeight: 500 }}>Database Entities</p>
              <h2 style={{ margin: "6px 0 0 0", fontSize: "2rem", fontWeight: 800, color: "#F8FAFC", letterSpacing: "-0.5px" }}>
                {(stats.totalUsers + stats.totalSubmissions) || 746}
              </h2>
            </div>
            <div style={{ backgroundColor: "rgba(139, 92, 246, 0.15)", padding: "12px", borderRadius: "14px", border: "1px solid rgba(139, 92, 246, 0.25)" }}>
              <Database size={22} color="#A78BFA" />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "12px" }}>
            <span style={{ fontSize: "0.78rem", color: "#94A3B8", fontWeight: 500 }}>
              Users + Submissions
            </span>
            {/* Sparkline */}
            <svg width="70" height="24" viewBox="0 0 150 45" style={{ overflow: "visible" }}>
              <path d={sparklinePurple} fill="none" stroke="#A78BFA" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </section>

      {/* MIDDLE SECTION: RECENT ACTIVITY | RESOURCES | DEPLOYMENT INFO */}
      <section className="dev-middle-grid">
        
        {/* 1. Recent Activity Logs (Timeline) */}
        <div className="dev-card-static" style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#FFFFFF" }}>Recent Activity Logs</h3>
            <button className="dev-btn-outline" style={{ padding: "4px 10px", fontSize: "0.75rem" }}>Lihat Semua</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", flex: 1 }}>
            {recentActivities.map((act, i) => {
              const IconComp = act.icon;
              return (
                <div key={i} style={{ 
                  display: "flex", alignItems: "flex-start", gap: "14px", padding: "12px", 
                  backgroundColor: "#0F172A", borderRadius: "14px", border: "1px solid rgba(34, 49, 74, 0.5)",
                  transition: "all 0.2s ease"
                }}>
                  <div style={{ backgroundColor: act.bg, padding: "8px", borderRadius: "10px", flexShrink: 0, color: act.color }}>
                    <IconComp size={18} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <span style={{ 
                        fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", color: act.color, 
                        backgroundColor: act.bg, padding: "2px 8px", borderRadius: "6px" 
                      }}>
                        {act.category}
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "#64748B" }}>{act.time}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: "#E2E8F0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {act.msg}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Server Resources */}
        <div className="dev-card-static" style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#FFFFFF" }}>Server Resources</h3>
            <button className="dev-btn-outline" style={{ padding: "4px 10px", fontSize: "0.75rem" }}>Detail</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", flex: 1, justifyContent: "center" }}>
            
            {/* CPU Usage */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ backgroundColor: "rgba(59, 130, 246, 0.15)", padding: "8px", borderRadius: "10px", color: "#60A5FA" }}>
                    <Cpu size={18} />
                  </div>
                  <div>
                    <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#F8FAFC", display: "block" }}>CPU Usage</span>
                    <span style={{ fontSize: "0.75rem", color: "#64748B" }}>4 Core / 8 Core</span>
                  </div>
                </div>
                <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#60A5FA" }}>56%</span>
              </div>
              <div className="dev-progress-bar">
                <div className="dev-progress-fill" style={{ width: "56%", background: "linear-gradient(90deg, #2563EB, #60A5FA)" }} />
              </div>
            </div>

            {/* RAM Usage */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ backgroundColor: "rgba(168, 85, 247, 0.15)", padding: "8px", borderRadius: "10px", color: "#A855F7" }}>
                    <HardDrive size={18} />
                  </div>
                  <div>
                    <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#F8FAFC", display: "block" }}>RAM Usage</span>
                    <span style={{ fontSize: "0.75rem", color: "#64748B" }}>5.8 GB / 8 GB</span>
                  </div>
                </div>
                <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#A855F7" }}>72%</span>
              </div>
              <div className="dev-progress-bar">
                <div className="dev-progress-fill" style={{ width: "72%", background: "linear-gradient(90deg, #9333EA, #C084FC)" }} />
              </div>
            </div>

            {/* Storage Usage */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ backgroundColor: "rgba(245, 158, 11, 0.15)", padding: "8px", borderRadius: "10px", color: "#F59E0B" }}>
                    <Database size={18} />
                  </div>
                  <div>
                    <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#F8FAFC", display: "block" }}>Storage Usage</span>
                    <span style={{ fontSize: "0.75rem", color: "#64748B" }}>152 GB / 400 GB</span>
                  </div>
                </div>
                <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#F59E0B" }}>38%</span>
              </div>
              <div className="dev-progress-bar">
                <div className="dev-progress-fill" style={{ width: "38%", background: "linear-gradient(90deg, #D97706, #FBBF24)" }} />
              </div>
            </div>

          </div>
        </div>

        {/* 3. Deployment Info */}
        <div className="dev-card-static" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#FFFFFF" }}>Deployment Info</h3>
            <button className="dev-btn-outline" style={{ padding: "4px 10px", fontSize: "0.75rem" }}>Riwayat</button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px", backgroundColor: "#0F172A", padding: "18px", borderRadius: "16px", border: "1px solid rgba(34, 49, 74, 0.5)", marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#94A3B8", fontSize: "0.85rem" }}>Environment</span>
              <span style={{ backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#10B981", padding: "2px 10px", borderRadius: "6px", fontSize: "0.78rem", fontWeight: 700, border: "1px solid rgba(16, 185, 129, 0.3)" }}>
                Production
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#94A3B8", fontSize: "0.85rem" }}>Version</span>
              <span style={{ color: "#F8FAFC", fontWeight: 700, fontSize: "0.9rem" }}>v1.3.2</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#94A3B8", fontSize: "0.85rem" }}>Build Number</span>
              <span style={{ color: "#38BDF8", fontWeight: 700, fontFamily: "monospace", fontSize: "0.9rem" }}>#203</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#94A3B8", fontSize: "0.85rem" }}>Deployed At</span>
              <span style={{ color: "#F8FAFC", fontSize: "0.85rem" }}>2 menit lalu</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#94A3B8", fontSize: "0.85rem" }}>Deployed By</span>
              <span style={{ color: "#E2E8F0", fontSize: "0.85rem", fontWeight: 600 }}>Icun Developer</span>
            </div>
          </div>

          <button className="dev-btn-outline" style={{ width: "100%", padding: "12px", borderRadius: "12px", justifyContent: "center", border: "1px solid rgba(56, 189, 248, 0.3)", color: "#38BDF8" }}>
            <Terminal size={16} /> View Deployment Logs
          </button>
        </div>

      </section>

      {/* BOTTOM SECTION 1: API ENDPOINTS | DATABASE OVERVIEW | ERROR MONITORING */}
      <section className="dev-bottom-grid">
        
        {/* 1. API Endpoints Monitor */}
        <div className="dev-card-static" style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#FFFFFF" }}>API Endpoints Monitor</h3>
            <button className="dev-btn-outline" style={{ padding: "4px 10px", fontSize: "0.75rem" }}>Lihat Semua</button>
          </div>
          <div style={{ overflowX: "auto", flex: 1 }}>
            <table className="dev-table" style={{ fontSize: "0.82rem" }}>
              <thead>
                <tr>
                  <th>Endpoint</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Avg Resp</th>
                  <th>Reqs</th>
                </tr>
              </thead>
              <tbody>
                {apiEndpoints.map((api, idx) => (
                  <tr key={idx}>
                    <td style={{ fontFamily: "monospace", color: "#38BDF8", fontWeight: 600 }}>{api.endpoint}</td>
                    <td>
                      <span style={{ 
                        backgroundColor: api.method === "GET" ? "rgba(59, 130, 246, 0.15)" : "rgba(16, 185, 129, 0.15)",
                        color: api.method === "GET" ? "#60A5FA" : "#34D399",
                        padding: "2px 8px", borderRadius: "6px", fontWeight: 700, fontSize: "0.72rem"
                      }}>
                        {api.method}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: "#10B981", fontWeight: 700 }}>{api.status}</span>
                    </td>
                    <td style={{ color: "#E2E8F0" }}>{api.latency}</td>
                    <td style={{ color: "#94A3B8" }}>{api.requests}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. Database Overview */}
        <div className="dev-card-static" style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#FFFFFF" }}>Database Overview</h3>
            <button className="dev-btn-outline" style={{ padding: "4px 10px", fontSize: "0.75rem" }}>Lihat Semua</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", flex: 1 }}>
            {dbOverview.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div key={idx} style={{ 
                  backgroundColor: "#0F172A", padding: "14px", borderRadius: "14px", 
                  border: "1px solid rgba(34, 49, 74, 0.5)", display: "flex", flexDirection: "column", justifyContent: "space-between",
                  transition: "all 0.2s ease"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.78rem", color: "#94A3B8", fontWeight: 600 }}>{item.label}</span>
                    <IconComp size={16} color={item.color} />
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: "8px" }}>
                    <span style={{ fontSize: "1.35rem", fontWeight: 800, color: "#FFFFFF" }}>{item.value}</span>
                    <span style={{ fontSize: "0.72rem", fontWeight: 700, color: item.up ? "#10B981" : "#EF4444" }}>
                      {item.trend}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Error Monitoring (24h) */}
        <div className="dev-card-static" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#FFFFFF" }}>Error Monitoring (24h)</h3>
            <button className="dev-btn-outline" style={{ padding: "4px 10px", fontSize: "0.75rem" }}>Lihat Semua</button>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", gap: "16px", flex: 1, padding: "8px 0" }}>
            {/* Animated Donut Chart */}
            <div style={{ position: "relative", width: "120px", height: "120px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="120" height="120" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="#22314A" strokeWidth="3.5"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="#10B981" strokeWidth="3.5" strokeDasharray="85, 100"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="#3B82F6" strokeWidth="3.5" strokeDasharray="60, 100" strokeDashoffset="-85"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="#F59E0B" strokeWidth="3.5" strokeDasharray="15, 100" strokeDashoffset="-145"
                />
              </svg>
              <div style={{ position: "absolute", textAlign: "center" }}>
                <span style={{ fontSize: "0.72rem", color: "#94A3B8", display: "block" }}>Total</span>
                <span style={{ fontSize: "1.4rem", fontWeight: 800, color: "#FFFFFF", lineHeight: "1" }}>14</span>
                <span style={{ fontSize: "0.68rem", color: "#64748B", display: "block" }}>Errors</span>
              </div>
            </div>

            {/* Legend */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.78rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "space-between" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#E2E8F0" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#EF4444" }} /> Critical
                </span>
                <span style={{ fontWeight: 700, color: "#FFFFFF", marginLeft: "12px" }}>0</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "space-between" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#E2E8F0" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#F59E0B" }} /> Warning
                </span>
                <span style={{ fontWeight: 700, color: "#FFFFFF", marginLeft: "12px" }}>2</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "space-between" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#E2E8F0" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#3B82F6" }} /> Info
                </span>
                <span style={{ fontWeight: 700, color: "#FFFFFF", marginLeft: "12px" }}>12</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "space-between" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#E2E8F0" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#10B981" }} /> Resolved
                </span>
                <span style={{ fontWeight: 700, color: "#10B981", marginLeft: "12px" }}>12</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#0F172A", padding: "10px 14px", borderRadius: "12px", border: "1px solid rgba(34, 49, 74, 0.5)", marginTop: "12px" }}>
            <div>
              <span style={{ fontSize: "0.72rem", color: "#64748B", display: "block" }}>Error rate</span>
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#F8FAFC" }}>0.04% <span style={{ fontSize: "0.72rem", color: "#64748B", fontWeight: 400 }}>vs yesterday</span></span>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "0.72rem", color: "#64748B", display: "block" }}>Trend</span>
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#10B981" }}>↓ 12% <span style={{ fontSize: "0.72rem", color: "#64748B", fontWeight: 400 }}>vs yesterday</span></span>
            </div>
          </div>
        </div>

      </section>

      {/* BOTTOM SECTION 2: LATEST AUDIT LOGS TABLE */}
      <section className="dev-card-static" style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "#FFFFFF" }}>Latest Audit Logs</h3>
            <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem", color: "#94A3B8" }}>System-wide user activity and authentication trail</p>
          </div>

          {/* Search and Filter */}
          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ position: "relative", width: "260px" }}>
              <Search size={16} color="#64748B" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
              <input 
                type="text" 
                placeholder="Search logs by user, IP, action..." 
                className="dev-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="dev-btn-outline" style={{ height: "40px" }}>
              <Filter size={15} /> Filter
            </button>
            <button className="dev-btn-outline" style={{ height: "40px" }}>
              Lihat Semua
            </button>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="dev-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>User</th>
                <th>Action</th>
                <th>Resource</th>
                <th>IP Address</th>
                <th>User Agent</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, idx) => (
                <tr key={idx}>
                  <td style={{ color: "#94A3B8", fontSize: "0.82rem", whiteSpace: "nowrap" }}>{log.time}</td>
                  <td style={{ fontWeight: 600, color: "#38BDF8", fontFamily: "monospace" }}>{log.user}</td>
                  <td>
                    <span style={{ 
                      backgroundColor: log.action === "Login" ? "rgba(16, 185, 129, 0.15)" : "rgba(59, 130, 246, 0.15)",
                      color: log.action === "Login" ? "#34D399" : "#60A5FA",
                      padding: "4px 10px", borderRadius: "6px", fontWeight: 600, fontSize: "0.78rem"
                    }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ color: "#E2E8F0", fontFamily: "monospace", fontSize: "0.82rem" }}>{log.resource}</td>
                  <td style={{ color: "#94A3B8", fontFamily: "monospace" }}>{log.ip}</td>
                  <td style={{ color: "#64748B", fontSize: "0.82rem" }}>{log.agent}</td>
                  <td>
                    <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#10B981", fontWeight: 600, fontSize: "0.82rem" }}>
                      <CheckCircle2 size={15} /> {log.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "32px", color: "#64748B" }}>
                    No audit logs matching "{searchTerm}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* BOTTOM SECTION 3: SUBSCRIPTION & USER ADMINISTRATION */}
      <section className="dev-card-static">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "#FFFFFF", display: "flex", alignItems: "center", gap: "10px" }}>
              <ShieldCheck size={22} color="#10B981" />
              Platform User & Subscription Administration
            </h3>
            <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem", color: "#94A3B8" }}>
              Manage active licenses, user elevations, and account statuses without leaving the operations console.
            </p>
          </div>
        </div>

        <div style={{ backgroundColor: "#0F172A", padding: "20px", borderRadius: "16px", border: "1px solid rgba(34, 49, 74, 0.5)" }}>
          <DeveloperSubscriptionsClient />
        </div>
      </section>

    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router";
import { Logo } from "../components/Logo";
import { Button } from "../components/Button";
import { RiskBadge } from "../components/RiskBadge";
import {
  Search,
  Bell,
  LayoutDashboard,
  Activity,
  FileText,
  LogOut,
  Users,
  Target,
  TrendingUp,
  Eye,
  Info
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const simulatedActivityData = [
  { day: "Mon", predictions: 45 },
  { day: "Tue", predictions: 52 },
  { day: "Wed", predictions: 48 },
  { day: "Thu", predictions: 61 },
  { day: "Fri", predictions: 55 },
  { day: "Sat", predictions: 38 },
  { day: "Sun", predictions: 42 },
];

const simulatedConfidenceData = [
  { range: "90-100%", count: 842 },
  { range: "80-89%", count: 324 },
  { range: "70-79%", count: 156 },
  { range: "60-69%", count: 78 },
];

const simulatedRecentPredictions = [
  { patient: "DEMO-2847", type: "Breast Cancer (IDC)", risk: "high", confidence: 94.2, time: "2 min ago" },
  { patient: "DEMO-2846", type: "Diabetes (Clinical)", risk: "low", confidence: 88.5, time: "8 min ago" },
  { patient: "DEMO-2845", type: "Breast Cancer (IDC)", risk: "low", confidence: 91.3, time: "15 min ago" },
  { patient: "DEMO-2844", type: "Diabetes (Clinical)", risk: "high", confidence: 86.4, time: "23 min ago" },
];

export function Dashboard() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("overview");

  const NavItem = ({ icon: Icon, label, id }: { icon: any; label: string; id: string }) => (
    <button
      onClick={() => {
        setActiveNav(id);
        if (id === "predict") navigate("/predict");
        if (id === "results") navigate("/results");
      }}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors relative ${
        activeNav === id
          ? "bg-[#F0E8DE] text-[#2C1A0E]"
          : "text-[#C9A882] hover:bg-[#3D2917] hover:text-[#FDF6F0]"
      }`}
    >
      {activeNav === id && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#E8845A] rounded-r"></div>
      )}
      <Icon className="w-5 h-5" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-[#FDF6F0]">
      {/* Sidebar - Deep Bark */}
      <aside className="w-[220px] bg-[#2C1A0E] flex flex-col">
        <div className="p-6">
          <Logo variant="dark" className="scale-90" />
        </div>

        <div className="px-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C9A882]" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 bg-[#3D2917] border border-[#6B4F3A] rounded-lg text-sm text-[#FDF6F0] placeholder:text-[#C9A882] focus:outline-none focus:ring-2 focus:ring-[#E8845A]"
            />
          </div>
        </div>

        <nav className="px-4 space-y-1 flex-1">
          <NavItem icon={LayoutDashboard} label="Overview" id="overview" />
          <NavItem icon={Activity} label="Predict Disease" id="predict" />
          <NavItem icon={FileText} label="Results & Analytics" id="results" />
        </nav>

        <div className="p-4 border-t border-[#6B4F3A]">
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-[#C9A882] hover:bg-[#3D2917] hover:text-[#C0392B] rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-[#E2D5C8] px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-[#F0E8DE] text-[#6B4F3A] rounded text-xs font-semibold">
                Clinician Portal
              </span>
              <span className="text-xs text-[#6B4F3A]">
                AI Diagnostics &amp; Risk Stratification Overview
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-[#6B4F3A] hover:text-[#2C1A0E] hover:bg-[#F0E8DE] rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#C0392B] rounded-full"></span>
              </button>

              <div className="flex items-center gap-3 pl-4 border-l border-[#E2D5C8]">
                <div className="text-right">
                  <p className="text-sm font-medium text-[#2C1A0E]">Dr. Shreya J.</p>
                  <p className="text-xs text-[#6B4F3A]">Chief Oncologist</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C0392B] to-[#E8845A] flex items-center justify-center text-white font-semibold">
                  SJ
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Prototype Demo Banner */}
            <div className="bg-[#FFF4ED] border border-[#E07B54]/40 rounded-xl p-4 flex items-start gap-3">
              <Info className="w-5 h-5 text-[#E07B54] flex-shrink-0 mt-0.5" />
              <div className="text-xs text-[#6B4F3A] leading-relaxed">
                <span className="font-semibold text-[#2C1A0E]">Demonstration &amp; Prototype Notice: </span>
                Aggregated activity trends, volume metrics, and recent activity logs displayed below are simulated cohort data for UI evaluation. Real predictions are triggered via the{" "}
                <button
                  onClick={() => navigate("/predict")}
                  className="font-medium text-[#C0392B] hover:underline"
                >
                  Predict Disease
                </button>{" "}
                tab.
              </div>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-[#2C1A0E]">Dashboard Overview</h2>
                <p className="text-xs text-[#6B4F3A] mt-1">
                  Monitoring simulated clinical inference throughput and diagnostic distribution.
                </p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-[#5B8C5A]/10 border border-[#5B8C5A]/30 rounded-full">
                <div className="w-2 h-2 rounded-full bg-[#5B8C5A]"></div>
                <span className="text-xs font-medium text-[#5B8C5A]">Backend Online (Flask API)</span>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-6">
              <div className="bg-[#F0E8DE] rounded-xl p-6 border border-[#E2D5C8] shadow-[0_1px_3px_rgba(44,26,14,0.07)]">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-[#6B4F3A] text-xs uppercase tracking-wide">Simulated Scans (Demo)</p>
                  <div className="text-[#E8845A]"><Users className="w-5 h-5" /></div>
                </div>
                <p className="text-3xl font-bold text-[#2C1A0E]">1,248</p>
              </div>

              <div className="bg-[#F0E8DE] rounded-xl p-6 border border-[#E2D5C8] shadow-[0_1px_3px_rgba(44,26,14,0.07)]">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-[#6B4F3A] text-xs uppercase tracking-wide">High Risk Flags (Demo)</p>
                  <div className="text-[#E8845A]"><Target className="w-5 h-5" /></div>
                </div>
                <p className="text-3xl font-bold text-[#2C1A0E]">84</p>
              </div>

              <div className="bg-[#F0E8DE] rounded-xl p-6 border border-[#E2D5C8] shadow-[0_1px_3px_rgba(44,26,14,0.07)]">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-[#6B4F3A] text-xs uppercase tracking-wide">Simulated Avg. Confidence</p>
                  <div className="text-[#E8845A]"><TrendingUp className="w-5 h-5" /></div>
                </div>
                <p className="text-3xl font-bold text-[#2C1A0E]">94.2%</p>
              </div>

              <div className="bg-[#F0E8DE] rounded-xl p-6 border border-[#E2D5C8] shadow-[0_1px_3px_rgba(44,26,14,0.07)]">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-[#6B4F3A] text-xs uppercase tracking-wide">Simulated Monitoring</p>
                  <div className="text-[#E8845A]"><Eye className="w-5 h-5" /></div>
                </div>
                <p className="text-3xl font-bold text-[#2C1A0E]">342</p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 border border-[#E2D5C8] shadow-[0_1px_3px_rgba(44,26,14,0.07)]">
                <h3 className="font-semibold text-[#2C1A0E] mb-1">Simulated Inference Activity Trends</h3>
                <p className="text-xs text-[#6B4F3A] mb-4">Daily scan throughput volume (sample prototype metrics)</p>
                <ResponsiveContainer width="100%" height={230}>
                  <AreaChart data={simulatedActivityData}>
                    <defs>
                      <linearGradient id="colorPredictions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#E8845A" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#E8845A" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2D5C8" />
                    <XAxis dataKey="day" stroke="#6B4F3A" fontSize={12} />
                    <YAxis stroke="#6B4F3A" fontSize={12} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="predictions"
                      stroke="#D4A96A"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorPredictions)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl p-6 border border-[#E2D5C8] shadow-[0_1px_3px_rgba(44,26,14,0.07)]">
                <h3 className="font-semibold text-[#2C1A0E] mb-1">AI Confidence Distribution</h3>
                <p className="text-xs text-[#6B4F3A] mb-4">Classification score distribution across simulated cohorts</p>
                <ResponsiveContainer width="100%" height={230}>
                  <BarChart data={simulatedConfidenceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2D5C8" />
                    <XAxis dataKey="range" stroke="#6B4F3A" fontSize={12} />
                    <YAxis stroke="#6B4F3A" fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#4A7B8C" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Predictions Table */}
            <div className="bg-white rounded-xl border border-[#E2D5C8] shadow-[0_1px_3px_rgba(44,26,14,0.07)] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E2D5C8] flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-[#2C1A0E]">Simulated Activity Log</h3>
                  <p className="text-xs text-[#6B4F3A]">Sample records illustrating clinical tracking interfaces</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate("/predict")}>
                  Run Real Prediction →
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#FDF6F0]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#6B4F3A] uppercase tracking-wider">
                        Record ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#6B4F3A] uppercase tracking-wider">
                        Modality / Disease
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#6B4F3A] uppercase tracking-wider">
                        Risk Tier
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#6B4F3A] uppercase tracking-wider">
                        AI Confidence
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#6B4F3A] uppercase tracking-wider">
                        Timestamp
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-[#E2D5C8]">
                    {simulatedRecentPredictions.map((pred, idx) => (
                      <tr key={idx} className="hover:bg-[#FDF6F0] transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-[#2C1A0E]">{pred.patient}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-[#6B4F3A]">{pred.type}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <RiskBadge level={pred.risk as "high" | "medium" | "low"} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-[#2C1A0E]">{pred.confidence}%</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-[#6B4F3A]">{pred.time}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

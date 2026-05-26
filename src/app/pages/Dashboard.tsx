import { useState } from "react";
import { useNavigate } from "react-router";
import { Logo } from "../components/Logo";
import { KPICard } from "../components/KPICard";
import { RiskBadge } from "../components/RiskBadge";
import { Search, Bell, LayoutDashboard, Activity, FileText, User, LogOut, Users, Target, TrendingUp, Eye } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const activityData = [
  { day: "Mon", predictions: 45 },
  { day: "Tue", predictions: 52 },
  { day: "Wed", predictions: 48 },
  { day: "Thu", predictions: 61 },
  { day: "Fri", predictions: 55 },
  { day: "Sat", predictions: 38 },
  { day: "Sun", predictions: 42 },
];

const confidenceData = [
  { range: "90-100%", count: 842 },
  { range: "80-89%", count: 324 },
  { range: "70-79%", count: 156 },
  { range: "60-69%", count: 78 },
];

const recentPredictions = [
  { patient: "P-2847", type: "Heart Disease", risk: "high", confidence: 96.4, time: "2 min ago" },
  { patient: "P-2846", type: "Diabetes", risk: "low", confidence: 92.1, time: "8 min ago" },
  { patient: "P-2845", type: "Breast Cancer", risk: "medium", confidence: 88.7, time: "15 min ago" },
  { patient: "P-2844", type: "Heart Disease", risk: "low", confidence: 94.2, time: "23 min ago" },
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
          <div className="flex items-center justify-end">
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
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-[#2C1A0E]">Dashboard Overview</h2>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-[#5B8C5A]/10 border border-[#5B8C5A]/30 rounded-full">
                <div className="w-2 h-2 rounded-full bg-[#5B8C5A]"></div>
                <span className="text-sm font-medium text-[#5B8C5A]">System Optimal</span>
              </div>
            </div>

            {/* KPI Cards - Linen background */}
            <div className="grid grid-cols-4 gap-6">
              <div className="bg-[#F0E8DE] rounded-xl p-6 border border-[#E2D5C8] shadow-[0_1px_3px_rgba(44,26,14,0.07)]">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-[#6B4F3A] text-sm">Total Patients Scanned</p>
                  <div className="text-[#E8845A]"><Users className="w-5 h-5" /></div>
                </div>
                <p className="text-3xl font-bold text-[#2C1A0E]">1,248</p>
              </div>

              <div className="bg-[#F0E8DE] rounded-xl p-6 border border-[#E2D5C8] shadow-[0_1px_3px_rgba(44,26,14,0.07)]">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-[#6B4F3A] text-sm">High Risk Predictions</p>
                  <div className="text-[#E8845A]"><Target className="w-5 h-5" /></div>
                </div>
                <p className="text-3xl font-bold text-[#2C1A0E]">84</p>
              </div>

              <div className="bg-[#F0E8DE] rounded-xl p-6 border border-[#E2D5C8] shadow-[0_1px_3px_rgba(44,26,14,0.07)]">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-[#6B4F3A] text-sm">Avg. AI Confidence</p>
                  <div className="text-[#E8845A]"><TrendingUp className="w-5 h-5" /></div>
                </div>
                <p className="text-3xl font-bold text-[#2C1A0E]">94.2%</p>
              </div>

              <div className="bg-[#F0E8DE] rounded-xl p-6 border border-[#E2D5C8] shadow-[0_1px_3px_rgba(44,26,14,0.07)]">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-[#6B4F3A] text-sm">Active Monitoring</p>
                  <div className="text-[#E8845A]"><Eye className="w-5 h-5" /></div>
                </div>
                <p className="text-3xl font-bold text-[#2C1A0E]">342</p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 border border-[#E2D5C8] shadow-[0_1px_3px_rgba(44,26,14,0.07)]">
                <h3 className="font-semibold text-[#2C1A0E] mb-4">Prediction Activity Trends</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={activityData}>
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
                <h3 className="font-semibold text-[#2C1A0E] mb-4">AI Confidence Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={confidenceData}>
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
              <div className="px-6 py-4 border-b border-[#E2D5C8]">
                <h3 className="font-semibold text-[#2C1A0E]">Recent Predictions</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#FDF6F0]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#6B4F3A] uppercase tracking-wider">
                        Patient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#6B4F3A] uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#6B4F3A] uppercase tracking-wider">
                        Risk Level
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#6B4F3A] uppercase tracking-wider">
                        AI Confidence
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#6B4F3A] uppercase tracking-wider">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-[#E2D5C8]">
                    {recentPredictions.map((pred, idx) => (
                      <tr key={idx} className="hover:bg-[#FDF6F0] transition-colors cursor-pointer">
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

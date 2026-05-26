import React from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Logo } from "../components/Logo";
import { Button } from "../components/Button";
import {
  Bell,
  LayoutDashboard,
  Activity,
  FileText,
  LogOut,
  Share2,
  Download,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Heart,
  TrendingUp,
  Sparkles,
  Brain,
  ShieldAlert,
  Stethoscope,
  CalendarClock,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";

const bloodPressureData = [
  { month: "Jan", value: 118 },
  { month: "Feb", value: 125 },
  { month: "Mar", value: 132 },
  { month: "Apr", value: 140 },
  { month: "May", value: 152 },
  { month: "Jun", value: 160 },
];

const riskyIndicators = [
  { name: "Blood Pressure", value: "160/95", subtitle: "Elevated significantly", icon: AlertTriangle, level: 88 },
  { name: "Cholesterol", value: "240 mg/dL", subtitle: "High LDL levels detected", icon: ShieldAlert, level: 75 },
  { name: "Age Factor", value: "62 yrs", subtitle: "Higher bracket risk", icon: CalendarClock, level: 60 },
];

const healthyIndicators = [
  { name: "Glucose", value: "95 mg/dL", subtitle: "Within normal range", icon: CheckCircle2, level: 92 },
  { name: "BMI", value: "24.5", subtitle: "Healthy weight range", icon: CheckCircle2, level: 88 },
  { name: "Heart Rate", value: "72 bpm", subtitle: "Stable resting rate", icon: Heart, level: 95 },
];

const recommendations = [
  {
    title: "Immediate Action",
    description: "Schedule an urgent cardiology consultation to review elevated blood pressure and prescribe necessary antihypertensive medication.",
    bgColor: "bg-[#FFF4ED]",
    borderColor: "border-[#E07B54]",
    accent: "#C0392B",
    icon: Stethoscope,
  },
  {
    title: "Lifestyle Modification",
    description: "Implement a low-sodium diet and initiate a guided, moderate cardiovascular exercise program (150 min/week).",
    bgColor: "bg-[#EFF6FF]",
    borderColor: "border-[#4A7B8C]",
    accent: "#4A7B8C",
    icon: TrendingUp,
  },
  {
    title: "Follow-up Monitoring",
    description: "Assign a continuous blood pressure monitor for 48 hours and re-evaluate lipid panel in 4 weeks.",
    bgColor: "bg-[#F0FDF4]",
    borderColor: "border-[#5B8C5A]",
    accent: "#5B8C5A",
    icon: CalendarClock,
  },
];

const radialData = [{ name: "risk", value: 80, fill: "#C0392B" }];

export function PredictionResults() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = React.useState("results");
  const [probability, setProbability] = React.useState(0);
  const [confidence, setConfidence] = React.useState(0);

  React.useEffect(() => {
    const t1 = setTimeout(() => setProbability(80), 200);
    const t2 = setTimeout(() => setConfidence(96.4), 600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const NavItem = ({ icon: Icon, label, id }: { icon: any; label: string; id: string }) => (
    <button
      onClick={() => {
        setActiveNav(id);
        if (id === "overview") navigate("/dashboard");
        if (id === "predict") navigate("/predict");
      }}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors relative ${
        activeNav === id
          ? "bg-[#F0E8DE] text-[#2C1A0E]"
          : "text-[#C9A882] hover:bg-[#3D2917] hover:text-[#FDF6F0]"
      }`}
    >
      {activeNav === id && (
        <motion.div
          layoutId="active-nav-pill"
          className="absolute left-0 top-0 bottom-0 w-1 bg-[#E8845A] rounded-r"
        />
      )}
      <Icon className="w-5 h-5" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-[#FDF6F0] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[220px] bg-[#2C1A0E] flex flex-col">
        <div className="p-6">
          <Logo variant="dark" className="scale-90" />
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

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-[#E2D5C8] px-8 py-4">
          <div className="flex items-center justify-end gap-4">
            <button className="relative p-2 text-[#6B4F3A] hover:text-[#2C1A0E] hover:bg-[#F0E8DE] rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <motion.span
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#C0392B] rounded-full"
              />
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
        </header>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-start justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-3xl font-bold text-[#2C1A0E]">Prediction Results</h2>
                  <motion.span
                    animate={{ boxShadow: ["0 0 0 0 rgba(192,57,43,0.45)", "0 0 0 8px rgba(192,57,43,0)"] }}
                    transition={{ duration: 1.6, repeat: Infinity }}
                    className="px-3 py-1 bg-[#C0392B]/10 text-[#C0392B] border border-[#C0392B]/30 rounded text-xs font-semibold"
                  >
                    High Risk Alert
                  </motion.span>
                </div>
                <p className="text-sm text-[#6B4F3A]">
                  Patient: John Doe • ID: PR-1042 • Scanned: Today, 10:45 AM
                </p>
              </div>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-4 py-2 border border-[#E2D5C8] rounded-lg text-sm font-medium text-[#2C1A0E] hover:bg-[#F0E8DE] transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </motion.button>
                <Button variant="red" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download Report
                </Button>
              </div>
            </motion.div>

            {/* Hero Risk Card */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative overflow-hidden bg-white rounded-2xl border border-[#E2D5C8] shadow-[0_1px_3px_rgba(44,26,14,0.07)]"
            >
              <motion.div
                animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-24 -right-16 w-72 h-72 bg-[#E8845A]/15 rounded-full blur-3xl"
              />
              <motion.div
                animate={{ x: [0, -30, 0], y: [0, -10, 0] }}
                transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-24 -left-10 w-72 h-72 bg-[#D4A96A]/20 rounded-full blur-3xl"
              />

              <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-6 p-8">
                <div className="flex flex-col items-center justify-center">
                  <div className="relative w-48 h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart
                        innerRadius="78%"
                        outerRadius="100%"
                        data={radialData}
                        startAngle={90}
                        endAngle={-270}
                      >
                        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                        <RadialBar background={{ fill: "#F0E8DE" }} dataKey="value" cornerRadius={20} />
                      </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <motion.span
                        key={probability}
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, type: "spring" }}
                        className="text-5xl font-bold text-[#2C1A0E]"
                      >
                        {probability}
                        <span className="text-2xl">%</span>
                      </motion.span>
                      <span className="text-xs text-[#6B4F3A] uppercase tracking-wider mt-1">Risk Probability</span>
                    </div>
                  </div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C0392B]/10 border border-[#C0392B]/20"
                  >
                    <Heart className="w-3.5 h-3.5 text-[#C0392B]" />
                    <span className="text-xs font-semibold text-[#C0392B]">Heart Disease</span>
                  </motion.div>
                </div>

                <div className="lg:col-span-2 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="w-5 h-5 text-[#4A7B8C]" />
                    <span className="text-sm font-semibold text-[#4A7B8C] uppercase tracking-wide">
                      AI Diagnosis Summary
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-[#2C1A0E] mb-3">
                    Significant cardiovascular risk detected
                  </h3>
                  <p className="text-sm text-[#6B4F3A] leading-relaxed mb-6">
                    Based on 14 clinical metrics including blood pressure trends, cholesterol levels, and patient
                    demographics, the model indicates a strong probability of developing cardiovascular complications
                    within the next 5 years without intervention.
                  </p>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Model Confidence", value: `${confidence.toFixed(1)}%`, color: "#4A7B8C" },
                      { label: "Risk Tier", value: "High", color: "#C0392B" },
                      { label: "Indicators", value: "6", color: "#D4A96A" },
                    ].map((stat, i) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                        className="rounded-xl p-3 bg-[#FDF6F0] border border-[#E2D5C8]"
                      >
                        <p className="text-xs text-[#6B4F3A] uppercase tracking-wide mb-1">{stat.label}</p>
                        <p className="text-xl font-bold" style={{ color: stat.color }}>
                          {stat.value}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Timeline + Health Score */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-2 bg-white rounded-2xl p-6 border border-[#E2D5C8] shadow-[0_1px_3px_rgba(44,26,14,0.07)]"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-[#4A7B8C]" />
                    <h3 className="font-semibold text-[#2C1A0E]">Blood Pressure Trend (6 mo)</h3>
                  </div>
                  <span className="text-xs text-[#6B4F3A]">Target ≤ 120 mmHg</span>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={bloodPressureData}>
                    <defs>
                      <linearGradient id="bpGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#C0392B" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#C0392B" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2D5C8" vertical={false} />
                    <XAxis dataKey="month" stroke="#6B4F3A" fontSize={12} axisLine={false} tickLine={false} />
                    <YAxis stroke="#6B4F3A" fontSize={12} axisLine={false} tickLine={false} domain={[100, 170]} />
                    <Tooltip
                      contentStyle={{
                        background: "#FDF6F0",
                        border: "1px solid #E2D5C8",
                        borderRadius: 12,
                        color: "#2C1A0E",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#C0392B"
                      strokeWidth={2.5}
                      fill="url(#bpGradient)"
                      animationDuration={1200}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl p-6 border border-[#E2D5C8] shadow-[0_1px_3px_rgba(44,26,14,0.07)] flex flex-col gap-4"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#D4A96A]" />
                  <h3 className="font-semibold text-[#2C1A0E]">Health Score</h3>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center">
                  <motion.div
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", delay: 0.5 }}
                    className="relative"
                  >
                    <div className="text-6xl font-bold text-[#2C1A0E]">42</div>
                    <span className="absolute -right-6 top-2 text-sm text-[#6B4F3A]">/100</span>
                  </motion.div>
                  <p className="text-sm text-[#C0392B] font-medium mt-2">Needs Attention</p>
                </div>

                <div className="space-y-2">
                  {[
                    { label: "Cardiovascular", value: 35, color: "#C0392B" },
                    { label: "Metabolic", value: 72, color: "#5B8C5A" },
                    { label: "Lifestyle", value: 58, color: "#D4A96A" },
                  ].map((bar, i) => (
                    <div key={bar.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[#6B4F3A]">{bar.label}</span>
                        <span className="text-[#2C1A0E] font-semibold">{bar.value}</span>
                      </div>
                      <div className="h-1.5 bg-[#F0E8DE] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${bar.value}%` }}
                          transition={{ duration: 1, delay: 0.6 + i * 0.15, ease: "easeOut" }}
                          className="h-full rounded-full"
                          style={{ background: bar.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Indicators */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[
                { title: "Risky Indicators", items: riskyIndicators, accent: "#C0392B", soft: "#E07B54" },
                { title: "Healthy Indicators", items: healthyIndicators, accent: "#5B8C5A", soft: "#5B8C5A" },
              ].map((section, sIdx) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + sIdx * 0.1 }}
                  className="bg-white rounded-2xl p-6 border border-[#E2D5C8] shadow-[0_1px_3px_rgba(44,26,14,0.07)]"
                >
                  <h4 className="font-semibold text-[#2C1A0E] mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: section.accent }} />
                    {section.title}
                  </h4>
                  <div className="space-y-4">
                    <AnimatePresence>
                      {section.items.map((indicator, idx) => {
                        const Icon = indicator.icon;
                        return (
                          <motion.div
                            key={indicator.name}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + sIdx * 0.1 + idx * 0.08 }}
                            whileHover={{ x: 4 }}
                            className="flex items-start gap-3"
                          >
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                              style={{ background: `${section.soft}1A` }}
                            >
                              <Icon className="w-4 h-4" style={{ color: section.soft }} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-baseline justify-between mb-1">
                                <span className="text-sm font-semibold text-[#2C1A0E]">{indicator.name}</span>
                                <span className="text-sm font-bold" style={{ color: section.accent }}>
                                  {indicator.value}
                                </span>
                              </div>
                              <p className="text-xs text-[#6B4F3A] mb-1.5">{indicator.subtitle}</p>
                              <div className="h-1 bg-[#F0E8DE] rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${indicator.level}%` }}
                                  transition={{ duration: 0.9, delay: 0.6 + sIdx * 0.1 + idx * 0.08 }}
                                  className="h-full rounded-full"
                                  style={{ background: section.accent }}
                                />
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Recommendations */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl p-6 border border-[#E2D5C8] shadow-[0_1px_3px_rgba(44,26,14,0.07)]"
            >
              <div className="flex items-center gap-2 mb-6">
                <Brain className="w-5 h-5 text-[#4A7B8C]" />
                <h3 className="text-xl font-bold text-[#2C1A0E]">AI Personalized Recommendations</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recommendations.map((rec, idx) => {
                  const Icon = rec.icon;
                  return (
                    <motion.div
                      key={rec.title}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + idx * 0.12 }}
                      whileHover={{ y: -4, boxShadow: "0 12px 24px rgba(44,26,14,0.08)" }}
                      className={`${rec.bgColor} rounded-xl p-5 border ${rec.borderColor} cursor-pointer`}
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                        style={{ background: `${rec.accent}1A` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: rec.accent }} />
                      </div>
                      <h4 className="font-bold text-[#2C1A0E] mb-2">{rec.title}</h4>
                      <p className="text-sm text-[#6B4F3A] mb-4 leading-relaxed">{rec.description}</p>
                      <motion.button
                        whileHover={{ x: 4 }}
                        className="flex items-center gap-2 text-sm font-semibold hover:underline"
                        style={{ color: rec.accent }}
                      >
                        Add to treatment plan
                        <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}

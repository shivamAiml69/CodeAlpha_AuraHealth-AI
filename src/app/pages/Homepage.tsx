import { useNavigate } from "react-router";
import { Logo } from "../components/Logo";
import { Button } from "../components/Button";
import { Activity, Zap, Shield, Check, Info } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const benchmarkData = [
  { model: "Diabetes (RF)", benchmark: 76, metric: "Test Accuracy (~76%)" },
  { model: "Breast Cancer (CNN)", benchmark: 85, metric: "IDC Patch Detection" },
];

export function Homepage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FDF6F0]">
      {/* Navbar */}
      <nav className="bg-[#FDF6F0] border-b border-[#E2D5C8] px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-8">
            <a href="#features" className="text-[#2C1A0E] hover:text-[#C0392B] transition-colors">Features</a>
            <a href="#architecture" className="text-[#2C1A0E] hover:text-[#C0392B] transition-colors">Architecture</a>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/signin")}>Sign In</Button>
            <Button variant="bark" onClick={() => navigate("/signin")}>
              Try Demo Engine →
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-8 py-20">
        <div className="grid grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#F0E8DE] rounded-full mb-6">
              <span className="text-[#E8845A]">✦</span>
              <span className="text-sm font-medium text-[#E8845A]">AuraHealth AI · Educational Prototype</span>
            </div>
            <h1 className="text-[60px] font-extrabold leading-tight mb-6">
              <span className="text-[#2C1A0E]">Predict health risks</span>
              <br />
              <span className="bg-gradient-to-r from-[#2C1A0E] to-[#C0392B] bg-clip-text text-transparent">
                with genuine machine learning.
              </span>
            </h1>
            <p className="text-lg text-[#6B4F3A] mb-8 leading-relaxed">
              Explore multimodal clinical AI pipelines: Type 2 Diabetes risk assessment from clinical measurements and Breast Cancer detection from histopathological microscopy patches using a deep Convolutional Neural Network (CNN).
            </p>
            <div className="flex gap-4">
              <Button variant="red" size="lg" onClick={() => navigate("/signin")}>
                Try Prediction Engine →
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate("/dashboard")}>
                Explore Dashboard
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_rgba(44,26,14,0.07)] border border-[#E2D5C8]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-[#2C1A0E]">Model Benchmark Profiles</h3>
                  <p className="text-xs text-[#6B4F3A]">Held-out test set performance</p>
                </div>
                <span className="text-xs text-[#4A7B8C] bg-[#4A7B8C]/10 px-3 py-1 rounded-full border border-[#4A7B8C]/30 font-medium">
                  Verified Pipelines
                </span>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={benchmarkData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2D5C8" />
                  <XAxis dataKey="model" stroke="#6B4F3A" fontSize={12} />
                  <YAxis stroke="#6B4F3A" fontSize={12} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      background: "#FDF6F0",
                      border: "1px solid #E2D5C8",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="benchmark" fill="#E8845A" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 pt-4 border-t border-[#E2D5C8] flex items-center justify-between text-xs text-[#6B4F3A]">
                <span>• Diabetes: Clinical Measurements</span>
                <span>• Breast Cancer: Tissue Patch CNN</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-8 py-16">
        <div className="grid grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-8 border border-[#E2D5C8] shadow-[0_1px_3px_rgba(44,26,14,0.07)]">
            <div className="w-12 h-12 rounded-xl bg-[#E8845A]/20 flex items-center justify-center mb-4">
              <Activity className="w-6 h-6 text-[#E8845A]" />
            </div>
            <h3 className="text-xl font-semibold text-[#2C1A0E] mb-3">Genuine Convolutional Neural Network</h3>
            <p className="text-[#6B4F3A] text-sm leading-relaxed">
              Trained on patient-stratified breast histopathology patches to detect Invasive Ductal Carcinoma with rigorous leak-free splits.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 border border-[#E2D5C8] shadow-[0_1px_3px_rgba(44,26,14,0.07)]">
            <div className="w-12 h-12 rounded-xl bg-[#D4A96A]/20 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-[#D4A96A]" />
            </div>
            <h3 className="text-xl font-semibold text-[#2C1A0E] mb-3">Real-time In-Memory Inference</h3>
            <p className="text-[#6B4F3A] text-sm leading-relaxed">
              Fast, deterministic evaluation with confidence scoring, model metadata verification, and server-side image integrity checks.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 border border-[#E2D5C8] shadow-[0_1px_3px_rgba(44,26,14,0.07)]">
            <div className="w-12 h-12 rounded-xl bg-[#5B8C5A]/20 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-[#5B8C5A]" />
            </div>
            <h3 className="text-xl font-semibold text-[#2C1A0E] mb-3">Privacy-Conscious Architecture</h3>
            <p className="text-[#6B4F3A] text-sm leading-relaxed">
              Uploaded tissue scans are processed strictly in RAM and never written to permanent disk storage, preserving privacy.
            </p>
          </div>
        </div>
      </section>

      {/* Dark Section */}
      <section id="architecture" className="bg-[#2C1A0E] py-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">
                Transparent &amp; Honest Healthcare AI.
              </h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-[#FDF6F0]">
                  <div className="w-6 h-6 rounded-full bg-[#D4A96A]/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <Check className="w-4 h-4 text-[#D4A96A]" />
                  </div>
                  <span>Separate pipelines for clinical tabular risk and histopathology microscopy imaging</span>
                </li>
                <li className="flex items-start gap-3 text-[#FDF6F0]">
                  <div className="w-6 h-6 rounded-full bg-[#D4A96A]/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <Check className="w-4 h-4 text-[#D4A96A]" />
                  </div>
                  <span>Patient-level stratified train/val/test splits to eliminate data leakage</span>
                </li>
                <li className="flex items-start gap-3 text-[#FDF6F0]">
                  <div className="w-6 h-6 rounded-full bg-[#D4A96A]/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <Check className="w-4 h-4 text-[#D4A96A]" />
                  </div>
                  <span>Honest evaluation reporting: test set benchmarks clearly separated from individual prediction scores</span>
                </li>
              </ul>
            </div>

            <div className="bg-[#3D2917] backdrop-blur rounded-2xl p-6 border border-[#6B4F3A]">
              <h3 className="text-white font-semibold mb-6">Pipeline Status</h3>
              <div className="space-y-4">
                {[
                  { disease: "Diabetes (Clinical Measurements)", model: "Random Forest", note: "Tabular laboratory metrics" },
                  { disease: "Breast Cancer (Histopathology)", model: "PyTorch CNN", note: "Invasive Ductal Carcinoma patches" },
                ].map((item) => (
                  <div key={item.disease} className="p-3 bg-[#2C1A0E]/60 rounded-xl border border-[#6B4F3A]/40">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-white font-medium text-sm">{item.disease}</span>
                      <span className="text-xs text-[#E8845A] font-semibold">{item.model}</span>
                    </div>
                    <p className="text-xs text-[#C9A882]">{item.note}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-[#6B4F3A]/50 flex items-start gap-2 text-xs text-[#C9A882]">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#E8845A]" />
                <span>Notice: Educational and investigational prototype. AI predictions do not replace professional clinical pathology reviews.</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

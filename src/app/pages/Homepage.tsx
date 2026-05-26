import { useNavigate } from "react-router";
import { Logo } from "../components/Logo";
import { Button } from "../components/Button";
import { Activity, Zap, Shield, Check } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const accuracyData = [
  { model: "Diabetes", accuracy: 98 },
  { model: "Heart", accuracy: 92 },
  { model: "Breast Cancer", accuracy: 95 },
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
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/signin")}>Sign In</Button>
            <Button variant="bark" onClick={() => navigate("/signin")}>
              Get Started →
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
              <span className="text-sm font-medium text-[#E8845A]">AuraHealth AI 2.0 is live</span>
            </div>
            <h1 className="text-[64px] font-extrabold leading-tight mb-6">
              <span className="text-[#2C1A0E]">Predict health risks</span>
              <br />
              <span className="bg-gradient-to-r from-[#2C1A0E] to-[#C0392B] bg-clip-text text-transparent">
                with clinical precision.
              </span>
            </h1>
            <p className="text-lg text-[#6B4F3A] mb-8">
              Advanced AI models for early detection of Diabetes, Heart Disease, and Breast Cancer.
              Powered by deep learning and validated by clinical data.
            </p>
            <div className="flex gap-4">
              <Button variant="red" size="lg" onClick={() => navigate("/signin")}>
                Try Prediction Engine →
              </Button>
              <Button variant="outline" size="lg">
                Explore Features
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_rgba(44,26,14,0.07)] border border-[#E2D5C8]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[#2C1A0E]">Model Accuracy</h3>
                <span className="text-sm text-[#5B8C5A] bg-[#5B8C5A]/10 px-3 py-1 rounded-full border border-[#5B8C5A]/30">
                  98.4%
                </span>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={accuracyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2D5C8" />
                  <XAxis dataKey="model" stroke="#6B4F3A" fontSize={12} />
                  <YAxis stroke="#6B4F3A" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="accuracy" fill="#E8845A" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 pt-4 border-t border-[#E2D5C8]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#5B8C5A]"></div>
                  <span className="text-sm text-[#6B4F3A]">Low Risk Prediction</span>
                </div>
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
            <h3 className="text-xl font-semibold text-[#2C1A0E] mb-3">Advanced Neural Networks</h3>
            <p className="text-[#6B4F3A]">
              Deep learning models trained on millions of clinical records for superior accuracy.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 border border-[#E2D5C8] shadow-[0_1px_3px_rgba(44,26,14,0.07)]">
            <div className="w-12 h-12 rounded-xl bg-[#D4A96A]/20 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-[#D4A96A]" />
            </div>
            <h3 className="text-xl font-semibold text-[#2C1A0E] mb-3">Real-time Processing</h3>
            <p className="text-[#6B4F3A]">
              Get instant predictions with confidence scores in milliseconds.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 border border-[#E2D5C8] shadow-[0_1px_3px_rgba(44,26,14,0.07)]">
            <div className="w-12 h-12 rounded-xl bg-[#5B8C5A]/20 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-[#5B8C5A]" />
            </div>
            <h3 className="text-xl font-semibold text-[#2C1A0E] mb-3">HIPAA Compliant</h3>
            <p className="text-[#6B4F3A]">
              Enterprise-grade security with full HIPAA compliance and encryption.
            </p>
          </div>
        </div>
      </section>

      {/* Dark Section */}
      <section className="bg-[#2C1A0E] py-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">
                Deep insights into patient populations.
              </h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-[#FDF6F0]">
                  <div className="w-6 h-6 rounded-full bg-[#D4A96A]/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <Check className="w-4 h-4 text-[#D4A96A]" />
                  </div>
                  <span>Multi-disease risk assessment across diabetes, cardiovascular, and oncology</span>
                </li>
                <li className="flex items-start gap-3 text-[#FDF6F0]">
                  <div className="w-6 h-6 rounded-full bg-[#D4A96A]/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <Check className="w-4 h-4 text-[#D4A96A]" />
                  </div>
                  <span>Explainable AI with detailed feature importance analysis</span>
                </li>
                <li className="flex items-start gap-3 text-[#FDF6F0]">
                  <div className="w-6 h-6 rounded-full bg-[#D4A96A]/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <Check className="w-4 h-4 text-[#D4A96A]" />
                  </div>
                  <span>Continuous model improvement with federated learning</span>
                </li>
              </ul>
            </div>

            <div className="bg-[#3D2917] backdrop-blur rounded-2xl p-6 border border-[#6B4F3A]">
              <h3 className="text-white font-semibold mb-6">Confidence Metrics</h3>
              <div className="space-y-4">
                {[
                  { disease: "Diabetes", confidence: 98 },
                  { disease: "Heart Disease", confidence: 92 },
                  { disease: "Breast Cancer", confidence: 95 },
                ].map((item) => (
                  <div key={item.disease}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-[#FDF6F0]">{item.disease}</span>
                      <span className="text-white font-semibold">{item.confidence}%</span>
                    </div>
                    <div className="h-2 bg-[#2C1A0E] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#E8845A] rounded-full"
                        style={{ width: `${item.confidence}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

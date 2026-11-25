import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Logo } from "../components/Logo";
import { Button } from "../components/Button";
import {
  Bell,
  LayoutDashboard,
  Activity,
  FileText,
  LogOut,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Brain,
  Stethoscope,
  CalendarClock,
  Microscope,
  Info,
  RotateCcw
} from "lucide-react";
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer
} from "recharts";
import {
  getLatestPrediction,
  clearLatestPrediction,
  getModelStatus,
  SavedPrediction,
  ModelStatusResponse
} from "../lib/api";

export function PredictionResults() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("results");
  const [prediction, setPrediction] = useState<SavedPrediction | null>(null);
  const [modelStatus, setModelStatus] = useState<ModelStatusResponse | null>(null);
  const [animProbability, setAnimProbability] = useState(0);

  useEffect(() => {
    const latest = getLatestPrediction();
    setPrediction(latest);

    if (latest) {
      const timer = setTimeout(() => {
        setAnimProbability(latest.confidence);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    getModelStatus().then((status) => {
      if (status) setModelStatus(status);
    });
  }, []);

  const handleClear = () => {
    clearLatestPrediction();
    setPrediction(null);
  };

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

  // Build recommendations based on actual prediction
  const getRecommendations = () => {
    if (!prediction) return [];

    if (prediction.disease === "breast-cancer") {
      if (prediction.isPositive) {
        return [
          {
            title: "Urgent Pathologist Review",
            description: "Schedule microscopic examination of serial whole-slide tissue sections by a senior pathologist to confirm invasive carcinoma margins.",
            bgColor: "bg-[#FFF4ED]",
            borderColor: "border-[#E07B54]",
            accent: "#C0392B",
            icon: Microscope,
          },
          {
            title: "Immunohistochemistry (IHC) Panel",
            description: "Order ER (estrogen receptor), PR (progesterone receptor), HER2/neu, and Ki-67 proliferation biomarker testing for molecular subtyping.",
            bgColor: "bg-[#EFF6FF]",
            borderColor: "border-[#4A7B8C]",
            accent: "#4A7B8C",
            icon: Stethoscope,
          },
          {
            title: "Multidisciplinary Tumor Board",
            description: "Present histological findings to multidisciplinary surgical, medical, and radiation oncology teams for personalized therapeutic planning.",
            bgColor: "bg-[#FDF6F0]",
            borderColor: "border-[#D4A96A]",
            accent: "#D4A96A",
            icon: CalendarClock,
          },
        ];
      } else {
        return [
          {
            title: "Routine Clinical Follow-Up",
            description: "Maintain standard clinical surveillance and scheduled routine mammography screening as per national oncology guidelines.",
            bgColor: "bg-[#F0FDF4]",
            borderColor: "border-[#5B8C5A]",
            accent: "#5B8C5A",
            icon: CheckCircle2,
          },
          {
            title: "Imaging Correlation",
            description: "Cross-reference the negative biopsy patch with diagnostic ultrasound and bilateral digital mammograms to confirm representative sampling.",
            bgColor: "bg-[#EFF6FF]",
            borderColor: "border-[#4A7B8C]",
            accent: "#4A7B8C",
            icon: Stethoscope,
          },
          {
            title: "Electronic Health Record Archival",
            description: "Document IDC negative microscopic patch findings and image provenance in the hospital pathology laboratory information system (LIS).",
            bgColor: "bg-[#FDF6F0]",
            borderColor: "border-[#E2D5C8]",
            accent: "#6B4F3A",
            icon: CalendarClock,
          },
        ];
      }
    } else {
      // Diabetes recommendations
      if (prediction.isPositive) {
        return [
          {
            title: "Confirmatory Glycemic Testing",
            description: "Order fasting plasma glucose (FPG) and standardized glycated hemoglobin (HbA1c) laboratory panel to confirm glycemic status.",
            bgColor: "bg-[#FFF4ED]",
            borderColor: "border-[#E07B54]",
            accent: "#C0392B",
            icon: Stethoscope,
          },
          {
            title: "Nutritional & Lifestyle Intervention",
            description: "Initiate structured medical nutrition therapy (low glycemic index diet) and recommended moderate physical activity (150 min/week).",
            bgColor: "bg-[#EFF6FF]",
            borderColor: "border-[#4A7B8C]",
            accent: "#4A7B8C",
            icon: CalendarClock,
          },
          {
            title: "Endocrinology Consultation",
            description: "Schedule clinical evaluation to discuss glycemic control, cardiovascular risk reduction, and baseline renal/retinal screening.",
            bgColor: "bg-[#FDF6F0]",
            borderColor: "border-[#D4A96A]",
            accent: "#D4A96A",
            icon: Stethoscope,
          },
        ];
      } else {
        return [
          {
            title: "Metabolic Health Maintenance",
            description: "Continue balanced nutritional habits, optimal weight maintenance, and regular cardiovascular exercise.",
            bgColor: "bg-[#F0FDF4]",
            borderColor: "border-[#5B8C5A]",
            accent: "#5B8C5A",
            icon: CheckCircle2,
          },
          {
            title: "Annual Preventative Screening",
            description: "Schedule annual fasting blood glucose or HbA1c check-up to monitor ongoing metabolic trajectory.",
            bgColor: "bg-[#EFF6FF]",
            borderColor: "border-[#4A7B8C]",
            accent: "#4A7B8C",
            icon: CalendarClock,
          },
        ];
      }
    }
  };

  const recommendations = getRecommendations();
  const radialData = [
    {
      name: "confidence",
      value: animProbability,
      fill: prediction?.isPositive ? "#C0392B" : "#5B8C5A"
    }
  ];

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

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-[#E2D5C8] px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-[#F0E8DE] text-[#6B4F3A] rounded text-xs font-semibold">
                Clinical Analytics
              </span>
              <span className="text-xs text-[#6B4F3A]">
                AI Inference Review &amp; Personalized Recommendations
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-[#6B4F3A] hover:text-[#2C1A0E] hover:bg-[#F0E8DE] rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#C0392B] rounded-full" />
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* If no prediction exists, render informative empty state */}
            {!prediction ? (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-12 border border-[#E2D5C8] shadow-[0_1px_3px_rgba(44,26,14,0.07)] text-center max-w-3xl mx-auto my-12"
              >
                <div className="w-20 h-20 bg-[#F0E8DE] rounded-full flex items-center justify-center mx-auto mb-6 text-[#E8845A]">
                  <Activity className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-[#2C1A0E] mb-3">No Active Prediction Loaded</h3>
                <p className="text-sm text-[#6B4F3A] mb-8 max-w-md mx-auto leading-relaxed">
                  To view clinical diagnostics, AI confidence distribution, and evidence-based recommendations, submit patient metrics or upload a tissue scan on the Predict Disease page.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                  <Button variant="bark" onClick={() => navigate("/predict")}>
                    Run Diabetes Prediction (Clinical Data)
                  </Button>
                  <Button variant="coral" onClick={() => navigate("/predict")}>
                    Run Breast Cancer CNN Analysis (Image Scan)
                  </Button>
                </div>

                {/* Model architecture summary */}
                <div className="pt-8 border-t border-[#E2D5C8] text-left">
                  <h4 className="text-sm font-semibold text-[#2C1A0E] mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#E8845A]" />
                    <span>Configured Clinical Prediction Models</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-[#FDF6F0] p-4 rounded-xl border border-[#E2D5C8]">
                      <p className="text-xs font-semibold text-[#2C1A0E]">Breast Cancer (Invasive Ductal Carcinoma)</p>
                      <p className="text-xs text-[#6B4F3A] mt-1">Architecture: Deep Convolutional Neural Network (PyTorch)</p>
                      <p className="text-xs text-[#6B4F3A]">Input: 50×50 RGB H&amp;E Histopathology Patches</p>
                      <p className="text-xs text-[#6B4F3A]">Status: {modelStatus?.breast_cancer_image_cnn.available ? "Model Active" : "Pending Dataset Setup"}</p>
                    </div>
                    <div className="bg-[#FDF6F0] p-4 rounded-xl border border-[#E2D5C8]">
                      <p className="text-xs font-semibold text-[#2C1A0E]">Type 2 Diabetes Risk</p>
                      <p className="text-xs text-[#6B4F3A] mt-1">Architecture: Random Forest Classifier</p>
                      <p className="text-xs text-[#6B4F3A]">Input: 7 Clinical &amp; Laboratory Metrics</p>
                      <p className="text-xs text-[#6B4F3A]">Status: {modelStatus?.diabetes_model.available ? "Model Active" : "Available"}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <>
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
                      <span
                        className={`px-3 py-1 rounded text-xs font-semibold border ${
                          prediction.isPositive
                            ? "bg-[#C0392B]/10 text-[#C0392B] border-[#C0392B]/30"
                            : "bg-[#5B8C5A]/10 text-[#5B8C5A] border-[#5B8C5A]/30"
                        }`}
                      >
                        {prediction.isPositive ? "High Risk Alert" : "Low Risk / Negative"}
                      </span>
                    </div>
                    <p className="text-sm text-[#6B4F3A]">
                      Case ID: {prediction.id} • Modality: {prediction.disease === "breast-cancer" ? "Histopathology Image (CNN)" : "Clinical Laboratory Measurements"} • Evaluated: {prediction.timestamp}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" size="sm" onClick={() => navigate("/predict")}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Run Another Prediction
                    </Button>
                    <button
                      onClick={handleClear}
                      className="px-3 py-2 border border-[#E2D5C8] rounded-lg text-xs text-[#C0392B] hover:bg-[#F0E8DE] transition-colors"
                      title="Clear saved prediction"
                    >
                      Clear
                    </button>
                  </div>
                </motion.div>

                {/* Hero Diagnosis Card */}
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="relative overflow-hidden bg-white rounded-2xl border border-[#E2D5C8] shadow-[0_1px_3px_rgba(44,26,14,0.07)]"
                >
                  <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-6 p-8">
                    {/* Radial Meter */}
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
                          <span className="text-5xl font-bold text-[#2C1A0E]">
                            {prediction.confidence.toFixed(1)}
                            <span className="text-2xl">%</span>
                          </span>
                          <span className="text-xs text-[#6B4F3A] uppercase tracking-wider mt-1">
                            Model Confidence
                          </span>
                        </div>
                      </div>
                      <div
                        className={`mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full border ${
                          prediction.isPositive
                            ? "bg-[#C0392B]/10 border-[#C0392B]/20 text-[#C0392B]"
                            : "bg-[#5B8C5A]/10 border-[#5B8C5A]/20 text-[#5B8C5A]"
                        }`}
                      >
                        {prediction.disease === "breast-cancer" ? (
                          <Microscope className="w-3.5 h-3.5" />
                        ) : (
                          <Activity className="w-3.5 h-3.5" />
                        )}
                        <span className="text-xs font-semibold">
                          {prediction.disease === "breast-cancer" ? "Breast Cancer (IDC)" : "Type 2 Diabetes"}
                        </span>
                      </div>
                    </div>

                    {/* AI Diagnosis Summary */}
                    <div className="lg:col-span-2 flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-5 h-5 text-[#4A7B8C]" />
                        <span className="text-xs font-semibold text-[#4A7B8C] uppercase tracking-wide">
                          AI Model Inference Summary
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-[#2C1A0E] mb-3">
                        {prediction.disease === "breast-cancer"
                          ? prediction.isPositive
                            ? "Invasive Ductal Carcinoma (IDC) cellular features detected"
                            : "Invasive Ductal Carcinoma features not identified in scan"
                          : prediction.isPositive
                          ? "Elevated glycemic risk profile detected"
                          : "Normal glycemic risk profile within expected parameters"}
                      </h3>
                      <p className="text-sm text-[#6B4F3A] leading-relaxed mb-6">
                        {prediction.disease === "breast-cancer"
                          ? `Inference performed by deep Convolutional Neural Network on tissue microscopy patch '${prediction.imageFileName ?? "specimen"}'. Predicted class is '${prediction.prediction}' with ${prediction.confidence.toFixed(1)}% model confidence.`
                          : `Inference performed by clinical Random Forest model on patient physiological measurements. Predicted outcome is '${prediction.prediction}' with ${prediction.confidence.toFixed(1)}% model confidence.`}
                      </p>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-xl p-3 bg-[#FDF6F0] border border-[#E2D5C8]">
                          <p className="text-xs text-[#6B4F3A] uppercase tracking-wide mb-1">Model Architecture</p>
                          <p className="text-sm font-bold text-[#2C1A0E] truncate">
                            {prediction.modelType.includes("CNN") ? "PyTorch CNN" : "Random Forest"}
                          </p>
                        </div>
                        <div className="rounded-xl p-3 bg-[#FDF6F0] border border-[#E2D5C8]">
                          <p className="text-xs text-[#6B4F3A] uppercase tracking-wide mb-1">Risk Tier</p>
                          <p className="text-sm font-bold" style={{ color: prediction.isPositive ? "#C0392B" : "#5B8C5A" }}>
                            {prediction.isPositive ? "High Risk" : "Low Risk"}
                          </p>
                        </div>
                        <div className="rounded-xl p-3 bg-[#FDF6F0] border border-[#E2D5C8]">
                          <p className="text-xs text-[#6B4F3A] uppercase tracking-wide mb-1">Task Definition</p>
                          <p className="text-sm font-bold text-[#D4A96A] truncate">
                            {prediction.disease === "breast-cancer" ? "IDC Detection" : "Diabetes Risk"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Diagnostic Indicators Breakdown */}
                <div className="bg-white rounded-2xl p-6 border border-[#E2D5C8] shadow-[0_1px_3px_rgba(44,26,14,0.07)]">
                  <h4 className="font-semibold text-[#2C1A0E] mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-[#E8845A]" />
                    <span>Submitted Case Indicators</span>
                  </h4>

                  {prediction.disease === "diabetes" && prediction.inputs ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {Object.entries(prediction.inputs).map(([key, val]) => (
                        <div key={key} className="bg-[#FDF6F0] p-3 rounded-xl border border-[#E2D5C8]">
                          <p className="text-xs text-[#6B4F3A] mb-1">{key}</p>
                          <p className="text-base font-bold text-[#2C1A0E]">{val}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-[#FDF6F0] p-4 rounded-xl border border-[#E2D5C8]">
                        <p className="text-xs text-[#6B4F3A] mb-1">Analyzed Specimen File</p>
                        <p className="text-sm font-bold text-[#2C1A0E] truncate">{prediction.imageFileName ?? "Histopathology Patch"}</p>
                      </div>
                      <div className="bg-[#FDF6F0] p-4 rounded-xl border border-[#E2D5C8]">
                        <p className="text-xs text-[#6B4F3A] mb-1">Patch Dimensions &amp; Modality</p>
                        <p className="text-sm font-bold text-[#2C1A0E]">50×50 RGB (H&amp;E Stain)</p>
                      </div>
                      <div className="bg-[#FDF6F0] p-4 rounded-xl border border-[#E2D5C8]">
                        <p className="text-xs text-[#6B4F3A] mb-1">Decision Threshold</p>
                        <p className="text-sm font-bold text-[#2C1A0E]">0.50 Probability Cutoff</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Evidence-Based Recommendations */}
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-2xl p-6 border border-[#E2D5C8] shadow-[0_1px_3px_rgba(44,26,14,0.07)]"
                >
                  <div className="flex items-center gap-2 mb-6">
                    <Brain className="w-5 h-5 text-[#4A7B8C]" />
                    <h3 className="text-xl font-bold text-[#2C1A0E]">Evidence-Based Clinical Recommendations</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {recommendations.map((rec, idx) => {
                      const Icon = rec.icon;
                      return (
                        <div
                          key={rec.title}
                          className={`${rec.bgColor} rounded-xl p-5 border ${rec.borderColor} transition-all`}
                        >
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                            style={{ background: `${rec.accent}1A` }}
                          >
                            <Icon className="w-5 h-5" style={{ color: rec.accent }} />
                          </div>
                          <h4 className="font-bold text-[#2C1A0E] mb-2">{rec.title}</h4>
                          <p className="text-sm text-[#6B4F3A] mb-4 leading-relaxed">{rec.description}</p>
                          <span
                            className="flex items-center gap-2 text-xs font-semibold cursor-pointer hover:underline"
                            style={{ color: rec.accent }}
                          >
                            Add to clinician review queue
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>

                {/* Regulatory / Educational Disclaimer */}
                <div className="p-4 bg-[#F0E8DE] border border-[#E2D5C8] rounded-xl flex items-start gap-3">
                  <Info className="w-5 h-5 text-[#E8845A] flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-[#6B4F3A] leading-relaxed">
                    <strong>Clinical Notice:</strong> This software is designed for investigational and educational workflows only. AI-generated predictions do not replace professional pathology consultations, clinical judgment, or standard laboratory diagnostic protocols.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

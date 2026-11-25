import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Logo } from "../components/Logo";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import {
  Search,
  Bell,
  LayoutDashboard,
  Activity,
  FileText,
  LogOut,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  X,
  Sparkles,
  Info
} from "lucide-react";
import {
  predictBreastCancerImage,
  predictDiabetes,
  saveLatestPrediction,
  SavedPrediction
} from "../lib/api";

export function PredictDisease() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"diabetes" | "breast-cancer">("diabetes");
  const [activeNav, setActiveNav] = useState("predict");

  // Diabetes inputs
  const [age, setAge] = useState("");
  const [glucose, setGlucose] = useState("");
  const [bloodPressure, setBloodPressure] = useState("");
  const [skinThickness, setSkinThickness] = useState("");
  const [insulin, setInsulin] = useState("");
  const [bmi, setBmi] = useState("");
  const [pedigree, setPedigree] = useState("");

  // Breast cancer image input
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // Prediction status
  const [showPrediction, setShowPrediction] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionError, setPredictionError] = useState("");
  const [predictionResult, setPredictionResult] = useState<{
    result: string;
    confidence: number;
    probability?: number;
    isPositive: boolean;
    modelType: string;
    modelName?: string;
    task?: string;
  } | null>(null);

  // Clear preview URL on unmount or file change
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  // Reset results when tab changes
  const handleTabChange = (tab: "diabetes" | "breast-cancer") => {
    setActiveTab(tab);
    setShowPrediction(false);
    setPredictionError("");
    setPredictionResult(null);
  };

  const NavItem = ({ icon: Icon, label, id }: { icon: any; label: string; id: string }) => (
    <button
      onClick={() => {
        setActiveNav(id);
        if (id === "overview") navigate("/dashboard");
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

  const handleDiabetesPrediction = async () => {
    setIsPredicting(true);
    setPredictionError("");
    setShowPrediction(false);

    try {
      const result = await predictDiabetes({
        age,
        glucose,
        bloodPressure,
        skinThickness,
        insulin,
        bmi,
        diabetesPedigreeFunction: pedigree,
      });

      const isPositive =
        result.prediction.toLowerCase().includes("diabetic") &&
        !result.prediction.toLowerCase().includes("not");

      const resObj = {
        result: result.prediction,
        confidence: result.confidence,
        isPositive,
        modelType: result.model_type ?? "Random Forest",
        modelName: "Clinical Random Forest Classifier",
        task: "Type 2 Diabetes Risk Prediction",
      };

      setPredictionResult(resObj);
      setShowPrediction(true);

      // Save to localStorage for Results & Analytics
      const saved: SavedPrediction = {
        id: `DIA-${Date.now().toString().slice(-4)}`,
        disease: "diabetes",
        prediction: result.prediction,
        confidence: result.confidence,
        isPositive,
        modelType: result.model_type ?? "Random Forest",
        modelName: "Clinical Random Forest Classifier",
        task: "Type 2 Diabetes Risk Prediction",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        inputs: {
          Age: age || "35",
          Glucose: `${glucose || "120"} mg/dL`,
          "Blood Pressure": `${bloodPressure || "80"} mmHg`,
          "Skin Thickness": `${skinThickness || "20"} mm`,
          Insulin: `${insulin || "80"} mu U/ml`,
          BMI: bmi || "25.5",
          "Pedigree Function": pedigree || "0.627",
        },
      };
      saveLatestPrediction(saved);
    } catch (error) {
      setPredictionError(error instanceof Error ? error.message : "Unable to run diabetes prediction.");
      setPredictionResult(null);
    } finally {
      setIsPredicting(false);
    }
  };

  const handleBreastCancerPrediction = async () => {
    if (!uploadedFile) {
      setPredictionError("Please select a breast histopathology image (PNG/JPG) before running analysis.");
      return;
    }

    setIsPredicting(true);
    setPredictionError("");
    setShowPrediction(false);

    try {
      const result = await predictBreastCancerImage(uploadedFile);

      const isPositive =
        result.prediction.toLowerCase().includes("positive") ||
        result.prediction.toLowerCase() === "malignant";

      const resObj = {
        result: result.prediction,
        confidence: result.confidence,
        probability: result.probability,
        isPositive,
        modelType: result.model_type ?? "Convolutional Neural Network (PyTorch)",
        modelName: result.model ?? "AuraHealth CNN",
        task: result.task ?? "Invasive Ductal Carcinoma (IDC) Histopathology Detection",
      };

      setPredictionResult(resObj);
      setShowPrediction(true);

      // Save to localStorage for Results & Analytics
      const saved: SavedPrediction = {
        id: `BC-${Date.now().toString().slice(-4)}`,
        disease: "breast-cancer",
        prediction: result.prediction,
        confidence: result.confidence,
        probability: result.probability,
        isPositive,
        modelType: result.model_type ?? "Convolutional Neural Network (PyTorch)",
        modelName: result.model ?? "AuraHealth CNN",
        task: result.task ?? "Invasive Ductal Carcinoma (IDC) Histopathology Detection",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        imageFileName: uploadedFile.name,
      };
      saveLatestPrediction(saved);
    } catch (error) {
      setPredictionError(error instanceof Error ? error.message : "Unable to run breast cancer image prediction.");
      setPredictionResult(null);
    } finally {
      setIsPredicting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate 5MB limit
      if (file.size > 5 * 1024 * 1024) {
        setPredictionError(`Selected file exceeds the 5 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB). Please select an image under 5 MB.`);
        return;
      }

      setPredictionError("");
      setShowPrediction(false);
      setPredictionResult(null);
      setUploadedFile(file);

      // Create preview URL
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleClearFile = () => {
    setUploadedFile(null);
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(null);
    }
    setShowPrediction(false);
    setPredictionResult(null);
    setPredictionError("");
  };

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
                Clinical Workflow
              </span>
              <span className="text-xs text-[#6B4F3A]">
                Multimodal AI Diagnostics: Tabular Measurements & Microscopy CNN
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
            <div>
              <h2 className="text-3xl font-bold text-[#2C1A0E]">Predict Disease Risk</h2>
              <p className="text-sm text-[#6B4F3A] mt-1">
                Evaluate patient risk using validated clinical parameters or histopathological tissue scan imaging.
              </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-[#E2D5C8]">
              <button
                onClick={() => handleTabChange("diabetes")}
                className={`px-6 py-3 font-medium transition-colors relative ${
                  activeTab === "diabetes"
                    ? "text-[#2C1A0E]"
                    : "text-[#6B4F3A] hover:text-[#2C1A0E]"
                }`}
              >
                Diabetes Risk — Clinical Data
                {activeTab === "diabetes" && (
                  <>
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2C1A0E]"></div>
                    <span className="ml-2 text-[#2C1A0E]">●</span>
                  </>
                )}
              </button>
              <button
                onClick={() => handleTabChange("breast-cancer")}
                className={`px-6 py-3 font-medium transition-colors relative ${
                  activeTab === "breast-cancer"
                    ? "text-[#2C1A0E]"
                    : "text-[#6B4F3A] hover:text-[#2C1A0E]"
                }`}
              >
                Breast Cancer — Histopathology Patch Scan (IDC)
                {activeTab === "breast-cancer" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2C1A0E]"></div>
                )}
              </button>
            </div>

            {/* Tab Content */}
            <div className="grid grid-cols-2 gap-6">
              {/* Left Side - Input */}
              {activeTab === "diabetes" ? (
                <div className="bg-white rounded-xl overflow-hidden border border-[#E2D5C8] shadow-[0_1px_3px_rgba(44,26,14,0.07)]">
                  <div className="bg-[#F0E8DE] px-6 py-4 border-b border-[#E2D5C8]">
                    <h3 className="text-xl font-semibold text-[#2C1A0E]">Patient Clinical Measurements</h3>
                    <p className="text-xs text-[#6B4F3A] mt-0.5">
                      Random Forest classification based on laboratory blood glucose, insulin, and biometric metrics.
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Age (years)" placeholder="35" value={age} onChange={(e) => setAge(e.target.value)} />
                      <Input label="Fasting Glucose (mg/dL)" placeholder="120" value={glucose} onChange={(e) => setGlucose(e.target.value)} />
                      <Input label="Blood Pressure (mm Hg)" placeholder="80" value={bloodPressure} onChange={(e) => setBloodPressure(e.target.value)} />
                      <Input label="Triceps Skin Thickness (mm)" placeholder="20" value={skinThickness} onChange={(e) => setSkinThickness(e.target.value)} />
                      <Input label="2-Hour Serum Insulin (mu U/ml)" placeholder="80" value={insulin} onChange={(e) => setInsulin(e.target.value)} />
                      <Input label="Body Mass Index (BMI)" placeholder="25.5" value={bmi} onChange={(e) => setBmi(e.target.value)} />
                      <div className="col-span-2">
                        <Input label="Diabetes Pedigree Function" placeholder="0.627" value={pedigree} onChange={(e) => setPedigree(e.target.value)} />
                      </div>
                    </div>
                    {predictionError && activeTab === "diabetes" && (
                      <div className="mt-4 rounded-lg border border-[#C0392B]/30 bg-[#C0392B]/10 px-4 py-3 text-sm text-[#8F2B21] flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <span>{predictionError}</span>
                      </div>
                    )}
                    <Button variant="bark" className="w-full mt-6" onClick={handleDiabetesPrediction} disabled={isPredicting}>
                      {isPredicting ? "Running Clinical Prediction..." : "Run AI Prediction Analysis"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl p-6 border border-[#E2D5C8] shadow-[0_1px_3px_rgba(44,26,14,0.07)]">
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold text-[#2C1A0E]">Upload Histopathology Patch Scan</h3>
                    <p className="text-xs text-[#6B4F3A] mt-1 leading-relaxed">
                      Deep Convolutional Neural Network (CNN) analysis of H&amp;E stained breast tissue microscopy windows (50×50 px) to detect <strong>Invasive Ductal Carcinoma (IDC)</strong> presence.
                    </p>
                  </div>

                  {/* Upload Box / Image Preview */}
                  <div className="mb-6">
                    {imagePreviewUrl ? (
                      <div className="border border-[#E2D5C8] bg-[#FDF6F0] rounded-xl p-4 flex flex-col items-center">
                        <div className="relative group mb-3">
                          <img
                            src={imagePreviewUrl}
                            alt="Uploaded tissue patch"
                            className="w-40 h-40 object-cover rounded-lg border border-[#E2D5C8] shadow-sm image-rendering-pixelated"
                          />
                          <button
                            onClick={handleClearFile}
                            className="absolute -top-2 -right-2 bg-[#C0392B] text-white p-1 rounded-full shadow hover:bg-[#8F2B21] transition-colors"
                            title="Remove image"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-sm font-medium text-[#2C1A0E] text-center truncate max-w-xs">
                          {uploadedFile?.name}
                        </p>
                        <p className="text-xs text-[#6B4F3A] mt-0.5">
                          {uploadedFile ? `${(uploadedFile.size / 1024).toFixed(1)} KB` : ""}
                        </p>
                        <button
                          onClick={handleClearFile}
                          className="mt-2 text-xs text-[#C0392B] hover:underline"
                        >
                          Choose another image
                        </button>
                      </div>
                    ) : (
                      <label className="block cursor-pointer">
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/jpg,image/tiff"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <div className="border-2 border-dashed border-[#E8845A] bg-[#F0E8DE] rounded-xl p-10 cursor-pointer hover:border-[#E07B54] hover:bg-[#E8845A]/5 transition-colors text-center">
                          <Cloud className="w-12 h-12 text-[#C9A882] mx-auto mb-3" />
                          <p className="text-[#2C1A0E] font-medium mb-1">
                            Click to upload tissue patch scan
                          </p>
                          <p className="text-sm text-[#6B4F3A]">PNG, JPG, TIFF · Max 5MB</p>
                          <p className="text-xs text-[#C9A882] mt-2">
                            Optimized for 50×50 RGB histopathology patches
                          </p>
                        </div>
                      </label>
                    )}
                  </div>

                  {predictionError && activeTab === "breast-cancer" && (
                    <div className="mb-4 rounded-lg border border-[#C0392B]/30 bg-[#C0392B]/10 px-4 py-3 text-sm text-[#8F2B21] flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold mb-0.5">Prediction Notice</p>
                        <p className="text-xs leading-relaxed">{predictionError}</p>
                      </div>
                    </div>
                  )}

                  <Button
                    variant="coral"
                    className="w-full"
                    onClick={handleBreastCancerPrediction}
                    disabled={isPredicting || !uploadedFile}
                  >
                    {isPredicting ? "Analyzing Tissue Patch with CNN..." : "Run CNN Tissue Analysis"}
                  </Button>
                </div>
              )}

              {/* Right Side - Result or Awaiting State */}
              <div className="bg-white rounded-xl p-6 border border-[#E2D5C8] shadow-[0_1px_3px_rgba(44,26,14,0.07)] flex flex-col items-center justify-center min-h-[440px]">
                {showPrediction && predictionResult ? (
                  <div className="flex flex-col items-center w-full">
                    {/* Model Architecture Tag */}
                    <div className="mb-4 flex items-center gap-2">
                      <span className="px-3 py-1 bg-[#4A7B8C]/10 text-[#4A7B8C] border border-[#4A7B8C]/30 rounded-full text-xs font-semibold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        {predictionResult.modelType}
                      </span>
                    </div>

                    {/* Result Icon */}
                    <div
                      className={`w-28 h-28 rounded-full flex items-center justify-center mb-4 ${
                        predictionResult.isPositive
                          ? "bg-gradient-to-br from-[#C0392B]/20 to-[#C0392B]/10"
                          : "bg-gradient-to-br from-[#5B8C5A]/20 to-[#5B8C5A]/10"
                      }`}
                    >
                      {predictionResult.isPositive ? (
                        <AlertTriangle className="w-14 h-14 text-[#C0392B]" />
                      ) : (
                        <CheckCircle2 className="w-14 h-14 text-[#5B8C5A]" />
                      )}
                    </div>

                    <p className="text-xs text-[#6B4F3A] uppercase tracking-wider mb-1">
                      {predictionResult.task ?? "Classification Result"}
                    </p>
                    <h3
                      className={`text-3xl font-bold mb-2 text-center ${
                        predictionResult.isPositive ? "text-[#C0392B]" : "text-[#5B8C5A]"
                      }`}
                    >
                      {predictionResult.result}
                    </h3>

                    <p className="text-xs text-[#6B4F3A] mb-6 text-center max-w-xs">
                      {predictionResult.isPositive
                        ? "Tissue morphology exhibits features consistent with Invasive Ductal Carcinoma."
                        : "No cellular features of Invasive Ductal Carcinoma identified in this patch."}
                    </p>

                    {/* Confidence Meter */}
                    <div className="w-full max-w-xs bg-[#F0E8DE] rounded-xl p-5 border border-[#E2D5C8] mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-[#2C1A0E]">Model Confidence</span>
                        <span className="text-lg font-bold text-[#2C1A0E]">
                          {predictionResult.confidence.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-3 bg-white rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            predictionResult.isPositive ? "bg-[#C0392B]" : "bg-[#5B8C5A]"
                          }`}
                          style={{ width: `${Math.min(100, Math.max(5, predictionResult.confidence))}%` }}
                        ></div>
                      </div>
                      {predictionResult.probability !== undefined && (
                        <p className="text-[11px] text-[#6B4F3A] mt-2 text-right">
                          IDC Positive Probability: {(predictionResult.probability * 100).toFixed(1)}%
                        </p>
                      )}
                    </div>

                    {/* Link to Full Results */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/results")}
                      className="flex items-center gap-2 mb-4"
                    >
                      <span>View Detailed Analytics &amp; Plan</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>

                    {/* Educational Disclaimer */}
                    <p className="text-[11px] text-[#8C7A6B] text-center max-w-sm flex items-center justify-center gap-1.5">
                      <Info className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Educational research tool only. Histopathological confirmation by a qualified pathologist is required.</span>
                    </p>
                  </div>
                ) : (
                  <>
                    <svg
                      width="100"
                      height="100"
                      viewBox="0 0 120 120"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="mb-6 opacity-25"
                    >
                      <circle cx="60" cy="60" r="50" stroke="#C0392B" strokeWidth="2" opacity="0.3" />
                      <circle cx="60" cy="60" r="35" stroke="#C0392B" strokeWidth="2" opacity="0.5" />
                      <circle cx="60" cy="60" r="20" fill="#C0392B" opacity="0.4" />
                    </svg>
                    <h3 className="text-lg font-semibold text-[#2C1A0E] mb-2">Awaiting Diagnostic Input</h3>
                    <p className="text-xs text-[#6B4F3A] text-center max-w-xs leading-relaxed">
                      {activeTab === "diabetes"
                        ? "Enter patient lab metrics to run Random Forest clinical diabetes analysis."
                        : "Upload a histopathological tissue patch scan (PNG/JPG) to run deep Convolutional Neural Network (CNN) analysis."}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

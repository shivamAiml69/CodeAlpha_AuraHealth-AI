import { useState } from "react";
import { useNavigate } from "react-router";
import { Logo } from "../components/Logo";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Search, Bell, LayoutDashboard, Activity, FileText, User, LogOut, Cloud } from "lucide-react";
import { predictBreastCancerImage, predictDiabetes } from "../lib/api";

export function PredictDisease() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"diabetes" | "breast-cancer">("diabetes");
  const [activeNav, setActiveNav] = useState("predict");

  const [age, setAge] = useState("");
  const [glucose, setGlucose] = useState("");
  const [bloodPressure, setBloodPressure] = useState("");
  const [skinThickness, setSkinThickness] = useState("");
  const [insulin, setInsulin] = useState("");
  const [bmi, setBmi] = useState("");
  const [pedigree, setPedigree] = useState("");

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showPrediction, setShowPrediction] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionError, setPredictionError] = useState("");
  const [predictionResult, setPredictionResult] = useState<{
    result: string;
    confidence: number;
    isPositive: boolean;
  } | null>(null);

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

      setPredictionResult({
        result: result.prediction,
        confidence: result.confidence,
        isPositive: result.prediction.toLowerCase().includes("diabetic") && !result.prediction.toLowerCase().includes("not"),
      });
      setShowPrediction(true);
    } catch (error) {
      setPredictionError(error instanceof Error ? error.message : "Unable to run prediction.");
      setPredictionResult(null);
    } finally {
      setIsPredicting(false);
    }
  };

  const handleBreastCancerPrediction = async () => {
    if (!uploadedFile) {
      setPredictionError("Please upload a PNG or JPG image before running the prediction.");
      return;
    }

    setIsPredicting(true);
    setPredictionError("");
    setShowPrediction(false);

    try {
      const result = await predictBreastCancerImage(uploadedFile);

      setPredictionResult({
        result: result.prediction,
        confidence: result.confidence,
        isPositive: result.prediction.toLowerCase() === "malignant",
      });
      setShowPrediction(true);
    } catch (error) {
      setPredictionError(error instanceof Error ? error.message : "Unable to run prediction.");
      setPredictionResult(null);
    } finally {
      setIsPredicting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
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
          <div className="max-w-7xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold text-[#2C1A0E]">Predict Disease Risk</h2>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-[#E2D5C8]">
              <button
                onClick={() => setActiveTab("diabetes")}
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
                onClick={() => setActiveTab("breast-cancer")}
                className={`px-6 py-3 font-medium transition-colors relative ${
                  activeTab === "breast-cancer"
                    ? "text-[#2C1A0E]"
                    : "text-[#6B4F3A] hover:text-[#2C1A0E]"
                }`}
              >
                Breast Cancer — Image Scan
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
                    <h3 className="text-xl font-semibold text-[#2C1A0E]">Patient Metrics</h3>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Age" placeholder="35" value={age} onChange={(e) => setAge(e.target.value)} />
                      <Input label="Glucose" placeholder="120 mg/dL" value={glucose} onChange={(e) => setGlucose(e.target.value)} />
                      <Input label="Blood Pressure" placeholder="80 mm Hg" value={bloodPressure} onChange={(e) => setBloodPressure(e.target.value)} />
                      <Input label="Skin Thickness" placeholder="20 mm" value={skinThickness} onChange={(e) => setSkinThickness(e.target.value)} />
                      <Input label="Insulin" placeholder="80 mu U/ml" value={insulin} onChange={(e) => setInsulin(e.target.value)} />
                      <Input label="BMI" placeholder="25.5" value={bmi} onChange={(e) => setBmi(e.target.value)} />
                      <div className="col-span-2">
                        <Input label="Pedigree Function" placeholder="0.627" value={pedigree} onChange={(e) => setPedigree(e.target.value)} />
                      </div>
                    </div>
                    {predictionError && activeTab === "diabetes" && (
                      <p className="mt-4 rounded-lg border border-[#C0392B]/30 bg-[#C0392B]/10 px-4 py-3 text-sm text-[#8F2B21]">
                        {predictionError}
                      </p>
                    )}
                    <Button variant="bark" className="w-full mt-6" onClick={handleDiabetesPrediction} disabled={isPredicting}>
                      {isPredicting ? "Running Prediction..." : "Run AI Prediction Analysis"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl p-6 border border-[#E2D5C8] shadow-[0_1px_3px_rgba(44,26,14,0.07)]">
                  <h3 className="text-xl font-semibold text-[#2C1A0E] mb-6">Upload Histopathological Image</h3>
                  <div className="mb-6">
                    <label className="block">
                      <input
                        type="file"
                        accept="image/png,image/jpeg"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <div className="border-2 border-dashed border-[#E8845A] bg-[#F0E8DE] rounded-xl p-12 cursor-pointer hover:border-[#E07B54] hover:bg-[#E8845A]/5 transition-colors text-center">
                        <Cloud className="w-12 h-12 text-[#C9A882] mx-auto mb-4" />
                        <p className="text-[#2C1A0E] font-medium mb-2">
                          {uploadedFile ? uploadedFile.name : "Click to upload tissue scan"}
                        </p>
                        <p className="text-sm text-[#6B4F3A]">PNG, JPG · Max 5MB</p>
                      </div>
                    </label>
                  </div>
                  {predictionError && activeTab === "breast-cancer" && (
                    <p className="mb-4 rounded-lg border border-[#C0392B]/30 bg-[#C0392B]/10 px-4 py-3 text-sm text-[#8F2B21]">
                      {predictionError}
                    </p>
                  )}
                  <Button variant="coral" className="w-full" onClick={handleBreastCancerPrediction} disabled={isPredicting}>
                    {isPredicting ? "Running Prediction..." : "Run AI Prediction Analysis"}
                  </Button>
                </div>
              )}

              {/* Right Side - Result or Awaiting State */}
              <div className="bg-white rounded-xl p-6 border border-[#E2D5C8] shadow-[0_1px_3px_rgba(44,26,14,0.07)] flex flex-col items-center justify-center min-h-[400px]">
                {showPrediction && predictionResult ? (
                  <div className="flex flex-col items-center w-full">
                    <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-6 ${
                      predictionResult.isPositive
                        ? "bg-gradient-to-br from-[#C0392B]/20 to-[#C0392B]/10"
                        : "bg-gradient-to-br from-[#5B8C5A]/20 to-[#5B8C5A]/10"
                    }`}>
                      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M40 10C23.43 10 10 23.43 10 40C10 56.57 23.43 70 40 70C56.57 70 70 56.57 70 40C70 23.43 56.57 10 40 10ZM40 15C53.81 15 65 26.19 65 40C65 53.81 53.81 65 40 65C26.19 65 15 53.81 15 40C15 26.19 26.19 15 40 15Z" fill={predictionResult.isPositive ? "#C0392B" : "#5B8C5A"}/>
                        <path d="M35 45L28 38L25 41L35 51L55 31L52 28L35 45Z" fill={predictionResult.isPositive ? "#C0392B" : "#5B8C5A"}/>
                      </svg>
                    </div>

                    <p className="text-sm text-[#6B4F3A] mb-2">Prediction Result</p>
                    <h3 className={`text-3xl font-bold mb-8 ${predictionResult.isPositive ? "text-[#C0392B]" : "text-[#5B8C5A]"}`}>
                      {predictionResult.result}
                    </h3>

                    <div className="w-full max-w-xs bg-[#F0E8DE] rounded-xl p-6 border border-[#E2D5C8]">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-[#2C1A0E]">Confidence</span>
                        <span className="text-lg font-bold text-[#2C1A0E]">{predictionResult.confidence}%</span>
                      </div>
                      <div className="h-3 bg-white rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${predictionResult.isPositive ? "bg-[#C0392B]" : "bg-[#5B8C5A]"}`}
                          style={{ width: `${predictionResult.confidence}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-6 opacity-20">
                      <circle cx="60" cy="60" r="50" stroke="#C0392B" strokeWidth="2" opacity="0.2"/>
                      <circle cx="60" cy="60" r="35" stroke="#C0392B" strokeWidth="2" opacity="0.4"/>
                      <circle cx="60" cy="60" r="20" fill="#C0392B" opacity="0.3"/>
                    </svg>
                    <h3 className="text-xl font-semibold text-[#C9A882] mb-2">Awaiting Data</h3>
                    <p className="text-sm text-[#6B4F3A] text-center max-w-xs">
                      {activeTab === "diabetes"
                        ? "Enter patient metrics and run analysis to see AI predictions"
                        : "Upload image to run CNN model for breast cancer detection"}
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

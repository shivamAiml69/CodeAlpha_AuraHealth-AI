import { useState } from "react";
import { useNavigate } from "react-router";
import { Logo } from "../components/Logo";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Info } from "lucide-react";

export function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("doctor@hospital.com");
  const [password, setPassword] = useState("••••••••");

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen grid grid-cols-2">
      {/* Left Side - Warm Linen to Coral Gradient */}
      <div className="bg-gradient-to-br from-[#F0E8DE] via-[#E8845A]/30 to-[#E8845A]/50 p-16 flex flex-col justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE2YzAtMi4yMDkgMS43OTEtNCA0LTRzNCAxLjc5MSA0IDQtMS43OTEgNC00IDQtNC0xLjc5MS00LTR6bS0yMCAwYzAtMi4yMDkgMS43OTEtNCA0LTRzNCAxLjc5MSA0IDQtMS43OTEgNC00IDQtNC0xLjc5MS00LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40"></div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/40 backdrop-blur rounded-full mb-8 border border-white/50">
            <span className="text-sm font-medium text-[#6B4F3A]">Clinical Intelligence Prototype</span>
          </div>

          <h1 className="text-5xl font-bold text-[#2C1A0E] mb-6 leading-tight">
            Empowering Clinical Decisions with AI.
          </h1>

          <p className="text-lg text-[#6B4F3A] max-w-md leading-relaxed">
            Multimodal healthcare machine learning platform integrating clinical laboratory prediction and deep histopathology patch classification.
          </p>
        </div>
      </div>

      {/* Right Side - Sign In Form */}
      <div className="bg-white flex flex-col items-center justify-center p-16">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8">
            <Logo />
          </div>

          <div className="bg-white rounded-2xl p-8 border border-[#E2D5C8] shadow-[0_1px_3px_rgba(44,26,14,0.07)]">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold text-[#2C1A0E]">Welcome Back</h2>
              <span className="px-2.5 py-0.5 bg-[#5B8C5A]/10 text-[#5B8C5A] border border-[#5B8C5A]/30 rounded text-xs font-semibold">
                Demo Access
              </span>
            </div>
            <p className="text-xs text-[#6B4F3A] mb-4">
              Explore the clinician dashboard in prototype preview mode.
            </p>

            <div className="p-3 bg-[#F0E8DE] rounded-xl border border-[#E2D5C8] mb-6 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-[#E8845A] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[#6B4F3A]">
                Click <strong>Sign In</strong> below to launch the dashboard instantly without an active enterprise directory account.
              </p>
            </div>

            <form onSubmit={handleSignIn} className="space-y-4">
              <Input
                label="Clinician Email"
                type="email"
                placeholder="doctor@hospital.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <Button type="submit" variant="red" className="w-full mt-6">
                Sign In to Dashboard →
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="text-xs text-[#E8845A] hover:underline"
              >
                Direct Dashboard Bypass (Instant Access)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

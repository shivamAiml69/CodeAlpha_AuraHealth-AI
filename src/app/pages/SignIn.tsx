import { useState } from "react";
import { useNavigate } from "react-router";
import { Logo } from "../components/Logo";
import { Button } from "../components/Button";
import { Input } from "../components/Input";

export function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
            <span className="text-sm font-medium text-[#6B4F3A]">Clinical Intelligence Platform</span>
          </div>

          <h1 className="text-5xl font-bold text-[#2C1A0E] mb-6 leading-tight">
            Empowering Clinical Decisions with AI.
          </h1>

          <p className="text-lg text-[#6B4F3A] max-w-md">
            Join healthcare professionals worldwide using AuraHealth AI to predict and prevent critical health conditions.
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
            <h2 className="text-2xl font-bold text-[#2C1A0E] mb-2">Welcome Back</h2>
            <p className="text-[#6B4F3A] mb-6">Sign in to your clinical dashboard</p>

            <form onSubmit={handleSignIn} className="space-y-4">
              <Input
                label="Email"
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
                Sign In →
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E2D5C8]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-[#6B4F3A]">or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-[#E2D5C8] rounded-lg hover:bg-[#F0E8DE] transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="text-sm font-medium text-[#2C1A0E]">Google</span>
              </button>

              <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-[#E2D5C8] rounded-lg hover:bg-[#F0E8DE] transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#00A4EF">
                  <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z" />
                </svg>
                <span className="text-sm font-medium text-[#2C1A0E]">Microsoft</span>
              </button>
            </div>

            <div className="mt-6 text-center">
              <a href="#" className="text-sm text-[#E8845A] hover:underline">
                Request Access
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

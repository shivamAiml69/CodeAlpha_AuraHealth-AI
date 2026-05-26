import { useId } from "react";

export function Logo({ className = "", variant = "light" }: { className?: string; variant?: "light" | "dark" }) {
  const textColor = variant === "dark" ? "text-[#FDF6F0]" : "text-[#2C1A0E]";
  const gradientId = useId();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="14" stroke={`url(#${gradientId})`} strokeWidth="2" opacity="0.3"/>
        <circle cx="16" cy="16" r="10" stroke={`url(#${gradientId})`} strokeWidth="2" opacity="0.6"/>
        <circle cx="16" cy="16" r="6" fill={`url(#${gradientId})`}/>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#C0392B"/>
            <stop offset="1" stopColor="#E8845A"/>
          </linearGradient>
        </defs>
      </svg>
      <span className={`text-xl font-bold ${textColor}`}>
        AuraHealth <span className="text-[#C0392B]">AI</span>
      </span>
    </div>
  );
}

import { ReactNode } from "react";

interface KPICardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  className?: string;
}

export function KPICard({ label, value, icon, className = "" }: KPICardProps) {
  return (
    <div className={`bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-sm ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-[#64748B] text-sm">{label}</p>
        {icon && <div className="text-[#7C3AED]">{icon}</div>}
      </div>
      <p className="text-3xl font-bold text-[#0F172A]">{value}</p>
    </div>
  );
}

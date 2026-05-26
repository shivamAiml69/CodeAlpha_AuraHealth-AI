type RiskLevel = "high" | "medium" | "low";

interface RiskBadgeProps {
  level: RiskLevel;
  className?: string;
}

export function RiskBadge({ level, className = "" }: RiskBadgeProps) {
  const variants = {
    high: "bg-[#C0392B]/10 text-[#C0392B] border-[#C0392B]/30",
    medium: "bg-[#E07B54]/10 text-[#E07B54] border-[#E07B54]/30",
    low: "bg-[#5B8C5A]/10 text-[#5B8C5A] border-[#5B8C5A]/30",
  };

  const labels = {
    high: "High Risk",
    medium: "Medium Risk",
    low: "Low Risk",
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${variants[level]} ${className}`}>
      {labels[level]}
    </span>
  );
}

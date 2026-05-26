import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  variant?: "red" | "bark" | "coral" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

export function Button({
  children,
  variant = "red",
  size = "md",
  className = "",
  onClick,
  type = "button",
  disabled = false,
}: ButtonProps) {
  const variants = {
    red: "bg-[#C0392B] text-white hover:bg-[#A93226] shadow-sm",
    bark: "bg-[#2C1A0E] text-white hover:bg-[#3D2917] shadow-sm",
    coral: "bg-[#E8845A] text-white hover:bg-[#E07B54] shadow-sm",
    outline: "border-2 border-[#C0392B] text-[#C0392B] hover:bg-[#C0392B] hover:text-white",
    ghost: "text-[#2C1A0E] hover:bg-[#F0E8DE]",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-2.5",
    lg: "px-8 py-3 text-lg",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}

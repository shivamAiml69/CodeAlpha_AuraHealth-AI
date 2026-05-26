interface InputProps {
  label?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export function Input({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  className = "",
}: InputProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && <label className="text-sm font-medium text-[#2C1A0E]">{label}</label>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="px-4 py-2.5 rounded-lg border border-[#E2D5C8] bg-[#F0E8DE] text-[#2C1A0E] placeholder:text-[#C9A882] focus:outline-none focus:ring-2 focus:ring-[#C0392B] focus:border-transparent"
      />
    </div>
  );
}

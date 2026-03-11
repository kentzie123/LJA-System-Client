import React, { useRef } from "react";
import { Calendar } from "lucide-react";

const CustomDatePicker = ({ value, onChange, label, placeholder = "Select Date", className = "" }) => {
  const inputRef = useRef(null);

  const formatDisplayDate = (dateString) => {
    if (!dateString) return placeholder;
    const [year, month, day] = dateString.split("-");
    const dateObj = new Date(year, month - 1, day);
    return dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const handleOpenPicker = () => {
    try { inputRef.current?.showPicker(); } catch { inputRef.current?.focus(); }
  };

  return (
    <div className={`flex flex-col w-full ${className}`}>
      {label && (
        <label className="text-[9px] font-bold uppercase tracking-wider opacity-50 mb-0.5 pl-1">
          {label}
        </label>
      )}
      
      <div 
        className="relative flex items-center h-8 w-full bg-base-100 border border-base-300 rounded-md shadow-sm focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all cursor-pointer"
        onClick={handleOpenPicker}
      >
        <Calendar size={12} className="absolute left-2.5 text-base-content/40 z-10 pointer-events-none" />
        
        <span className="absolute left-8 right-2 text-[12px] font-medium text-base-content truncate pointer-events-none">
          {formatDisplayDate(value)}
        </span>

        <input
          ref={inputRef}
          type="date"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
        />
      </div>
    </div>
  );
};

export default CustomDatePicker;
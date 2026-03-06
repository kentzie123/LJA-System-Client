import React, { useRef } from "react";
import { Calendar } from "lucide-react";

const CustomDatePicker = ({ 
  value, 
  onChange, 
  label, // <-- ADDED THIS PROP
  placeholder = "Select Date", 
  className = "" 
}) => {
  const inputRef = useRef(null);

  const formatDisplayDate = (dateString) => {
    if (!dateString) return placeholder;
    const [year, month, day] = dateString.split("-");
    const dateObj = new Date(year, month - 1, day);
    
    return dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleOpenPicker = (e) => {
    if (inputRef.current && inputRef.current.showPicker) {
      try {
        inputRef.current.showPicker();
      } catch (error) {
        inputRef.current.focus();
      }
    }
  };

  return (
    <div className={`flex flex-col w-full ${className}`}>
      {/* RENDER LABEL IF PROVIDED */}
      {label && (
        <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1 pl-1">
          {label}
        </label>
      )}
      
      <div 
        className="relative flex items-center h-10 w-full bg-base-100 border border-base-300 rounded-lg shadow-sm focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 hover:border-base-content/30 transition-all cursor-pointer"
        onClick={handleOpenPicker}
      >
        <Calendar size={14} className="absolute left-3 text-base-content/40 z-10 pointer-events-none" />
        
        <span className="absolute left-9 right-3 text-sm font-medium text-base-content truncate pointer-events-none">
          {formatDisplayDate(value)}
        </span>

        <input
          ref={inputRef}
          type="date"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          onClick={handleOpenPicker}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
        />
      </div>
    </div>
  );
};

export default CustomDatePicker;
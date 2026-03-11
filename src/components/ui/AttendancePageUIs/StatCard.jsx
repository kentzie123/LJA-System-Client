import React from "react";

const StatCard = ({ icon, label, value, textClass = "text-base-content" }) => {
  return (
    <div className="bg-base-100 p-3.5 rounded-xl border border-base-300 shadow-sm relative overflow-hidden group hover:border-primary/30 transition-all duration-300">
      <div className="relative z-10 flex flex-col">
        {/* SMALLER, TIGHTER LABEL */}
        <p className="text-[9px] opacity-50 font-bold uppercase tracking-[0.15em] mb-0.5">
          {label}
        </p>
        
        {/* COMPACT VALUE: text-2xl is plenty for a pro dashboard */}
        <p className={`text-2xl font-black tracking-tight tabular-nums leading-none ${textClass}`}>
          {value}
        </p>
      </div>

      {/* REFINED BACKGROUND ICON */}
      <div className="absolute -right-2 -bottom-2 opacity-[0.04] group-hover:opacity-[0.08] group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 pointer-events-none">
        <div className="w-16 h-16 [&>svg]:w-full [&>svg]:h-full">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
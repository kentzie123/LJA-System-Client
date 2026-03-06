import React from "react";

const StatCard = ({ icon, label, value, textClass = "text-base-content" }) => {
  return (
    <div className="bg-base-100 p-5 rounded-2xl border border-base-300 shadow-sm relative overflow-hidden group hover:border-primary/30 transition-colors">
      <div className="relative z-10 flex flex-col">
        <p className="text-[11px] opacity-60 font-bold uppercase tracking-widest mb-1">
          {label}
        </p>
        <p className={`text-3xl font-black tracking-tight tabular-nums ${textClass}`}>
          {value}
        </p>
      </div>
      <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.06] group-hover:scale-110 transition-all duration-500 pointer-events-none">
        <div className="w-24 h-24 [&>svg]:w-full [&>svg]:h-full">{icon}</div>
      </div>
    </div>
  );
};

export default StatCard;
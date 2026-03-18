"use client";

import { Cake, ShieldCheck, Bell, Sparkles, Megaphone, Coffee } from "lucide-react";

const CalendarEventItem = ({ event, onClick }) => {
  const getEventConfig = () => {
    switch (event.event_type) {
      case "Regular Holiday":
        return {
          // Strong Red - High urgency for Payroll/Scheduling
          wrapper: "bg-rose-600 text-white shadow-sm border border-rose-700",
          icon: <ShieldCheck size={10} className="text-white/90 sm:w-2.5 sm:h-2.5" />,
          leftBar: "hidden", 
        };
      case "Special Non-Working":
        return {
          // Vivid Amber/Yellow - Distinct warning color
          wrapper: "bg-amber-400 text-amber-950 shadow-sm border border-amber-500",
          icon: <Coffee size={10} className="text-amber-900/80 sm:w-2.5 sm:h-2.5" />,
          leftBar: "hidden", 
        };
      case "Birthday":
        return {
          // Festive Pink/Fuchsia - Subtle and celebratory
          wrapper: "bg-fuchsia-500/15 text-fuchsia-700 border border-fuchsia-200",
          icon: <Cake size={10} className="text-fuchsia-600 sm:w-2.5 sm:h-2.5" />,
          leftBar: "bg-fuchsia-500",
        };
      case "Company Event":
        return {
          // Professional Indigo/Blue - Standard corporate color
          wrapper: "bg-indigo-500/10 text-indigo-700 border border-indigo-200",
          icon: <Megaphone size={10} className="text-indigo-600 sm:w-2.5 sm:h-2.5" />,
          leftBar: "bg-indigo-600",
        };
      default:
        return {
          wrapper: "bg-slate-100 text-slate-600 border border-slate-300",
          icon: <Bell size={10} className="sm:w-2.5 sm:h-2.5" />,
          leftBar: "bg-slate-400",
        };
    }
  };

  const config = getEventConfig();

  return (
    <div
      title={`${event.event_type}: ${event.title}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick && onClick(event);
      }}
      className={`
        group relative flex w-full items-center gap-1 sm:gap-1.5 overflow-hidden
        rounded-[3px] sm:rounded-[4px] px-1.5 sm:px-2 py-0.5 sm:py-1 
        text-[8.5px] sm:text-[9.5px] font-bold leading-none 
        transition-all duration-200 hover:brightness-90 active:scale-95
        cursor-pointer select-none ${config.wrapper}
      `}
    >
      {config.leftBar !== "hidden" && (
        <div className={`absolute left-0 top-0 h-full w-[2.5px] ${config.leftBar}`} />
      )}
      
      <span className={`shrink-0 flex items-center justify-center ${config.leftBar !== 'hidden' ? 'ml-0.5' : ''}`}>
        {config.icon}
      </span>
      
      <span className="truncate tracking-tight pb-px">
        {event.title}
      </span>

      {event.event_type === "Birthday" && (
        <Sparkles size={8} className="ml-auto text-fuchsia-400 animate-pulse shrink-0 hidden sm:block" />
      )}
    </div>
  );
};

export default CalendarEventItem;
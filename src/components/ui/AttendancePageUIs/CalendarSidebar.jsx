"use client";

import React from "react";
import { Briefcase, Building, Download } from "lucide-react"; 
import UserSelectDropdown from "@/components/ui/Selections/UserSelectDropdown";

const CalendarSidebar = ({ 
  users, 
  activeUser, 
  onSelectEmployee, 
  onExport, 
  showExport, 
  canManualEntry 
}) => {
  
  // --- FILTER OUT ADMINS (Role ID = 1) ---
  const employeesOnly = users?.filter(user => user.role_id !== 1) || [];

  return (
    <div className="w-full xl:w-[280px] shrink-0 flex flex-col gap-4 sm:gap-6">
      
      {/* 1. Select Employee Dropdown (Only visible if canManualEntry = true) */}
      {canManualEntry && (
        <div className="relative z-50 animate-in fade-in">
          <label className="text-xs sm:text-sm font-bold text-base-content mb-2 block tracking-wide">
            Select Employee
          </label>
          <UserSelectDropdown 
            users={employeesOnly} // <-- PASSED FILTERED LIST HERE
            value={activeUser?.id || ""} 
            onChange={(selectedId) => onSelectEmployee && onSelectEmployee(selectedId)} 
          />
        </div>
      )}

      {/* 2. Employee Profile Card (Responsive Layout) */}
      <div className="bg-base-100 border border-base-300 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row xl:flex-col items-center sm:items-start xl:items-center text-center sm:text-left xl:text-center shadow-sm gap-4 xl:gap-0 relative z-10">
        
        {/* Avatar */}
        <div className="relative mb-0 xl:mb-4 shrink-0">
          <div className="w-20 sm:w-24 h-20 sm:h-24 rounded-full border-2 border-primary/20 p-1">
            <div className="w-full h-full rounded-full overflow-hidden bg-base-300 border-2 border-primary relative">
              <img 
                src={activeUser?.profile_picture || "/images/default_profile.jpg"} 
                alt={activeUser?.fullname || "Employee"} 
                className="w-full h-full object-cover"
                onError={(e) => { e.target.onerror = null; e.target.src = "/images/default_profile.jpg"; }}
              />
            </div>
          </div>
        </div>
        
        {/* Info & Details */}
        <div className="flex-1 min-w-0 w-full">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight mb-1 text-base-content truncate">
            {activeUser?.fullname || "No Employee"}
          </h2>
          <p className="text-xs text-base-content/60 mb-4 sm:mb-0 xl:mb-6 truncate w-full">
            {activeUser?.email || "No email available"}
          </p>

          <div className="w-full flex flex-col sm:flex-row xl:flex-col gap-2 sm:gap-4 xl:gap-3 pt-0 sm:pt-4 xl:pt-5 border-t-0 sm:border-t border-base-300 text-left justify-center sm:justify-start xl:justify-center">
            <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3 text-xs sm:text-sm text-base-content/80 font-medium">
              <Briefcase size={16} className="text-primary shrink-0" />
              <span className="truncate">{activeUser?.position || "Staff"}</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3 text-xs sm:text-sm text-base-content/80 font-medium">
              <Building size={16} className="text-primary shrink-0" />
              <span className="truncate">{activeUser?.branch || "Headquarters"}</span>
            </div>
          </div>

          {/* EXPORT DTR BUTTON */}
          {showExport && (
            <div className="w-full pt-4 xl:pt-5 mt-4 xl:mt-5 border-t border-base-300">
              <button 
                onClick={onExport}
                className="btn btn-success btn-sm sm:btn-md w-full text-success-content font-bold tracking-wide shadow-sm"
              >
                <Download size={16} className="mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm">Export DTR</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Color Legend */}
      <div className="bg-base-100 border border-base-300 rounded-2xl p-4 sm:p-5 shadow-sm relative z-0">
        <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-base-content/50 mb-3 sm:mb-4">Legend</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-2 gap-y-2 sm:gap-y-3 gap-x-2">
          <LegendItem dotColor="bg-emerald-500" bgClass="bg-emerald-500/15" textClass="text-emerald-600 dark:text-emerald-500" label="Present" />
          <LegendItem dotColor="bg-rose-500" bgClass="bg-rose-500/15" textClass="text-rose-600 dark:text-rose-500" label="Absent" />
          <LegendItem dotColor="bg-fuchsia-500" bgClass="bg-fuchsia-500/15" textClass="text-fuchsia-600 dark:text-fuchsia-500" label="Leave" />
          <LegendItem dotColor="bg-amber-500" bgClass="bg-amber-500/15" textClass="text-amber-600 dark:text-amber-500" label="Late" />
          <LegendItem dotColor="bg-sky-500" bgClass="bg-sky-500/15" textClass="text-sky-600 dark:text-sky-500" label="Half-day" />
          <LegendItem dotColor="bg-indigo-500" bgClass="bg-indigo-500/15" textClass="text-indigo-600 dark:text-indigo-500" label="Overtime" />
        </div>
      </div>
    </div>
  );
};

const LegendItem = ({ dotColor, bgClass, textClass, label }) => (
  <div className={`flex items-center gap-1.5 sm:gap-2.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-transparent ${bgClass}`}>
    <div className={`size-2 sm:size-2.5 rounded-full shrink-0 ${dotColor}`} />
    <span className={`text-[9px] sm:text-[11px] font-bold tracking-wide truncate ${textClass}`}>{label}</span>
  </div>
);

export default CalendarSidebar;
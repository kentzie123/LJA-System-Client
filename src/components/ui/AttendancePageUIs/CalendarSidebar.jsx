"use client";

import React, { useMemo } from "react";
import { Briefcase, Download } from "lucide-react"; 
import UserSelectDropdown from "@/components/ui/Selections/UserSelectDropdown";

import Image from "next/image";
import { getImageUrl } from "@/utils/getImageUrl";

const CalendarSidebar = ({ 
  users, 
  activeUser, 
  onSelectEmployee, 
  onExport, 
  showExport, 
  canManualEntry 
}) => {
  
  // --- FILTER OUT ADMINS (Role ID = 1) & SORT A-Z ---
  const employeesOnly = useMemo(() => {
    return (users || [])
      .filter(user => user.role_id !== 1)
      .sort((a, b) => (a.fullname || "").localeCompare(b.fullname || ""));
  }, [users]);

  return (
    // Reduced width from 280px to 240px to give the grid more room
    <div className="w-full xl:w-[240px] shrink-0 flex flex-col gap-3 antialiased-text">
      
      {/* 1. Select Employee Dropdown */}
      {canManualEntry && (
        <div className="relative z-50 animate-in fade-in">
          <label className="text-[9px] font-bold text-base-content/50 mb-1 block uppercase tracking-widest">
            Select Employee
          </label>
          <UserSelectDropdown 
            users={employeesOnly}
            value={activeUser?.id || ""} 
            onChange={(selectedId) => onSelectEmployee && onSelectEmployee(selectedId)} 
          />
        </div>
      )}

      {/* 2. Compact Employee Profile Card */}
      <div className="bg-base-100 border border-base-300 rounded-xl p-4 flex flex-col sm:flex-row xl:flex-col items-center sm:items-start xl:items-center text-center sm:text-left xl:text-center shadow-sm gap-3 relative z-10">
        
        {/* Shrunk Avatar */}
        <div className="relative shrink-0">
          <div className="w-16 h-16 rounded-full border-2 border-primary/20 p-0.5">
            <div className="w-full h-full rounded-full overflow-hidden bg-base-300 border border-primary relative">
              <Image 
                src={activeUser?.profile_picture ? getImageUrl(activeUser.profile_picture) : "/images/default_profile.jpg"} 
                alt={activeUser?.fullname || "Employee"} 
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
          </div>
        </div>
        
        {/* Info & Details */}
        <div className="flex-1 min-w-0 w-full flex flex-col items-center sm:items-start xl:items-center">
          <h2 className="text-sm font-bold tracking-tight text-base-content truncate w-full">
            {activeUser?.fullname || "No Employee"}
          </h2>
          <p className="text-[10px] text-base-content/50 truncate w-full mt-0.5">
            {activeUser?.email || "No email available"}
          </p>

          <div className="w-full pt-3 mt-3 border-t border-base-200">
            <div className="flex items-center justify-center sm:justify-start xl:justify-center gap-1.5 text-[11px] text-base-content/70 font-medium">
              <Briefcase size={12} className="text-primary shrink-0" />
              <span className="truncate">{activeUser?.position || "Staff"}</span>
            </div>
          </div>

          {/* EXPORT DTR BUTTON (h-8 standard) */}
          {showExport && (
            <div className="w-full pt-3 mt-3 border-t border-base-200">
              <button 
                onClick={onExport}
                className="btn btn-success btn-sm h-8 min-h-0 w-full text-success-content font-bold tracking-widest text-[9px] uppercase shadow-sm rounded-md"
              >
                <Download size={12} className="mr-1" />
                Export DTR
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Ultra-Compact Color Legend */}
      <div className="bg-base-100 border border-base-300 rounded-xl p-3 shadow-sm relative z-0">
        <h3 className="text-[9px] font-black uppercase tracking-widest text-base-content/40 mb-2">Legend</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-2 gap-1.5">
          <LegendItem dotColor="bg-emerald-500" bgClass="bg-emerald-500/10" textClass="text-emerald-600 dark:text-emerald-500" label="Present" />
          <LegendItem dotColor="bg-rose-500" bgClass="bg-rose-500/10" textClass="text-rose-600 dark:text-rose-500" label="Absent" />
          <LegendItem dotColor="bg-fuchsia-500" bgClass="bg-fuchsia-500/10" textClass="text-fuchsia-600 dark:text-fuchsia-500" label="Leave" />
          <LegendItem dotColor="bg-amber-500" bgClass="bg-amber-500/10" textClass="text-amber-600 dark:text-amber-500" label="Late" />
          <LegendItem dotColor="bg-sky-500" bgClass="bg-sky-500/10" textClass="text-sky-600 dark:text-sky-500" label="Half-day" />
          <LegendItem dotColor="bg-indigo-500" bgClass="bg-indigo-500/10" textClass="text-indigo-600 dark:text-indigo-500" label="Overtime" />
        </div>
      </div>
    </div>
  );
};

// Shrunk Legend Item
const LegendItem = ({ dotColor, bgClass, textClass, label }) => (
  <div className={`flex items-center gap-1.5 px-2 py-1 rounded border border-transparent ${bgClass}`}>
    <div className={`size-1.5 rounded-full shrink-0 ${dotColor}`} />
    <span className={`text-[8px] font-bold tracking-widest uppercase truncate ${textClass}`}>{label}</span>
  </div>
);

export default CalendarSidebar;
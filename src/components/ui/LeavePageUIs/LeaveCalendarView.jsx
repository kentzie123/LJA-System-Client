"use client";

import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Briefcase, User } from "lucide-react";
import Image from "next/image";
import { getImageUrl } from "@/utils/getImageUrl";
import { useAuthStore } from "@/stores/useAuthStore";
import CalendarLeaveDetailsModal from "./CalendarLeaveDetailsModal";

// --- HELPERS ---
const getSafeDate = (dateString) => {
  if (!dateString) return new Date();
  const safeString = dateString.includes("T") ? dateString : `${dateString}T00:00:00`;
  return new Date(safeString);
};

const getLeaveDetails = (leaveName, dbColorCode) => {
  const name = (leaveName || "").toLowerCase();
  let icon = "📅"; 
  if (name.includes("sick")) icon = "🤒";
  else if (name.includes("paid") || name.includes("vacation")) icon = "🌴";
  else if (name.includes("casual")) icon = "🏄";
  return { icon, color: dbColorCode || "#094C8A" };
};

const LeaveCalendarView = ({ leaves, filterDate, setFilterDate }) => {
  const { authUser } = useAuthStore();
  const canApprove = authUser?.role?.perm_leave_approve === true;

  const [selectedLeave, setSelectedLeave] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [year, month] = filterDate.split("-").map(Number);
  
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month;
  const currentDay = today.getDate();

  const daysInMonth = useMemo(() => {
    const date = new Date(year, month, 0);
    const numDays = date.getDate();

    return Array.from({ length: numDays }, (_, i) => {
      const currentDate = new Date(year, month - 1, i + 1);
      const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
      const isToday = isCurrentMonth && (i + 1) === currentDay;

      return {
        dayNumber: i + 1,
        dayName: currentDate.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
        isWeekend,
        isToday
      };
    });
  }, [year, month, isCurrentMonth, currentDay]);

  const employeeRows = useMemo(() => {
    if (!leaves) return [];
    const grouped = leaves.reduce((acc, leave) => {
      if (leave.status !== "Approved" && leave.status !== "Pending") return acc;
      if (!acc[leave.user_id]) {
        acc[leave.user_id] = {
          user_id: leave.user_id,
          fullname: leave.fullname || "Unknown Employee",
          initials: leave.fullname ? leave.fullname.substring(0, 2).toUpperCase() : "??",
          position: leave.position || "Staff",
          profile_picture: leave.profile_picture,
          leaves: [],
        };
      }
      acc[leave.user_id].leaves.push(leave);
      return acc;
    }, {});
    return Object.values(grouped);
  }, [leaves]);

  const getGridPlacement = (leave) => {
    const start = getSafeDate(leave.start_date);
    const end = getSafeDate(leave.end_date);
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0);
    
    if (end < monthStart || start > monthEnd) return null;
    
    const effectiveStart = start < monthStart ? monthStart : start;
    const effectiveEnd = end > monthEnd ? monthEnd : end;
    const startCol = effectiveStart.getDate();
    const span = effectiveEnd.getDate() - effectiveStart.getDate() + 1;
    
    return { gridColumn: `${startCol} / span ${span}` };
  };

  const handlePrevMonth = () => {
    const prev = new Date(year, month - 2, 1);
    setFilterDate(`${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}`);
  };

  const handleNextMonth = () => {
    const next = new Date(year, month, 1);
    setFilterDate(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`);
  };

  const handleJumpToToday = () => {
    setFilterDate(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`);
  };

  return (
    <div className="bg-base-100 rounded-xl border border-base-200 shadow-sm overflow-hidden flex flex-col h-full relative antialiased-text">
      
      {/* TOOLBAR HEADER */}
      <div className="px-3 py-2.5 border-b border-base-200 flex items-center justify-between bg-base-100 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 rounded-md text-primary hidden sm:block">
            <CalendarIcon size={14} />
          </div>
          <div className="flex flex-col">
            <h2 className="text-[12px] font-black text-base-content uppercase tracking-widest leading-none">
              Team Planner
            </h2>
            <p className="text-[8px] font-bold text-base-content/40 uppercase tracking-widest mt-1">
              Resource Timeline
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isCurrentMonth && (
            <button 
              onClick={handleJumpToToday}
              className="btn btn-xs h-7 min-h-0 btn-outline border-base-300 text-[9px] font-bold uppercase tracking-widest text-base-content/70"
            >
              Today
            </button>
          )}
          <div className="flex items-center bg-base-200/50 p-1 rounded-md border border-base-300/50">
            <button onClick={handlePrevMonth} className="btn btn-xs h-6 w-6 min-h-0 btn-ghost p-0 rounded">
              <ChevronLeft size={14} />
            </button>
            
            {/* --- FULLY CLICKABLE MONTH PICKER --- */}
            <div className="relative flex items-center justify-center w-24 cursor-pointer group">
              <span className="text-[10px] font-black text-base-content uppercase tracking-widest tabular-nums group-hover:text-primary transition-colors pointer-events-none">
                {new Date(year, month - 1).toLocaleString("default", { month: "short", year: "numeric" })}
              </span>
              <input 
                type="month" 
                value={filterDate}
                onChange={(e) => {
                  if (e.target.value) setFilterDate(e.target.value);
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
                title="Select a month"
              />
            </div>

            <button onClick={handleNextMonth} className="btn btn-xs h-6 w-6 min-h-0 btn-ghost p-0 rounded">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* TIMELINE CONTAINER */}
      <div className="flex-1 overflow-auto bg-base-100 custom-scrollbar relative">
        <div className="min-w-max">
          
          {/* HEADER ROW */}
          <div className="flex border-b border-base-200 sticky top-0 z-40 bg-base-100 shadow-sm">
            {/* RESPONSIVE HEADER COLUMN: Shrinks on mobile */}
            <div className="w-[52px] sm:w-[160px] shrink-0 px-2 sm:px-3 py-2 border-r border-base-200 flex items-center justify-center sm:justify-start sticky left-0 z-50 bg-base-100">
              <span className="hidden sm:inline text-[8px] font-black text-base-content/40 tracking-[0.2em] uppercase">Team Member</span>
              <User size={14} strokeWidth={2.5} className="sm:hidden text-base-content/40" />
            </div>

            <div className="grid flex-1" style={{ gridTemplateColumns: `repeat(${daysInMonth.length}, minmax(50px, 1fr))` }}>
              {daysInMonth.map((day) => (
                <div 
                  key={day.dayNumber} 
                  className={`flex flex-col items-center justify-center py-2 border-r border-base-200/50 
                    ${day.isToday ? "bg-primary/10 border-b-2 border-b-primary" : day.isWeekend ? "bg-base-200/40" : ""}`
                  }
                >
                  <span className={`text-[12px] font-black tabular-nums leading-none ${day.isToday ? "text-primary" : day.isWeekend ? "opacity-30" : "text-base-content"}`}>
                    {day.dayNumber}
                  </span>
                  <span className={`text-[8px] font-bold tracking-widest uppercase mt-0.5 ${day.isToday ? "text-primary/70" : day.isWeekend ? "opacity-30" : "text-base-content/40"}`}>
                    {day.dayName}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* EMPLOYEE ROWS */}
          {employeeRows.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center h-48 opacity-40">
               <Briefcase size={24} className="mb-2" />
               <p className="text-[10px] font-black uppercase tracking-widest">No scheduled leaves</p>
            </div>
          ) : (
            employeeRows.map((row) => (
              <div key={row.user_id} className="flex border-b border-base-200/70 group hover:bg-base-200/20 transition-colors">
                
                {/* STICKY MEMBER COLUMN: Responsive Width */}
                <div className="w-[52px] sm:w-[160px] shrink-0 px-2 sm:px-3 py-2 border-r border-base-200 flex items-center justify-center sm:justify-start gap-2.5 sticky left-0 z-30 bg-base-100 group-hover:bg-base-200/40 transition-colors shadow-[4px_0_12px_-4px_rgba(0,0,0,0.05)]">
                  
                  {/* MOBILE VIEW: Clickable Dropdown Avatar */}
                  <div className="sm:hidden dropdown dropdown-right">
                    <div tabIndex={0} role="button" className="avatar block hover:opacity-80 transition-opacity">
                      <div className="w-7 h-7 relative rounded-full ring-1 ring-base-300 bg-base-200 overflow-hidden flex items-center justify-center">
                        {row.profile_picture ? (
                          <Image src={getImageUrl(row.profile_picture)} alt={row.fullname} fill sizes="28px" className="object-cover" />
                        ) : (
                          <span className="text-[9px] font-black uppercase tracking-tighter">{row.initials}</span>
                        )}
                      </div>
                    </div>
                    {/* The popout card that appears on tap */}
                    <div tabIndex={0} className="dropdown-content z-[100] ml-2 p-2.5 shadow-xl bg-base-100 border border-base-200 rounded-lg w-max flex flex-col">
                      <span className="text-[11px] font-black text-base-content leading-none">{row.fullname}</span>
                      <span className="text-[8px] font-bold text-base-content/50 uppercase tracking-widest mt-1">{row.position}</span>
                    </div>
                  </div>

                  {/* DESKTOP VIEW: Standard Layout */}
                  <div className="hidden sm:flex items-center gap-2.5 min-w-0 w-full">
                    <div className="avatar shrink-0">
                      <div className="w-7 h-7 relative rounded-full ring-1 ring-base-300 bg-base-200 overflow-hidden flex items-center justify-center">
                        {row.profile_picture ? (
                          <Image src={getImageUrl(row.profile_picture)} alt={row.fullname} fill sizes="28px" className="object-cover" />
                        ) : (
                          <span className="text-[9px] font-black uppercase tracking-tighter">{row.initials}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[11px] font-bold text-base-content truncate leading-tight group-hover:text-primary transition-colors">
                        {row.fullname}
                      </span>
                      <span className="text-[8px] font-bold text-base-content/40 tracking-widest uppercase truncate mt-0.5">
                        {row.position}
                      </span>
                    </div>
                  </div>

                </div>

                {/* DAYS GRID & LEAVE PILLS */}
                <div className="grid flex-1 relative py-1.5" style={{ gridTemplateColumns: `repeat(${daysInMonth.length}, minmax(50px, 1fr))` }}>
                  {daysInMonth.map((day) => (
                     <div 
                      key={day.dayNumber} 
                      className={`border-r border-base-200/30 ${day.isToday ? "bg-primary/5" : day.isWeekend ? "bg-base-200/20" : ""}`} 
                    />
                  ))}

                  {row.leaves.map((leave) => {
                    const placement = getGridPlacement(leave);
                    if (!placement) return null;

                    const leaveTypeName = leave.leave_type || "Leave";
                    const details = getLeaveDetails(leaveTypeName, leave.color_code);
                    const isPending = leave.status === "Pending";

                    return (
                      <div key={leave.id} className="z-10 px-0.5 py-0.5 h-full min-h-[42px]" style={{ ...placement, gridRow: 1 }}>
                        <div
                          onClick={() => {
                            setSelectedLeave(leave);
                            setIsModalOpen(true);
                          }}
                          className={`h-full w-full rounded-[4px] border-l-2 shadow-sm flex flex-col justify-center px-1.5 cursor-pointer transition-all hover:brightness-95 active:scale-[0.98] overflow-hidden ${
                            isPending ? 'border-dashed border-l-2 opacity-70' : ''
                          }`}
                          style={{ borderLeftColor: details.color, backgroundColor: `${details.color}1a` }}
                        >
                          <div className="flex flex-col w-full overflow-hidden">
                            {/* Icon & Title Row */}
                            <div className="text-[9px] font-black flex items-center gap-1 truncate tracking-wider leading-none" style={{ color: details.color }}>
                              <span className="text-[11px] shrink-0">{details.icon}</span> 
                              <span className="truncate uppercase mt-[1px]">{leaveTypeName}</span>
                              {isPending && <span className="opacity-60 font-bold ml-0.5 mt-[1px] shrink-0">(WAIT)</span>}
                            </div>
                            
                            {/* Notes/Reason Row */}
                            <span 
                              className="text-[8px] font-semibold truncate mt-1 leading-tight hidden sm:block mix-blend-multiply" 
                              style={{ color: details.color, opacity: 0.6 }}
                            >
                              {leave.reason || "No reason provided"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <CalendarLeaveDetailsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedLeave={selectedLeave}
        canApprove={canApprove}
      />
    </div>
  );
};

export default LeaveCalendarView;
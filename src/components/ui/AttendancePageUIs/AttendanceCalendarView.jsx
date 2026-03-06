"use client";

import React, { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle, Coffee, AlertCircle, XCircle, Timer, Loader2 } from "lucide-react";
import CalendarSidebar from "./CalendarSidebar";
import CalendarDetailsModal from "./CalendarDetailsModal";
import { useAttendanceStore } from "@/stores/useAttendanceStore";

export const getStatusColors = (status) => {
  switch (status) {
    case 'Present':  return { bg: 'bg-emerald-500/15', text: 'text-emerald-500', dotClass: 'bg-emerald-500', border: 'border-emerald-500/20', icon: CheckCircle }; 
    case 'Late':     return { bg: 'bg-amber-500/15', text: 'text-amber-500', dotClass: 'bg-amber-500', border: 'border-amber-500/20', icon: AlertCircle }; 
    case 'Absent':   return { bg: 'bg-rose-500/15', text: 'text-rose-500', dotClass: 'bg-rose-500', border: 'border-rose-500/20', icon: XCircle }; 
    case 'Leave':    return { bg: 'bg-fuchsia-500/15', text: 'text-fuchsia-500', dotClass: 'bg-fuchsia-500', border: 'border-fuchsia-500/20', icon: Coffee }; 
    case 'Half-day': return { bg: 'bg-sky-500/15', text: 'text-sky-500', dotClass: 'bg-sky-500', border: 'border-sky-500/20', icon: AlertCircle }; 
    case 'Overtime': return { bg: 'bg-indigo-500/15', text: 'text-indigo-500', dotClass: 'bg-indigo-500', border: 'border-indigo-500/20', icon: Timer }; 
    default:         return { bg: 'bg-base-200/50', text: 'text-base-content/40', dotClass: 'bg-transparent', border: 'border-base-300', icon: null }; 
  }
};

const AttendanceCalendarView = ({ 
  users, 
  selectedEmployee, 
  onSelectEmployee, 
  onExport,
  showExport,
  canVerify,
  canManualEntry,
  authUser
}) => {
  const { fetchCalendarData, calendarData, isFetchingCalendar } = useAttendanceStore();
  
  const activeUser = selectedEmployee || authUser || users?.[0];
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCell, setSelectedCell] = useState(null);

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const handleToday = () => setCurrentDate(new Date());

  // --- AUTOMATICALLY FETCH DATA ON MOUNT AND WHEN MONTH/USER CHANGES ---
  useEffect(() => {
    if (activeUser?.id) {
      fetchCalendarData(
        activeUser.id, 
        currentDate.getFullYear(), 
        currentDate.getMonth() // 0-indexed month for the API
      );
    }
  }, [activeUser?.id, currentDate.getFullYear(), currentDate.getMonth(), fetchCalendarData]);

  const calendarGrid = useMemo(() => {
    if (!activeUser) return [];

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay(); 
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    // Pull from the store's dedicated calendar state
    const userAttendances = calendarData.attendances || [];
    const userLeaves = calendarData.leaves || [];
    const userOT = calendarData.overtime || [];

    const grid = [];

    const getDateStr = (dbDate) => {
      if (!dbDate) return null;
      const d = new Date(dbDate);
      const localYear = d.getFullYear();
      const localMonth = String(d.getMonth() + 1).padStart(2, '0');
      const localDay = String(d.getDate()).padStart(2, '0');
      return `${localYear}-${localMonth}-${localDay}`;
    };

    const checkTimeFlag = (timeString, type) => {
      if (!timeString) return false;
      const [hours, minutes] = timeString.split(":").map(Number);
      const totalMinutes = hours * 60 + minutes;
      if (type === "in") return totalMinutes > 495;
      if (type === "out") return totalMinutes < 1020;
      return false;
    };

    const formatTimeShort = (timeStr) => {
      if (!timeStr) return null;
      const [hours, minutes] = timeStr.split(":");
      const date = new Date();
      date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
      return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    };

    for (let i = firstDayOfMonth - 1; i >= 0; i--) grid.push({ day: daysInPrevMonth - i, month: month - 1, year: month === 0 ? year - 1 : year, isFaded: true });
    for (let i = 1; i <= daysInMonth; i++) grid.push({ day: i, month: month, year: year, isFaded: false });
    const paddingEnd = (grid.length > 35 ? 42 : 35) - grid.length;
    for (let i = 1; i <= paddingEnd; i++) grid.push({ day: i, month: month + 1, year: month === 11 ? year + 1 : year, isFaded: true });

    const todayStr = new Date().toDateString();

    return grid.map(cell => {
      const cellDateObj = new Date(cell.year, cell.month, cell.day);
      const cellDateString = `${cell.year}-${String(cell.month + 1).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}`;
      
      const isToday = cellDateObj.toDateString() === todayStr;
      const isWeekend = cellDateObj.getDay() === 0 || cellDateObj.getDay() === 6;
      const isPast = cellDateObj < new Date(new Date().setHours(0,0,0,0));

      let status = null;

      const hasLeave = userLeaves.find(l => cellDateString >= getDateStr(l.start_date) && cellDateString <= getDateStr(l.end_date));
      const hasOT = userOT.find(o => getDateStr(o.ot_date) === cellDateString);
      const record = userAttendances.find(a => getDateStr(a.date) === cellDateString);

      if (hasLeave) {
        status = 'Leave';
      } else if (record) {
        if (hasOT) {
          status = 'Overtime';
        } else {
          const isLate = checkTimeFlag(record.time_in, "in");
          const isUndertime = checkTimeFlag(record.time_out, "out");
          if (isLate) status = 'Late';
          else if (isUndertime) status = 'Half-day';
          else status = 'Present';
        }
      } else if (!cell.isFaded && isPast && !isWeekend) {
        status = 'Absent';
      }

      return { ...cell, isToday, status, in: record ? formatTimeShort(record.time_in) : null, out: record ? formatTimeShort(record.time_out) : null, record: record || null, leave: hasLeave || null, dateObj: cellDateObj };
    });
  }, [currentDate, activeUser, calendarData]);

  return (
    <div className="flex flex-col xl:flex-row gap-6 animate-in fade-in duration-500 font-sans text-base-content">
      
      {/* 1. SEPARATED SIDEBAR */}
      <CalendarSidebar 
        users={users} 
        activeUser={activeUser} 
        onSelectEmployee={onSelectEmployee} 
        onExport={onExport} 
        showExport={showExport} 
        canVerify={canVerify}
        canManualEntry={canManualEntry}
      />

      {/* 2. MAIN CALENDAR */}
      <div className="relative flex-1 bg-base-100 border border-base-300 rounded-2xl overflow-hidden flex flex-col min-h-[500px] shadow-sm">
        
        {/* Loading Overlay */}
        {isFetchingCalendar && (
          <div className="absolute inset-0 z-50 bg-base-100/50 backdrop-blur-[1px] flex items-center justify-center">
            <Loader2 className="animate-spin text-primary size-8" />
          </div>
        )}

        {/* Calendar Header */}
        <div className="px-4 sm:px-8 py-4 sm:py-6 flex flex-row items-center justify-between gap-4 border-b border-base-200">
          <div className="flex items-center gap-2 sm:gap-3">
            <CalendarIcon className="text-primary size-5 sm:size-6 shrink-0" strokeWidth={2.5} />
            <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-base-content tabular-nums truncate">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button onClick={handlePrevMonth} className="p-1.5 sm:p-2 rounded-lg text-base-content/60 hover:text-base-content hover:bg-base-200 transition-colors"><ChevronLeft size={20} strokeWidth={3} /></button>
            <button onClick={handleToday} className="px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-base-200 hover:bg-base-300 text-xs sm:text-sm font-bold text-base-content transition-colors">Today</button>
            <button onClick={handleNextMonth} className="p-1.5 sm:p-2 rounded-lg text-base-content/60 hover:text-base-content hover:bg-base-200 transition-colors"><ChevronRight size={20} strokeWidth={3} /></button>
          </div>
        </div>

        {/* Calendar Grid UI */}
        <div className="p-3 sm:p-4 lg:p-6 flex-1 flex flex-col">
          <div className="grid grid-cols-7 mb-2 sm:mb-3">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-base-content/50">{day.substring(0, 3)}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 lg:gap-3 flex-1">
            {calendarGrid.map((data, i) => <CalendarCell key={i} data={data} onClick={() => setSelectedCell(data)} />)}
          </div>
        </div>
      </div>

      {/* 3. SEPARATED MODAL */}
      <CalendarDetailsModal selectedCell={selectedCell} activeUser={activeUser} onClose={() => setSelectedCell(null)} getStatusColors={getStatusColors} />
    </div>
  );
};

// ==========================================
// RESPONSIVE CALENDAR CELL
// ==========================================
const CalendarCell = ({ data, onClick }) => {
  const colors = getStatusColors(data.status);
  const isClickable = data.record || data.leave;

  return (
    <div 
      onClick={() => isClickable && onClick(data)}
      className={`
        relative flex flex-col p-1.5 sm:p-2 lg:p-3 rounded-xl sm:rounded-xl transition-all 
        h-[72px] sm:h-auto sm:min-h-[80px] lg:min-h-[112px] 
        border border-transparent overflow-hidden
        ${colors.bg} 
        ${data.status ? colors.border : 'border-base-300 bg-base-200/30'}
        ${data.isToday ? '!border-primary ring-1 sm:ring-2 ring-primary/40 ring-offset-1 sm:ring-offset-2 ring-offset-base-100' : ''}
        ${data.isFaded ? 'opacity-40 grayscale-[50%]' : 'opacity-100'}
        ${isClickable ? 'cursor-pointer hover:shadow-md hover:scale-[1.02] active:scale-95' : ''}
      `}
    >
      {/* Day Number */}
      <div className={`text-xs sm:text-sm lg:text-base font-bold sm:mb-1 z-10
        ${data.isToday ? 'text-base-content' : (data.status ? colors.text : 'text-base-content/40')}
      `}>
        {data.day}
      </div>

      {/* DESKTOP TEXT: Status */}
      {data.status && (
        <div className={`hidden sm:block text-[10px] lg:text-[11px] font-bold ${colors.text} mb-1 truncate leading-none z-10`}>
          {data.status}
        </div>
      )}

      {/* DESKTOP TEXT: Time In/Out */}
      {data.in && data.out && (
        <div className={`hidden sm:flex mt-auto flex-col gap-0.5 text-[9px] lg:text-[10px] font-medium ${colors.text} opacity-80 leading-tight z-10`}>
          <span className="truncate">In: {data.in}</span>
          <span className="truncate">Out: {data.out}</span>
        </div>
      )}

      {/* MOBILE ONLY: Centered Dot Indicator */}
      {data.status && (
        <div className="absolute inset-0 flex items-center justify-center sm:hidden pointer-events-none mt-3">
          <div className={`w-2 h-2 rounded-full ${colors.dotClass}`} />
        </div>
      )}
    </div>
  );
};

export default AttendanceCalendarView;
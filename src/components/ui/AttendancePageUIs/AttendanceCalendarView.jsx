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
  
  const activeUser = useMemo(() => {
    if (selectedEmployee) return selectedEmployee;
    const staffOnly = users?.filter(u => u.role?.toLowerCase() !== 'admin')
      .sort((a, b) => a.name.localeCompare(b.name));
    return staffOnly?.[0] || authUser || users?.[0];
  }, [selectedEmployee, users, authUser]);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCell, setSelectedCell] = useState(null);

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const handleToday = () => setCurrentDate(new Date());

  useEffect(() => {
    if (activeUser?.id) {
      fetchCalendarData(activeUser.id, currentDate.getFullYear(), currentDate.getMonth());
    }
  }, [activeUser?.id, currentDate.getFullYear(), currentDate.getMonth(), fetchCalendarData]);

  const calendarGrid = useMemo(() => {
    if (!activeUser) return [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay(); 
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const { attendances = [], leaves = [], overtime = [] } = calendarData;
    const grid = [];

    const getDateStr = (dbDate) => {
      if (!dbDate) return null;
      const d = new Date(dbDate);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const checkTimeFlag = (timeString, type) => {
      if (!timeString) return false;
      const [hours, minutes] = timeString.split(":").map(Number);
      const totalMinutes = hours * 60 + minutes;
      if (type === "in") return totalMinutes > 495; // Late after 8:15 AM
      if (type === "out") return totalMinutes < 1020; // Half-day before 5:00 PM
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

    return grid.map(cell => {
      const cellDateObj = new Date(cell.year, cell.month, cell.day);
      const cellDateString = `${cell.year}-${String(cell.month + 1).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}`;
      const isToday = cellDateObj.toDateString() === new Date().toDateString();
      const isWeekend = cellDateObj.getDay() === 0 || cellDateObj.getDay() === 6;
      const isPast = cellDateObj < new Date(new Date().setHours(0,0,0,0));

      let status = null;
      let indicators = []; 

      const hasLeave = leaves.find(l => cellDateString >= getDateStr(l.start_date) && cellDateString <= getDateStr(l.end_date));
      const record = attendances.find(a => getDateStr(a.date) === cellDateString);

      // --- OVERNIGHT OVERTIME SPLITTING LOGIC ---
      let hasOT = null;
      const matchingOT = overtime.find(o => {
        const startStr = getDateStr(o.start_datetime);
        const endStr = getDateStr(o.end_datetime);
        // Match if the cell's date is anywhere between the start and end of the OT
        return cellDateString >= startStr && cellDateString <= endStr;
      });

      if (matchingOT) {
        const startStr = getDateStr(matchingOT.start_datetime);
        const endStr = getDateStr(matchingOT.end_datetime);

        // If the OT starts and ends on the same day, pass it normally
        if (startStr === endStr) {
          hasOT = matchingOT;
        } else {
          // It crosses midnight! We need to clamp the time based on which day we are rendering
          const actualStart = new Date(matchingOT.start_datetime);
          const actualEnd = new Date(matchingOT.end_datetime);
          
          let clampedStart = new Date(actualStart);
          let clampedEnd = new Date(actualEnd);

          if (cellDateString === startStr) {
            // Day 1: End at 11:59:59 PM
            clampedEnd = new Date(actualStart.getFullYear(), actualStart.getMonth(), actualStart.getDate(), 23, 59, 59);
          } else if (cellDateString === endStr) {
            // Day 2: Start at 12:00:00 AM
            clampedStart = new Date(actualEnd.getFullYear(), actualEnd.getMonth(), actualEnd.getDate(), 0, 0, 0);
          } else {
            // Middle day (Rare, but just in case OT spans 24+ hours)
            clampedStart = new Date(cell.year, cell.month, cell.day, 0, 0, 0);
            clampedEnd = new Date(cell.year, cell.month, cell.day, 23, 59, 59);
          }

          // Calculate hours for this specific clamped slice
          const splitHours = (clampedEnd - clampedStart) / (1000 * 60 * 60);

          hasOT = {
            ...matchingOT,
            start_datetime: clampedStart.toISOString(),
            end_datetime: clampedEnd.toISOString(),
            total_hours: splitHours.toFixed(2), // Overwrite original hours with clamped hours
          };
        }
      }

      // --- DETERMINE PRIMARY STATUS ---
      if (hasLeave) {
        status = 'Leave';
      } else if (record) {
        if (checkTimeFlag(record.time_in, "in")) {
          status = 'Late';
        } else {
          status = 'Present';
        }
      } else if (!cell.isFaded && isPast && !isWeekend && !hasOT) {
        status = 'Absent'; 
      }

      // --- COMPILE SECONDARY INDICATORS ---
      if (hasOT) {
        indicators.push('Overtime');
      }
      
      if (record) {
        if (checkTimeFlag(record.time_out, "out")) indicators.push('Half-day');
      }

      // Sunday OT Edge Case
      if (!status && hasOT) {
        status = 'Overtime'; 
        indicators = indicators.filter(i => i !== 'Overtime'); 
      }

      return { 
        ...cell, 
        isToday, 
        status, 
        indicators, 
        in: record ? formatTimeShort(record.time_in) : null, 
        out: record ? formatTimeShort(record.time_out) : null, 
        record, 
        leave: hasLeave, 
        hasOT,
        dateObj: cellDateObj 
      };
    });
  }, [currentDate, activeUser, calendarData]);

  return (
    <div className="flex flex-col xl:flex-row gap-4 animate-in fade-in duration-500 font-sans text-base-content">
      <CalendarSidebar users={users} activeUser={activeUser} onSelectEmployee={onSelectEmployee} onExport={onExport} showExport={showExport} canVerify={canVerify} canManualEntry={canManualEntry} />

      <div className="relative flex-1 bg-base-100 border border-base-300 rounded-xl overflow-hidden flex flex-col shadow-sm">
        {isFetchingCalendar && (
          <div className="absolute inset-0 z-50 bg-base-100/50 backdrop-blur-[1px] flex items-center justify-center">
            <Loader2 className="animate-spin text-primary size-6" />
          </div>
        )}

        <div className="px-5 py-3 flex flex-row items-center justify-between border-b border-base-200">
          <div className="flex items-center gap-2">
            <CalendarIcon className="text-primary size-5 shrink-0" strokeWidth={2.5} />
            <h2 className="text-lg font-bold tracking-tight tabular-nums truncate">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={handlePrevMonth} className="p-1 rounded-lg text-base-content/60 hover:bg-base-200"><ChevronLeft size={18} strokeWidth={3} /></button>
            <button onClick={handleToday} className="px-3 py-1 rounded-lg bg-base-200 hover:bg-base-300 text-xs font-bold transition-colors">Today</button>
            <button onClick={handleNextMonth} className="p-1 rounded-lg text-base-content/60 hover:bg-base-200"><ChevronRight size={18} strokeWidth={3} /></button>
          </div>
        </div>

        <div className="p-3 flex-1 flex flex-col">
          <div className="grid grid-cols-7 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-[10px] font-black uppercase tracking-widest text-base-content/40">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 flex-1">
            {calendarGrid.map((data, i) => <CalendarCell key={i} data={data} onClick={() => setSelectedCell(data)} />)}
          </div>
        </div>
      </div>

      <CalendarDetailsModal selectedCell={selectedCell} activeUser={activeUser} onClose={() => setSelectedCell(null)} getStatusColors={getStatusColors} />
    </div>
  );
};

const CalendarCell = ({ data, onClick }) => {
  const baseColors = getStatusColors(data.status);
  const isClickable = data.record || data.leave || data.hasOT; 

  return (
    <div 
      onClick={() => isClickable && onClick(data)}
      className={`
        relative flex flex-col p-1.5 rounded-lg transition-all 
        h-[60px] sm:h-[75px] lg:h-[90px] 
        border border-transparent overflow-hidden
        ${baseColors.bg} 
        ${data.status ? baseColors.border : 'border-base-300 bg-base-200/20'}
        ${data.isToday ? '!border-primary ring-1 ring-primary/40' : ''}
        ${data.isFaded ? 'opacity-30 grayscale-[50%]' : 'opacity-100'}
        ${isClickable ? 'cursor-pointer hover:shadow-sm active:scale-95' : ''}
      `}
    >
      <div className={`text-xs font-bold ${data.isToday ? 'text-base-content' : (data.status ? baseColors.text : 'text-base-content/30')}`}>
        {data.day}
      </div>

      {data.status && (
        <div className={`hidden sm:block text-[9px] font-black ${baseColors.text} truncate leading-none mt-0.5 uppercase`}>
          {data.status}
        </div>
      )}

      {data.indicators && data.indicators.length > 0 && (
        <div className="flex flex-wrap gap-0.5 mt-1 hidden sm:flex">
          {data.indicators.map((ind, idx) => {
            const indColors = getStatusColors(ind);
            const Icon = indColors.icon;
            return (
              <div key={idx} className={`flex items-center gap-0.5 px-1 py-0.5 rounded text-[8px] font-bold ${indColors.bg} ${indColors.text}`}>
                {Icon && <Icon size={8} />}
                <span className="leading-none uppercase tracking-wider">{ind === 'Overtime' ? 'OT' : ind}</span>
              </div>
            )
          })}
        </div>
      )}

      {(data.in || data.hasOT) && (
        <div className={`hidden sm:flex mt-auto flex-col gap-0 text-[8px] font-bold ${baseColors.text} opacity-70 leading-tight z-10`}>
          {data.in && <span className="truncate">In: {data.in}</span>}
          {data.out && <span className="truncate">Out: {data.out || '--'}</span>}
          {data.hasOT && (
            <span className="truncate text-indigo-500 font-black mt-0.5">
              OT: {parseFloat(data.hasOT.total_hours).toFixed(2)} hrs
            </span>
          )}
        </div>
      )}

      {(data.status || (data.indicators && data.indicators.length > 0)) && (
        <div className="absolute bottom-1 right-1 flex gap-0.5 sm:hidden">
          {data.status && <div className={`w-1.5 h-1.5 rounded-full ${baseColors.dotClass}`} />}
          {data.indicators?.map((ind, idx) => (
             <div key={idx} className={`w-1.5 h-1.5 rounded-full ${getStatusColors(ind).dotClass}`} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AttendanceCalendarView;
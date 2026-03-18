"use client";

import React, { useState } from "react";
import { useEventStore } from "@/stores/useEventStore";
import { CalendarPlus, ChevronLeft, ChevronRight } from "lucide-react";
import CalendarEventItem from "./CalendarEventItem";
import EventMorePopover from "./EventMorePopover"; // Import the new component

const MAX_VISIBLE_EVENTS = 2; // Better for high-density grids

// Priority mapping for sorting
const PRIORITY = {
  "Regular Holiday": 1,
  "Special Non-Working": 2,
  "Company Event": 3,
  "Birthday": 4,
  default: 5
};

const EventsCalendar = ({ currentDate, onDateChange, onDateClick, onEditEvent }) => {
  const { events } = useEventStore();
  const [expandedDate, setExpandedDate] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // --- Logic for Grid Generation ---
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  
  const prevMonthDays = Array.from({ length: firstDayOfMonth }, (_, i) => ({
    day: daysInPrevMonth - firstDayOfMonth + i + 1,
    month: month - 1,
    isCurrentMonth: false 
  }));

  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => ({
    day: i + 1,
    month: month,
    isCurrentMonth: true 
  }));

  const totalCells = prevMonthDays.length + currentMonthDays.length;
  const nextMonthCount = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  const nextMonthDays = Array.from({ length: nextMonthCount }, (_, i) => ({
    day: i + 1,
    month: month + 1,
    isCurrentMonth: false 
  }));

  const allGridDays = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];

  // Optimized Event Filter + Sort
  const getEventsForDate = (d, m, y) => {
    const targetDate = new Date(y, m, d);
    targetDate.setHours(0, 0, 0, 0);

    return events
      .filter((event) => {
        if (!event.start_date || !event.end_date) return false;
        const start = new Date(event.start_date);
        const end = new Date(event.end_date);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        return targetDate >= start && targetDate <= end;
      })
      .sort((a, b) => (PRIORITY[a.event_type] || 5) - (PRIORITY[b.event_type] || 5));
  };

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="w-full rounded-xl border border-base-300 bg-base-100 shadow-sm overflow-hidden flex flex-col relative">
      
      {/* 1. Popover Overlay */}
      {expandedDate && (
        <EventMorePopover
          date={expandedDate.date}
          events={expandedDate.events}
          onClose={() => setExpandedDate(null)}
          onEventClick={onEditEvent}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-b border-base-300">
        <div className="flex flex-col">
          <h2 className="text-sm sm:text-base font-black uppercase tracking-widest leading-none">
            {currentDate.toLocaleString("default", { month: "long" })} <span className="text-primary">{year}</span>
          </h2>
          <span className="text-[9px] sm:text-[10px] font-bold text-base-content/40 uppercase mt-1">
            {events.length} Events This Month
          </span>
        </div>
        <div className="flex items-center gap-1 bg-base-200 p-1 rounded-lg border border-base-300 self-start sm:self-auto">
          <button onClick={() => onDateChange(new Date(year, month - 1, 1))} className="btn btn-ghost btn-xs size-7 p-0 min-h-0"><ChevronLeft size={14} /></button>
          <button onClick={() => onDateChange(new Date())} className="btn btn-ghost btn-xs h-7 px-3 text-[9px] font-black uppercase tracking-widest">Today</button>
          <button onClick={() => onDateChange(new Date(year, month + 1, 1))} className="btn btn-ghost btn-xs size-7 p-0 min-h-0"><ChevronRight size={14} /></button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-6 px-4 py-2.5 bg-base-200/50 border-b border-base-300 text-[9px] font-black uppercase tracking-widest text-base-content/60">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-[3px] bg-rose-600 shadow-sm"></div> 
          <span>Regular Holiday</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-[3px] bg-amber-400 shadow-sm"></div> 
          <span>Special Non-Working</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-[3px] bg-indigo-500/20 border border-indigo-400"></div> 
          <span>Company Event</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-[3px] bg-fuchsia-500/20 border border-fuchsia-400"></div> 
          <span>Birthday</span>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 border-b border-base-300 bg-base-200/50">
        {dayNames.map(day => (
          <div key={day} className="py-2 text-center text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-base-content/50">{day}</div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-7 bg-base-300 gap-px flex-1">
        {allGridDays.map((dateObj, idx) => {
          const { day, month: itemMonth, isCurrentMonth } = dateObj;
          const fullDate = new Date(year, itemMonth, day);
          const allDayEvents = getEventsForDate(day, itemMonth, year);
          
          // Slice events for the preview
          const visibleEvents = allDayEvents.slice(0, MAX_VISIBLE_EVENTS);
          const extraCount = allDayEvents.length - MAX_VISIBLE_EVENTS;

          const isToday = new Date().toDateString() === fullDate.toDateString();
          const isWeekend = fullDate.getDay() === 0 || fullDate.getDay() === 6;

          return (
            <div 
              key={`${itemMonth}-${day}-${idx}`}
              onClick={() => onDateClick && onDateClick(fullDate)}
              // Mobile-friendly height logic: smaller minimum height on small screens
              className={`group flex min-h-[75px] sm:min-h-[90px] md:min-h-[110px] flex-col p-0.5 sm:p-1 transition-all relative cursor-pointer
                ${!isCurrentMonth ? 'bg-base-200/40 opacity-60' : isWeekend ? 'bg-base-100/60' : 'bg-base-100'} 
                hover:bg-base-200/50 hover:opacity-100`}
            >
              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity text-primary hidden sm:block">
                <CalendarPlus size={12} />
              </div>

              <div className="flex w-full justify-between items-start mb-1 px-0.5 pt-0.5">
                <span className={`flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full text-[9px] sm:text-[10px] font-black transition-all ${
                  isToday 
                    ? "bg-primary text-primary-content shadow-md shadow-primary/30" 
                    : isCurrentMonth ? "text-base-content/70" : "text-base-content/30"
                }`}>
                  {day}
                </span>
              </div>

              {/* Event Container */}
              <div className="flex flex-col gap-0.5 sm:gap-1 overflow-hidden px-0.5 sm:px-0">
                {visibleEvents.map((event, eIdx) => (
                  <CalendarEventItem 
                    key={`${event.id}-${eIdx}`} 
                    event={event} 
                    onClick={onEditEvent} 
                  />
                ))}

                {/* "+ More" Button */}
                {extraCount > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedDate({ date: fullDate, events: allDayEvents });
                    }}
                    className="mt-0.5 w-fit rounded px-1 sm:px-1.5 py-0.5 text-[8px] sm:text-[9px] font-bold text-primary hover:bg-primary/10 transition-colors"
                  >
                    + {extraCount} more
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EventsCalendar;
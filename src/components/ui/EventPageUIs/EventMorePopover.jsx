"use client";

import React from "react";
import CalendarEventItem from "./CalendarEventItem";
import { X } from "lucide-react";

const EventMorePopover = ({ date, events, onClose, onEventClick }) => {
  if (!events || events.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative w-full max-w-xs overflow-hidden rounded-xl border border-base-300 bg-base-100 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-base-200 bg-base-200/50 px-4 py-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/60">
              Events for
            </h3>
            <p className="text-sm font-black text-base-content">
              {new Date(date).toLocaleDateString("en-US", { 
                month: "long", day: "numeric", year: "numeric" 
              })}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="rounded-full p-1 hover:bg-base-300 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Event List */}
        <div className="flex flex-col gap-2 p-4 max-h-[60vh] overflow-y-auto">
          {events.map((event) => (
            <div key={event.id} className="transform transition-transform active:scale-[0.98]">
               <CalendarEventItem 
                event={event} 
                onClick={(ev) => {
                  onEventClick(ev);
                  onClose();
                }} 
              />
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="bg-base-200/30 px-4 py-2 text-center text-[10px] text-base-content/40">
          {events.length} total events scheduled
        </div>
      </div>
    </div>
  );
};

export default EventMorePopover;
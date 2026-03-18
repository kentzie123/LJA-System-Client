"use client";

import React from "react";
import { X, Calendar, Trash2, Edit3, AlignLeft, Info, ShieldCheck, Coffee, Megaphone, Cake } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";

const EventDetailsModal = ({ isOpen, onClose, event, onEdit, onDelete }) => {
  const { authUser } = useAuthStore();
  const canManage = authUser?.role?.perm_event_manage === true;

  if (!event) return null;

  // Syncing colors with the Calendar Item styles
  const getHeaderStyles = () => {
    switch (event.event_type) {
      case "Regular Holiday":
        return { bg: "bg-rose-600", text: "text-rose-600", icon: <ShieldCheck size={20} /> };
      case "Special Non-Working":
        return { bg: "bg-amber-400", text: "text-amber-600", icon: <Coffee size={20} /> };
      case "Birthday":
        return { bg: "bg-fuchsia-500", text: "text-fuchsia-600", icon: <Cake size={20} /> };
      case "Company Event":
        return { bg: "bg-indigo-600", text: "text-indigo-600", icon: <Megaphone size={20} /> };
      default:
        return { bg: "bg-slate-400", text: "text-slate-600", icon: <Calendar size={20} /> };
    }
  };

  const theme = getHeaderStyles();

  return (
    <dialog className={`modal modal-middle ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box p-0 bg-base-100 w-11/12 max-w-[360px] border border-base-300 shadow-2xl rounded-2xl overflow-hidden antialiased-text">
        
        {/* HEADER / COLORED TOP BAR */}
        <div className={`h-1.5 w-full ${theme.bg}`} />

        <div className="p-6">
          {/* TITLE & TYPE */}
          <div className="flex justify-between items-start mb-5">
            <div className="min-w-0">
              <span className={`text-[9px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-md border border-base-300 bg-base-200/50 text-base-content/50`}>
                {event.event_type}
              </span>
              <h2 className="text-xl font-black text-base-content mt-2 leading-tight tracking-tight break-words">
                {event.title}
              </h2>
            </div>
            <button 
              onClick={onClose}
              className="btn btn-xs btn-circle btn-ghost text-base-content/30 hover:text-base-content"
            >
              <X size={18} />
            </button>
          </div>

          {/* DATE INFO CARD */}
          <div className="flex items-center gap-4 mb-6 bg-base-200/40 p-4 rounded-xl border border-base-200/60">
            <div className={`p-2.5 rounded-xl shadow-sm bg-white dark:bg-base-100 ${theme.text}`}>
              {theme.icon}
            </div>
            <div className="flex flex-col">
              <p className="text-[10px] font-black uppercase tracking-widest text-base-content/40 leading-none mb-1.5">Date Schedule</p>
              <p className="text-sm font-black text-base-content tracking-tight">
                {event.start_date === event.end_date 
                  ? new Date(event.start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                  : `${new Date(event.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(event.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                }
              </p>
            </div>
          </div>

          {/* DESCRIPTION */}
          {event.description && (
            <div className="mb-6">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-base-content/30 mb-2">
                <AlignLeft size={12} /> Description
              </div>
              <div className="bg-base-200/30 rounded-lg p-3 border-l-4 border-base-300">
                <p className="text-[12px] text-base-content/70 leading-relaxed font-medium">
                  {event.description}
                </p>
              </div>
            </div>
          )}

          {/* PAYROLL STATUS INDICATOR */}
          {event.is_payroll_holiday && (
            <div className="flex items-center gap-3 text-[10px] font-bold text-primary bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 mb-6">
              <div className="bg-primary/10 p-1.5 rounded-lg">
                <Info size={14} />
              </div>
              <span className="leading-tight">Holiday Pay Rules are enabled for this date.</span>
            </div>
          )}

          {/* ACTIONS FOOTER - Only visible if perm_event_manage is true */}
          {canManage && (
            <div className="flex gap-2 pt-4 border-t border-base-200">
              <button
                onClick={() => onDelete(event)}
                className="btn btn-sm flex-1 btn-ghost text-error hover:bg-error/10 gap-2 text-[10px] font-black uppercase tracking-widest"
              >
                <Trash2 size={14} />
                Delete
              </button>
              <button
                onClick={() => onEdit(event)}
                className="btn btn-sm flex-[1.5] btn-primary shadow-md gap-2 text-[10px] font-black uppercase tracking-widest border-none"
              >
                <Edit3 size={14} />
                Edit Event
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="modal-backdrop bg-black/60 backdrop-blur-sm transition-all duration-300" onClick={onClose} />
    </dialog>
  );
};

export default EventDetailsModal;
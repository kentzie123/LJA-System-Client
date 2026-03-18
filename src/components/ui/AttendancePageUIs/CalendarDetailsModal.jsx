"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Clock, Camera, FileText, Timer } from "lucide-react";
import Image from "next/image";
import { getImageUrl } from "@/utils/getImageUrl";

const CalendarDetailsModal = ({
  selectedCell,
  activeUser,
  onClose,
  getStatusColors,
}) => {
  const [expandedPhoto, setExpandedPhoto] = useState(null);
  
  // Refs for native dialogs
  const modalRef = useRef(null);
  const photoModalRef = useRef(null);

  // Sync main modal with native dialog API
  useEffect(() => {
    if (selectedCell) {
      modalRef.current?.showModal();
    } else {
      modalRef.current?.close();
    }
  }, [selectedCell]);

  // Sync photo viewer modal with native dialog API
  useEffect(() => {
    if (expandedPhoto) {
      photoModalRef.current?.showModal();
    } else {
      photoModalRef.current?.close();
    }
  }, [expandedPhoto]);

  if (!selectedCell) return null;

  const formatModalDate = (dateObj) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const d = dateObj.getDate();
    return `${days[dateObj.getDay()]}, ${months[dateObj.getMonth()]} ${d}, ${dateObj.getFullYear()}`;
  };

  // For Attendance Time (e.g. "08:00:00")
  const formatTime = (timeString) => {
    if (!timeString) return "--:--";
    const [hours, minutes] = timeString.split(":");
    const date = new Date();
    date.setHours(hours, minutes);
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  };

  // For Overtime Datetime (e.g. "2026-03-05 17:00:00")
  const formatDateTimeString = (dtString) => {
    if (!dtString) return "--:--";
    const date = new Date(dtString);
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  };

  // Determine if there is ANY data to show
  const hasAnyRecord = selectedCell.leave || selectedCell.record || selectedCell.hasOT;

  return (
    <>
      {/* 1. MAIN DETAILS MODAL */}
      <dialog ref={modalRef} className={`modal modal-middle ${selectedCell ? "modal-open" : ""}`} onClose={onClose}>
        
        <div className="modal-box p-0 bg-base-100 overflow-hidden w-11/12 max-w-[400px] sm:max-w-xl border border-base-300 shadow-2xl rounded-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh] antialiased-text">
          
          {/* HEADER */}
          <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-base-200 flex justify-between items-start shrink-0">
            <div className="flex flex-col">
              <h2 className="text-[13px] sm:text-[14px] font-bold text-base-content tracking-tight">
                {formatModalDate(selectedCell.dateObj)}
              </h2>
              <p className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-base-content/40 mt-0.5">
                Attendance Details
              </p>
            </div>
            <button type="button" onClick={onClose} className="btn btn-xs btn-circle btn-ghost text-base-content/50 hover:text-base-content">
              <X size={16} />
            </button>
          </div>

          {/* USER INFO BAR */}
          <div className="px-4 sm:px-5 py-2.5 sm:py-3 bg-base-200/50 border-b border-base-200 flex items-center justify-between shrink-0 gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 relative rounded-full overflow-hidden bg-base-300 border border-base-300 shrink-0">
                <Image
                  src={activeUser?.profile_picture ? getImageUrl(activeUser.profile_picture) : "/images/default_profile.jpg"}
                  alt="" fill sizes="32px" className="object-cover"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <h3 className="font-bold text-[11px] sm:text-[12px] truncate leading-tight">
                  {activeUser?.fullname}
                </h3>
                <p className="text-[9px] sm:text-[10px] opacity-50 truncate leading-none mt-0.5">
                  {activeUser?.position || "Staff"}
                </p>
              </div>
            </div>

            <div className={`px-2 py-1 rounded text-[9px] sm:text-[10px] font-black uppercase tracking-widest flex items-center gap-1 sm:gap-1.5 shrink-0 ${getStatusColors(selectedCell.status).bg} ${getStatusColors(selectedCell.status).text}`}>
              {getStatusColors(selectedCell.status).icon && React.createElement(getStatusColors(selectedCell.status).icon, { size: 12 })}
              <span className="hidden xs:inline">{selectedCell.status}</span>
            </div>
          </div>

          {/* SCROLLABLE BODY */}
          <div className="p-4 sm:p-5 overflow-y-auto custom-scrollbar flex-1 bg-base-100">
            
            {!hasAnyRecord ? (
               <div className="flex items-center justify-center h-32 opacity-30 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest">
                 No Record Found
               </div>
            ) : (
              <div className="flex flex-col gap-8 pb-4">
                
                {/* 1. LEAVE RECORD */}
                {selectedCell.leave && (
                  <div className="bg-fuchsia-500/5 border border-fuchsia-500/10 rounded-xl p-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-fuchsia-600 mb-2 flex items-center gap-1.5">
                      <FileText size={12} /> Leave Record
                    </h4>
                    <p className="text-[11px] sm:text-[12px] text-base-content/80 leading-relaxed font-medium">
                      {selectedCell.leave.reason || selectedCell.leave.leave_type || "Approved Time Off."}
                    </p>
                  </div>
                )}

                {/* 2. REGULAR ATTENDANCE RECORD */}
                {selectedCell.record && (
                  <div className="flex flex-col gap-4">
                    
                    {/* Header for block clarity if multiple exist */}
                    {(selectedCell.leave || selectedCell.hasOT) && (
                       <h4 className="text-[11px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-1.5 border-b border-base-200 pb-2">
                         <Clock size={14} /> Regular Shift
                       </h4>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* TIME IN */}
                      <div className="flex flex-col bg-base-100 sm:bg-transparent rounded-xl sm:rounded-none border sm:border-none border-base-200 p-3 sm:p-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-1">
                            <Clock size={12} /> Clock In
                          </span>
                          <span className="text-base sm:text-lg font-black text-base-content tabular-nums leading-none tracking-tight">
                            {formatTime(selectedCell.record.time_in)}
                          </span>
                        </div>
                        <div 
                          className="aspect-[16/9] sm:h-28 sm:aspect-auto bg-base-200 rounded-lg overflow-hidden relative group cursor-zoom-in"
                          onClick={() => selectedCell.record.photo_in && setExpandedPhoto(selectedCell.record.photo_in)}
                        >
                          {selectedCell.record.photo_in ? (
                            <Image src={getImageUrl(selectedCell.record.photo_in)} alt="" fill sizes="(max-width: 640px) 100vw, 250px" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center opacity-20"><Camera size={24} /></div>
                          )}
                        </div>
                      </div>

                      {/* TIME OUT */}
                      <div className="flex flex-col bg-base-100 sm:bg-transparent rounded-xl sm:rounded-none border sm:border-none border-base-200 p-3 sm:p-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-1">
                            <Clock size={12} /> Clock Out
                          </span>
                          <span className="text-base sm:text-lg font-black text-base-content tabular-nums leading-none tracking-tight">
                            {formatTime(selectedCell.record.time_out)}
                          </span>
                        </div>
                        <div 
                          className="aspect-[16/9] sm:h-28 sm:aspect-auto bg-base-200 rounded-lg overflow-hidden relative group cursor-zoom-in"
                          onClick={() => selectedCell.record.photo_out && setExpandedPhoto(selectedCell.record.photo_out)}
                        >
                          {selectedCell.record.photo_out ? (
                            <Image src={getImageUrl(selectedCell.record.photo_out)} alt="" fill sizes="(max-width: 640px) 100vw, 250px" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center opacity-20"><Camera size={24} /></div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* SUMMARY */}
                    <div className="bg-base-200/50 border border-base-200 rounded-xl p-3 sm:p-4 mt-1">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-base-content/50 flex items-center gap-1.5">
                          <FileText size={12} /> Work Summary
                        </h4>
                        <span className="text-[9px] sm:text-[10px] font-bold tracking-widest text-primary uppercase">
                          {selectedCell.record.worked_hours || "0.00"} Hrs
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-[12px] text-base-content/80 leading-relaxed font-medium">
                        {selectedCell.record.work_summary || "No summary provided."}
                      </p>
                    </div>
                  </div>
                )}

                {/* 3. OVERTIME RECORD */}
                {selectedCell.hasOT && (
                  <div className="flex flex-col gap-4">
                    
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-indigo-500 flex items-center gap-1.5 border-b border-indigo-500/20 pb-2">
                      <Timer size={14} /> Overtime ({selectedCell.hasOT.type_name || "Regular"})
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       {/* OT START */}
                       <div className="flex flex-col bg-indigo-500/5 sm:bg-transparent rounded-xl sm:rounded-none border sm:border-none border-indigo-500/10 p-3 sm:p-0">
                         <div className="flex items-center justify-between">
                           <span className="text-[10px] font-black uppercase tracking-widest opacity-70 text-indigo-500 flex items-center gap-1">
                             OT Start
                           </span>
                           {/* Changed to text-base-content to automatically adapt to dark mode */}
                           <span className="text-base sm:text-lg font-black text-base-content tabular-nums leading-none tracking-tight">
                             {formatDateTimeString(selectedCell.hasOT.start_datetime)}
                           </span>
                         </div>
                       </div>

                       {/* OT END */}
                       <div className="flex flex-col bg-indigo-500/5 sm:bg-transparent rounded-xl sm:rounded-none border sm:border-none border-indigo-500/10 p-3 sm:p-0">
                         <div className="flex items-center justify-between">
                           <span className="text-[10px] font-black uppercase tracking-widest opacity-70 text-indigo-500 flex items-center gap-1">
                             OT End
                           </span>
                           {/* Changed to text-base-content to automatically adapt to dark mode */}
                           <span className="text-base sm:text-lg font-black text-base-content tabular-nums leading-none tracking-tight">
                             {formatDateTimeString(selectedCell.hasOT.end_datetime)}
                           </span>
                         </div>
                       </div>
                    </div>

                    {/* OT SUMMARY */}
                    <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-3 sm:p-4 mt-1">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-500/70 flex items-center gap-1.5">
                          <FileText size={12} /> Reason
                        </h4>
                        <span className="text-[9px] sm:text-[10px] font-bold tracking-widest text-indigo-500 uppercase">
                          {selectedCell.hasOT.total_hours || "0.00"} Hrs
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-[12px] text-base-content/80 leading-relaxed font-medium">
                        {selectedCell.hasOT.reason || "No reason provided."}
                      </p>
                    </div>

                  </div>
                )}

              </div>
            )}
          </div>
        </div>

        {/* NATIVE DAISY UI BACKDROP */}
        <form method="dialog" className="modal-backdrop">
          <button onClick={onClose}>close</button>
        </form>
      </dialog>

      {/* 2. PHOTO VIEWER MODAL */}
      <dialog ref={photoModalRef} className={`modal ${expandedPhoto ? "modal-open" : ""}`} onClose={() => setExpandedPhoto(null)}>
        
        {/* Transparent box */}
        <div className="modal-box max-w-5xl bg-transparent shadow-none p-0 w-full h-[85vh] flex items-center justify-center relative">
          
          <button 
            type="button"
            className="btn btn-circle btn-sm absolute top-2 right-2 sm:top-6 sm:right-6 bg-black/50 hover:bg-black/80 border-none text-white/70 hover:text-white z-50 transition-colors" 
            onClick={() => setExpandedPhoto(null)}
          >
            <X size={18} strokeWidth={2.5} />
          </button>
          
          {expandedPhoto && (
            <div className="relative w-full h-full" onClick={(e) => e.stopPropagation()}>
              <Image src={getImageUrl(expandedPhoto)} alt="Expanded view" fill className="object-contain drop-shadow-2xl" />
            </div>
          )}
        </div>

        {/* NATIVE DAISY UI BACKDROP */}
        <form method="dialog" className="modal-backdrop bg-black/95 backdrop-blur-md">
          <button onClick={() => setExpandedPhoto(null)}>close</button>
        </form>
      </dialog>
    </>
  );
};

export default CalendarDetailsModal;
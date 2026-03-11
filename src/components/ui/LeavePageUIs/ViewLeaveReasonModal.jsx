"use client";

import { X, FileText, CornerDownRight } from "lucide-react";

const ViewLeaveReasonModal = ({ isOpen, onClose, reason }) => {
  return (
    <dialog className={`modal modal-middle ${isOpen ? "modal-open" : ""}`}>
      
      {/* MODAL BOX */}
      <div className="modal-box p-0 bg-base-100 overflow-hidden w-11/12 max-w-[360px] border border-base-300 shadow-2xl rounded-xl flex flex-col antialiased-text">
        
        {/* HEADER */}
        <div className="px-4 py-3 border-b border-base-200 bg-base-200/50 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-base-300 rounded-md text-base-content/70 shadow-sm">
              <FileText size={14} />
            </div>
            <div className="flex flex-col">
              <h3 className="text-[12px] font-black text-base-content uppercase tracking-widest leading-none">
                Leave Reason
              </h3>
              <p className="text-[9px] font-bold uppercase tracking-widest text-base-content/40 mt-1">
                Employee Request Details
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="btn btn-xs btn-circle btn-ghost text-base-content/40 hover:text-base-content"
          >
            <X size={14} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-5 bg-base-100">
          <label className="text-[9px] font-black text-base-content/40 uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5">
            <CornerDownRight size={10} /> Submitted Reason
          </label>
          
          <div className="relative group">
            {/* Decorative Quote Mark */}
            <span className="absolute -top-2 -left-1 text-4xl text-base-content/5 font-serif select-none pointer-events-none">
              “
            </span>
            
            <div className="bg-base-200/40 p-4 rounded-lg border border-base-300/50 min-h-[80px] max-h-[200px] overflow-y-auto custom-scrollbar shadow-inner">
              <p className="text-[12px] text-base-content/80 font-medium leading-relaxed italic break-words whitespace-pre-wrap">
                {reason || "No specific reason was provided by the employee."}
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="px-4 py-3 border-t border-base-200 bg-base-200/30 flex justify-end shrink-0">
          <button 
            type="button"
            onClick={onClose} 
            className="btn btn-sm h-8 min-h-0 btn-primary text-primary-content text-[10px] font-black uppercase tracking-widest px-6 shadow-sm border-none"
          >
            Close View
          </button>
        </div>
      </div>

      {/* EXACT CLICKABLE BACKDROP REQUESTED */}
      <div className="modal-backdrop bg-black/60 backdrop-blur-md" onClick={onClose}></div>
    </dialog>
  );
};

export default ViewLeaveReasonModal;
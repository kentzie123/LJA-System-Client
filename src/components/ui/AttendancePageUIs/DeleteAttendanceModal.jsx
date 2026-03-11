"use client";

import { Trash2, X, Loader2 } from "lucide-react";

const DeleteAttendanceModal = ({
  isOpen,
  onClose,
  onConfirm,
  record,
  isDeleting,
}) => {
  
  const formatDate = (dateString) => {
    if (!dateString) return "this date";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short", 
      day: "numeric",
    });
  };

  return (
    <dialog className={`modal modal-middle ${isOpen ? "modal-open" : ""}`}>
      
      {/* MODAL BOX */}
      <div className="modal-box p-0 bg-base-100 overflow-hidden w-11/12 max-w-[380px] border border-error/30 shadow-2xl rounded-xl flex flex-col antialiased-text">
        
        {/* HEADER: High-Contrast Alert Strip */}
        <div className="px-4 py-3 border-b border-error/10 bg-error/5 flex justify-between items-start shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-error/20 rounded-md text-error shadow-sm">
              <Trash2 size={16} />
            </div>
            <div className="flex flex-col">
              <h3 className="text-[13px] font-black text-error uppercase tracking-widest leading-none">
                Delete Record
              </h3>
              <p className="text-[9px] font-bold uppercase tracking-widest text-error/60 mt-1">
                Destructive Action
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            disabled={isDeleting}
            className="btn btn-xs btn-circle btn-ghost text-error/50 hover:text-error hover:bg-error/10"
          >
            <X size={14} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-4 bg-base-100">
          <p className="text-[12px] text-base-content/80 leading-relaxed font-medium">
            You are about to delete the entire attendance record for <strong className="text-base-content font-black">{record?.fullname || "this employee"}</strong> on <strong className="text-base-content font-black">{formatDate(record?.date)}</strong>.
          </p>
          <div className="mt-4 p-2.5 bg-base-200/50 border border-base-300 rounded-lg">
            <p className="text-[10px] text-base-content/60 italic leading-snug">
              * This action cannot be undone. The record will be permanently removed from the system.
            </p>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="px-4 py-3 border-t border-base-200 bg-base-200/30 flex justify-end gap-2 shrink-0">
          <button 
            type="button"
            onClick={onClose} 
            disabled={isDeleting}
            className="btn btn-sm h-8 min-h-0 btn-ghost text-[10px] font-bold uppercase tracking-widest px-4"
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={onConfirm} 
            disabled={isDeleting}
            className="btn btn-sm h-8 min-h-0 btn-error text-white text-[10px] font-bold uppercase tracking-widest px-5 shadow-sm border-none"
          >
            {isDeleting ? (
              <Loader2 className="animate-spin size-4" />
            ) : (
              "Confirm Deletion"
            )}
          </button>
        </div>
      </div>

      {/* CLICKABLE BACKDROP */}
      <div 
        className="modal-backdrop bg-black/60 backdrop-blur-sm" 
        onClick={() => !isDeleting && onClose()}
      ></div>
    </dialog>
  );
};

export default DeleteAttendanceModal;
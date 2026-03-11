"use client";

import React from "react";
import { Trash2, X, Loader2 } from "lucide-react";
import { useOvertimeStore } from "@/stores/useOvertimeStore";

const DeleteOvertimeModal = ({ isOpen, onClose, request, userRole }) => {
  const { deleteOvertimeRequest, isDeleting } = useOvertimeStore();
  
  // Staff Role ID = 2
  const isStaff = userRole === 2;

  if (!request) return null;

  const handleDelete = async () => {
    const success = await deleteOvertimeRequest(request.id);
    if (success) onClose();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "...";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
    });
  };

  return (
    <div className={`modal modal-middle ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box p-0 bg-base-100 overflow-hidden w-11/12 max-w-[380px] border border-error/30 shadow-2xl rounded-xl flex flex-col antialiased-text">
        
        {/* HEADER */}
        <div className="px-4 py-3 border-b border-error/10 bg-error/5 flex justify-between items-start shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-error/20 rounded-md text-error shadow-sm">
              <Trash2 size={16} />
            </div>
            <div className="flex flex-col">
              <h3 className="text-[13px] font-black text-error uppercase tracking-widest leading-none">
                {isStaff ? "Cancel My Request" : "Delete OT Request"}
              </h3>
              <p className="text-[9px] font-bold uppercase tracking-widest text-error/60 mt-1">
                {isStaff ? "Personal Action" : "Admin Destructive Action"}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} disabled={isDeleting} className="btn btn-xs btn-circle btn-ghost text-error/50 hover:text-error hover:bg-error/10">
            <X size={14} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-4 bg-base-100">
          <p className="text-[12px] text-base-content/80 leading-relaxed font-medium">
            {isStaff 
              ? `Are you sure you want to cancel your overtime request for `
              : `You are about to delete the overtime request for `}
            <strong className="text-base-content font-black">
              {isStaff ? "this date" : (request?.fullname || "this employee")}
            </strong>.
          </p>
          
          <div className="mt-3 flex flex-col gap-1 text-[11px]">
            <div className="flex justify-between border-b border-base-200 pb-1">
              <span className="text-base-content/50 uppercase font-bold tracking-tighter">Date</span>
              <span className="font-black text-base-content uppercase">{formatDate(request?.ot_date)}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-base-content/50 uppercase font-bold tracking-tighter">Duration</span>
              <span className="font-black text-base-content uppercase">{request?.total_hours} Hours</span>
            </div>
          </div>

          <div className="mt-4 p-2.5 bg-base-200/50 border border-base-300 rounded-lg">
            <p className="text-[10px] text-base-content/60 italic leading-snug">
              * {isStaff ? "Once cancelled, you will need to resubmit if you change your mind." : "This action cannot be undone and will be purged from system records."}
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-4 py-3 border-t border-base-200 bg-base-200/30 flex justify-end gap-2 shrink-0">
          <button type="button" onClick={onClose} disabled={isDeleting} className="btn btn-sm h-8 min-h-0 btn-ghost text-[10px] font-bold uppercase tracking-widest px-4">
            Close
          </button>
          <button type="button" onClick={handleDelete} disabled={isDeleting} className={`btn btn-sm h-8 min-h-0 btn-error text-white text-[10px] font-bold uppercase tracking-widest px-5 shadow-sm border-none`}>
            {isDeleting ? <Loader2 className="animate-spin size-4" /> : isStaff ? "Cancel Request" : "Confirm Deletion"}
          </button>
        </div>
      </div>
      <div className="modal-backdrop bg-black/60 backdrop-blur-sm" onClick={() => !isDeleting && onClose()}></div>
    </div>
  );
};

export default DeleteOvertimeModal;
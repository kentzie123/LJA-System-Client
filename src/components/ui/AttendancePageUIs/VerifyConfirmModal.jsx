"use client";

import React from "react";
import { AlertCircle, CheckCircle, XCircle, X, Loader2 } from "lucide-react";
import { useAttendanceStore } from "@/stores/useAttendanceStore";

const VerifyConfirmModal = ({ isOpen, onClose, onConfirm, statusToApply, itemCount = 1 }) => {
  const { isEditingAttendance } = useAttendanceStore();

  const isVerify = statusToApply === "Verified";
  const isBulk = itemCount > 1;

  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  // Dynamic Theme mapping
  const theme = isVerify 
    ? {
        bg: "bg-success/5",
        border: "border-success/10",
        boxBorder: "border-success/30",
        text: "text-success",
        iconBg: "bg-success/20",
        icon: <CheckCircle size={16} />,
        btn: "btn-success",
        btnText: "text-white"
      }
    : {
        bg: "bg-error/5",
        border: "border-error/10",
        boxBorder: "border-error/30",
        text: "text-error",
        iconBg: "bg-error/20",
        icon: <XCircle size={16} />,
        btn: "btn-error",
        btnText: "text-white"
      };

  return (
    <dialog className={`modal modal-middle ${isOpen ? "modal-open" : ""}`}>
      
      {/* MODAL BOX */}
      <div className={`modal-box p-0 bg-base-100 overflow-hidden w-11/12 max-w-[380px] border ${theme.boxBorder} shadow-2xl rounded-xl flex flex-col antialiased-text`}>
        
        {/* HEADER: Dynamic Alert Strip */}
        <div className={`px-4 py-3 border-b flex justify-between items-start shrink-0 ${theme.bg} ${theme.border}`}>
          <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded-md shadow-sm ${theme.iconBg} ${theme.text}`}>
              {theme.icon}
            </div>
            <div className="flex flex-col">
              <h3 className={`text-[13px] font-black uppercase tracking-widest leading-none ${theme.text}`}>
                Confirm {isVerify ? "Verification" : "Rejection"}
              </h3>
              <p className={`text-[9px] font-bold uppercase tracking-widest opacity-60 mt-1 ${theme.text}`}>
                {isBulk ? `Batch Action: ${itemCount} Records` : "Single Record Action"}
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            disabled={isEditingAttendance}
            className={`btn btn-xs btn-circle btn-ghost opacity-50 hover:opacity-100 ${theme.text}`}
          >
            <X size={14} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-4 bg-base-100">
          <p className="text-[12px] text-base-content/80 leading-relaxed font-medium">
            Are you sure you want to <strong className={`font-black ${theme.text}`}>{isVerify ? "VERIFY" : "REJECT"}</strong> {isBulk ? `these ${itemCount} attendance records` : "this attendance record"}?
          </p>
          
          <div className={`mt-4 p-2.5 bg-base-200/50 border border-base-300 rounded-lg flex items-start gap-2 ${!isVerify && "border-error/20 bg-error/5 text-error"}`}>
            <AlertCircle size={14} className={`shrink-0 mt-0.5 ${isVerify ? "text-base-content/40" : "text-error"}`} />
            {isVerify ? (
              <p className="text-[10px] text-base-content/60 leading-snug">
                This confirms the employee's time logs and photo evidence are accurate and ready for payroll processing.
              </p>
            ) : (
              <p className="text-[10px] leading-snug font-medium">
                This marks the record as rejected. Ensure you communicate the reason to the affected employee(s).
              </p>
            )}
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="px-4 py-3 border-t border-base-200 bg-base-200/30 flex justify-end gap-2 shrink-0">
          <button 
            type="button"
            onClick={onClose} 
            className="btn btn-sm h-8 min-h-0 btn-ghost text-[10px] font-bold uppercase tracking-widest px-4"
            disabled={isEditingAttendance}
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={handleConfirm}
            disabled={isEditingAttendance}
            className={`btn btn-sm h-8 min-h-0 ${theme.btn} ${theme.btnText} text-[10px] font-bold uppercase tracking-widest px-5 shadow-sm border-none`}
          >
            {isEditingAttendance ? (
              <Loader2 className="animate-spin size-4" />
            ) : (
              isVerify ? "Yes, Verify" : "Yes, Reject"
            )}
          </button>
        </div>

      </div>

      {/* CLICKABLE BACKDROP */}
       <div 
        className="modal-backdrop bg-black/60 backdrop-blur-sm" 
        onClick={() => !isEditingAttendance && onClose()}
      ></div>
    </dialog>
  );
};

export default VerifyConfirmModal;
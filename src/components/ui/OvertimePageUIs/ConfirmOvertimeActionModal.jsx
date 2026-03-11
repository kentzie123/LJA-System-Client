"use client";

import React, { useMemo } from "react";
import { CheckCircle, X, Loader2, AlertCircle } from "lucide-react";
import { formatDate } from "@/utils/formatUtils";

/**
 * @param {boolean} isOpen 
 * @param {function} onClose
 * @param {function} onConfirm
 * @param {object} actionData 
 * @param {boolean} isProcessing
 * @param {number} userRole 
 */
const ConfirmOvertimeActionModal = ({
  isOpen,
  onClose,
  onConfirm,
  actionData,
  isProcessing,
  userRole,
}) => {
  const isStaff = userRole === 2;

  const isApprove = actionData?.status === "Approved";
  const request = actionData?.request;

  // Memoize theme to prevent "flicker" of colors during state cleanup
  const theme = useMemo(() => {
    if (isApprove) {
      return {
        bg: "bg-success/5",
        border: "border-success/10",
        text: "text-success",
        iconBg: "bg-success/20",
        icon: <CheckCircle size={16} />,
        button: "btn-success",
      };
    }
    return {
      bg: "bg-error/5",
      border: "border-error/10",
      text: "text-error",
      iconBg: "bg-error/20",
      icon: <AlertCircle size={16} />,
      button: "btn-error",
    };
  }, [isApprove]);

  if (!isOpen && !actionData) return null;

  return (
    <dialog className={`modal modal-middle ${isOpen ? "modal-open" : ""}`}>
      
      {/* MODAL BOX - DaisyUI structure with custom styling overrides */}
      <div className={`modal-box p-0 bg-base-100 overflow-hidden w-11/12 max-w-[380px] border ${isApprove ? "border-success/30" : "border-error/30"} shadow-2xl rounded-xl flex flex-col antialiased-text transition-all duration-300`}>
        
        {/* HEADER: Warning/Success Strip */}
        <div className={`px-4 py-3 border-b flex justify-between items-start shrink-0 ${theme.bg} ${theme.border}`}>
          <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded-md shadow-sm ${theme.iconBg} ${theme.text}`}>
              {theme.icon}
            </div>
            <div className="flex flex-col">
              <h3 className={`text-[13px] font-black uppercase tracking-widest leading-none ${theme.text}`}>
                {isApprove ? "Approve Overtime" : "Reject Overtime"}
              </h3>
              <p className={`text-[9px] font-bold uppercase tracking-widest opacity-60 mt-1 ${theme.text}`}>
                {isStaff ? "Employee Request" : "Administrative Action"}
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            disabled={isProcessing}
            className={`btn btn-xs btn-circle btn-ghost opacity-50 hover:opacity-100 ${theme.text}`}
          >
            <X size={14} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-4 bg-base-100">
          <p className="text-[12px] text-base-content/80 leading-relaxed font-medium">
            You are about to <strong className={`font-black ${theme.text}`}>{isApprove ? "APPROVE" : "REJECT"}</strong> the overtime request 
            {isStaff 
              ? " you submitted for " 
              : <> submitted by <strong className="text-base-content font-black">{request?.fullname || "this employee"}</strong> for </>
            }
            <strong className="text-base-content font-black"> {formatDate(request?.ot_date)}</strong>.
          </p>

          <div className="mt-4 p-2.5 bg-base-200/50 border border-base-300 rounded-lg">
            <div className="flex flex-col gap-1.5">
               <div className="flex justify-between items-center text-[10px]">
                  <span className="opacity-50 uppercase font-bold">Total Hours</span>
                  <span className="font-black text-base-content uppercase">{request?.total_hours} hrs</span>
               </div>
               <p className="text-[10px] text-base-content/60 italic leading-snug pt-1 border-t border-base-300/50">
                * This action will update the payroll-related records and notify the concerned parties.
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="px-4 py-3 border-t border-base-200 bg-base-200/30 flex justify-end gap-2 shrink-0">
          <button 
            type="button"
            onClick={onClose} 
            disabled={isProcessing}
            className="btn btn-sm h-8 min-h-0 btn-ghost text-[10px] font-black uppercase tracking-widest px-4"
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={onConfirm} 
            disabled={isProcessing}
            className={`btn btn-sm h-8 min-h-0 text-white text-[10px] font-black uppercase tracking-widest px-5 shadow-sm border-none ${theme.button}`}
          >
            {isProcessing ? (
              <Loader2 className="animate-spin size-4" />
            ) : (
              isApprove ? "Confirm Approval" : "Confirm Rejection"
            )}
          </button>
        </div>
      </div>

      {/* BACKDROP: DaisyUI Backdrop with enhanced focus */}
      <div 
        className="modal-backdrop bg-black/60 backdrop-blur-md transition-all duration-300" 
        onClick={() => !isProcessing && onClose()}
      >
        <button className="cursor-default" type="button">close</button>
      </div>
    </dialog>
  );
};

export default ConfirmOvertimeActionModal;
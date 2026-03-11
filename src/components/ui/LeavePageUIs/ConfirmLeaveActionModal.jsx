"use client";

import { CheckCircle, X, Loader2, AlertCircle } from "lucide-react";

const ConfirmLeaveActionModal = ({
  isOpen,
  onClose,
  onConfirm,
  actionData,
  isProcessing,
}) => {
  if (!actionData) return null;

  const isApprove = actionData.status === "Approved";

  // Dynamic theme based on action
  const theme = isApprove
    ? {
        bg: "bg-success/5",
        border: "border-success/10",
        text: "text-success",
        iconBg: "bg-success/20",
        icon: <CheckCircle size={16} />,
        button: "btn-success",
      }
    : {
        bg: "bg-error/5",
        border: "border-error/10",
        text: "text-error",
        iconBg: "bg-error/20",
        icon: <AlertCircle size={16} />,
        button: "btn-error",
      };

  return (
    <div className={`modal modal-middle ${isOpen ? "modal-open" : ""}`}>
      
      {/* MODAL BOX */}
      <div className={`modal-box p-0 bg-base-100 overflow-hidden w-11/12 max-w-[380px] border ${isApprove ? "border-success/30" : "border-error/30"} shadow-2xl rounded-xl flex flex-col antialiased-text`}>
        
        {/* HEADER: High-Contrast Dynamic Strip */}
        <div className={`px-4 py-3 border-b flex justify-between items-start shrink-0 ${theme.bg} ${theme.border}`}>
          <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded-md shadow-sm ${theme.iconBg} ${theme.text}`}>
              {theme.icon}
            </div>
            <div className="flex flex-col">
              <h3 className={`text-[13px] font-black uppercase tracking-widest leading-none ${theme.text}`}>
                {isApprove ? "Approve Request" : "Reject Request"}
              </h3>
              <p className={`text-[9px] font-bold uppercase tracking-widest opacity-60 mt-1 ${theme.text}`}>
                Action Required
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
            You are about to <strong className={`font-black ${theme.text}`}>{isApprove ? "APPROVE" : "REJECT"}</strong> the leave request submitted by <strong className="text-base-content font-black">{actionData.fullname}</strong>.
          </p>
          <div className="mt-4 p-2.5 bg-base-200/50 border border-base-300 rounded-lg">
            <p className="text-[10px] text-base-content/60 italic leading-snug">
              * This action will update the system records and notify the employee accordingly.
            </p>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="px-4 py-3 border-t border-base-200 bg-base-200/30 flex justify-end gap-2 shrink-0">
          <button 
            type="button"
            onClick={onClose} 
            disabled={isProcessing}
            className="btn btn-sm h-8 min-h-0 btn-ghost text-[10px] font-bold uppercase tracking-widest px-4"
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={onConfirm} 
            disabled={isProcessing}
            className={`btn btn-sm h-8 min-h-0 text-white text-[10px] font-bold uppercase tracking-widest px-5 shadow-sm border-none ${theme.button}`}
          >
            {isProcessing ? (
              <Loader2 className="animate-spin size-4" />
            ) : (
              isApprove ? "Confirm Approval" : "Confirm Rejection"
            )}
          </button>
        </div>
      </div>

      {/* CLICKABLE BACKDROP */}
      <div 
        className="modal-backdrop bg-black/60 backdrop-blur-sm" 
        onClick={() => !isProcessing && onClose()}
      ></div>
    </div>
  );
};

export default ConfirmLeaveActionModal;
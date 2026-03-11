"use client";

import { useState } from "react";
import { AlertCircle, X, Loader2, Send } from "lucide-react";

const OvertimeRejectReasonModal = ({
  isOpen,
  onClose,
  onConfirm,
  isProcessing,
}) => {
  const [reason, setReason] = useState("");

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    onConfirm(reason);
    setReason("");
  };

  return (
    <dialog className={`modal modal-middle ${isOpen ? "modal-open" : ""}`}>
      
      {/* MODAL BOX */}
      <div className="modal-box p-0 bg-base-100 overflow-hidden w-11/12 max-w-[380px] border border-error/30 shadow-2xl rounded-xl flex flex-col antialiased-text">
        
        {/* HEADER: Warning Strip */}
        <div className="px-4 py-3 border-b border-error/10 bg-error/5 flex justify-between items-start shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-error/20 rounded-md text-error shadow-sm">
              <AlertCircle size={16} />
            </div>
            <div className="flex flex-col">
              <h3 className="text-[13px] font-black text-error uppercase tracking-widest leading-none">
                Reject Overtime
              </h3>
              <p className="text-[9px] font-bold uppercase tracking-widest text-error/60 mt-1">
                Final Confirmation
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            disabled={isProcessing}
            className="btn btn-xs btn-circle btn-ghost text-error/50 hover:text-error hover:bg-error/10"
          >
            <X size={14} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-4 bg-base-100 flex flex-col gap-4">
          <p className="text-[12px] text-base-content/70 leading-relaxed font-medium">
            Confirming this rejection will update the overtime records. You may include an optional explanation for the employee below.
          </p>

          <div className="form-control w-full">
            <label className="text-[9px] font-black text-base-content/40 uppercase tracking-[0.15em] mb-1.5 ml-0.5">
              Rejection Note <span className="opacity-50">(Optional)</span>
            </label>
            <textarea
              className="textarea textarea-bordered text-[11px] leading-snug w-full h-24 resize-none p-2 focus:border-error focus:outline-none bg-base-200/30"
              placeholder="E.g., Task priority has changed or budget constraints..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isProcessing}
            ></textarea>
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
            onClick={handleSubmit} 
            disabled={isProcessing}
            className="btn btn-sm h-8 min-h-0 btn-error text-white text-[10px] font-black uppercase tracking-widest px-5 shadow-sm border-none"
          >
            {isProcessing ? (
              <Loader2 className="animate-spin size-4" />
            ) : (
              <>
                <Send size={12} className="mr-1.5" /> Confirm Reject
              </>
            )}
          </button>
        </div>
      </div>

      {/* CLICKABLE BACKDROP: Using the deeper black for admin focus */}
      <div 
        className="modal-backdrop bg-black/60 backdrop-blur-md" 
        onClick={() => !isProcessing && onClose()}
      >
        <button className="cursor-default" type="button">close</button>
      </div>
    </dialog>
  );
};

export default OvertimeRejectReasonModal;
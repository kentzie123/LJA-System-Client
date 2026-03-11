import React, { useEffect, useRef } from "react";
import { AlertTriangle, X, Trash2, Loader2 } from "lucide-react";

const DeleteAllowanceModal = ({ isOpen, onClose, onConfirm, allowanceName, isDeleting }) => {
  const modalRef = useRef(null);

  // Synchronize the native dialog state with the isOpen prop
  useEffect(() => {
    if (isOpen) {
      modalRef.current?.showModal();
    } else {
      modalRef.current?.close();
    }
  }, [isOpen]);

  return (
    <dialog 
      ref={modalRef} 
      className="modal modal-middle" 
      onClose={onClose}
    >
      <div className="modal-box p-0 bg-base-100 overflow-hidden w-11/12 max-w-sm border border-base-300 shadow-2xl rounded-2xl flex flex-col">
        
        {/* HEADER & ICON SECTION */}
        <div className="p-6 pb-2 flex flex-col items-center text-center">
          {/* Circular Alert Icon */}
          <div className="w-14 h-14 rounded-full bg-error/10 flex items-center justify-center text-error mb-4 animate-pulse">
            <AlertTriangle size={28} />
          </div>
          
          <h3 className="text-lg font-bold text-base-content">Delete Allowance?</h3>
          <p className="text-[11px] font-bold text-base-content/40 uppercase tracking-widest mt-1">
            This action is permanent
          </p>
        </div>

        {/* BODY */}
        <div className="px-6 py-4">
          <p className="text-sm text-base-content/70 leading-relaxed text-center">
            Are you sure you want to delete <span className="font-bold text-error">"{allowanceName}"</span>? 
            This will remove all associated records from the system.
          </p>
          
          {/* Subtle Warning Box */}
          <div className="mt-4 p-3 bg-error/5 rounded-xl border border-error/10">
            <p className="text-[10px] text-error/80 leading-tight text-center italic">
              Warning: All payment history and subscriber records for this allowance will be wiped.
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 bg-base-200/50 border-t border-base-300 flex flex-col sm:flex-row gap-2">
          <button 
            type="button"
            onClick={onClose} 
            className="btn btn-sm h-10 flex-1 rounded-lg btn-ghost text-xs order-2 sm:order-1"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={onConfirm} 
            className="btn btn-sm h-10 flex-[1.5] rounded-lg btn-error text-white text-xs gap-2 shadow-md order-1 sm:order-2"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="animate-spin size-4" />
            ) : (
              <>
                <Trash2 size={14} />
                <span>Confirm Delete</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* Click outside to close */}
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose} className="cursor-default">close</button>
      </form>
    </dialog>
  );
};

export default DeleteAllowanceModal;
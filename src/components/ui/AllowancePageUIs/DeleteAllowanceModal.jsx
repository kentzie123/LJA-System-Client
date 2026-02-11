import React from "react";
import { AlertTriangle, X, Trash2 } from "lucide-react";

const DeleteAllowanceModal = ({ isOpen, onClose, onConfirm, allowanceName, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      
      {/* MODAL CONTAINER */}
      <div className="bg-base-100 rounded-xl shadow-2xl w-full max-w-sm border border-base-200 overflow-hidden transform transition-all scale-100">
        
        {/* --- HEADER --- */}
        <div className="p-4 flex justify-between items-start">
          <div className="flex gap-3">
            {/* Icon Box */}
            <div className="p-3 bg-error/10 text-error rounded-lg h-fit">
              <AlertTriangle size={24} />
            </div>
            {/* Title & Subtitle */}
            <div>
              <h3 className="text-lg font-bold text-base-content">Delete Allowance?</h3>
              <p className="text-xs text-base-content/60 mt-1">
                This action cannot be undone.
              </p>
            </div>
          </div>
          {/* Close Button */}
          <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost opacity-50 hover:opacity-100">
            <X size={18} />
          </button>
        </div>

        {/* --- BODY --- */}
        <div className="px-6 py-2">
          <p className="text-sm text-base-content/80 leading-relaxed">
            Are you sure you want to delete <span className="font-bold text-base-content">"{allowanceName}"</span>?
          </p>
          
          {/* Warning Box */}
          <div className="mt-3 p-3 bg-base-200 rounded-lg border border-base-300">
            <p className="text-xs opacity-70">
              <span className="font-bold">Warning:</span> All payment history and subscriber records associated with this allowance will be permanently removed.
            </p>
          </div>
        </div>

        {/* --- FOOTER --- */}
        <div className="p-4 bg-base-200/50 flex gap-3 justify-end mt-4">
          <button 
            onClick={onClose} 
            className="btn btn-ghost"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            className="btn btn-error text-white gap-2"
            disabled={isDeleting}
          >
            {isDeleting ? <span className="loading loading-spinner loading-xs"></span> : <Trash2 size={16} />}
            Delete Allowance
          </button>
        </div>

      </div>
    </div>
  );
};

export default DeleteAllowanceModal;
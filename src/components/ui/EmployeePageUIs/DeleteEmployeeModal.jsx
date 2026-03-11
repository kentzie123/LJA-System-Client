"use client";

import { useEffect, useRef } from "react";
import { useUserStore } from "@/stores/useUserStore";
import { Trash2, X, Loader2 } from "lucide-react";

const DeleteEmployeeModal = ({ isOpen, onClose, employee }) => {
  const { deleteUser, isDeletingUser } = useUserStore();
  const modalRef = useRef(null);

  // Sync native dialog
  useEffect(() => {
    if (isOpen) {
      modalRef.current?.showModal();
    } else {
      modalRef.current?.close();
    }
  }, [isOpen]);

  const handleDelete = async () => {
    if (!employee) return;
    const success = await deleteUser(employee.id);
    if (success) {
      onClose();
    }
  };

  return (
    <dialog ref={modalRef} className={`modal modal-middle ${isOpen ? "modal-open" : ""}`} onClose={onClose}>
      
      {/* MODAL BOX */}
      <div className="modal-box p-0 bg-base-100 overflow-hidden w-11/12 max-w-[380px] border border-error/30 shadow-2xl rounded-xl flex flex-col antialiased-text">
        
        {/* HEADER: High-Contrast Alert Strip */}
        <div className="px-5 py-4 border-b border-error/10 bg-error/5 flex justify-between items-start shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-error/20 rounded-md text-error shadow-sm">
              <Trash2 size={16} />
            </div>
            <div className="flex flex-col">
              <h3 className="text-[13px] font-black text-error uppercase tracking-widest">
                System Warning
              </h3>
              <p className="text-[9px] font-bold uppercase tracking-widest text-error/60 mt-0.5">
                Destructive Action
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            disabled={isDeletingUser}
            className="btn btn-xs btn-circle btn-ghost text-error/50 hover:text-error hover:bg-error/10"
          >
            <X size={16} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-5 bg-base-100">
          <p className="text-[12px] text-base-content/80 leading-relaxed font-medium">
            You are about to permanently delete <strong className="text-base-content font-black">{employee?.fullname || "this employee"}</strong> from the system database. 
          </p>
          <div className="mt-4 p-3 bg-base-200/50 border border-base-300 rounded-lg">
            <p className="text-[10px] text-base-content/60 italic leading-snug">
              * This action cannot be undone. All access privileges will be revoked immediately and associated non-archived data may be lost.
            </p>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="px-5 py-3 border-t border-base-200 bg-base-200/30 flex justify-end gap-2 shrink-0">
          <button 
            type="button"
            onClick={onClose} 
            disabled={isDeletingUser}
            className="btn btn-sm h-8 min-h-0 btn-ghost text-[10px] font-bold uppercase tracking-widest px-4"
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={handleDelete} 
            disabled={isDeletingUser}
            className="btn btn-sm h-8 min-h-0 btn-error text-white text-[10px] font-bold uppercase tracking-widest px-5 shadow-sm"
          >
            {isDeletingUser ? (
              <Loader2 className="animate-spin size-4" />
            ) : (
              "Confirm Deletion"
            )}
          </button>
        </div>
      </div>

      {/* NATIVE DAISY UI BACKDROP */}
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose} disabled={isDeletingUser}>close</button>
      </form>
    </dialog>
  );
};

export default DeleteEmployeeModal;
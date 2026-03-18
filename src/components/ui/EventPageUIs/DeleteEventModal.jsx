"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import { useEventStore } from "@/stores/useEventStore";

const DeleteEventModal = ({ isOpen, onClose, event }) => {
  const { deleteEvent, isOperating } = useEventStore();

  const handleDelete = async () => {
    if (!event) return;
    const success = await deleteEvent(event.id);
    if (success) onClose();
  };

  return (
    <dialog className={`modal modal-middle ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box p-0 bg-base-100 w-11/12 max-w-[320px] border border-error/20 shadow-2xl rounded-xl overflow-hidden">
        
        {/* WARNING HEADER */}
        <div className="bg-error/10 px-4 py-4 flex flex-col items-center gap-2 border-b border-error/10">
          <div className="bg-error text-error-content p-2 rounded-full shadow-lg shadow-error/20">
            <AlertTriangle size={20} />
          </div>
          <h3 className="text-sm font-black uppercase tracking-widest text-error">
            Confirm Deletion
          </h3>
        </div>

        {/* CONTENT */}
        <div className="p-5 text-center">
          <p className="text-[11px] font-bold text-base-content/40 uppercase tracking-tight mb-1">
            You are about to remove:
          </p>
          <p className="text-sm font-black text-base-content leading-tight mb-4">
            {event?.title || "this event"}
          </p>
          <p className="text-[10px] leading-relaxed text-base-content/60 bg-base-200 p-3 rounded-lg border border-base-300">
            This action is <span className="text-error font-bold underline">permanent</span>. It will be removed from the company calendar and payroll calculations immediately.
          </p>
        </div>

        {/* FOOTER */}
        <div className="px-4 py-3 bg-base-200/50 flex flex-col gap-2">
          <button
            onClick={handleDelete}
            disabled={isOperating}
            className="btn btn-sm btn-error w-full h-9 min-h-0 text-[10px] font-black uppercase tracking-widest"
          >
            {isOperating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Delete Permanently"
            )}
          </button>
          <button
            onClick={onClose}
            disabled={isOperating}
            className="btn btn-sm btn-ghost w-full h-9 min-h-0 text-[10px] font-bold uppercase tracking-widest opacity-60"
          >
            Cancel
          </button>
        </div>
      </div>

      <div 
        className="modal-backdrop bg-black/60 backdrop-blur-sm" 
        onClick={() => !isOperating && onClose()} 
      />
    </dialog>
  );
};

export default DeleteEventModal;
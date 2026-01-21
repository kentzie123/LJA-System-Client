"use client";

import React from "react";
import { Trash2 } from "lucide-react"; // Using Trash2 to match your design request
import { usePayrollStore } from "@/stores/usePayrollStore";

const DeleteactivePayRunModal = ({ isOpen, onClose }) => {
  // 1. Get Action & State directly from store
  const { deletePayRun, isDeleting, activePayRun } = usePayrollStore();

  if (!isOpen) return null;

  const handleDelete = async () => {
    if (!activePayRun?.id) return;

    // Call store action
    const success = await deletePayRun(activePayRun.id);

    // Close on success
    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-base-100 w-full max-w-sm rounded-3xl shadow-2xl border border-base-300 p-6 flex flex-col items-center text-center">
        {/* Icon Circle */}
        <div className="size-14 rounded-full bg-error/10 flex items-center justify-center mb-4">
          <Trash2 className="size-7 text-error" />
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-base-content mb-2">
          Delete Pay Run?
        </h3>

        {/* Description */}
        <p className="text-sm text-base-content/60 mb-8 leading-relaxed">
          You are about to delete the payroll period for
          <br />
          <strong className="text-base-content font-semibold">
            {activePayRun?.run_name || "this period"}
          </strong>
          .
          <span className="block mt-2 text-error/80 font-medium">
            This action cannot be undone. All calculated records will be
            permanently removed.
          </span>
        </p>

        {/* Actions */}
        <div className="w-full space-y-3">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="btn btn-error w-full rounded-xl text-white font-bold hover:brightness-90 border-none h-12 min-h-0"
          >
            {isDeleting ? (
              <span className="loading loading-spinner loading-sm text-white"></span>
            ) : (
              "Yes, Delete Pay Run"
            )}
          </button>

          <button
            onClick={onClose}
            disabled={isDeleting}
            className="btn bg-base-200 hover:bg-base-300 text-base-content w-full rounded-xl border-none h-12 min-h-0"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteactivePayRunModal;

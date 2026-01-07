"use client";

import { useUserStore } from "@/stores/useUserStore";
import { AlertTriangle, X } from "lucide-react";

const DeleteEmployeeModal = ({ isOpen, onClose, employee }) => {
  const { deleteUser, isDeletingUser } = useUserStore();

  if (!isOpen || !employee) return null;

  const handleDelete = async () => {
    // 1. Call the store action
    const success = await deleteUser(employee.id);

    // 2. Close modal only if successful
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-base-100 w-full max-w-md rounded-2xl shadow-2xl border border-base-300 overflow-hidden scale-in-95 duration-200">
        {/* Header with Close Button */}
        <div className="flex justify-end p-4">
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost text-base-content/50 hover:text-base-content"
            disabled={isDeletingUser}
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col items-center text-center px-8 pb-8">
          {/* Warning Icon */}
          <div className="size-16 bg-error/10 text-error rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="size-8" />
          </div>

          <h3 className="text-xl font-bold text-base-content">
            Delete Employee?
          </h3>

          <p className="text-sm text-base-content/60 mt-2">
            Are you sure you want to remove{" "}
            <span className="font-bold text-base-content">
              {employee.fullname}
            </span>{" "}
            from the system? This action cannot be undone.
          </p>

          {/* Action Buttons */}
          <div className="flex w-full gap-3 mt-8">
            <button
              onClick={onClose}
              className="btn btn-outline border-base-300 text-base-content/70 hover:bg-base-200 hover:text-base-content flex-1"
              disabled={isDeletingUser}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="btn btn-error text-error-content flex-1"
              disabled={isDeletingUser}
            >
              {isDeletingUser ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteEmployeeModal;

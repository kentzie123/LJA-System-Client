import React from "react";
import { AlertCircle, CheckCircle, XCircle, X, Loader2 } from "lucide-react";
import { useAttendanceStore } from "@/stores/useAttendanceStore";

const VerifyConfirmModal = ({ isOpen, onClose, onConfirm, statusToApply, itemCount = 1 }) => {
  const { isEditingAttendance } = useAttendanceStore();

  if (!isOpen) return null;

  const isVerify = statusToApply === "Verified";
  const isBulk = itemCount > 1;

  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden border border-base-300 scale-in-95 duration-200">
        
        {/* Dynamic Header */}
        <div className={`p-5 flex items-center gap-3 border-b ${isVerify ? "bg-success/10 border-success/20 text-success" : "bg-error/10 border-error/20 text-error"}`}>
          {isVerify ? <CheckCircle size={24} /> : <XCircle size={24} />}
          <h3 className="text-lg font-bold">
            Confirm {isVerify ? "Verification" : "Rejection"}
          </h3>
        </div>

        {/* Body content */}
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3 text-base-content/80">
            <AlertCircle className="size-5 mt-0.5 shrink-0 opacity-60" />
            <div>
              <p className="text-sm font-medium leading-relaxed">
                Are you sure you want to <strong>{isVerify ? "verify" : "reject"}</strong> {isBulk ? `these ${itemCount} attendance records` : "this attendance record"}?
              </p>
              {isVerify ? (
                <p className="text-xs mt-2 opacity-60">
                  This confirms the employee's time logs and photo evidence are accurate for payroll.
                </p>
              ) : (
                <p className="text-xs mt-2 opacity-60 text-error">
                  This will mark the record as rejected. Ensure you have communicated the reason to the employee.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-base-200/50 border-t border-base-200 flex justify-end gap-3">
          <button 
            onClick={onClose} 
            className="btn btn-ghost hover:bg-base-200"
            disabled={isEditingAttendance}
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm}
            disabled={isEditingAttendance}
            className={`btn min-w-[100px] text-white shadow-sm ${
              isVerify 
                ? "bg-success hover:bg-success/90 border-none shadow-success/20" 
                : "bg-error hover:bg-error/90 border-none shadow-error/20"
            }`}
          >
            {isEditingAttendance ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              isVerify ? "Yes, Verify" : "Yes, Reject"
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default VerifyConfirmModal;
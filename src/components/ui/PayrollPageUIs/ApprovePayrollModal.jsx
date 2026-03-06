import React from "react";
import { AlertTriangle, CheckCircle, X, Loader2, FileCheck2 } from "lucide-react";

const ApprovePayrollModal = ({ isOpen, onClose, onConfirm, isFinalizing, runName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-base-100 w-full max-w-md rounded-2xl shadow-2xl border border-base-300 flex flex-col overflow-hidden scale-in-95 duration-200">
        
        {/* HEADER */}
        <div className="bg-warning/10 border-b border-warning/20 p-5 flex items-start gap-4 relative">
          <button 
            onClick={onClose}
            disabled={isFinalizing}
            className="absolute top-4 right-4 text-base-content/50 hover:text-base-content transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
          
          <div className="p-3 bg-warning/20 text-warning rounded-full shrink-0">
            <AlertTriangle size={24} />
          </div>
          <div className="pt-1">
            <h3 className="text-lg font-bold text-base-content leading-tight">
              Approve Payroll?
            </h3>
            <p className="text-sm text-base-content/70 mt-1 font-medium">
              {runName || "This payroll period"}
            </p>
          </div>
        </div>

        {/* BODY */}
        <div className="p-6">
          <p className="text-sm text-base-content/80 mb-4">
            You are about to officially finalize this payroll run. Please confirm that you have reviewed the details, as this action will trigger the following events:
          </p>

          <ul className="space-y-3 mb-2">
            <li className="flex items-start gap-3 text-sm text-base-content/80">
              <CheckCircle size={18} className="text-success shrink-0 mt-0.5" />
              <span><strong>Payslips Visible:</strong> Employees will now be able to view and download their official payslips.</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-base-content/80">
              <FileCheck2 size={18} className="text-info shrink-0 mt-0.5" />
              <span><strong>Status Locked:</strong> The pay run will be marked as <span className="badge badge-success badge-sm border-none ml-1">APPROVED</span>.</span>
            </li>
          </ul>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="bg-base-200/50 p-5 border-t border-base-300 flex justify-end gap-3">
          <button 
            onClick={onClose} 
            disabled={isFinalizing}
            className="btn btn-ghost"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            disabled={isFinalizing}
            className="btn btn-primary text-primary-content gap-2"
          >
            {isFinalizing ? (
              <>
                <Loader2 className="animate-spin size-4" />
                Approving...
              </>
            ) : (
              <>
                <CheckCircle size={18} />
                Yes, Approve Payroll
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ApprovePayrollModal;
"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar, Loader2, AlertCircle } from "lucide-react";
import { usePayrollStore } from "@/stores/usePayrollStore";
import { toast } from "react-hot-toast";

const CreatePayRunModal = ({ isOpen, onClose }) => {
  const { createPayRun, isCreating } = usePayrollStore();

  const [formData, setFormData] = useState({
    start_date: "",
    end_date: "",
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({ start_date: "", end_date: "" });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    // A. Validation
    if (!formData.start_date || !formData.end_date) {
      toast.error("Please select the cut-off range.");
      return;
    }

    // B. Auto-Generate Name & Pay Date
    const s = new Date(formData.start_date);
    const e = new Date(formData.end_date);
    const options = { month: "short", day: "numeric" };

    // Format: "Payroll: Dec 26 - Jan 10"
    const autoName = `Payroll: ${s.toLocaleDateString(
      "en-US",
      options
    )} - ${e.toLocaleDateString("en-US", options)}`;

    // C. Construct Payload
    const payload = {
      start_date: formData.start_date,
      end_date: formData.end_date,
      pay_date: formData.end_date,
      run_name: autoName,
    };

    // D. Call Store Action
    // The store handles the API call, Toast success/error, and refreshing the list.
    const success = await createPayRun(payload);

    // E. Close Modal on Success
    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-base-100 w-full max-w-sm rounded-xl shadow-2xl border border-white/10 flex flex-col scale-in-95 duration-200">
        {/* --- HEADER --- */}
        <div className="p-5 border-b border-white/10 flex justify-between items-center bg-base-200/30 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Calendar size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Run Payroll</h3>
              <p className="text-xs opacity-60">New Calculation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost text-base-content/50 hover:text-error"
          >
            <X size={18} />
          </button>
        </div>

        {/* --- BODY --- */}
        <div className="p-6 space-y-5">
          {/* Info Box */}
          <div className="alert bg-base-200 text-xs border border-base-content/10 flex items-start gap-3 rounded-lg">
            <AlertCircle className="size-5 shrink-0 opacity-50" />
            <span className="opacity-70">
              System will auto-generate the Run Name and set the Pay Date to the
              Cut-off End Date.
            </span>
          </div>

          {/* Date Inputs */}
          <div className="space-y-4">
            <div className="form-control">
              <label className="label text-xs font-bold uppercase text-base-content/60">
                Cut-off Start
              </label>
              <input
                type="date"
                className="input input-bordered w-full focus:outline-none focus:border-primary"
                value={formData.start_date}
                onChange={(e) =>
                  setFormData({ ...formData, start_date: e.target.value })
                }
              />
            </div>
            <div className="form-control">
              <label className="label text-xs font-bold uppercase text-base-content/60">
                Cut-off End
              </label>
              <input
                type="date"
                className="input input-bordered w-full focus:outline-none focus:border-primary"
                value={formData.end_date}
                onChange={(e) =>
                  setFormData({ ...formData, end_date: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* --- FOOTER --- */}
        <div className="p-5 border-t border-white/10 flex gap-3 justify-end bg-base-100 rounded-b-xl">
          <button
            onClick={onClose}
            disabled={isCreating}
            className="btn btn-ghost hover:bg-base-200"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={isCreating}
            className="btn btn-primary px-6 shadow-lg shadow-primary/20"
          >
            {isCreating ? (
              <>
                <Loader2 className="animate-spin size-4" />
                Processing...
              </>
            ) : (
              "Run Calculation"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePayRunModal;

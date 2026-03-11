"use client";

import { useEffect, useState } from "react";
import { X, CircleAlert, Loader2, Send } from "lucide-react";
import { useLeaveStore } from "@/stores/useLeaveStore";

// IMPORT CUSTOM DATE PICKER
import CustomDatePicker from "@/components/ui/Selections/CustomDatePicker";

const NewLeaveModal = ({ isOpen, onClose }) => {
  const {
    leaveTypes,
    fetchLeaveTypes,
    createLeaveRequest,
    isCreating,
    userBalances,
    fetchLeaveBalances,
  } = useLeaveStore();

  const [formData, setFormData] = useState({
    leaveTypeId: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      fetchLeaveTypes();
      fetchLeaveBalances();
      setFormData({ leaveTypeId: "", startDate: "", endDate: "", reason: "" });
      setErrors({});
    }
  }, [isOpen, fetchLeaveTypes, fetchLeaveBalances]);

  // --- DYNAMIC BALANCE CHECKER ---
  const getSelectedBalance = () => {
    if (!formData.leaveTypeId) return "Select type";

    const selectedType = leaveTypes.find((t) => t.id === Number(formData.leaveTypeId));
    if (!selectedType) return "Unknown";

    const balance = userBalances.find((b) => b.leave_name === selectedType.name);

    if (balance) {
      const remaining = balance.allocated_days - balance.used_days;
      return `${remaining} Days Left`;
    }

    return "0 Credits";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleDateChange = (name, value) => {
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      if (name === "startDate" && prev.endDate && new Date(value) > new Date(prev.endDate)) {
        newData.endDate = value;
      }
      return newData;
    });
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.leaveTypeId) newErrors.leaveTypeId = "Required";
    if (!formData.startDate) newErrors.startDate = "Required";
    if (!formData.endDate) newErrors.endDate = "Required";
    if (!formData.reason.trim()) newErrors.reason = "Required";

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.endDate) < new Date(formData.startDate)) {
        newErrors.endDate = "Invalid range";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const success = await createLeaveRequest(formData);
    if (success) onClose();
  };

  return (
    <div className={`modal modal-middle ${isOpen ? "modal-open" : ""}`}>
      
      {/* MODAL BOX */}
      <div className="modal-box p-0 bg-base-100 overflow-hidden w-11/12 max-w-[420px] border border-base-300 shadow-2xl rounded-xl flex flex-col max-h-[90vh] antialiased-text">
        
        {/* HEADER */}
        <div className="px-4 py-3 border-b border-base-200 bg-base-200/50 flex justify-between items-center shrink-0">
          <div className="flex flex-col">
            <h3 className="font-black text-sm uppercase tracking-wider text-base-content leading-none">
              Apply for Leave
            </h3>
            <div className="flex items-center gap-1.5 mt-1.5 text-[9px] font-bold uppercase tracking-widest text-primary">
               <CircleAlert size={10} />
               <span>Available: {getSelectedBalance()}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isCreating}
            className="btn btn-xs btn-circle btn-ghost text-base-content/50 hover:text-error"
          >
            <X size={14} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar flex-1 bg-base-100">
          <form id="new-leave-form" onSubmit={handleSubmit} className="space-y-3.5">
            
            {/* LEAVE TYPE */}
            <div className="form-control relative z-[50]">
              <label className="text-[9px] font-bold text-base-content/50 uppercase tracking-widest mb-1 flex justify-between">
                Leave Category {errors.leaveTypeId && <span className="text-error">{errors.leaveTypeId}</span>}
              </label>
              <select
                name="leaveTypeId"
                value={formData.leaveTypeId}
                onChange={handleChange}
                className={`select select-bordered select-sm h-8 min-h-0 w-full text-[11px] ${errors.leaveTypeId ? "select-error" : ""}`}
              >
                <option value="" disabled>Select category...</option>
                {leaveTypes.map((type) => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>

            {/* DATES */}
            <div className="grid grid-cols-2 gap-3">
              <div className="form-control relative z-[40]">
                <label className="text-[9px] font-bold text-base-content/50 uppercase tracking-widest mb-1 flex justify-between">
                  Start {errors.startDate && <span className="text-error text-[10px]">*</span>}
                </label>
                <CustomDatePicker 
                  value={formData.startDate}
                  onChange={(val) => handleDateChange("startDate", val)}
                  className={errors.startDate ? "border-error" : ""}
                />
              </div>

              <div className="form-control relative z-[40]">
                <label className="text-[9px] font-bold text-base-content/50 uppercase tracking-widest mb-1 flex justify-between">
                  End {errors.endDate && <span className="text-error text-[10px]">*</span>}
                </label>
                <CustomDatePicker 
                  value={formData.endDate}
                  onChange={(val) => handleDateChange("endDate", val)}
                  className={errors.endDate ? "border-error" : ""}
                />
              </div>
            </div>

            {/* REASON */}
            <div className="form-control relative z-0">
              <label className="text-[9px] font-bold text-base-content/50 uppercase tracking-widest mb-1 flex justify-between">
                Purpose of Request {errors.reason && <span className="text-error">{errors.reason}</span>}
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                className={`textarea textarea-bordered text-[11px] leading-snug w-full h-20 resize-none p-2 ${errors.reason ? "textarea-error" : ""}`}
                placeholder="Briefly explain the reason for your leave..."
              ></textarea>
            </div>
          </form>
        </div>

        {/* FOOTER BUTTONS */}
        <div className="px-4 py-3 border-t border-base-200 bg-base-200/30 flex justify-end gap-2 shrink-0">
          <button 
            type="button"
            onClick={onClose} 
            className="btn btn-sm h-8 min-h-0 btn-ghost text-[10px] uppercase font-bold px-4"
            disabled={isCreating}
          >
            Cancel
          </button>
          <button 
            type="submit"
            form="new-leave-form"
            className="btn btn-sm h-8 min-h-0 btn-primary text-primary-content text-[10px] uppercase font-bold px-4 shadow-sm border-none"
            disabled={isCreating}
          >
            {isCreating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                <Send size={12} className="mr-1" /> Submit Application
              </>
            )}
          </button>
        </div>
      </div>

      {/* CLICKABLE BACKDROP */}
      <div className="modal-backdrop bg-black/60 backdrop-blur-sm" onClick={() => !isCreating && onClose()}></div>
    </div>
  );
};

export default NewLeaveModal;
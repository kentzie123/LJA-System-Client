"use client";

import { useEffect, useState } from "react";
import { X, Loader2, Save } from "lucide-react";
import { useLeaveStore } from "@/stores/useLeaveStore";

// IMPORT CUSTOM DATE PICKER
import CustomDatePicker from "@/components/ui/Selections/CustomDatePicker";

const EditLeaveModal = ({ isOpen, onClose }) => {
  const { 
    leaveTypes, fetchLeaveTypes, 
    updateLeaveRequest, 
    selectedLeave, isCreating 
  } = useLeaveStore();

  const [formData, setFormData] = useState({
    leaveTypeId: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && leaveTypes.length === 0) fetchLeaveTypes();
  }, [isOpen, leaveTypes.length, fetchLeaveTypes]);

  useEffect(() => {
    if (isOpen && selectedLeave) {
      let typeId = selectedLeave.leave_type_id;
      
      if (!typeId && leaveTypes.length > 0) {
        const foundType = leaveTypes.find(t => t.name === selectedLeave.leave_type);
        if (foundType) typeId = foundType.id;
      }

      setFormData({
        leaveTypeId: typeId || "", 
        startDate: selectedLeave.start_date ? selectedLeave.start_date.slice(0, 10) : "",
        endDate: selectedLeave.end_date ? selectedLeave.end_date.slice(0, 10) : "",
        reason: selectedLeave.reason || "",
      });
      setErrors({});
    }
  }, [isOpen, selectedLeave, leaveTypes]); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleDateChange = (name, value) => {
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      
      if (name === "startDate" && prev.endDate && new Date(value) > new Date(prev.endDate)) {
        newData.endDate = value;
      }
      
      return newData;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.leaveTypeId) newErrors.leaveTypeId = "Required";
    if (!formData.startDate) newErrors.startDate = "Required";
    if (!formData.endDate) newErrors.endDate = "Required";
    if (!formData.reason.trim()) newErrors.reason = "Required";

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.endDate) < new Date(formData.startDate)) {
        newErrors.endDate = "Cannot be before start date.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    const success = await updateLeaveRequest(selectedLeave.id, formData);
    if (success) onClose();
  };

  return (
    <div className={`modal modal-middle ${isOpen ? "modal-open" : ""}`}>
      
      {/* MODAL BOX */}
      <div className="modal-box p-0 bg-base-100 overflow-hidden w-11/12 max-w-[400px] border border-base-300 shadow-2xl rounded-xl flex flex-col max-h-[90vh] antialiased-text">
        
        {/* HEADER */}
        <div className="px-4 py-3 border-b border-base-200 bg-base-200/50 flex justify-between items-center shrink-0">
          <div className="flex flex-col">
            <h3 className="font-black text-sm uppercase tracking-wider text-base-content leading-none">
              Edit Request
            </h3>
            <p className="text-[9px] font-bold uppercase tracking-widest text-base-content/50 mt-1">
              Modify Leave Details
            </p>
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
          
          <form id="edit-leave-form" onSubmit={handleSubmit} className="space-y-3">
            
            {/* 1. SELECT LEAVE TYPE */}
            <div className="form-control relative z-[50]">
              <label className="text-[9px] font-bold text-base-content/50 uppercase tracking-widest mb-1 flex justify-between">
                Leave Type {errors.leaveTypeId && <span className="text-error">{errors.leaveTypeId}</span>}
              </label>
              <select 
                name="leaveTypeId"
                value={formData.leaveTypeId} 
                onChange={handleChange}
                className={`select select-bordered select-sm h-8 min-h-0 w-full text-[11px] ${errors.leaveTypeId ? "select-error" : ""}`}
              >
                <option value="" disabled>Select type...</option>
                {leaveTypes.map((type) => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>

            {/* 2. DATES */}
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
            {errors.endDate && <p className="text-[9px] font-bold text-error uppercase tracking-widest mt-0.5">{errors.endDate}</p>}

            {/* 3. REASON */}
            <div className="form-control relative z-0">
              <label className="text-[9px] font-bold text-base-content/50 uppercase tracking-widest mb-1 flex justify-between">
                Reason / Notes {errors.reason && <span className="text-error">{errors.reason}</span>}
              </label>
              <textarea 
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                className={`textarea textarea-bordered text-[11px] leading-snug w-full h-20 resize-none p-2 ${errors.reason ? "textarea-error" : ""}`}
                placeholder="Update your reason..."
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
            form="edit-leave-form"
            className="btn btn-sm h-8 min-h-0 btn-primary text-primary-content text-[10px] uppercase font-bold px-4 shadow-sm border-none"
            disabled={isCreating}
          >
            {isCreating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                <Save size={14} /> Save Changes
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

export default EditLeaveModal;
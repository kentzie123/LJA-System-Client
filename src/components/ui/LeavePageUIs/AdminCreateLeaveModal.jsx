import React, { useState, useEffect } from "react";
import { X, FileText, CheckCircle, Loader2 } from "lucide-react";
import { useLeaveStore } from "@/stores/useLeaveStore";
import { useUserStore } from "@/stores/useUserStore";

// IMPORT THE COMPONENTS
import UserSelectDropdown from "@/components/ui/Selections/UserSelectDropdown";
import CustomDatePicker from "@/components/ui/Selections/CustomDatePicker";

const AdminCreateLeaveModal = ({ isOpen, onClose }) => {
  // --- ADDED fetchLeaveTypes HERE ---
  const { leaveTypes, fetchLeaveTypes, createAdminLeaveRequest, isCreating } = useLeaveStore();
  const { users, fetchAllUsers } = useUserStore();

  const [formData, setFormData] = useState({
    targetUserId: "",
    leaveTypeId: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const [errors, setErrors] = useState({});

  // --- UPDATED: Fetch BOTH Users AND Leave Types when modal opens ---
  useEffect(() => {
    if (isOpen) {
      if (users.length === 0) fetchAllUsers();
      if (leaveTypes.length === 0) fetchLeaveTypes(); 
    }
  }, [isOpen, users.length, fetchAllUsers, leaveTypes.length, fetchLeaveTypes]);

  // Reset form when modal closes/opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        targetUserId: "",
        leaveTypeId: "",
        startDate: "",
        endDate: "",
        reason: "",
      });
      setErrors({});
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Custom handler for DatePickers
  const handleDateChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Custom handler for the UserSelectDropdown
  const handleUserSelect = (selectedId) => {
    setFormData({ ...formData, targetUserId: selectedId });
    if (errors.targetUserId) {
      setErrors((prev) => ({ ...prev, targetUserId: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.targetUserId) newErrors.targetUserId = "Please select an employee.";
    if (!formData.leaveTypeId) newErrors.leaveTypeId = "Please select a leave type.";
    if (!formData.startDate) newErrors.startDate = "Start date is required.";
    if (!formData.endDate) newErrors.endDate = "End date is required.";
    if (!formData.reason.trim()) newErrors.reason = "Reason is required.";

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.endDate) < new Date(formData.startDate)) {
        newErrors.endDate = "End date cannot be before start date.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    // Call Store Action
    const success = await createAdminLeaveRequest(formData);
    
    if (success) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-base-100 w-full max-w-lg rounded-2xl overflow-hidden shadow-xl border border-base-300 flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="flex items-center justify-between bg-base-200 py-4 px-6 border-b border-base-300">
          <div className="text-lg font-bold">Assign Leave</div>
          <button
            onClick={onClose}
            disabled={isCreating}
            className="btn btn-ghost btn-sm btn-square text-base-content/50 hover:text-error"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="py-4 px-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          
          {/* INFO BANNER */}
          <div className="alert alert-info shadow-sm text-xs py-2">
            <CheckCircle size={16} />
            <span>Requests created here are <b>automatically approved</b>.</span>
          </div>

          {/* 1. SELECT EMPLOYEE */}
          <fieldset className="fieldset relative z-[60]">
            <legend className="fieldset-legend text-xs font-semibold">Select Employee</legend>
            <UserSelectDropdown 
              users={users} 
              value={formData.targetUserId} 
              onChange={handleUserSelect} 
            />
            {errors.targetUserId && <span className="text-error text-xs mt-1">{errors.targetUserId}</span>}
          </fieldset>

          {/* 2. SELECT LEAVE TYPE */}
          <fieldset className="fieldset relative z-[50]">
            <legend className="fieldset-legend text-xs font-semibold">Leave Type</legend>
            <div className="relative">
              <FileText className="absolute z-1 left-3 top-2.5 text-base-content/50 pointer-events-none" size={16} />
              <select 
                name="leaveTypeId"
                value={formData.leaveTypeId} 
                onChange={handleChange}
                className={`select select-bordered w-full text-xs pl-9 h-10 ${errors.leaveTypeId ? "select-error" : ""}`}
              >
                <option value="" disabled>Select type...</option>
                {leaveTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
            {errors.leaveTypeId && <span className="text-error text-xs mt-1">{errors.leaveTypeId}</span>}
          </fieldset>

          {/* 3. DATES */}
          <div className="grid grid-cols-2 gap-4">
            <fieldset className="fieldset relative z-[40]">
              <legend className="fieldset-legend text-xs font-semibold">Start Date</legend>
              <CustomDatePicker 
                value={formData.startDate}
                onChange={(val) => handleDateChange("startDate", val)}
                className={`text-xs ${errors.startDate ? "border-error" : ""}`}
              />
              {errors.startDate && <span className="text-error text-xs mt-1">{errors.startDate}</span>}
            </fieldset>

            <fieldset className="fieldset relative z-[40]">
              <legend className="fieldset-legend text-xs font-semibold">End Date</legend>
              <CustomDatePicker 
                value={formData.endDate}
                onChange={(val) => handleDateChange("endDate", val)}
                className={`text-xs ${errors.endDate ? "border-error" : ""}`}
              />
              {errors.endDate && <span className="text-error text-xs mt-1">{errors.endDate}</span>}
            </fieldset>
          </div>

          {/* 4. REASON */}
          <fieldset className="fieldset relative z-0">
            <legend className="fieldset-legend text-xs font-semibold">Reason / Notes</legend>
            <textarea 
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              className={`textarea textarea-bordered text-xs w-full h-24 resize-none ${errors.reason ? "textarea-error" : ""}`}
              placeholder="e.g. Medical emergency, Forced leave, etc."
            ></textarea>
            {errors.reason && <span className="text-error text-xs mt-1">{errors.reason}</span>}
          </fieldset>

          {/* FOOTER BUTTONS */}
          <div className="flex justify-end gap-4 mt-4 pt-4 border-t border-base-300">
            <button 
              onClick={onClose} 
              className="btn btn-ghost"
              disabled={isCreating}
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit} 
              className="btn btn-primary min-w-[140px]"
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="size-5 animate-spin mr-2" />
                  Assigning...
                </>
              ) : (
                <>
                  <CheckCircle size={18} className="mr-2" />
                  Assign Leave
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminCreateLeaveModal;
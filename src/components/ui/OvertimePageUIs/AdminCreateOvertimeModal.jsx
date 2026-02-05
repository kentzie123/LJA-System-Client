import React, { useState, useEffect } from "react";
import { X, Calendar, Clock, User, FileText, CheckCircle, Loader2 } from "lucide-react";
import { useOvertimeStore } from "@/stores/useOvertimeStore";
import { useUserStore } from "@/stores/useUserStore";

const AdminCreateOvertimeModal = ({ isOpen, onClose }) => {
  const { overtimeTypes, fetchOvertimeTypes, createAdminOvertimeRequest, isCreating } = useOvertimeStore();
  const { users, fetchAllUsers } = useUserStore();

  const [formData, setFormData] = useState({
    targetUserId: "",
    otTypeId: "",
    date: "",
    startTime: "",
    endTime: "",
    reason: "",
  });

  const [errors, setErrors] = useState({});

  // Fetch initial data
  useEffect(() => {
    if (isOpen) {
      if (users.length === 0) fetchAllUsers();
      if (overtimeTypes.length === 0) fetchOvertimeTypes();
    }
  }, [isOpen, users.length, fetchAllUsers, overtimeTypes.length, fetchOvertimeTypes]);

  // Reset form
  useEffect(() => {
    if (isOpen) {
      setFormData({
        targetUserId: "",
        otTypeId: "",
        date: "",
        startTime: "",
        endTime: "",
        reason: "",
      });
      setErrors({});
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.targetUserId) newErrors.targetUserId = "Please select an employee.";
    if (!formData.otTypeId) newErrors.otTypeId = "Please select an overtime type.";
    if (!formData.date) newErrors.date = "Date is required.";
    if (!formData.startTime) newErrors.startTime = "Start time is required.";
    if (!formData.endTime) newErrors.endTime = "End time is required.";
    if (!formData.reason.trim()) newErrors.reason = "Reason is required.";

    // Logical Check: End Time vs Start Time
    if (formData.startTime && formData.endTime) {
      if (formData.endTime <= formData.startTime) {
        newErrors.endTime = "End time must be after start time.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const success = await createAdminOvertimeRequest(formData);
    
    if (success) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-base-100 w-full max-w-lg rounded-2xl shadow-2xl border border-base-300 flex flex-col max-h-[90vh] overflow-hidden scale-in-95 duration-200">
        
        {/* HEADER */}
        <div className="flex items-center justify-between bg-base-200 py-4 px-6">
          <div className="text-lg font-bold flex items-center gap-2">
            Assign Overtime (Admin)
          </div>
          <button
            onClick={onClose}
            disabled={isCreating}
            className="btn btn-ghost btn-sm btn-square text-base-content/50 hover:text-error"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="py-4 px-6 space-y-4 overflow-y-auto">
          
          {/* INFO BANNER */}
          <div className="alert alert-info shadow-sm text-xs py-2">
            <CheckCircle size={16} />
            <span>Requests created here are <b>automatically approved</b>.</span>
          </div>

          {/* 1. SELECT EMPLOYEE */}
          <fieldset className="fieldset">
            <legend className="fieldset-legend text-xs font-semibold">Select Employee</legend>
            <div className="relative">
               <User className="absolute left-3 top-3 z-1 text-base-content/50 pointer-events-none" size={16} />
               <select 
                name="targetUserId"
                value={formData.targetUserId} 
                onChange={handleChange}
                className={`select w-full text-xs pl-9 ${errors.targetUserId ? "select-error" : ""}`}
              >
                <option value="" disabled>Select an employee...</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.fullname}
                  </option>
                ))}
              </select>
            </div>
            {errors.targetUserId && <span className="text-error text-xs mt-1">{errors.targetUserId}</span>}
          </fieldset>

          {/* 2. OVERTIME TYPE */}
          <fieldset className="fieldset">
            <legend className="fieldset-legend text-xs font-semibold">Overtime Type</legend>
            <div className="relative">
              <FileText className="absolute left-3 top-3 z-1 text-base-content/50 pointer-events-none" size={16} />
              <select 
                name="otTypeId"
                value={formData.otTypeId} 
                onChange={handleChange}
                className={`select w-full text-xs pl-9 ${errors.otTypeId ? "select-error" : ""}`}
              >
                <option value="" disabled>Select type...</option>
                {overtimeTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
            {errors.otTypeId && <span className="text-error text-xs mt-1">{errors.otTypeId}</span>}
          </fieldset>

          {/* 3. DATE & TIME */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Date */}
            <fieldset className="fieldset">
              <legend className="fieldset-legend text-xs font-semibold">Date</legend>
              <div className="relative">
                <input 
                  type="date" 
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={`input text-xs w-full ${errors.date ? "input-error" : ""}`}
                />
              </div>
              {errors.date && <span className="text-error text-xs mt-1">{errors.date}</span>}
            </fieldset>

            {/* Start Time */}
            <fieldset className="fieldset">
              <legend className="fieldset-legend text-xs font-semibold">Start Time</legend>
              <div className="relative">
                <Clock className="absolute left-3 top-3 z-1 text-base-content/50 pointer-events-none" size={16} />
                <input 
                  type="time" 
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className={`input text-xs w-full pl-9 ${errors.startTime ? "input-error" : ""}`}
                />
              </div>
              {errors.startTime && <span className="text-error text-xs mt-1">{errors.startTime}</span>}
            </fieldset>

            {/* End Time */}
            <fieldset className="fieldset">
              <legend className="fieldset-legend text-xs font-semibold">End Time</legend>
              <div className="relative">
                <Clock className="absolute left-3 top-3 z-1 text-base-content/50 pointer-events-none" size={16} />
                <input 
                  type="time" 
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className={`input text-xs w-full pl-9 ${errors.endTime ? "input-error" : ""}`}
                />
              </div>
              {errors.endTime && <span className="text-error text-xs mt-1">{errors.endTime}</span>}
            </fieldset>
          </div>

          {/* 4. REASON */}
          <fieldset className="fieldset">
            <legend className="fieldset-legend text-xs font-semibold">Reason / Task</legend>
            <textarea 
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              className={`textarea text-xs w-full h-24 resize-none ${errors.reason ? "textarea-error" : ""}`}
              placeholder="e.g. Urgent project deadline, Server maintenance..."
            ></textarea>
            {errors.reason && <span className="text-error text-xs mt-1">{errors.reason}</span>}
          </fieldset>

          {/* FOOTER BUTTONS */}
          <div className="flex justify-end gap-4 mt-4 pt-2">
            <button 
              onClick={onClose} 
              className="btn"
              disabled={isCreating}
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit} 
              className="btn btn-secondary min-w-[140px]"
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
                  Assign OT
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminCreateOvertimeModal;
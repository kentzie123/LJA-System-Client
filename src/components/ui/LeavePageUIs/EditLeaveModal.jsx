import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { useLeaveStore } from "@/stores/useLeaveStore";

const EditLeaveModal = ({ isOpen, onClose }) => {
  const { 
    leaveTypes, fetchLeaveTypes, 
    updateLeaveRequest, 
    selectedLeave, isCreating // reusing isCreating for loading state
  } = useLeaveStore();

  const [formData, setFormData] = useState({
    leaveTypeId: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  // Error State
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) fetchLeaveTypes();
  }, [isOpen, fetchLeaveTypes]);

  useEffect(() => {
    if (isOpen && selectedLeave) {
      
      // 1. Try to get ID directly. 
      // 2. If missing, Find the ID by matching the name ("Sick Leave" === "Sick Leave")
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

    // Clear error for this specific field as user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // 1. Check Required Fields
    if (!formData.leaveTypeId) newErrors.leaveTypeId = "Please select a leave type.";
    if (!formData.startDate) newErrors.startDate = "Start date is required.";
    if (!formData.endDate) newErrors.endDate = "End date is required.";
    if (!formData.reason.trim()) newErrors.reason = "Reason is required.";

    // 2. Logical Check: End Date vs Start Date
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
    
    // Call the Update Action
    const success = await updateLeaveRequest(selectedLeave.id, formData);
    if (success) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-base-100 w-full max-w-md rounded-2xl shadow-2xl border border-base-300 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between bg-base-200 py-4 px-6">
          <div className="text-lg font-bold">Edit Request</div>
          <button onClick={onClose} disabled={isCreating} className="btn btn-ghost btn-sm btn-square hover:text-error">
            <X className="size-5" />
          </button>
        </div>

        {/* Body */}
        <div className="py-4 px-6 space-y-4">
          
          {/* Leave Type */}
          <fieldset className="fieldset">
            <legend className="fieldset-legend text-xs font-semibold">Leave Type</legend>
            <select 
              name="leaveTypeId" 
              value={formData.leaveTypeId} 
              onChange={handleChange} 
              className={`select w-full text-xs ${errors.leaveTypeId ? "select-error" : ""}`}
            >
              <option value="" disabled>Select leave type</option>
              {leaveTypes.map((type) => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
            {errors.leaveTypeId && <span className="text-error text-xs mt-1">{errors.leaveTypeId}</span>}
          </fieldset>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <fieldset className="fieldset">
              <legend className="fieldset-legend text-xs font-semibold">Start Date</legend>
              <input 
                type="date" 
                name="startDate" 
                value={formData.startDate} 
                onChange={handleChange} 
                className={`input text-xs w-full ${errors.startDate ? "input-error" : ""}`}
              />
              {errors.startDate && <span className="text-error text-xs mt-1">{errors.startDate}</span>}
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend text-xs font-semibold">End Date</legend>
              <input 
                type="date" 
                name="endDate" 
                value={formData.endDate} 
                onChange={handleChange} 
                min={formData.startDate} 
                className={`input text-xs w-full ${errors.endDate ? "input-error" : ""}`}
              />
              {errors.endDate && <span className="text-error text-xs mt-1">{errors.endDate}</span>}
            </fieldset>
          </div>

          {/* Reason */}
          <fieldset className="fieldset">
            <legend className="fieldset-legend text-xs font-semibold">Reason</legend>
            <textarea 
              name="reason" 
              value={formData.reason} 
              onChange={handleChange} 
              className={`textarea text-xs w-full h-24 resize-none ${errors.reason ? "textarea-error" : ""}`}
            ></textarea>
            {errors.reason && <span className="text-error text-xs mt-1">{errors.reason}</span>}
          </fieldset>

          {/* Actions */}
          <div className="flex justify-end gap-4 mt-4">
            <button onClick={onClose} className="btn" disabled={isCreating}>Cancel</button>
            <button 
              onClick={handleSubmit} 
              disabled={isCreating} 
              className="btn btn-primary min-w-[140px]"
            >
              {isCreating ? (
                <>
                  <Loader2 className="size-5 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditLeaveModal;